// pages/my_acc/my_acc.js
var eapi = getApp().url.url_api;
var alert = getApp().alert;
var loading = getApp().loading;
var Toast = getApp().Toast;
var share = getApp().share;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recharge: [
      { 'cz': '2000.00', 'zs': '550.00' },
      { 'cz': '500.00', 'zs': '90.00' },
      { 'cz': '1000.00', 'zs': '240.00' },
      { 'cz': '300.00', 'zs': '45.00' },
      { 'cz': '5000.00', 'zs': '1500.00' },
      { 'cz': '10000.00', 'zs': '3100.00' },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    getApp().login(eapi, that);//授权
    that.index();
    that.pd_balance(that);

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    // that.index();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: share().title,
      path: share().path,
      imageUrl: share().imageUrl,
    }
  },
  recharge: function (res) {
    var that = this;
    console.log(res.detail.value.price);
    if (res.detail.value.price == '') {
      alert('请填入充值金额');
      return false;
    }
    if (that.data.books != 1) {
      alert('请同意用户充值协议');
      return false;
    }
    wx.request({
      url: eapi + '/recharge/recharge',
      method: 'post',
      data: {
        uid: wx.getStorageSync('uid'),
        money: res.detail.value.price
      },
      success: function (d) {
        console.log(d);
        var pay = d.data.data;
        if (d.data.code == 0) {
          wx.requestPayment({
            timeStamp: pay.timeStamp,
            nonceStr: pay.nonceStr,
            package: pay.package,
            signType: pay.signType,
            paySign: pay.paySign,
            success: function (res) {
              Toast('充值成功！');
              var t = setTimeout(function () {
                that.index();
              }, 1000)
            },
            fail: function (res) {
              console.log(res);
            }
          })
        }
      }
    })
  },
  rec_number: function (res) {//选择充值面额
    var that = this;
    var ind = res.currentTarget.dataset.index
    that.setData({
      rec_number: ind,
      price: that.data.recharge[ind].cz,
    })
  },
  checkbox: function (res) {
    var that = this;
    that.setData({
      books: res.detail.value.length
    })
  },
  // index: function () {
  //   loading();
  //   var that = this;
  //   wx.request({
  //     url: eapi + '/recharge/balance',
  //     data: {
  //       uid: wx.getStorageSync('uid')
  //     },
  //     method: 'post',
  //     success: function (res) {
  //       var balance = getApp().fix_2(res.data.data.money);
  //       if (res.data.code == 0) {
  //         wx.stopPullDownRefresh();
  //         that.setData({
  //           balance: balance,
  //           rec_number: '',
  //           price: ''
  //         })
  //       } else {
  //         alert(res.data.msg);
  //       }
  //       console.log(res);
  //       wx.hideLoading();
  //     },
  //   })
  // },

  index: function () {
    wx.showNavigationBarLoading();
    var that = this;
    wx.request({
      url: eapi + '/user/info',
      data: {
        uid: wx.getStorageSync('uid')
      },
      method: 'post',
      success: function (res) {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          that.setData({
            my_money: res.data.data.money.money
          })
        } else {
          alert(res.data.mag)
        }
      },
    })
  },
  opened: function () {//功能未开放提示
    alert('即将开放，敬请期待！')
  },

  pd_balance: function (that) {
    // that.setData({
    //   balance: wx.getStorageSync('page_user').balance
    // })
    if (wx.getStorageSync('page_user').balance == null){
      wx.showModal({
        title: '温馨提示',
        content: '您还没有设置余额支付密码，设置密码方可充值。',
        showCancel: false,
        cancelText: '',
        cancelColor: '',
        confirmText: '确定',
        confirmColor: '#1ca6f8',
        success: function(res) {
          wx.navigateTo({
            url: '/pages/password/password?types=2',
          })
        }
      })
    }
  }
})