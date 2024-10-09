const app = getApp() 
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
Page({
  data: {
    coupons: [ 
    ],
  },
  onLoad: function(options) {
    // 页面加载完成时执行的代码 
    this._loadDetail();
  },
  selectCoupon(e) { 
    var id = e.currentTarget.dataset.id; 
    var info = e.currentTarget.dataset.info; 
    this.setData({
      usedCouponId: id
    })  
    // 将结果存入本地缓存
    wx.setStorageSync('usedCoupon', info); 
    // 返回上一页面
    wx.navigateBack();
  }, 
  cancelCoupon(e) {
    this.setData({
      usedCouponId: null
    })  
    const type = this.data.type;
    // 将结果存入本地缓存
    if(type == 1){
      wx.setStorageSync('usedCoupon', {num: 10,type: 1});
    }else if(type == 2){
      wx.setStorageSync('usedCoupon', {num:0,type: 2});
    }
    // 返回上一页面
    wx.navigateBack();
  },
  _loadDetail: async function (e) {
    if (!await PassportBiz.loginMustBackWin(this)) return;
    PassportBiz.loginSilence(this);  
    
		let user = PassportBiz.getToken2();
 		this.setData({ 
      userId: user.id,
			phone: user.phone
    })  

    // 获取当前小程序的页面栈
    let pages = getCurrentPages();
		// 数组中索引最大的页面--当前页面
    let currentPage = pages[pages.length - 1];
		if (currentPage.options && currentPage.options.type) {
      this.setData({ type: currentPage.options.type,
        usedCouponId: currentPage.options.usedCouponId
                  });
    }

    this.constructArticleList();
	},
  // 构造文章列表
  constructArticleList() {
    const { userId,type} = this.data; 
    // 发送请求到后端进行数据查询
    wx.request({
      url: app.globalData.apiPath+'/wx/xcx/userinfo/coupon/list',
      data: {
        userId: userId,
        type: type
      },
      success: (res) => {
        const newArticleList = res.data.body; // 假设后端返回的数据为文章列表 
        // 将新的文章数据追加到列表末尾
        if(newArticleList!=null) {
          this.setData({
            coupons: newArticleList, 
          });
        }
        this.setData({ isLoad: true });
        console.log("this.getdata",this.data.coupons);
      },
      fail: (err) => {
        this.setData({ isLoad: true });
        console.error('请求失败', err);
      }
    });
  }
});
