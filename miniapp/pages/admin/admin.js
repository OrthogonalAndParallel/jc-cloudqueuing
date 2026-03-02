// pages/admin/admin.js
const api = require("../../utils/api");
const auth = require("../../utils/auth");

Page({
  data: {
    queueId: "default",
    roleText: "-",
    adminPasscode: "",
    items: [],
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

  onLoad() {
    this.syncRole();
    if (auth.isAdmin()) {
      this.onRefresh();
    }
  },

  onShow() {
    this.syncRole();
  },

  syncRole() {
    const role = auth.getRole();
    this.setData({ roleText: role });
  },

  onQueueIdInput(e) {
    this.setData({ queueId: e.detail.value || "default" });
  },

  onAdminPasscodeInput(e) {
    this.setData({ adminPasscode: e.detail.value || "" });
  },

  onAdminLogin() {
    const app = getApp();
    const expected =
      (app && app.globalData && app.globalData.adminPasscode) || "admin";

    if ((this.data.adminPasscode || "") === expected) {
      auth.setRole("admin");
      this.syncRole();
      wx.showToast({ title: "已切换为管理员", icon: "success" });
      this.onRefresh();
      return;
    }

    wx.showToast({ title: "口令错误", icon: "none" });
  },

  onLogout() {
    auth.logout();
    this.setData({ items: [] });
    this.syncRole();
    wx.showToast({ title: "已退出", icon: "success" });
  },

  async onRefresh() {
    if (!auth.isAdmin()) {
      wx.showToast({ title: "需要管理员权限", icon: "none" });
      return;
    }

    const { queueId } = this.data;
    try {
      const res = await api.list({ queueId });
      const rawItems = res && res.ok && Array.isArray(res.items) ? res.items : [];
      const items = rawItems.map((it) => ({
        ...it,
        createdAtText: this.formatTime(it && it.createdAt)
      }));
      this.setData({
        items,
        lastUpdatedText: new Date().toLocaleString()
      });
      wx.stopPullDownRefresh();
    } catch (e) {
      this.setData({ lastUpdatedText: new Date().toLocaleString() });
      wx.stopPullDownRefresh();
      wx.showToast({ title: "网络错误", icon: "none" });
    }
  },

  async onNext() {
    if (!auth.isAdmin()) {
      wx.showToast({ title: "需要管理员权限", icon: "none" });
      return;
    }

    const { queueId } = this.data;
    try {
      const res = await api.next({ queueId });
      if (res && res.ok) {
        wx.showToast({ title: "已叫号", icon: "success" });
        this.onRefresh();
      } else {
        wx.showToast({ title: res && res.error ? res.error : "叫号失败", icon: "none" });
      }
    } catch (e) {
      wx.showToast({ title: "网络错误", icon: "none" });
    }
  },

  onPullDownRefresh() {
    this.onRefresh();
  }
})