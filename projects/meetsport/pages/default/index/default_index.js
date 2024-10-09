const pageHelper = require('../../../../../helper/page_helper.js'); 
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
    cateList: projectSetting.ENROLL_CATE,
    circularList: projectSetting.IMG_CIRCULAR, 
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) { 
    ProjectBiz.initPage(this);
   var t =  PassportBiz.getToken2(); 
	}, 

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () { 
	},

	onPullDownRefresh: async function () { 
		wx.stopPullDownRefresh();
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

	url: async function (e) {
		pageHelper.url(e, this);
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

  },
  handLetenantTap: async function(e) { 
      if (!await PassportBiz.loginMustCancelWin(this)) return;
      PassportBiz.loginSilence(this);   
    // 获取传递的数据
    const url = e.currentTarget.dataset.url; 
    // 跳转到指定页面
    wx.navigateTo({
      url: url
    });
  },
})