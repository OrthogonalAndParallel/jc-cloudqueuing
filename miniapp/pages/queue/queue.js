const api = require("../../utils/api");

Page({
  data: {
    queueId: "default",
    items: [],
    waitingCountText: "-",
    calledCountText: "-",
    canceledCountText: "-",
    lastUpdatedText: "-"
  },

  formatTime(ms) {
    if (!ms) return "-";
    try {
      return new Date(ms).toLocaleString();
    } catch {
      return "-";
    }
  },

  formatStatus(status) {
    const statusMap = {
      waiting: "等待中",
      called: "已叫号",
      canceled: "已取消"
    };
    return statusMap[status] || status;
  },

  onLoad() {
    this.onRefresh();
  },

  onQueueIdInput(e) {
    this.setData({ queueId: e.detail.value || "default" });
  },

  async onRefresh() {
    const { queueId } = this.data;
    try {
      const res = await api.list({ queueId });
      const rawItems = res && res.ok && Array.isArray(res.items) ? res.items : [];
      const items = rawItems.map((it) => ({
        ...it,
        createdAtText: this.formatTime(it && it.createdAt),
        statusText: this.formatStatus(it && it.status)
      }));
      let waiting = 0;
      let called = 0;
      let canceled = 0;
      for (const it of items) {
        if (it && it.status === "waiting") waiting += 1;
        else if (it && it.status === "called") called += 1;
        else if (it && it.status === "canceled") canceled += 1;
      }

      this.setData({
        items,
        waitingCountText: String(waiting),
        calledCountText: String(called),
        canceledCountText: String(canceled),
        lastUpdatedText: new Date().toLocaleString()
      });

      wx.stopPullDownRefresh();
    } catch (e) {
      this.setData({ lastUpdatedText: new Date().toLocaleString() });
      wx.stopPullDownRefresh();
      wx.showToast({ title: "网络错误", icon: "none" });
    }
  },

  onPullDownRefresh() {
    this.onRefresh();
  }
});
