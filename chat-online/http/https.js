var urls = require('./config.js')

function req(url, transmit, cb, that) {
  if (that) {
    that.setData({ hiddenLoading: !that.data.hiddenLoading });
  }
  let value = {
    "authMobile": wx.getStorageSync("authMobile"),
    "unionid": wx.getStorageSync("unionId"),
    "openid": wx.getStorageSync("openId")
  }
  let data = Object.assign(value, transmit)
  wx.request({
    url: urls.location + url,
    data: transmit,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    success: function (res) {
      return typeof cb == "function" && cb(res.data)
    },
    fail: function () {
      return typeof cb == "function" && cb(false)
    },
    complete: function () {
      if (that) {
        that.setData({ hiddenLoading: !that.data.hiddenLoading });
      }
    }
  })
}

function upload(filePath, name, cb, that) {
  that.setData({ hiddenLoading: !that.data.hiddenLoading });
  wx.uploadFile({
    url: urls.location + '/pinkiepie/mFileSave/uploadFile',
    filePath: filePath,
    name: 'file',
    formData: {
      'productType': name
    },
    success: function (res) {
      return typeof cb == "function" && cb(res.data)
    },
    complete: function () {
      that.setData({ hiddenLoading: !that.data.hiddenLoading })
    }
  })
}


module.exports = {
  req: req,
  upload: upload
}


