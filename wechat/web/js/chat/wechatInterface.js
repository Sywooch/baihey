/**
 * Created by Administrator on 2016/3/23.
 */
define(['http://res.wx.qq.com/open/js/jweixin-1.0.0.js','chat/chat'] , function (wx,chat) {
    // 微信接口调用
    wx.setConfig = function ($config) {

        wx.config($config);

        wx.ready(function () {

        });

        wx.error(function(res){

        })
    }

    /**
     * 发送语音
     * @param toUser
     */
    wx.send_record = function (toUser) {
        var localId = null;
        var serverId = null; // 音频服务端ID
        wx.stopRecord({
                success: function (res) {
                    localId = res.localId;
                    if (localId != null) {
                        wx.uploadVoice({
                            localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                            success: function (res) {
                                serverId = res.serverId; // 返回音频的服务器端ID
                                chat.sendMessage(serverId , toUser ,'record')
                            }
                        });
                    }else{
                        alert('没有录音Id');
                    }
                }
            }
        );
    }

    /**
     * 发送图片
     * @param toUser
     */
    wx.send_pic = function(toUser){

    }

    return wx;
})