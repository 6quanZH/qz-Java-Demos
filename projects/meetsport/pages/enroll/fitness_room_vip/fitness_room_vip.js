const app = getApp() 
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js'); 
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    ProjectBiz.initPage(this);
    this._loadDetail();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  _loadDetail: async function (e) {
    if (!await PassportBiz.loginMustBackWin(this)) return;
    PassportBiz.loginSilence(this);  
    
		let user = PassportBiz.getToken2();
 		this.setData({
			isLoad: true,
			isEdit: true,

			user,
      userId: user.id,
			fields: projectSetting.USER_FIELDS,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      birth: user.birth,
			nick_name: user.nick_name,
			avatar_url: user.avatar_url,
			formForms: user.USER_FORMS
    }) 
    // 获取当前小程序的页面栈
    let pages = getCurrentPages();
		// 数组中索引最大的页面--当前页面
		let currentPage = pages[pages.length - 1]; 
		if (currentPage.options && currentPage.options.id) {
			this.setData({ classId: currentPage.options.id});
    }
    this.constructInfo();
	},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
// 构造文章列表
constructInfo() {
  const {classId,userId} = this.data;
  wx.request({
    url: app.globalData.apiPath+'/xcx/fitness/room/class/vip/list',
    data: {
      classId: classId,
      userId: userId
    },
    success: (res) => {
      const body = res.data.body; 
       // 将新的文章数据追加到列表末尾
      if(body!=null) {
        this.setData({
          vipRules: body, 
        });
      } 
    },
    fail: (err) => {
      wx.showToast({
        title: err,
        icon: 'error',
        duration: 2000
      });
    }
  });
  
},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  selectCard(e) {
    const id = e.currentTarget.dataset.id;
    const fee = e.currentTarget.dataset.fee;
    const name = e.currentTarget.dataset.name;
    if (this.data.selectedId === id) {
      this.setData({ selectedId: null,fee: null,name: null });
    } else {
      this.setData({ selectedId: id,fee: fee,name: name });
    }
  },
  pay(e) {
    const id = this.data.selectedId ;
    const fee = this.data.fee ;
    const name = this.data.name ;
    if(id == null){
      wx.showToast({
        title: '请选择购买卡项',
        icon: 'error',
        duration: 2000
      });
    return;
    }
    wx.navigateTo({
      url: '../pay/pay_index?id=' + id+'&totalFee='+fee+'&name='+name, // 替换为实际的页面路径和参数名
    });
  }
})