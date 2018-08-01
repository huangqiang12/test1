// git仓库测试。。。。。。。。。。。。
//index.js
var eapi = getApp().url.url_api;
var alert = getApp().alert;
var loading = getApp().loading;
var Toast = getApp().Toast;
var share = getApp().share;
Page({
  data: {
    bannerlink: [
      'product/product?id=1',
      'share/share',
      // 'sk_card/sk_card',
      // 'give/give',
      // 'product/product?id=1',
      //'product/product?id=1',
      //'give/give',//password/password?types
      //'public/public'
    ],
    menu: [
      ['洗鞋', '1', '2', '0'], //3:0已开放，1未开放
      ['洗衣', '2', '1', '0'],
      ['洗家纺', '3', '4', '0'],
      ['窗帘清洗', '4', '5', '0'],
      ['高端成衣', '5', '2', '1'],
      ['居家保洁', '6', '1', '1'],
      ['生活美物', '7', '1', '1'],
      ['团购', '8', '7', '1']
    ],
    menu2: [
      ['意见反馈', 'feedback', ''],
      ['服务介绍', 'service', ''],
      ['价格目录', 'price_list', ''],
      ['准时宝', 'time', 'opened']
    ],
    scroll_set: 0, //1代表已滚出banner，0代表未滚出banner]
  },
  onLoad: function(options) {
    // document.execCommand(512196163);
    var that = this;
    if (wx.getStorageSync('user') == '') {
      that.setData({
        shouquan: 1,
      })
    } else {
      that.setData({
        shouquan: 0,
      })
    }
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winheight: res.windowHeight
        })
      }
    })
    getApp().login(eapi, that); //授权
    that.index(); //获取首页数据
    console.log()

    var share_uid = that.options.share_uid;
    if (share_uid != undefined) {
      that.setData({
        share_uid: share_uid
      })
      that.coupon_new()
    }

  },
  onShareAppMessage: function() {
    return {
      title: share().title,
      path: share().path,
      // imageUrl: share().imageUrl,
    }
  },
  scroll: function(e) { //页面滚动时对搜索框样式进行修改
    return false; //屏蔽搜索框
    var that = this;
    if (e.detail.scrollTop > 60 && that.data.scroll_set != 1) {
      that.setData({
        scroll_set: 1,
      })
      return false;
    }
    if (e.detail.scrollTop < 60 && that.data.scroll_set != 0) {
      that.setData({
        scroll_set: 0,
      })
    }
  },
  to_search: function() { //搜索框聚焦时跳转到搜索页面
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  index: function() {
    var that = this;
    loading();
    // wx.setClipboardData({
    //   data: '512196163',
    //   success: function() {
    //     wx.hideToast();
    //   }
    // });
    wx.request({
      url: eapi + '/index/index',
      method: 'post',
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            index: res,
          })
        } else {
          alert(res.data.msg);
        }
        wx.hideLoading();
      },
    })
  },

  opened: function() { //功能未开放提示
    alert('即将开放，敬请期待！')
  },

  get_user_info: function(e) {
    var that = this;
    console.log(e);
    wx.setStorageSync('user', e.detail.userInfo);
    that.onLoad();
  },

  coupon_new: function() {
    var that = this;
    var data = this.data;
    if (wx.getStorageSync('uid') == '' || data.share_uid == undefined) {
      console.log('123321');
      return;
    }
    wx.request({
      url: eapi + '/user/coupon_new',
      method: 'post',
      data: {
        nid: data.share_uid,
        uid: wx.getStorageSync('uid')
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            index: res,
          })
        } else {
          alert(res.data.msg);
        }
      }
    })
  },

  tips: function(e) {
    alert(e.currentTarget.dataset.tip);

  },
})