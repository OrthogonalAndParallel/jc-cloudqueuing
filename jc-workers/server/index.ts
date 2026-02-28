export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		const corsHeaders: Record<string, string> = {
			"access-control-allow-origin": "*",
			"access-control-allow-methods": "GET,POST,OPTIONS",
			"access-control-allow-headers": "content-type",
		};

		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		if (!url.pathname.startsWith("/api/")) {
			return new Response(null, { status: 404 });
		}

		const queueId = url.searchParams.get("queueId") ?? "default";
		const now = Date.now();

		const json = async <T>(): Promise<T> => {
			const ct = request.headers.get("content-type") ?? "";
			if (!ct.includes("application/json")) {
				throw new Error("Expected application/json");
			}
			return (await request.json()) as T;
		};

		const ok = (data: unknown, status = 200) =>
			Response.json(data, { status, headers: corsHeaders });

		const bad = (message: string, status = 400) =>
			ok({ ok: false, error: message }, status);

		const queueKey = (id: string) => `queue:${id}:items`;
		const activeKey = (id: string) => `queue:${id}:active`;
		const userKey = (id: string, userId: string) => `queue:${id}:user:${userId}`;

		type QueueItem = {
			id: string;
			userId: string;
			nickname?: string;
			createdAt: number;
			status: "waiting" | "called" | "canceled" | "done";
		};

		const readQueue = async (): Promise<QueueItem[]> => {
			const raw = await env.QUEUE_KV.get(queueKey(queueId));
			if (!raw) return [];
			try {
				const parsed = JSON.parse(raw);
				return Array.isArray(parsed) ? (parsed as QueueItem[]) : [];
			} catch {
				return [];
			}
		};

		const writeQueue = async (items: QueueItem[]) => {
			await env.QUEUE_KV.put(queueKey(queueId), JSON.stringify(items));
			await env.QUEUE_KV.put(activeKey(queueId), String(items.filter((x) => x.status === "waiting").length));
		};

		try {
			switch (url.pathname) {
				case "/api/health": {
					return ok({ ok: true, now });
				}
				case "/api/join": {
					if (request.method !== "POST") return bad("Method not allowed", 405);
					const body = await json<{ userId: string; nickname?: string }>();
					if (!body.userId) return bad("userId required");

					const existing = await env.QUEUE_KV.get(userKey(queueId, body.userId));
					if (existing) {
						return ok({ ok: true, ticket: JSON.parse(existing) });
					}

					const items = await readQueue();
					const ticket: QueueItem = {
						id: crypto.randomUUID(),
						userId: body.userId,
						nickname: body.nickname,
						createdAt: now,
						status: "waiting",
					};
					items.push(ticket);
					await writeQueue(items);
					await env.QUEUE_KV.put(userKey(queueId, body.userId), JSON.stringify(ticket));
					return ok({ ok: true, ticket });
				}
				case "/api/cancel": {
					if (request.method !== "POST") return bad("Method not allowed", 405);
					const body = await json<{ userId: string }>();
					if (!body.userId) return bad("userId required");

					const items = await readQueue();
					let changed = false;
					for (const it of items) {
						if (it.userId === body.userId && it.status === "waiting") {
							it.status = "canceled";
							changed = true;
						}
					}
					await env.QUEUE_KV.delete(userKey(queueId, body.userId));
					if (changed) await writeQueue(items);
					return ok({ ok: true });
				}
				case "/api/status": {
					const userId = url.searchParams.get("userId");
					if (!userId) return bad("userId required");

					const items = await readQueue();
					const waiting = items.filter((x) => x.status === "waiting");
					const idx = waiting.findIndex((x) => x.userId === userId);
					return ok({
						ok: true,
						position: idx >= 0 ? idx + 1 : null,
						waitingCount: waiting.length,
					});
				}
				case "/api/list": {
					const items = await readQueue();
					return ok({ ok: true, items });
				}
				case "/api/next": {
					if (request.method !== "POST") return bad("Method not allowed", 405);
					const items = await readQueue();
					const next = items.find((x) => x.status === "waiting");
					if (!next) return ok({ ok: true, next: null });
					next.status = "called";
					await writeQueue(items);
					await env.QUEUE_KV.delete(userKey(queueId, next.userId));
					return ok({ ok: true, next });
				}
				default: {
					return bad("Not found", 404);
				}
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : "Unknown error";
			return ok({ ok: false, error: message }, 500);
		}
	},
} satisfies ExportedHandler<Env>;
