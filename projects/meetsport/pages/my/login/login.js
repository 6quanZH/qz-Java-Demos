//login.js
//获取应用实例
const app = getApp()
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
Page({
  data: {
    motto: '欢迎您',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hide : true,
    sourcepath : ''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (e) {
    console.log('--------------------');
    this.getOpenid(); 
    
  }
  ,getOpenid:function(e){
     var that = this;
     wx.showLoading({
      title: '加载中',
      mask: true // 可选，是否显示透明蒙层，防止触摸穿透，默认值为false
    });
    
      // 登录
      wx.login({
        success: res => {
          console.log('---------getOpenid-----------')
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log(res);
          console.log(app.globalData.apiPath);
          wx.request({
            url: app.globalData.apiPath+'/wx/xcx/userinfo/get/openid',
            data: { 'code': res.code },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded'},
            success: function (res) { 
              console.log('------/wx/know/userinfo/get/openid-----');
              console.log(res);
              if (res.statusCode == 200) {
                console.log(res.data.msg);
                var json = JSON.parse(res.data.msg);
                app.globalData.openid = json.openid;
                app.globalData.session_key = json.session_key;
              } else {
                console.log(res.errMsg)
              }
              wx.hideLoading(); 
          }
        })
        }
      })
  }
  ,getUserInfo: function(e) {
    console.log('----------getUserInfo------------')
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
      hide : !this.data.hide
    })
  },
  saveUserInfo:function(e){
    console.log('---saveUserInfo-----');
    console.log(app.globalData.userInfo);
    if(app.globalData.userInfo == null || app.globalData.userInfo.nickName == null || app.globalData.userInfo.nickName == ""){
      return;
    }
    wx.request({
      url: app.globalData.apiPath+'/wx/know/userinfo/save',
      data: {
              'openid': app.globalData.openid,
              'nickName':app.globalData.userInfo.nickName,
              'gender':app.globalData.userInfo.gender,
              'province':app.globalData.userInfo.province,
              'city':app.globalData.userInfo.city,
              'avatarUrl':app.globalData.userInfo.avatarUrl
            },
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded'},
        success: function (res) {  
          console.log('----/wx/know/userinfo/save-----'+res);
          if (res.statusCode == 200) {
            console.log(res.data.msg);
          } else {
            console.log(res.errMsg)
          }
      }
    })
  }
  ,
  getPhoneNumber: function(e) {  
    console.log(e)
    console.log('---------获取用户手机号--------');
    console.log("getPhoneNumberok" + e.detail.errMsg);
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      console.log('encryptedData='+e.detail.encryptedData); 
      console.log('iv='+e.detail.iv); 
      console.log('session_key='+app.globalData.session_key);
      wx.request({ 
        url: app.globalData.apiPath+'/wx/xcx/userinfo/get/phone', 
        data: {
          'encryptedData': e.detail.encryptedData,
          'iv': e.detail.iv,
          'sessionKey': app.globalData.session_key,
          'openid': app.globalData.openid
        },
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded'},
        success: function(res) {  
          console.log('--------解密用户手机号--------'); 
          console.log("这个是res===",res.data.msg);        //成功-跳转页面 
            var json = JSON.parse(res.data.msg);
            wx.showToast({
              icon: 'none',
              title: '登陆成功',
              duration: 2500
            })
            console.log("这个是json",json); 
            PassportBiz.setToken2(json);
            wx.navigateBack();
        }
        ,fail: function (res) {
          console.log('获取失败', res.errMsg);
        }
      }) 
    }
  },
  
  cancel: function() { 
    wx.navigateBack(); 
  },
  getPhoneNumber2: function(phone) { 
    var sourcepath =  this.data.sourcepath; 
    console.log('---------获取用户手机号2--------');   
      wx.request({ 
        url: app.globalData.apiPath+'/wx/know/userinfo/get/phone2', 
        data: {
          'phone': phone,
          'sessionKey': app.globalData.session_key,
          'openid': app.globalData.openid
        },
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded'},
        success: function(res) {  
          console.log('--------解密用户手机号--------'); 
          console.log("这个是res===",res.data.msg);
          if(res.data.code==-1){     //失败
            wx.showModal({
              title: '警告',
              content: '您好，您非微企系统内部人员',
              showCancel: false,       // 是否显示取消按钮，默认为 true
              confirmText: '确定',     // 确定按钮的文本，默认为 "确定"
              confirmColor: '#3CC51F', // 确定按钮的文字颜色，默认为 "#3CC51F"（绿色）
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定');
                } else if (res.cancel) {
                  console.log('用户点击取消');
                }
              },
              fail: function (res) {
                console.log('调用失败', res.errMsg);
              }
            });
          }else{                //成功-跳转页面
            var json = JSON.parse(res.data.msg);
            wx.showToast({
              icon: 'none',
              title: '登陆成功',
              duration: 2500
            })
            console.log("这个是json",json);
            wx.setStorageSync("userid", json.user_id);
            wx.setStorageSync("username", json.nick_name);
            wx.setStorageSync('expireTime', Date.now() + 60 * 60 * 24 * 1000);
            // wx.setStorageSync('key', data.message);
            console.log("到期时间" + wx.getStorageSync('expireTime'))
            var path = '/pages/index/index';
            wx.setStorageSync('scanCode', sourcepath);
            wx.switchTab({ 
              url: path
            });
          } 
        }
      })  
  }
})
