import Vue from 'vue'
import wdLogin from '@vdian/login'
import md5 from './md5'

/**
 *
 * type: 登录类型
 * oauth：url中
 *       1 snsapi_base
 *       2 snsapi_userinfo 默认登录方式
 *       3 抖音登录
 *       4 优先静默
 *       5 wd静默
 *       6 wd登录
 *       7 不登陆
 */

export const login = {
  oauth_type(type) {
    return type || (Vue.$utils.urlQuery('oauth') ? Vue.$utils.urlQuery('oauth') : 2)
  },
  isLogin(type = '') {
    type = this.oauth_type(type)
    type = Number(type)
    switch (type) {
      case 1: {
        return !!Vue.$utils.cookie.get('openid')
      }
      case 2: {
        return (Vue.$utils.cookie.get('unionid') && Vue.$utils.cookie.get('openid'))
      }
      case 3: {
        return !!Vue.$utils.cookie.get('unionid')
      }
      case 7: {
        return true
        
      }
      default: {
        if (type == 4 || type == 5 || type == 6) {
          return wdLogin.isLogin()
        } else {
          return false
        }
      }
    }
  },
  doLogin(url = window.location.href, type = '') {
    type = this.oauth_type(type)
    if (type == 3) {
      this.dydoLogin()
    } else if (type == 1 || type == 2) {
      this.wxdoLogin(url, type)
    } else if (type == 4) {
      if (Vue.$utils.ua.isWX()) {
        this.wdwxdoLogin()
      } else {
        this.wddoLogin()
      }
    } else if (type == 5) {
      this.wdwxdoLogin()
    } else if (type == 6) {
      this.wddoLogin()
    }
  },
  wdwxdoLogin(url = window.location.href) {
    window.location.href = wdLogin.wechatSlientLogin({
      url: Vue.$wdsso + `/user/synclogin?redirect=${encodeURIComponent(url)}`,
      environment: 3
    })
  },
  wddoLogin() {
    window.location.href = wdLogin.login({environment: 3})
  },
  wxdoLogin(url, type) {
    const params = Vue.$utils.url2obj(window.location.href)
    params.hasOwnProperty('unionid') && Reflect.deleteProperty(params, 'unionid')
    params.hasOwnProperty('openid') && Reflect.deleteProperty(params, 'openid')
    const uri = Vue.$utils.getUri(params)
    Vue.$http.get(Vue.$comApi.get_wx_web_auth, {
      type: type,
      url: encodeURIComponent(`${url.split('?')[0]}${uri ? '?' + uri : ''}`)
    }, res => {
      // if (res.errCode == 0) {
      //   window.location.href = res.data.link
      // }
      log(res.data.link)
      window.location.href = res.data.link
    })
  },
  dydoLogin() {
    const uid = md5.hexMD5(Vue.$utils.uuid()).substr(8, 16)
    Vue.$utils.cookie.set('openid', 'dy' + uid, 1000 * 60 * 60 * 24 * 60, '.fangxin.com')
    // Vue.$utils.cookie.set('uid', 'dy' + uid, 1000 * 60 * 60 * 24 * 60, '.fangxin.com')
    Vue.$utils.cookie.set('unionid', 'dy' + uid, 1000 * 60 * 60 * 24 * 60, '.fangxin.com')
  }
}
