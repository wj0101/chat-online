const app = getApp()
const urls = require('../../http/config.js')
var socketUrl = 'ws://10.43.21.199:3000'
const io = require('../../utils/socket')
// socket 状态更新
var socketMessage = ''
// 上下文对象

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bottomFG:true,
    animationData: {},
    message:null,
    scrollTop: 0,
    messageList:[],
    userInfo:{},
    previewImgList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    this.socketStart();
  },
  
  onUnload() {
    this.socketStop()
   
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 初始化socket
   */
  socketStart: function (msg) {
    let that =this
    // 设置socket连接地址 socketUrl
    const socket = (this.socket = io(
      socketUrl,
    ))

    socket.on('connect', () => {
      //初始化
      let obj = {}
      obj.nickName = this.data.userInfo.nickName
      obj.openid = wx.getStorageSync("openid") || app.globalData.openid
      obj.pageSize = 10
      this.socket.emit('init', obj);
      this.socket.emit('getChatList', obj);
    })
    //广播
    socket.on('user joined', function (d) {
      console.log('!!!!!!!!!', d)
    })

    //有用户加入聊天
    socket.on('login', function (d) {
      console.log('~~~~~~~~~~~~', d)
    })
    socket.on('connect_error', d => {
      this.setData({ socketMessage: socketMessage += 'SOCKET连接失败 → \n\n' })
    })

    socket.on('connect_timeout', d => {
      this.setData({ socketMessage: socketMessage += 'SOCKET连接超时 → \n\n' })
    })

    socket.on('disconnect', reason => {
      this.setData({ socketMessage: socketMessage += 'SOCKET连接断开 → \n\n' })
    })

    socket.on('reconnect', attemptNumber => {
      this.setData({ socketMessage: socketMessage += 'SOCKET正在重连 → \n\n' })
    })

    socket.on('reconnect_failed', () => {
      this.setData({ socketMessage: socketMessage += 'SOCKET重连失败 → \n\n' })
    })

    socket.on('reconnect_attempt', () => {
      this.setData({ socketMessage: socketMessage += 'SOCKET正在重连 → \n\n' })
    })

    socket.on('error', err => {
      this.setData({ socketMessage: socketMessage += 'SOCKET连接错误 → \n\n' })
    })

    //接受新消息
    socket.on('newmessage', function (d) {
      console.log('~~~~~~~~~~~~',d)
      that.socketReceiveMessage(d)
    })

    //调取聊天记录
    socket.on('getChatListDone', function (d) {
      console.log('~~~~~~~~~~~~', d)
    })
  },

  /**
   * 断开socket
   */
  socketStop: function () {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  },

  /**
   * 发送消息
   */
  socketSendMessage: function (sendStr) {
    if (this.socket) {
      this.socket.emit('message', sendStr);
    }
  },

  /**
   * 接收消息
   */
  socketReceiveMessage: function (receivedStr) {
    //this.socketStop();
  },


  sendMessage:function(e){
    let obj ={}
    obj.content = e.detail.value
    obj.type = 'text'
    obj.nickName = this.data.userInfo.nickName
    obj.avatar = this.data.userInfo.avatarUrl
    obj.openid= wx.getStorageSync("openid") || app.globalData.openid
    this.data.messageList.push(obj)
    this.setData({
      'messageList': this.data.messageList,
      'message': null
    })
    //this.socketStart(obj);
    this.socketSendMessage(obj);
    this.bottom()
  },
  showAlbum:function(){
    this.data.bottomFG ? this.showModal() : this.hideModal()
  },


  showModal: function () {
    var that = this;
    that.setData({
      'bottomFG': false
    })
    var animation = wx.createAnimation({
      duration: 600,//动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn();//调用显示动画
    }, 200)
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 800,//动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown();//调用隐藏动画   
    setTimeout(function () {
      that.setData({
        'bottomFG': true
      })
    }, 720)//先执行下滑动画，再隐藏模块
  },

  //动画集
  fadeIn: function () {
    this.animation.bottom(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function () {
    this.animation.bottom('-150rpx').step()
    this.setData({
      animationData: this.animation.export(),
    })
  }, 
  chooseImage:function(e){
    var _this = this;
    let types = e.target.dataset.types
    var sourceType
    types == 'picture' ? sourceType = ['album'] : sourceType = ['camera']
    wx.chooseImage({
      count: 9, // 默认9 
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有 
      sourceType: sourceType, // 可以指定来源是相册还是相机，默认二者都有 
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let obj = {}
        obj.images = res.tempFilePaths
        obj.type = 'image'
        obj.nickName = _this.data.userInfo.nickName
        obj.openid = wx.getStorageSync("openid") || app.globalData.openid
        _this.data.messageList.push(obj)
        _this.setData({
          'messageList': _this.data.messageList
        })
        _this.socketStart(_this.data.messageList);
        _this.bottom()
      }
    })
  },

  bottom: function () {
    var query = wx.createSelectorQuery()
    query.select('#flag').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      wx.pageScrollTo({
        scrollTop: res[0].bottom // #the-id节点的下边界坐标
      })
      res[1].scrollTop // 显示区域的竖直滚动位置
    })
  },
  previewImg(e) {
    var res = e.target.dataset.src
    var list = this.data.previewImgList //页面的图片集合数组
    //判断res在数组中是否存在，不存在则push到数组中, -1表示res不存在
    if (list.indexOf(res) == -1) {
      this.data.previewImgList.push(res)
    }
    wx.previewImage({
      current: res, // 当前显示图片的http链接
      urls: this.data.previewImgList // 需要预览的图片http链接列表
    })

  },
})