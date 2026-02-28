const api = require("../../utils/api");
const { getOrCreateUserId } = require("../../utils/id");

Page({
  data: {
    queueId: "default",
    nickname: "",
    userId: "",
    positionText: "-",
    waitingCountText: "-",
    lastUpdatedText: "-"
  },

  onLoad() {
    const userId = getOrCreateUserId();
    this.setData({ userId });
    this.onRefresh();
  },

  onQueueIdInput(e) {
    this.setData({ queueId: e.detail.value || "default" });
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value || "" });
  },

  async onJoin() {
    const { queueId, userId, nickname } = this.data;
    try {
      const res = await api.joinQueue({ queueId, userId, nickname });
      if (res && res.ok) {
        wx.showToast({ title: "已加入", icon: "success" });
        this.onRefresh();
      } else {
        wx.showToast({ title: res && res.error ? res.error : "加入失败", icon: "none" });
      }
    } catch (e) {
      wx.showToast({ title: "网络错误", icon: "none" });
    }
  },

  async onCancel() {
    const { queueId, userId } = this.data;
    try {
      const res = await api.cancelQueue({ queueId, userId });
      if (res && res.ok) {
        wx.showToast({ title: "已取消", icon: "success" });
        this.onRefresh();
      } else {
        wx.showToast({ title: res && res.error ? res.error : "取消失败", icon: "none" });
      }
    } catch (e) {
      wx.showToast({ title: "网络错误", icon: "none" });
    }
  },

  async onRefresh() {
    const { queueId, userId } = this.data;
    try {
      const res = await api.status({ queueId, userId });
      const pos = res && res.ok ? res.position : null;
      const waitingCount = res && res.ok ? res.waitingCount : null;
      this.setData({
        positionText: pos ? String(pos) : "未排队",
        waitingCountText: waitingCount != null ? String(waitingCount) : "-",
        lastUpdatedText: new Date().toLocaleString()
      });
    } catch (e) {
      this.setData({
        lastUpdatedText: new Date().toLocaleString()
      });
    }
  }
});
