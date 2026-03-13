App({
  globalData: {
    apiBaseUrl: "https://jczen.dpdns.org",
    adminPasscode: "admin"
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloudbase-2gj1xuwp25e39da0', // 云环境 ID
        traceUser: true,
      });
    }
  }
});
