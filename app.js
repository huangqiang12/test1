const updateManager = wx.getUpdateManager()

updateManager.onCheckForUpdate(function (res) {
  // 请求完新版本信息的回调
  // console.log(res.hasUpdate)
})

updateManager.onUpdateReady(function () {
  wx.showModal({
    title: '更新提示',
    content: '新版本已经准备好，是否重启应用？',
    success: function (res) {
      if (res.confirm) {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate()
      }
    }
  })

})

updateManager.onUpdateFailed(function () {
  // 新的版本下载失败
})

//添加注释
//app.js
App({
  url: {

    url_api: 'https://www.qiaolibeilang.com/eapi',//接口地址前缀
    // url_api: 'https://www.jollyberan.com/eapi',//接口地址前缀
    url_img: 'https://www.jollyberan.com/public/new_xcx',//图片地址前缀
  },
  alert: function (text) {
    wx: wx.showModal({
      title: '提示',
      content: text,
      showCancel: false,
      // confirmColor: '#1ca6f8',
      mask: true,
    })
  },
  loading: function () {
    wx: wx.showLoading({
      title: '加载中',
      mask: true,
    })
  },
  Toast: function (text) {
    wx.showToast({
      title: text,
      icon: 'success',
      duration: 3000,
      mask: true,
    });
  },
  share: function () {
    return {
      title: '“宿洗”与您共进洗衣新时代！',
      path: '/pages/index/index',
      imageUrl: '../../img/share.jpg',
    }
  },
  fix_2: function (num) {//保留两位有效数字
    return parseFloat(num).toFixed(2);

  },
  //----------------------------------------------授权登入-------------------------------------------- //
  login: function (eapi, that) { //用户登入
    if (wx.getStorageSync('uid') == '') {
      wx.login({
        success: function (res_1) { //用户登入成功
          wx.request({
            url: eapi + '/user/code',
            method: 'post',
            data: {
              code: res_1.code,
            },
            success: function (res_2) { //获取openid成功
              console.log(res_2.data.data.openid);
              wx.setStorageSync('openid', res_2.data.data.openid)
              var user = wx.getStorageSync('user');
              console.log(user);
              wx.request({
                url: eapi + '/user/index', //获取uid
                data: {
                  name: user.nickName,
                  gender: user.gender,
                  avatarUrl: user.avatarUrl,
                  openid: wx.getStorageSync('openid'),
                },
                method: 'POST',
                success: function (res_4) {
                  wx.setStorageSync('uid', res_4.data.data.uid); //缓存uid,同步缓存
                  wx.setStorageSync('oid', res_2.data.data.openid);//缓存openid
                }
              });
            }
          })
        }
      })
    }
  },
  //----------------------------------------------授权登入-------------------------------------------- //

  // get_user_info:function(app,that){
  //   wx.getUserInfo({
  //     withCredentials: true,
  //     lang: 'zh_CN ',
  //     success: function(res) {
  //       wx.setStorageSync('user', res.detail.userInfo);
  //       that.onLoad();
  //     },
  //     fail: function(res) {},
  //     complete: function(res) {},
  //   })
  // }


})