/**
 * Created by NSK. on 2016/4/5/0005.
 */
define(['app/module', 'app/directive/directiveApi'
    , 'app/service/serviceApi', 'comm'
], function (module) {

    module.controller("message.index", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', function (api, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading) {
        $scope.userInfo = {};
        // 获取页面数据

        // 获取localstorage消息记录
        var messageList = ar.getStorage("messageList");
        $scope.messageList = new Array();
        if (messageList != null){
            $scope.messageList = messageList;
        }

        // 从服务器获取未看消息
        api.list('/wap/message/message-list', []).success(function (res) {
            var list = res.data;
            for (var i in list) {
                list[i].info = JSON.parse(list[i].info);
                list[i].identity_pic = JSON.parse(list[i].identity_pic);
                var flag = true;
                for (var j in $scope.messageList){  // 相同消息合并
                    if ($scope.messageList[j].send_user_id == list[i].send_user_id){
                        $scope.messageList[j] = list[i];
                        flag = false;
                        break;
                    }
                }
                if (flag){
                    $scope.messageList.push(list[i]);
                }
            }
            //console.log($scope.messageList)
            ar.setStorage('messageList' , $scope.messageList)
        });

        $scope.userInfo.id = ar.getCookie('bhy_user_id');

        $scope.isFollow = true;   // 是否有谁关注了我，有则显示小红点

        // 联系人pop窗口
        $scope.popShow = false;
        $scope.pop_toggle = function () {
            $scope.popShow = !$scope.popShow;
        }

        // 删除操作
        $scope.removeItem = function (item) {
            api.setMsgDisplay(item.other).success(function (res) {
                if (res.status) { // 删除成功
                    $scope.items.splice($scope.items.indexOf(item), 1);
                } else {
                    $ionicPopup.alert({title: '删除失败！'});
                }
            }).error(function () {
                $ionicPopup.alert({title: '操作失败，请刷新页面重试！'});
            })

        }

        $scope.chatHref = function (id, head_pic) {
            window.location.href = '/wap/message/chat?id=' + id + '&head_pic=' + head_pic;
        }

    }]);


    module.controller("message.chat", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$ionicScrollDelegate', 'FileUploader', '$http', function (api, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicScrollDelegate, FileUploader, $http) {

        $scope.multi = false;
        $scope.showMulti = function () {
            $scope.multi = !$scope.multi;
        }

        $scope.scrollBot = function () {
            $ionicScrollDelegate.scrollBottom(true);
        }

        $scope.talk_type = 'voice';

        $scope.changeType = function () {
            if ($scope.talk_type == 'voice') {
                $scope.talk_type = 'txt';
            } else {
                $scope.talk_type = 'voice';
            }
        }

        // 是否已关注对方， 已关注则不显示关注按钮。
        $scope.u_isFollow = true;

        // 加关注
        $scope.addFollow = function () {

            $scope.followData = [{sendId: $scope.sendId}, {receiveId: $scope.receiveId}];

            api.save(url, $scope.followData).success(function (res) {

                // 成功，提示
                $ionicPopup.alert({title: '加关注成功'});

            });
        }

        // 发红包
        $ionicModal.fromTemplateUrl('briberyModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.briberyModal = modal;
            $scope.briPageHide = function () {
                modal.hide();
            }
        });

        // 查看图片
        $scope.showPic = false;
        $scope.detail_pic = function(id){
            $scope.showPicAdd = id;
            $scope.showPic = true;
        }
        $scope.hidePicBox = function(){
            $scope.showPic = false;
        }


        // 播放语音
        $scope.detail_record = function (id) {


        }

        // 领取红包
        $ionicModal.fromTemplateUrl('detailBriModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.detailBriModal = modal;
        });
        $scope.detail_bri = function (id, status) {
            $scope.detailBriModal.show();
        }

        // 打开红包
        $ionicModal.fromTemplateUrl('detaiOpenBriModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.detaiOpenBriModal = modal;
        });


        // 测试数据
        /*$scope.historyList = [
            {
                id: 1,
                send_user_id: 1001,
                headImgUrl: '/wechat/web/images/test.jpg',
                type: 'txt',
                content: '你好你好你好啊，测试文本消息',
                status: 1,
                display: 1
            },
            {
                id: 2,
                send_user_id: 1001,
                headImgUrl: '/wechat/web/images/test.jpg',
                type: 'pic',
                content: '/wechat/web/images/test2.jpg',
                status: 3,
                display: 1
            },
            {
                id: 3,
                send_user_id: 1001,
                headImgUrl: '/wechat/web/images/test.jpg',
                type: 'record',
                content: '语音路径',
                status: 2,
                display: 1

            },
            {
                id: 4,
                send_user_id: 1001,
                headImgUrl: '/wechat/web/images/test.jpg',
                type: 'bri',
                content: '红包数据',
                status: 4,
                display: 1
            }

        ]*/

        // 对方是否认证身份
        $scope.auth_validate = function (receviceId) {

            api.getUserAuthStatus(receviceId).success(function (res) {

                // 显示警示语
                $scope.u_auth_validate = res.status;

            })
        }

        // 红娘评价
        $scope.marker_rated = function (receviceId) {
            api.getUserAuthStatus(receviceId).success(function (res) {

                // 显示红娘评价
                $scope.u_maker_rated = res.status;

            })
        }


         //  获取历史聊天数据
        $scope.receiveId = ar.getQueryString('id') // 获取接受者ID

        $scope.receiveHeadPic = ar.getQueryString('head_pic');
        $scope.sendHeadPic = ar.getQueryString('head_pic');

        api.list("/wap/message/message-history", {id: $scope.receiveId}).success(function (data) {
        $scope.historyList = data;

        }).error(function () {

            console.log('页面message.js出现错误，代码：/wap/chat/message-history');

        })

        // 实例化上传图片插件
        $scope.uploader = new FileUploader({url: '/wap/file/upload'});

        // socket聊天
        requirejs(['chat/wechatInterface', 'chat/chat'], function (wx, chat) {

            // 配置微信
            wx.setConfig($scope.wx_config);

            // 初始化聊天
            chat.init($scope.sendId);

            // 发送消息函数
            var sendMessage = function (serverId, sendId, toUser, type){
                var flagTime = ar.timeStamp();
                chat.sendMessage(serverId, sendId, toUser, type , flagTime);
                var id = 0;
                if ($scope.historyList == undefined || $scope.historyList.length == 0) { // 判断是否有聊天内容设置ID
                    id = 1 ;
                } else {
                    id = $scope.historyList[$scope.historyList.length - 1].id + 1;
                }

                $scope.historyList.push({id:id,message:serverId , send_user_id : sendId , receive_user_id:toUser , type:type,status:3 , time:flagTime})

            }

            // 开始录音
            $scope.start_record = function () {
                wx.startRecord();
            }

            // 结束录音
            $scope.send_record = function () {
                console.log('end');
                wx.send_record($scope.sendId, $scope.receiveId , function (serverId,sendId, toUser ,type) {
                    sendMessage(serverId, sendId, toUser, type);
                });
            }

            // 发送文本消息调用接口
            $scope.send = function () {

                if ($scope.message == '' || $scope.message == null) return;

                sendMessage($scope.message, $scope.sendId, $scope.receiveId, 'send');

            }



            // 发送图片
            $scope.send_pic = function () {
                var e = document.getElementById("pic_fileInput");
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                e.dispatchEvent(ev);

                // 过滤器，限制用户只能上传图片
                $scope.uploader.filters.push({
                    name: 'file-type-Res',
                    fn: function (item) {

                        if (!ar.msg_file_res_img(item)) {   // 验证文件是否是图片格式
                            $ionicPopup.alert({title: '只能发送图片类型的文件！'});
                            return false;
                        }

                        if ((item.size / 1024) > 2) {    // 图片大于2M，则压缩图片
                            api.resizeFile(item).then(function (blob_data) {
                                var fd = new FormData();
                                fd.append("imageFile", blob_data);
                                console.log(fd);
                            }, function (err_reason) {
                                console.log(err_reason);
                            });
                        }

                        return true;
                    }
                });

                var length = $scope.uploader.queue.length;
                $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {  // 上传成功
                    console.info('onSuccessItem', fileItem, response, status, headers);

                };
                $scope.uploader.onBeforeUploadItem = function (item) {   // 上传之前

                    console.info('onBeforeUploadItem', item);

                };

                $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {   // 上传出错
                    console.info('onErrorItem', fileItem, response, status, headers);
                };

                // 上传图片相关回调
                $scope.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {

                    console.info('onWhenAddingFileFailed', item, filter, options);
                };

                $scope.uploader.onAfterAddingFile = function (fileItem) {   // 上传之后
                    fileItem.uploader.queue[length].upload();
                    //console.info('onAfterAddingFile', fileItem);

                };
                $scope.uploader.onBeforeUploadItem = function (item) {   // 上传之前

                    //console.info('onBeforeUploadItem', item);
                };

                $scope.uploader.onProgressItem = function (fileItem, progress) {  // 文件上传进度

                    //console.info('onProgressItem', fileItem, progress);
                };

                $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {  // 上传成功


                    //console.info('onSuccessItem', fileItem, response, status, headers);
                };

                $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {   // 上传出错

                    //console.info('onErrorItem', fileItem, response, status, headers);
                };

                $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {  // 上传结束
                    console.log(response.path);
                    sendMessage(response.path, $scope.sendId, $scope.receiveId, 'pic');
                    //console.info('onCompleteItem', fileItem, response, status, headers);
                };

            }


            // 消息响应回调函数
            chat.onMessageCallback = function (msg) {
                var response = JSON.parse(msg.data);

                var setMessageStatus = function (response){
                    if ($scope.sendId == response.sendId){  //响应自己发送的消息
                        for (var i in $scope.historyList){
                            console.log(response.time +'=='+ $scope.historyList[i].time)
                            if(response.time == $scope.historyList[i].time && response.message == $scope.historyList[i].message){

                                $scope.historyList[i].status = 2;
                            }
                        }
                    }else{
                        $scope.historyList.push(response);
                    }
                }

                switch (response.type) {
                    case 'send': // 文字
                        setMessageStatus(response);
                        break;
                    case 'pic': // 图片
                        setMessageStatus(response);
                        break;
                    case 'record': // 录音
                        wx.downloadVoice({
                            serverId: response.message, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
                            success: function (res) {
                                wx.playVoice({
                                    localId: res.localId // 需要播放的音频的本地ID，由stopRecord接口获得
                                });

                                // 监听播放结束
                                wx.onVoicePlayEnd({
                                    success: function (res) {
                                        var localId = res.localId; // 返回音频的本地ID
                                    }

                                });
                                response.message = res.localId;
                                $scope.historyList.push(response);
                            }
                        });

                        break;
                }

                $scope.scrollBot(); // 滚动至底部
                $scope.$apply();
            }
        })

    }]);

    module.controller("message.childBriberyController", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', function (api, $scope, $timeout, $ionicPopup, $ionicModal) {

        $scope.btnStatus = true;
        $scope.money = 0;
        $scope.valMoney = function (money) {
            if (ar.validateMoney(money)) {
                $scope.money = money;
                if (money > 200) {
                    $scope.btnStatus = true;
                } else {
                    $scope.btnStatus = false;
                }
            } else {
                $scope.money = 0;
                $scope.btnStatus = true;
            }
        }


        // 发红包
        $scope.bri_submit = function () {
            if ($scope.money == 0) {
                $ionicPopup.alert({title: '红包金额不合法'});
                return false;
            }

            $scope.briFormData = [{sendId: $scope.sendId, receiveId: $scope.receiveId, money: $scope.money}];

            api.save(url, $scope.briFormData).success(function (res) {

                //成功，隐藏窗口
                $scope.briPageHide();
            });
        }

    }]);

    // 领取红包
    module.controller("message.childDetailBriController", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', function (api, $scope, $timeout, $ionicPopup, $ionicModal) {

    }]);
})
