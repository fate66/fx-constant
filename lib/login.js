import Vue from 'vue'

/**
 * type: 2 snsapi_userinfo
 *       1 snsapi_base
 * -------url中------
 * oauth: 2 snsapi_userinfo
 *        1  snsapi_base
 *
 */

export const login = {
  oauth_type(type) {
    return type || (Vue.$utils.urlQuery('oauth') ? Vue.$utils.urlQuery('oauth') : 2)
  },
  isLogin(type = '') {
    type = this.oauth_type(type)
    return type == 2 ? (Vue.$utils.cookie.get('unionid') && Vue.$utils.cookie.get('openid')) : !!Vue.$utils.cookie.get('openid')
  },
  doLogin(url = window.location.href, type = '') {
    type = this.oauth_type(type)
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
  }
}
