/**
 * Notes: 注册登录模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-11-14 07:48:00 
 */

const BaseBiz = require('./base_biz.js');
const cacheHelper = require('../../helper/cache_helper.js');
const cloudHelper = require('../../helper/cloud_helper.js');
const pageHelper = require('../../helper/page_helper.js');
const helper = require('../../helper/helper.js');
const constants = require('../constants.js');

class PassportBiz extends BaseBiz {

	// 静默登录(有登录状态则不登录)  
	static async loginSilence(that) {
		return await PassportBiz.loginCheck(false, 'slience', 'bar', that);
	}

	// 强制静默登录(有不论是否有登录状态)  
	static async loginSilenceMust(that) {
		return await PassportBiz.loginCheck(false, 'must', 'bar', that);
	}

	// 必须登陆 可以取消(窗口形式) 
	static async loginMustCancelWin(that) {
		return await PassportBiz.loginCheck(true, 'cancel', '', that);
	}

	// 必须登陆 只能强制注册或者回上页(窗口形式)  
	static async loginMustBackWin(that) {
		return await PassportBiz.loginCheck(true, 'back', '', that);
	}

	// 获取token  
	static getToken() {
		let token = cacheHelper.get(constants.CACHE_TOKEN);
		return token || null;
	}
	// 获取token  
	static getToken2() {
		let token = cacheHelper.get(constants.CACHE_TOKEN2);
		return token || null;
	}
	// 设置token
	static setToken(token) {
		if (!token) return;
		cacheHelper.set(constants.CACHE_TOKEN, token, constants.CACHE_TOKEN_EXPIRE);
	}
	// 设置token2
	static setToken2(token) {
		if (!token) return;
		cacheHelper.set(constants.CACHE_TOKEN2, token, constants.CACHE_TOKEN_EXPIRE);
	}
	//  获取user id 
	static getUserId() {
		let token = cacheHelper.get(constants.CACHE_TOKEN2);
		if (!token) return '';
		return token.id || '';
	}

	// 获取user name 
	static getUserName() {
		let token = cacheHelper.get(constants.CACHE_TOKEN2);
		if (!token) return '';
		return token.nick_name || '';
	}
// 获取user phone
static getUserPhone() {
  let token = cacheHelper.get(constants.CACHE_TOKEN2);
  if (!token) return '';
  return token.phone || '';
}
static getUseravatarUrl() {
  let token = cacheHelper.get(constants.CACHE_TOKEN2);
  if (!token) return '';
  return token.avatar_url || '';
}
static getFace() {
  let token = cacheHelper.get(constants.CACHE_TOKEN2);
  if (!token) return '';
  return token.face || '';
}
	static getStatus() {
		let token = cacheHelper.get(constants.CACHE_TOKEN);
		if (!token) return -1;
		return token.status || -1;
	}

	// 是否登录 
	static isLogin() {
    let id = PassportBiz.getUserId();
		return (id > 0) ? true : false;
	}

	static loginStatusHandler(method, status) {
		let content = '';
		if (status == 0) content = '您的注册正在审核中，暂时无法使用此功能！';
		else if (status == 8) content = '您的注册审核未通过，暂时无法使用此功能；请在个人中心修改资料，再次提交审核！';
		else if (status == 9) content = '您的账号已经禁用, 无法使用此功能！';
		if (method == 'cancel') {
			wx.showModal({
				title: '温馨提示',
				content,
				confirmText: '取消',
				showCancel: false
			});
		}
		else if (method == 'back') {
			wx.showModal({
				title: '温馨提示',
				content,
				confirmText: '返回',
				showCancel: false,
				success(result) {
					wx.navigateBack();
				}
			});
		}
		return false;
	}
	// 登录判断及处理
	static async loginCheck(mustLogin = false, method = 'back', title = '', that = null) {
		let token = cacheHelper.get(constants.CACHE_TOKEN2);
		if (token) {
			if (that)
				that.setData({
					isLogin: true
				});
			return true;
		} else {
			if (that) that.setData({
				isLogin: false
			});
		} 
      PassportBiz.clearToken(); 
      if (mustLogin && method == 'cancel') {
				wx.showModal({
					title: '温馨提示',
					content: '此功能仅限登录用户',
					confirmText: '马上登录',
					cancelText: '取消',
					success(result) {
						if (result.confirm) {
							let url = pageHelper.fmtURLByPID('/pages/my/login/login') + '?retUrl=back';
							wx.navigateTo({ url });

						} else if (result.cancel) {

						}
					}
				});
				return false;
			}else{
				wx.showModal({
					title: '温馨提示',
					content: '此功能仅限登录用户',
					confirmText: '马上登录',
					cancelText: '返回',
					success(result) {
						if (result.confirm) {
							let retUrl = encodeURIComponent(pageHelper.getCurrentPageUrlWithArgs());
							let url = pageHelper.fmtURLByPID('/pages/my/login/login') + '?retUrl=' + retUrl;
							wx.redirectTo({ url });
						} else if (result.cancel) {
							let len = getCurrentPages().length;
							if (len == 1) {
								let url = pageHelper.fmtURLByPID('/pages/default/index/default_index');
								wx.reLaunch({ url });
							}
							else
								wx.navigateBack(); 
						}
					}
				});
				return false;
			} 

		return res;
	}

	// 清除登录缓存
	static clearToken() {
		cacheHelper.remove(constants.CACHE_TOKEN);
	}
  static clearToken2() {
		cacheHelper.remove(constants.CACHE_TOKEN2);
	}
	// 手机号码
	static async getPhone(e, that) {
		if (e.detail.errMsg == "getPhoneNumber:ok") {

			let cloudID = e.detail.cloudID;
			let params = {
				cloudID
			};
			let opt = {
				title: '手机验证中'
			};
			await cloudHelper.callCloudSumbit('passport/phone', params, opt).then(res => {
				let phone = res.data;
				if (!phone || phone.length < 11)
					wx.showToast({
						title: '手机号码获取失败，请重新填写手机号码',
						icon: 'none',
						duration: 2000
					});
				else {
					that.setData({
						formMobile: phone
					});
				}
			});
		} else
			wx.showToast({
				title: '手机号码获取失败，请重新填写手机号码',
				icon: 'none'
			});
	}
}



/** 表单校验    */
PassportBiz.CHECK_FORM = {
  name: 'formName|must|string|min:1|max:30|name=昵称',
  rent_address: 'rent_address|must|string|min:1|max:30|name=昵称',
	mobile: 'formMobile|must|len:11|name=手机',
	forms: 'formForms|array'
};

/** 租客认证表单校验    */
PassportBiz.RENT_CHECK_FORM = { 
  rent_address: 'rent_address|must|string|min:1|max:30|name=租用地址'
};


module.exports = PassportBiz;