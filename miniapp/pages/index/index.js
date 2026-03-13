const api = require("../../utils/api");
const { getOrCreateUserId } = require("../../utils/id");

Page({
  data: {
    queueId: "default",
    nickname: "",
    userId: "",
    positionText: "-",
    waitingCountText: "-",
    startAtText: "-",
    lastUpdatedText: "-",
    adminKey: ""
  },

  formatTime(ms) {
    if (!ms) return "-";
    try {
      return new Date(ms).toLocaleString();
    } catch {
      return "-";
    }
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

  onGetUserProfile() {
    wx.getUserProfile({
      desc: '用于显示排队昵称',
      success: (res) => {
        const nickname = res.userInfo.nickName;
        this.setData({ nickname });
        wx.showToast({ title: '获取成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '获取失败', icon: 'none' });
      }
    });
  },

  onAdminKeyInput(e) {
    this.setData({ adminKey: e.detail.value || "" });
  },

  onGoAdmin() {
    const { adminKey } = this.data;
    if (adminKey === "admin") {
      wx.navigateTo({ url: "/pages/admin/admin" });
    } else {
      wx.showToast({ title: '口令错误', icon: 'none' });
    }
  },

  /*
  async testNetwork() {
    wx.cloud.callFunction({
      name: 'testWorker',
      success: res => {
        console.log('调用成功', res.result)
      },
      fail: err => {
        console.log('调用失败', err)
      }
    })
  },
  */

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

      let startAtText = "-";
      if (pos) {
        const listRes = await api.list({ queueId });
        const items = listRes && listRes.ok && Array.isArray(listRes.items) ? listRes.items : [];
        const mine = items.find((x) => x && x.userId === userId && x.status === "waiting");
        startAtText = this.formatTime(mine && mine.createdAt);
      }

      const nickname = res && res.ok && res.nickname ? res.nickname : this.data.nickname;
      this.setData({
        nickname,
        positionText: pos ? String(pos) : "未排队",
        waitingCountText: waitingCount != null ? String(waitingCount) : "-",
        startAtText,
        lastUpdatedText: new Date().toLocaleString()
      });
    } catch (e) {
      this.setData({
        lastUpdatedText: new Date().toLocaleString()
      });
    }
  }
});
