function request({ url, method = "GET", data }) {
  const app = getApp();
  const base = (app && app.globalData && app.globalData.apiBaseUrl) || "";

  return new Promise((resolve, reject) => {
    wx.request({
      url: base + url,
      method,
      data,
      header: {
        "content-type": "application/json"
      },
      success(res) {
        resolve(res.data);
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

module.exports = {
  request
};
