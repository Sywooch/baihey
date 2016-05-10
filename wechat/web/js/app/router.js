/**
 * Created by Administrator on 2016/3/22.
 */
define(["app/module", 'app/service/serviceApi'],
    function (module) {
        module.run(['$rootScope', '$state', '$timeout', 'app.serviceApi', '$ionicLoading', function ($rootScope, $state, $timeout, api, $ionicLoading) {
            var messageList = function () {
                api.list('/wap/message/message-list', []).success(function (res) {
                    $rootScope.messageList = ar.getStorage('messageList') ? ar.getStorage('messageList') : [];
                    var list = res.data;
                    for (var i in list) {
                        list[i].info = JSON.parse(list[i].info);
                        list[i].identity_pic = JSON.parse(list[i].identity_pic);
                        var flag = true;
                        for (var j in $rootScope.messageList) {  // 相同消息合并
                            if ($rootScope.messageList[j].send_user_id == list[i].send_user_id) {
                                $rootScope.messageList[j] = list[i];
                                flag = false;
                                break;
                            }
                        }
                        if (flag) {
                            $rootScope.messageList.push(list[i]);
                        }
                    }
                    //console.log($rootScope.messageList)
                    ar.setStorage('messageList', $rootScope.messageList)
                });
            }
            $rootScope.$on('$stateChangeStart', function (evt, next) {
                if (next.url == '/message') {
                    messageList();
                    $rootScope.handle = setInterval(function () {
                        messageList();
                    }, 5000);
                } else {
                    clearInterval($rootScope.handle)
                }

            });
            // 页面开始加载
            $rootScope
                .$on('$stateChangeStart',
                    function (event, toState, toParams, fromState, fromParams) {
                        $ionicLoading.show();
                    });
            // 页面加载成功
            $rootScope
                .$on('$stateChangeSuccess',
                    function (event, toState, toParams, fromState, fromParams) {
                        $ionicLoading.hide();
                    });
        }]);
        return module.config(["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider", function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
                $ionicConfigProvider.templates.maxPrefetch(0);
                $ionicConfigProvider.tabs.position("bottom");
                $stateProvider
                    .state('main', {
                        url: "/main",
                        templateUrl: "main.html",
                        controller: 'main'
                    })
                    .state('main.index', {   // 首页
                        url: "/index",
                        views: {
                            'home-tab': {
                                templateUrl: "/wechat/views/site/index.html"
                            }
                        }
                    })
                    .state('main.member_information', {   // 资料
                        url: "/information",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/information.html"
                            }
                        }
                    })
                    .state('main.member_dynamic', {   // 个人动态
                        url: "/dynamic",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/dynamic.html"
                            }
                        }
                    })
                    .state('main.member_signature', {  //  个性签名
                        url: "/signature",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/signature.html",
                                controller: 'member.signature'
                            }
                        }
                    })
                    .state('main.member_real_name', {   //  真实姓名
                        url: "/real_name",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/real_name.html",
                                controller: 'member.real_name'
                            }
                        }
                    })
                    .state('main.member_age', {    //  年龄
                        url: "/age",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/age.html",
                                controller: 'member.age'
                            }
                        }
                    })
                    .state('main.member_height', {      // 身高
                        url: "/height",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/height.html",
                                controller: 'member.height'
                            }
                        }
                    })
                    .state('main.member_is_marriage', {    // 婚姻状况
                        url: "/is_marriage",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/is_marriage.html",
                                controller: 'member.is_marriage'
                            }
                        }
                    })
                    .state('main.member_education', {    // 学历
                        url: "/education",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/education.html",
                                controller: 'member.education'
                            }
                        }
                    })
                    .state('main.member_occupation', {   // 职业
                        url: "/occupation",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/occupation.html",
                                controller: 'member.occupation'
                            }
                        }
                    })
                    .state('main.member_address', {    // 地区
                        url: "/address",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/address.html",
                                controller: 'member.address'
                            }
                        }
                    })
                    .state('main.member_haunt_address', {   // 常出没地
                        url: "/haunt_address",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/haunt_address.html",
                                controller: 'member.haunt_address'
                            }
                        }
                    })
                    .state('main.member_wechat_number', {   // 微信号
                        url: "/wechat_number",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/wechat_number.html",
                                controller: 'member.wechat_number'
                            }
                        }
                    })
                    .state('main.member_qq_number', {    //  QQ号
                        url: "/qq_number",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/qq_number.html",
                                controller: 'member.qq_number'
                            }
                        }
                    })
                    .state('main.member_been_address', {   // 去过的地方
                        url: "/been_address",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/been_address.html",
                                controller: 'member.been_address'
                            }
                        }
                    })
                    .state('main.member_want_address', {   // 想去的地方
                        url: "/want_address",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/want_address.html",
                                controller: 'member.want_address'
                            }
                        }
                    })
                    .state('main.member_sports', {   // 喜欢的运动
                        url: "/sports",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/sports.html",
                                controller: 'member.sports'
                            }
                        }
                    })
                    .state('main.member_movie', {  // 喜欢的电影
                        url: "/movie",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/movie.html",
                                controller: 'member.movie'
                            }
                        }
                    })
                    .state('main.member_delicacy', {   // 喜欢的美食
                        url: "/delicacy",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/delicacy.html",
                                controller: 'member.delicacy'
                            }
                        }
                    })
                    .state('main.member_mate', {  // 未来伴侣的期望
                        url: "/mate",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/mate.html",
                                controller: 'member.mate'
                            }
                        }
                    })
                    .state('main.member_children', {  // 子女状况
                        url: "/children",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/children.html",
                                controller: 'member.children'
                            }
                        }
                    })
                    .state('main.member_nation', {  // 民族
                        url: "/nation",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/nation.html",
                                controller: 'member.nation'
                            }
                        }
                    })
                    .state('main.member_work', {  // 工作单位
                        url: "/work",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/work.html",
                                controller: 'member.work'
                            }
                        }
                    })
                    .state('main.member_salary', {  // 年收入
                        url: "/salary",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/salary.html",
                                controller: 'member.salary'
                            }
                        }
                    })
                    .state('main.member_house', {  // 购房情况
                        url: "/house",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/house.html",
                                controller: 'member.house'
                            }
                        }
                    })
                    .state('main.member_car', {  // 购车情况
                        url: "/car",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/car.html",
                                controller: 'member.car'
                            }
                        }
                    })
                    .state('main.member_blood', {  // 血型
                        url: "/blood",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/blood.html",
                                controller: 'member.blood'
                            }
                        }
                    })
                    .state('main.member_school', {  // 毕业院校
                        url: "/school",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/school.html",
                                controller: 'member.school'
                            }
                        }
                    })
                    .state('main.member_zo_age', {  // 择偶标准-年龄
                        url: "/zo_age",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/zo_age.html",
                                controller: 'member.zo_age'
                            }
                        }
                    })
                    .state('main.member_zo_height', {  // 择偶标准-身高
                        url: "/zo_height",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/zo_height.html",
                                controller: 'member.zo_height'
                            }
                        }
                    })
                    .state('main.member_zo_education', {  // 择偶标准-学历
                        url: "/zo_education",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/zo_education.html",
                                controller: 'member.zo_education'
                            }
                        }
                    })
                    .state('main.member_zo_marriage', {  // 择偶标准-婚姻状况
                        url: "/zo_marriage",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/zo_marriage.html",
                                controller: 'member.zo_marriage'
                            }
                        }
                    })
                    .state('main.member_zo_house', {  // 择偶标准-购房情况
                        url: "/zo_house",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/zo_house.html",
                                controller: 'member.zo_house'
                            }
                        }
                    })
                    .state('main.member_zo_car', {  // 择偶标准-购车情况
                        url: "/zo_car",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/zo_car.html",
                                controller: 'member.zo_car'
                            }
                        }
                    })
                    .state('main.member_zo_zodiac', {  // 择偶标准-属相
                        url: "/zo_zodiac",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/zo_zodiac.html",
                                controller: 'member.zo_zodiac'
                            }
                        }
                    })
                    .state('main.member_zo_constellation', {  // 择偶标准-星座
                        url: "/zo_constellation",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/zo_constellation.html",
                                controller: 'member.zo_constellation'
                            }
                        }
                    })
                    .state('main.member_preview', {  // 预览资料
                        url: "/preview",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/preview.html",
                                controller: 'member.preview'
                            }
                        }
                    })
                    .state('main.member_follow', {  // 我-谁关注了我
                        url: "/follow",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/follow.html",
                                controller: 'member.follow'
                            }
                        }
                    })
                    .state('main.member_user_info', {  // 查看用户资料
                        url: "/user_info?userId&tempUrl",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/user_info.html",
                                controller: 'member.user_info'
                            }
                        }
                    })
                    .state('main.member_privacy', {  // 隐私设置
                        url: "/privacy",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/privacy.html",
                                controller: 'member.privacy'
                            }
                        }
                    })
                    .state('main.member_privacy_pic', {  // 隐私设置-照片权限
                        url: "/privacy_pic",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/privacy_pic.html",
                                controller: 'member.privacy_pic'
                            }
                        }
                    })
                    .state('main.member_privacy_per', {  // 隐私设置-个人动态权限
                        url: "/privacy_per",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/privacy_per.html",
                                controller: 'member.privacy_per'
                            }
                        }
                    })
                    .state('main.member_privacy_wechat', {  // 隐私设置-微信显示权限
                        url: "/privacy_wechat",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/privacy_wechat.html",
                                controller: 'member.privacy_wechat'
                            }
                        }
                    })
                    .state('main.member_privacy_qq', {  // 隐私设置-QQ显示权限
                        url: "/privacy_qq",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/privacy_qq.html",
                                controller: 'member.privacy_qq'
                            }
                        }
                    })
                    .state('main.member_privacy_black', {  // 隐私设置-黑名单
                        url: "/privacy_black",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/privacy_black.html",
                                controller: 'member.privacy_black'
                            }
                        }
                    })
                    .state('main.member_security', {  // 账户安全
                        url: "/security",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/security.html",
                                controller: 'member.security'
                            }
                        }
                    })
                    .state('main.member_security_pass', {  // 账户安全-密码修改
                        url: "/security_pass",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/security_pass.html",
                                controller: 'member.security_pass'
                            }
                        }
                    })
                    .state('main.member_security_phone', {  // 账户安全-手机绑定
                        url: "/security_phone",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/security_phone.html",
                                controller: 'member.security_phone'
                            }
                        }
                    })
                    .state('main.member_security_wechat', {  // 账户安全-微信绑定
                        url: "/security_wechat",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/security_wechat.html",
                                controller: 'member.security_wechat'
                            }
                        }
                    })
                    .state('main.member_security_qq', {  // 账户安全-QQ绑定
                        url: "/security_qq",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/security_qq.html",
                                controller: 'member.security_qq'
                            }
                        }
                    })
                    .state('main.member_honesty', {  // 诚信认证
                        url: "/honesty",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/honesty.html",
                                controller: 'member.honesty'
                            }
                        }
                    })
                    .state('main.member_honesty_sfz', {  // 诚信认证-身份认证
                        url: "/honesty_sfz",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/honesty_sfz.html",
                                controller: 'member.honesty_sfz'
                            }
                        }
                    })
                    .state('main.member_honesty_marr', {  // 诚信认证-婚姻认证
                        url: "/honesty_marr",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/honesty_marr.html",
                                controller: 'member.honesty_marr'
                            }
                        }
                    })
                    .state('main.member_honesty_edu', {  // 诚信认证-学历认证
                        url: "/honesty_edu",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/honesty_edu.html",
                                controller: 'member.honesty_edu'
                            }
                        }
                    })
                    .state('main.member_honesty_housing', {  // 诚信认证-房产认证
                        url: "/honesty_housing",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/honesty_housing.html",
                                controller: 'member.honesty_housing'
                            }
                        }
                    })
                    .state('main.member_bribery', {  // 诚信认证-房产认证
                        url: "/bribery",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/bribery.html",
                                controller: 'member.bribery'
                            }
                        }
                    })
                    .state('main.message', {  // 消息首页
                        cache: false,
                        url: "/message",
                        views: {
                            'message-tab': {
                                templateUrl: "/wechat/views/message/index.html"
                            }
                        }
                    })
                    .state('main.message_chat', { // 聊天页面
                        cache: false,
                        url: "/chat?id&head_pic&real_name&sex&age",
                        views: {
                            'message-tab': {
                                templateUrl: "/wechat/views/message/chat.html"
                            }
                        },

                        onExit: function ($rootScope) {

                            var messageList = ar.getStorage("messageList");
                            var flag = true;
                            var i = 0;

                            if (messageList != undefined && messageList != '') {
                                for (i in messageList) {
                                    if (messageList[i].receive_user_id == $rootScope.receiveUserInfo.id || messageList[i].send_user_id == $rootScope.receiveUserInfo.id) {
                                        if ($rootScope.historyList != undefined && $rootScope.historyList.length > 0) {

                                            messageList[i].message = $rootScope.historyList[$rootScope.historyList.length - 1].message
                                        }
                                        flag = false;
                                    }
                                }
                            }
                            if (flag) {
                                $rootScope.receiveUserInfo.info = JSON.parse($rootScope.receiveUserInfo.info);
                                $rootScope.receiveUserInfo.identity_pic = JSON.parse($rootScope.receiveUserInfo.identity_pic);
                                $rootScope.receiveUserInfo.receive_user_id = $rootScope.receiveUserInfo.id;
                                $rootScope.receiveUserInfo.other = $rootScope.receiveUserInfo.id;
                                $rootScope.receiveUserInfo.send_user_id = $rootScope.receiveUserInfo.send_user_id;
                                if ($rootScope.historyList != undefined && $rootScope.historyList.length > 0) {
                                    $rootScope.receiveUserInfo.message = $rootScope.historyList[$rootScope.historyList.length - 1].message
                                }

                                messageList.push($rootScope.receiveUserInfo);
                            }


                            ar.setStorage('messageList', messageList);

                        }
                    })
                    .state('main.member', {
                        url: "/member",
                        views: {
                            'member-tab': {
                                templateUrl: "/wechat/views/member/index.html"
                            }
                        }
                    })
                    .state('main.discovery', {
                        url: "/discovery",
                        views: {
                            'discovery-tab': {
                                templateUrl: "/wechat/views/discovery/index.html"
                            }
                        }
                    })
                    .state('main.rendezvous', {
                        url: "/rendezvous",
                        views: {
                            'rendezvous-tab': {
                                templateUrl: "/wechat/views/rendezvous/index.html"
                            }
                        }
                    });
                //$urlRouterProvider.otherwise("/main/index");
            }])
            .controller('main', ['$scope', '$location', 'app.serviceApi', function ($scope, $location, api) {
                if (ar.getCookie('bhy_user_id') > 0) {
                    api.getMessageNumber().success(function (res) {
                        $scope.msgNumber = parseInt(res.data);
                    });
                    setInterval(function () {
                        api.getMessageNumber().success(function (res) {
                            $scope.msgNumber = parseInt(res.data);
                        });
                    }, 10000);
                } else {
                    $scope.msgNumber = 0;
                }
                $scope.upUserStorage = function (name, value, type) {
                    if (type == 'wu') {
                        eval('$scope.userInfo.' + name + ' = ' + value);
                    } else {
                        eval('$scope.userInfo.' + type + '.' + name + ' = ' + value);
                    }
                }

                var getUserStorage = function () {
                    $scope.userInfo.info = JSON.parse($scope.userInfo.info);
                    $scope.userInfo.identity_pic = JSON.parse($scope.userInfo.identity_pic);
                }

                $scope.setUserStorage = function () {
                    $scope.userInfo.info = JSON.stringify($scope.userInfo.info);
                    $scope.userInfo.identity_pic = JSON.stringify($scope.userInfo.identity_pic);
                    ar.setStorage('userInfo', $scope.userInfo);
                    window.location.hash = '/main/information';
                    getUserStorage();
                }

                if ($scope.userInfo = ar.getStorage('userInfo')) {
                    getUserStorage();
                } else {
                    api.list("/wap/user/get-user-info", []).success(function (res) {
                        $scope.userInfo = res.data;
                        ar.setStorage('userInfo', res.data);
                        getUserStorage();
                    });
                }
                //$scope.userInfo = [{}];
            }])
    });
