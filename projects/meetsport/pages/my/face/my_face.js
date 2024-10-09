const app = getApp()
const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const validate = require('../../../../../helper/validate.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const setting = require('../../../../../setting/setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		isEdit: true,
    face: '' 
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);
    await this._loadDetail(); 
	},

	_loadDetail: async function (e) {
    if (!await PassportBiz.loginMustCancelWin(this)) return;
    PassportBiz.loginSilence(this); 
    
 		this.setData({
			face : PassportBiz.getFace()
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	bindGetPhoneNumber: async function (e) {
		await PassportBiz.getPhone(e, this);
	},
 
  chooseAvatar: function() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        wx.showLoading({
          title: '上传中',
          mask: true // 可选，是否显示透明蒙层，防止触摸穿透，默认值为false
        });
        // 上传图片到服务器
        this.uploadAvatar(tempFilePaths);
      }
    });
  },
  uploadAvatar: function(tempFilePath) { 
    const that = this;
    let user = PassportBiz.getToken2();
    wx.uploadFile({
      url: app.globalData.apiPath+'/wx/xcx/userinfo/upload/face',
      filePath: tempFilePath,
      name: 'file',
      formData: {id: user.id},
      success: (res) => {
        const data = res.data;
          // 更新用户信息中的头像URL 
          if(user){
            user.face = data;
          }
          PassportBiz.setToken2(user);

          // 更新页面显示 
          that.setData({
            face: data
          });
          wx.showToast({
            title: '人脸信息更新',
            icon: 'success',
            duration: 2000
          });
          wx.hideLoading(); 
      },
      fail: (error) => {
        console.error('上传失败:', error);
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        });
        wx.hideLoading(); 
      }
    });
  } 
})