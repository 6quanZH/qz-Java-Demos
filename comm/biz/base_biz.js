/**
 * Notes: 基础模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-11-14 07:48:00 
 */
const app = getApp() 
const pageHelper = require('../../helper/page_helper.js');

class BaseBiz {

	static getCateName(cateId, cateList) {
		for (let k = 0; k < cateList.length; k++) {
			if (cateList[k].id == cateId) {
				return cateList[k].title;
			}
		}
		return '';
	}

	static  getCateList(cateList) {

		let arr = [];
		for (let k = 0; k < cateList.length; k++) {
			arr.push({
				label: cateList[k].title,
				type: 'cateId',
				val: cateList[k].id, //for options form
				value: cateList[k].id, //for list menu
			})
		}

		return arr;
	}

	static setCateTitle(cateList, cateId = null) {

		let curPage = pageHelper.getPrevPage(1);
		if (!curPage) return;

		if (!cateId) {
		if (curPage.options && curPage.options.id) {
			cateId = curPage.options.id;
		}
		}

		for (let k = 0; k < cateList.length; k++) {
			if (cateList[k].id == cateId) {
				wx.setNavigationBarTitle({
					title: cateList[k].title
				});
				curPage.setData({
					listMode: cateList[k].style || ''
				})
				return;
			}
		}

  }
  
  static wxpay(fee, orderNo, openId,that) {
    wx.request({
      method: 'POST',
      url: app.globalData.apiPath+'/pay/xcx/order',
      data: {
        fee: fee,
        orderNo: orderNo,
        openId: openId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 改为 form-data
      },
      success: (res) => {
        const result = res.data; 
        that.setData({ hidden: true });
         // 将新的文章数据追加到列表末尾
        if(result!=null) {
          wx.requestPayment({
            timeStamp: result.timeStamp,
            nonceStr: result.nonceStr,
            package: result.package,
            signType: result.signType,
            paySign: result.paySign,
            success (res) { 
              console.log('Success:', res);
              debugger;
            },
            fail (res) { 
              console.log('Success:', res);
              debugger;
            }
          })
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
  }
  
  static getSn() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.apiPath+'/xcx/basic/project/get/sn', 
        success: (res) => {
          const result = res.data.objectBody;
          resolve(result);
        },
        fail: (err) => {
          wx.showToast({
            title: err,
            icon: 'error',
            duration: 2000
          });
          reject('');
        }
      });
    });
  }
  
}

module.exports = BaseBiz;