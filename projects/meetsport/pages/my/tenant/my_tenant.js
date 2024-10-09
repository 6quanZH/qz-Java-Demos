const app = getApp()
const pageHelper = require('../../../../../helper/page_helper.js');
const helper = require('../../../../../helper/helper.js');
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
		isEdit: false,

		mobileCheck: setting.MOBILE_CHECK
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
    ProjectBiz.initPage(this); 
    
    
    let user = PassportBiz.getToken2();  
 		this.setData({
			rent_address: user.rent_address, 
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
	onShow: async function () {
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
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	bindGetPhoneNumber: async function (e) {
		PassportBiz.getPhone(e, this);
	},


	bindSubmitTap: async function (e) {
		try {
			let data = this.data;
			// 数据校验 
			data = validate.check(data, PassportBiz.RENT_CHECK_FORM, this);
      if (!data) return;

      const value = data.rent_address
      const that = this;
      let user = PassportBiz.getToken2();
      wx.request({
        url: app.globalData.apiPath + '/wx/xcx/userinfo/update/address', // 控制器新增接口地址
        method: 'POST',
        data: {
          id: user.id,
          rent_address: value
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 改为 form-data
        },
        success(res) {  
          console.log('Success:', res);
          if( res.data.code=='0'){ 
            if(user){
              user.rent_address = value;
            }
            PassportBiz.setToken2(user);
            // 更新页面显示 
            that.setData({
              rent_address: value
            });
            wx.showToast({
              title: '申请成功',
              icon: 'success',
              duration: 2000
            });
          }else{
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false 
            });
          }
        },
        fail(err) {
          console.error('Failed:', err);
        },
      });
		} catch (err) {
			console.error(err);
		}
	}
})