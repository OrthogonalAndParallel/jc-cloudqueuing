const { request } = require("./request");

function health() {
  return request({ url: "/api/health" });
}

function joinQueue({ queueId = "default", userId, nickname }) {
  return request({
    url: `/api/join?queueId=${encodeURIComponent(queueId)}`,
    method: "POST",
    data: { userId, nickname }
  });
}

function cancelQueue({ queueId = "default", userId }) {
  return request({
    url: `/api/cancel?queueId=${encodeURIComponent(queueId)}`,
    method: "POST",
    data: { userId }
  });
}

function status({ queueId = "default", userId }) {
  return request({
    url: `/api/status?queueId=${encodeURIComponent(queueId)}&userId=${encodeURIComponent(userId)}`
  });
}

function list({ queueId = "default" }) {
  return request({
    url: `/api/list?queueId=${encodeURIComponent(queueId)}`
  });
}

function next({ queueId = "default" }) {
  return request({
    url: `/api/next?queueId=${encodeURIComponent(queueId)}`,
    method: "POST",
    data: {}
  });
}

module.exports = {
  health,
  joinQueue,
  cancelQueue,
  status,
  list,
  next
};
