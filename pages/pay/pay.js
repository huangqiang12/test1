// pages/pay/pay.js
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

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    loading();
    var that = this;
    getApp().login(eapi, that); //授权
    that.setData({
      orderid: that.options.id,
    })
    wx.request({
      url: eapi + '/order/pay_info',
      data: {
        uid: wx.getStorageSync('uid'),
        orderid: that.options.id
      },
      method: 'post',
      success: function(res) {
        console.log(res.data.data.price);
        if (res.data.code == 0) {
          that.setData({
            infor: res.data.data,
          })
          console.log(that.data.infor);
        } else {
          alert(res.data.msg);
        }
        wx.hideLoading();
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: share().title,
      path: share().path,
      imageUrl: share().imageUrl,
    }
  },
  pay: function(e) {
    var that = this;
    console.log(e.detail.value.type);
    console.log(e);
    if (e.detail.value.type == 'card') {
      if (that.data.infor.sxcard_status < 1) {
        alert('您还没有宿卡，请选择微信支付或前往购买宿卡。');
        return false;
      }
      if (that.data.infor.good_price < that.data.infor.distribution_price) { //that.data.infor.lower_price
        that.setData({
          mark_yunfei: 1
        })
        return;
      }
      that.setData({
        sk_pay: 1
      })
      return false;
    }

    if (e.detail.value.type == 'yue') {
      that.setData({
        ye_pay: 1
      })
      return;
      wx.showModal({
        title: '提示',
        content: '您正在使用余额支付' + that.data.infor.price + '元,是否确认支付',
        success: function(res) {
          if (res.confirm) {
            that.yue_pay();
          } else if (res.cancel) {}
        }
      })
      return;
    }

    if (that.data.pay == '1') {
      return false;
    }


    that.setData({
      pay: 1
    })
    wx.request({
      url: eapi + '/order/payment',
      data: {
        uid: wx.getStorageSync('uid'),
        orderid: that.data.orderid
      },
      method: 'post',
      success: function(res) {
        if (res.data.code == 0) {
          that.wx_pay(res.data.data);
        } else {
          alert(res.data.msg);
        }
        that.setData({
          pay: 0,
        })
      }
    })

  },
  wx_pay: function(pay) { //唤醒微信支付，支付成功后跳转订单详情页
    var that = this;
    wx.requestPayment({
      timeStamp: pay.timeStamp,
      nonceStr: pay.nonceStr,
      package: pay.package,
      signType: pay.signType,
      paySign: pay.paySign,
      success: function(res) {
        Toast('支付成功');
        wx.setStorageSync('pay', 'ok');
        var t = setTimeout(function() {
          wx.navigateBack(); //返回上一个页面
        }, 1500)
      },
      fail: function(res) {
        console.log(res);
      }
    })
  },
  colse_sk_pay: function() { //关闭宿卡支付密码框
    var that = this;
    that.setData({
      sk_pay: 0,
      ye_pay: 0,
      pay_yunfei_pass:0,
    })
  },
  pass_pay: function(e) { //输入宿卡支付密码支付
    var that = this;

    if (that.data.pass_sk_pay == 1) {
      return false;
    }

    that.setData({
      pass_sk_pay: 1
    })

    if (that.data.sk_pay == 1) {
      var api_url = '/sxcard/sxcard_payment';

    } else if (that.data.pay_yunfei_pass == 1) {
      var api_url = '/Sxcard/pay_card_balance'
    } else {
      var api_url = '/order/balance_pay';
    }

    wx.request({
      url: eapi + api_url,
      data: {
        uid: wx.getStorageSync('uid'),
        orderid: that.data.orderid,
        paypwd: e.detail.value.pass,
        card_id: that.data.infor.scard_id
      },
      method: 'post',
      success: function(res) {

        if (res.data.code == 0) {
          Toast('支付成功');
          wx.setStorageSync('pay', 'ok');
          var t = setTimeout(function() {
            wx.navigateBack(); //返回上一个页面
          }, 1500)
        } else {
          alert(res.data.msg);
        }
        that.setData({
          pass_sk_pay: 0
        })
      },
    })


  },

  yue_pay: function() {
    var that = this;
    var data = this.data;
    loading();
    wx.request({
      url: eapi + '/order/balance_pay',
      data: {
        uid: wx.getStorageSync('uid'),
        money: data.infor.price,
        orderid: data.orderid
      },
      method: 'POST',
      success: function(res) {
        console.log(res);
        if (res.data.code == 0) {
          Toast('支付成功');
          wx.setStorageSync('pay', 'ok');
          var t = setTimeout(function() {
            wx.navigateBack(); //返回上一个页面
          }, 1500)
        } else {
          alert(res.data.msg);
        }
      },
      fail: function(res) {},
      complete: function(res) {
        wx.hideLoading();
      },
    })
  },

  sk_play: function() {
    var that = this;
    var infor = that.data.infor;
    if (infor.coupon_id != 0 || infor.first_free != 0) {
      alert('宿卡支付不能和优惠券或者收件免单优惠共同使用！')
      return;
    }



  },

  play_yunfei: function(e) {
    var that=this;
    console.log(e);
    var yunfei_type = e.detail.value.yunfei_type; //1微信支付，2余额支付
    console.log(yunfei_type)
    if (yunfei_type == '') {
      alert('请选择支付方式支付运费');
      return;
    }

    if (yunfei_type == 1) { //微信支付
      loading();
      wx.request({
        url: eapi + '/Sxcard/pay_card_wx',
        data: {
          uid: wx.getStorageSync('uid'),
          orderid: that.data.orderid
        },
        method: 'POST',
        success: function(res) {
          console.log(res);
          if (res.data.code == 0) {
            that.wx_pay(res.data.data);
          } else {
            alert(res.data.msg);
          }
        },
        fail: function(res) {},
        complete: function(res) {
          wx.hideLoading();
        },
      })

    }

    if (yunfei_type == 2) { //余额支付
      that.setData({
        pay_yunfei_pass: 1,
        mark_yunfei: 0,
      })



    }

  },

  close_yunfei: function() {
    var that=this;
    that.setData({
      mark_yunfei: 0,
    })
  }

  // sk_function: function () {
  //   var infor = this.data.infor;
  //   if (infor.goods_sum < infor.user_times) {
  //     return;
  //   }

  //   wx.showModal({
  //     title: '温馨提示',
  //     content: '宿卡剩余次数不足,充值更划算哦！',
  //     showCancel: true,
  //     cancelText: '取消',
  //     cancelColor: '',
  //     confirmText: '前往充值',
  //     confirmColor: '#1ca6f8',
  //     success: function (res) {
  //       if (res.confirm) {
  //         wx.navigateTo({
  //           url: '/pages/sk_card/sk_card',
  //         })
  //       }
  //     }
  //   })
  // }
})