function getOrCreateUserId() {
  const key = "userId";
  let id = wx.getStorageSync(key);
  if (id) return id;

  const sys = wx.getSystemInfoSync();
  const rand = Math.random().toString(16).slice(2);
  id = `u_${Date.now()}_${sys.platform}_${rand}`;
  wx.setStorageSync(key, id);
  return id;
}

module.exports = {
  getOrCreateUserId
};
