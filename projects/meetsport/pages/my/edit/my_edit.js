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
    gender: '',
    genders: ['男', '女'], 
    birth: '',  
    heights: '',  
    weights: '', 
		userRegCheck: projectSetting.USER_REG_CHECK,
		mobileCheck: setting.MOBILE_CHECK
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);
    await this._loadDetail();
    this.initHeightsAndWeights();
	},

	_loadDetail: async function (e) {
    if (!await PassportBiz.loginMustBackWin(this)) return;
    PassportBiz.loginSilence(this);  
    
		let user = PassportBiz.getToken2(); 
      
 		this.setData({
			isLoad: true,
			isEdit: true,

			user,

			fields: projectSetting.USER_FIELDS,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      birth: user.birth,
			nick_name: user.nick_name,
			avatar_url: user.avatar_url,
			formForms: user.USER_FORMS
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


	bindSubmitTap: async function (e) {
		try {
			let data = this.data;
			// 数据校验 
			data = validate.check(data, PassportBiz.CHECK_FORM, this);
			if (!data) return;

			let forms = this.selectComponent("#cmpt-form").getForms(true);
			if (!forms) return;
			data.forms = forms;

			let opts = {
				title: '提交中'
			}
			await cloudHelper.callCloudSumbit('passport/edit_base', data, opts).then(res => {
				let callback = () => {
					wx.reLaunch({ url: '../index/my_index' });
				}
				pageHelper.showSuccToast('修改成功', 1500, callback);
			});
		} catch (err) {
			console.error(err);
		}
  }
  ,
  chooseAvatar: function() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        this.setData({
          avatar_url: tempFilePaths
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
      url: app.globalData.apiPath+'/wx/xcx/userinfo/upload',
      filePath: tempFilePath,
      name: 'file',
      formData: {id: user.id},
      success: (res) => {
        const data = res.data;
          // 更新用户信息中的头像URL 
          if(user){
            user.avatar_url = data;
          }
          PassportBiz.setToken2(user);

          // 更新页面显示 
          that.setData({
            avatar_url: data.avatarUrl
          });
          wx.showToast({
            title: '头像更新成功',
            icon: 'success',
            duration: 2000
          });
      },
      fail: (error) => {
        console.error('上传失败:', error);
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  updateProfile: function(e) {
    const formData = e.detail.value;
    const userInfo = wx.getStorageSync('userInfo') || {};
    Object.assign(userInfo, formData);
    wx.setStorageSync('userInfo', userInfo);
    this.setData(userInfo);

    wx.showToast({
      title: '资料更新成功',
      icon: 'success',
      duration: 2000
    });
  },

  logout: function() {
    PassportBiz.clearToken2(); 
    wx.navigateBack();
  },
  initHeightsAndWeights: function() {
    // 初始化身高和体重的范围
    const heights = [];
    const weights = [];

    // 身高从130cm到210cm
    for (let i = 130; i <= 210; i++) {
      heights.push(`${i}cm`);
    }

    // 体重从30kg到150kg
    for (let i = 30; i <= 150; i++) {
      weights.push(`${i}kg`);
    }

    this.setData({
      heights,
      weights
    });
  },
  handleGenderPickerChange: function(e) {
    const value = this.data.genders[e.detail.value];
    const that = this;
    let user = PassportBiz.getToken2();
    wx.request({
      url: app.globalData.apiPath + '/wx/xcx/userinfo/update/gender', // 控制器新增接口地址
      method: 'POST',
      data: {
        id: user.id,
        gender: value
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 改为 form-data
      },
      success(res) {  
        console.log('Success:', res);
        if( res.data.code=='0'){ 
          if(user){
            user.gender = value;
          }
          PassportBiz.setToken2(user);
          // 更新页面显示 
          that.setData({
            gender: value
          });
          wx.showToast({
            title: '信息更新成功',
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
  },
  handleHeightChange: function(e) {
    const value = this.data.heights[e.detail.value];
    const that = this;
    let user = PassportBiz.getToken2();
    wx.request({
      url: app.globalData.apiPath + '/wx/xcx/userinfo/update/height', // 控制器新增接口地址
      method: 'POST',
      data: {
        id: user.id,
        height: value
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 改为 form-data
      },
      success(res) {  
        console.log('Success:', res);
        if( res.data.code=='0'){ 
          if(user){
            user.height = value;
          }
          PassportBiz.setToken2(user);
          // 更新页面显示 
          that.setData({
            height: value
          });
          wx.showToast({
            title: '信息更新成功',
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
  },
  handleDateChange: function(e) {
    const value = e.detail.value;
    const that = this;
    let user = PassportBiz.getToken2();
    wx.request({
      url: app.globalData.apiPath + '/wx/xcx/userinfo/update/birth', // 控制器新增接口地址
      method: 'POST',
      data: {
        id: user.id,
        birth: value
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 改为 form-data
      },
      success(res) {  
        console.log('Success:', res);
        if( res.data.code=='0'){ 
          if(user){
            user.birth = value;
          }
          PassportBiz.setToken2(user);
          // 更新页面显示 
          that.setData({
            birth: value
          });
          wx.showToast({
            title: '信息更新成功',
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
  },
  handleWeightChange: function(e) {
    const value = this.data.weights[e.detail.value];
    const that = this;
    let user = PassportBiz.getToken2();
    wx.request({
      url: app.globalData.apiPath + '/wx/xcx/userinfo/update/weight', // 控制器新增接口地址
      method: 'POST',
      data: {
        id: user.id,
        weight: value
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 改为 form-data
      },
      success(res) {  
        console.log('Success:', res);
        if( res.data.code=='0'){ 
          if(user){
            user.weight = value;
          }
          PassportBiz.setToken2(user);
          // 更新页面显示 
          that.setData({
            weight: value
          });
          wx.showToast({
            title: '信息更新成功',
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
  },
  handleNickNameBlur: function(e) {
    var value =  e.detail.value;
    const that = this;
    let user = PassportBiz.getToken2();
    wx.request({
      url: app.globalData.apiPath + '/wx/xcx/userinfo/update/name', // 控制器新增接口地址
      method: 'POST',
      data: {
        id: user.id,
        nickName: value
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 改为 form-data
      },
      success(res) {  
        console.log('Success:', res);
        if( res.data.code=='0'){ 
          if(user){
            user.nick_name = value;
          }
          PassportBiz.setToken2(user);
          // 更新页面显示 
          that.setData({
            nick_name: value
          });
          wx.showToast({
            title: '信息更新成功',
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
  } 
})