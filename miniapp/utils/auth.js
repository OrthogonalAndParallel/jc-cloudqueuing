function getRole() {
  return wx.getStorageSync("role") || "customer";
}

function setRole(role) {
  wx.setStorageSync("role", role);
}

function logout() {
  wx.removeStorageSync("role");
}

function isAdmin() {
  return getRole() === "admin";
}

module.exports = {
  getRole,
  setRole,
  logout,
  isAdmin
};
