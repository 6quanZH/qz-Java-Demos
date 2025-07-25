const pageHelper = require('../../../../../helper/page_helper.js');
const timeHelper = require('../../../../../helper/time_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const EnrollBiz = require('../../../biz/enroll_biz.js');
const projectSetting = require('../../../public/project_setting.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		cateId: '1',
    type: '',
		dateCmtpEndDay: '',

		day: timeHelper.time('Y-M-D'),
		used: [],

		nowUserId: PassportBiz.getUserId()
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) { 
		ProjectBiz.initPage(this); 
    
		pageHelper.getOptions(this, options); 
		//	if (!await PassportBiz.loginMustBackWin(this)) return;

		/*
		if (options && options.day) {
			this.setData({ day: options.day });
		}

		this.setData({ isLoad: false });
		await this._loadEnroll();
		await this._loadDayUsed(this.data.day);
		this.setData({ isLoad: true });*/
	},

	_loadEnroll: async function () {
		let day = this.data.day; 
		let params = {
			cateId: this.data.cateId,
			day,
		};
		let opt = {
			title: 'bar'
		};
		/*await cloudHelper.callCloudSumbit('enroll/all', params, opt).then(res => {
			console.log(res.data)
			this.setData({
				columns: res.data,
				dateCmtpEndDay: res.data.maxDay,
			})
			return;
		});*/ 

	},


	_loadDayUsed: async function (day) {
		if (!day) return;

		let params = {
			cateId: this.data.cateId,
			day,
		};
		let opt = {
			title: 'bar'
    };
    /*
		await cloudHelper.callCloudSumbit('enroll/day_used', params, opt).then(res => {
			this.setData({
				used: res.data
			});
		});
*/
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {
    if (!await PassportBiz.loginMustCancelWin(this)) return;
    PassportBiz.loginSilence(this);  
     
		// 获取当前小程序的页面栈
		let pages = getCurrentPages();
		// 数组中索引最大的页面--当前页面
		let currentPage = pages[pages.length - 1];
		// 附加参数 
		if (currentPage.options && currentPage.options.day) {
			this.setData({ day: currentPage.options.day });
		}


		if (currentPage.options && currentPage.options.id) {
			this.setData({ cateId: currentPage.options.id,type: currentPage.options.type });
		}

		EnrollBiz.setCateTitle(this.data.cateId);

		let cateList = projectSetting.ENROLL_CATE;
		for (let k = 0; k < cateList.length; k++) {
			if (cateList[k].id == this.data.type) {
				wx.setNavigationBarTitle({
					title: cateList[k].title
				});
				this.setData({
					title:  cateList[k].title ,
					titleEn: encodeURIComponent(cateList[k].title+'预订须知')
				});
				break;  
			}
		}

		this.setData({ isLoad: false }); 
		this.setData({ isLoad: true });
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () { },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () { },

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {

		this.setData({ isLoad: false });
		await this._loadEnroll();
		await this._loadDayUsed(this.data.day);
		this.setData({ isLoad: true });

		wx.stopPullDownRefresh();
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () { },

	bindDateSelectCmpt: function (e) { 
		this.setData({
			day: e.detail
		}, async () => {
			this.setData({ isLoad: false });
			await this._loadEnroll();
			await this._loadDayUsed(e.detail);
			this.setData({ isLoad: true });
		});
	},

	bindTimeSelectCmpt: async function (e) {
		if (!await PassportBiz.loginMustCancelWin(this)) return;

		let start = encodeURIComponent(e.detail.start);
		let end = encodeURIComponent(e.detail.end);
		let endPoint = encodeURIComponent(e.detail.endPoint);
		let day = encodeURIComponent(this.data.day);
		let enrollId = encodeURIComponent(e.detail.enrollId);
		let price = encodeURIComponent(e.detail.price);

		let url = `../join/enroll_join?id=${enrollId}&start=${start}&end=${end}&endPoint=${endPoint}&day=${day}&price=${price}`;

		wx.navigateTo({
			url,
		});
	},


	url: function (e) {
		pageHelper.url(e, this);
	},


	onPageScroll: function (e) {
		// 回页首按钮
		pageHelper.showTopBtn(e, this);

	},

	onShareAppMessage: function (res) {

	}
})