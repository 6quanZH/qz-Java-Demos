// projects/meetsport/pages/enroll/pay/pay_index.js
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 获取当前小程序的页面栈
    let pages = getCurrentPages();
		// 数组中索引最大的页面--当前页面
    let currentPage = pages[pages.length - 1];
		if (currentPage.options && currentPage.options.totalFee) {
			this.setData({ totalFee: currentPage.options.totalFee,originalTotalFee: currentPage.options.totalFee});
    }
    if (currentPage.options && currentPage.options.name) {
			this.setData({ name: currentPage.options.name});
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
   this.loadUser();

    // 获取之前存储的结果 
    const usedCoupon = wx.getStorageSync('usedCoupon');
    if(usedCoupon.type == '1'){
      this.setData({ 
        usedCouponzk: usedCoupon
      })  
    }else if(usedCoupon.type == '2'){
      this.setData({ 
        usedCoupondj: usedCoupon
      })  
    }
    const {usedCouponzk,usedCoupondj,originalTotalFee} = this.data;
    var originalTotalFee2 = originalTotalFee; 
    if(usedCouponzk){ 
      this.setData({ 
        totalFee: (originalTotalFee*usedCouponzk.num*0.1).toFixed(2)
      }) 
      originalTotalFee2 = (originalTotalFee*usedCouponzk.num*0.1).toFixed(2);
    }
    if(usedCoupondj){ 
      this.setData({
        totalFee: (originalTotalFee2-usedCoupondj.num).toFixed(2)
      }) 
      if(this.data.totalFee < 0){
        this.setData({
          totalFee: 0.00
        }) 
      }
    }
    // 清除已存储的结果
    wx.removeStorageSync('usedCoupon');

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
  checkboxChange(e) {
    this.setData({ isChecked: true });
  },
  handleCouponPickerChange(e) { 
    var type = e.currentTarget.dataset.type; 
    var usedCouponId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../coupon/select_coupon?type='+type+'&usedCouponId='+usedCouponId, // 替换为实际的页面路径和参数名
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
   loadUser: async function() {
    if (!await PassportBiz.loginMustBackWin(this)) return;
    PassportBiz.loginSilence(this);  
    
    let user = PassportBiz.getToken2(); 
 		this.setData({ 
      openId: user.openid
    })  
  },
  async pay() {
    this.setData({ hidden: false });
    const sn = await ProjectBiz.getSn();
    this.setData({ orderNo: sn });
    const {totalFee,orderNo,openId} = this.data;
    ProjectBiz.wxpay(totalFee,orderNo,openId,this);
  }
})