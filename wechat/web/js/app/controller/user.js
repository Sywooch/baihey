/**
 * Created by Administrator on 2016/3/22.
 */

define(['app/module', 'app/directive/directiveApi'
    , 'app/service/serviceApi'
], function (module) {

    // 注册
    module.controller("User.register", ['app.serviceApi', '$scope', '$ionicPopup', '$ionicLoading', '$interval', '$location', '$ionicModal', function (api, $scope, $ionicPopup, $ionicLoading, $interval, $location, $ionicModal) {

        $scope.User = {};
        $scope.validate = {};

        $scope.codeTitle = '获取验证码';

        //如果文档高度大于屏幕高度，使用文档高度。 否则使用屏幕高度
        if (document.body.scrollHeight > document.documentElement.clientHeight) {
            $scope.winHeight = {
                'height': document.body.scrollHeight + 'px'
            }
        } else {
            $scope.winHeight = {
                'height': document.documentElement.clientHeight + 'px'
            }
        }

        $scope.sexToggle = function (sex, event) {
            event.stopPropagation();
            $scope.User.sex = sex;
        }

        function validateFrom() {
            if (!$scope.User.sex) {
                ar.saveDataAlert($ionicPopup, '请选择您的性别');
                return false;
            }
            if (!ar.validateMobile($scope.User.mobile)) {
                ar.saveDataAlert($ionicPopup, '请输入正确的手机号码');
                return false;
            }
            return true;
        }

        $ionicModal.fromTemplateUrl('sendCodeModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.openSendCodeModal = function () {
            $scope.modal.show();
        };
        $scope.closeSendCodeModal = function () {
            $scope.modal.hide();
        };

        $scope.getVerify = function (event) {
            event.target.src = '/wap/user/get-verify?time=' + ar.timeStamp();
        }

        // 倒计时
        $scope.getCode = function () {
            validateFrom();
            api.getMobileIsExist($scope.User.mobile).success(function (res) {
                if (res.status < 1) {
                    ar.saveDataAlert($ionicPopup, '该手机号码已存在');
                    return false;
                } else {
                    $scope.openSendCodeModal();
                }
            });

        }

        $scope.sendCode = function () {
            api.get('/wap/user/check-code', {verify_code: $scope.validate.verify}).success(function (res) {
                if (!res) {
                    ar.saveDataAlert($ionicPopup, '验证码不正确');
                    angular.element(document.querySelectorAll('#verify')[0]).attr('src', '/wap/user/get-verify?time=' + ar.timeStamp())
                    return false;
                } else {
                    $scope.closeSendCodeModal();
                    var timeTitle = 60;
                    var timer = $interval(function () {
                        $scope.codeTitle = '重新获取(' + timeTitle + ')';
                    }, 1000, 60);
                    timer.then(function () {
                        $scope.codeTitle = '获取验证码';
                        $interval.cancel(timer);
                    }, function () {
                        ar.saveDataAlert($ionicPopup, '倒计时出错');
                    }, function () {
                        timeTitle -= 1;
                    });

                    // 发送验证码
                    api.sendCodeMsg($scope.User.mobile).success(function (res) {
                        if (res.status < 1) {
                            $interval.cancel(timer);
                            ar.saveDataAlert($ionicPopup, res.msg);
                        }
                    });
                }
            });
        }

        //注册提交
        $scope.register = function () {
            if (!validateFrom()) return false;
            api.validateCode($scope.User.code).success(function (res) {
                if (!res.status) {
                    ar.saveDataAlert($ionicPopup, '验证码不正确');
                    return false;
                } else {
                    delete $scope.User.code;
                    $ionicLoading.show({template: '注册中...'});
                    var result = api.save('/wap/user/register', $scope.User);
                    result.success(function (data) {
                        $ionicLoading.hide();
                        if (data.status == 1) {
                            ar.setStorage('userInfo', data.data);
                            var alertPopup = $ionicPopup.alert({
                                title: '重要提示',
                                template: '您的初始密码为：' + ar.getPassByPhone($scope.User.mobile) + '，请及时前往个人中心修改您的密码。'
                            });
                            alertPopup.then(function (res) {
                                top.location.href = '/wap/site/main#/index';
                            });

                        } else {
                            ar.saveDataAlert($ionicPopup, data.msg);
                        }
                    }).error(function () {
                        $ionicLoading.hide();
                        ar.saveDataAlert($ionicPopup, '网络连接错误，请重试！');
                    })
                }
            });
        }

    }])

    // 登录
    module.controller("User.login", ['app.serviceApi', '$scope', '$ionicPopup', '$location', '$ionicLoading', function (api, $scope, $ionicPopup, $location, $ionicLoading) {

        $scope.User = {};

        $scope.login = function () {

            if (!$scope.validateFrom()) return;
            $ionicLoading.show({template: '登录中...'});
            api.save('/wap/user/login', $scope.User).success(function (res) {
                $ionicLoading.hide();
                if (res.status) {
                    // 存储userInfo
                    top.location.href = '/wap/site/main#/index';
                } else {
                    ar.saveDataAlert($ionicPopup, res.msg);
                }

            }).error(function () {
                $ionicLoading.hide();
                ar.saveDataAlert($ionicPopup, '网络连接错误，请重试');
            })

        }

        $scope.validateFrom = function () {

            if (!$scope.User.username) {
                ar.saveDataAlert($ionicPopup, '请输入您的手机号码或ID');
                return false;
            }

            if (!$scope.User.password) {
                ar.saveDataAlert($ionicPopup, '请输入您的密码');
                return false;
            }

            return true;
        }

    }])

    //找回密码
    module.controller("User.forgetpass", ['app.serviceApi', '$scope', '$ionicPopup', '$ionicModal','$interval', function (api, $scope, $ionicPopup, $ionicModal,$interval) {

        $scope.formData = {};

        $scope.codeBtn = '获取验证码';

        $scope.validate = {};

        $ionicModal.fromTemplateUrl('sendCodeModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.openSendCodeModal = function () {
            $scope.modal.show();
        };
        $scope.closeSendCodeModal = function () {
            $scope.modal.hide();
        };

        // 发送验证码
        $scope.getCode = function () {

            if (!ar.validateMobile($scope.formData.phone)) {  // 验证手机格式
                ar.saveDataAlert($ionicPopup, '请输入正确的手机号码');
                return false;
            }

            api.getMobileIsExist($scope.formData.phone).success(function (res) {
                if (res.status > 0) {
                    ar.saveDataAlert($ionicPopup, '该手机号码还未注册，请直接注册');
                    return false;
                } else {
                    $scope.openSendCodeModal();
                }
            });
        }

        $scope.sendCode = function () {
            api.get('/wap/user/check-code', {verify_code: $scope.validate.verify}).success(function (res) {
                if (!res) {
                    ar.saveDataAlert($ionicPopup, '验证码不正确');
                    angular.element(document.querySelectorAll('#verify')[0]).attr('src', '/wap/user/get-verify?time=' + ar.timeStamp())
                    return false;
                } else {
                    $scope.closeSendCodeModal();
                    var timeTitle = 60;
                    var timer = $interval(function () {
                        $scope.codeBtn = '重新获取(' + timeTitle + ')';
                    }, 1000, 60);
                    timer.then(function () {
                        $scope.codeBtn = '获取验证码';
                        $interval.cancel(timer);
                    }, function () {
                        ar.saveDataAlert($ionicPopup, '倒计时出错');
                    }, function () {
                        timeTitle -= 1;
                    });

                    // 发送验证码
                    api.sendCodeMsg($scope.formData.phone).success(function (res) {
                        if (res.status < 1) {
                            $interval.cancel(timer);
                            ar.saveDataAlert($ionicPopup, res.msg);
                        }
                    });
                }
            });
        }

        // 下一步
        $scope.next = function () {

            //比对验证码是否正确
            api.validateCode($scope.formData.code).success(function (data) {
                if (data.status) {   //验证成功则跳转设置新密码页
                    window.location.href = '/wap/user/setpass?mobile=' + $scope.formData.phone;
                } else {
                    ar.saveDataAlert($ionicPopup, '验证码不正确');
                    return false;
                }
            });
        }


    }])

    //设置新密码
    module.controller("User.setpass", ['app.serviceApi', '$scope', '$ionicPopup', function (api, $scope, $ionicPopup) {

        $scope.User = {};

        $scope.mobile = ar.getQueryString('mobile');


        //设置新密码
        $scope.User.setpass = function () {

            if (!ar.validatePass($scope.User.password)) {
                ar.saveDataAlert($ionicPopup, '密码不能少于6位字符');
                return false;
            }

            if ($scope.User.password != $scope.User.repassword) {
                ar.saveDataAlert($ionicPopup, '两次输入的密码不一致');
                return false;
            }

            var formData = [];
            formData.password = $scope.User.password;
            formData.phone = $scope.mobile;
            api.save('/wap/user/forgot-password', formData).success(function (data) {
                if (data.status) {
                    //提交成功
                    window.location.href = '/wap/user/login'

                } else {
                    ar.saveDataAlert($ionicPopup, '设置密码失败');
                }
            }).error(function () {
                ar.saveDataAlert($ionicPopup, '网络错误，请稍候再试');
            });

        }

    }])

    return module;
})


