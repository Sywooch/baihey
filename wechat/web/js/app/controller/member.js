/**
 * Created by Administrator on 2016/3/22.
 */

define(['app/module', 'app/router', 'app/directive/directiveApi'
    , 'app/service/serviceApi', 'config/area'
], function (module) {

    // 我
    module.controller("member.index", ['app.serviceApi', '$scope', '$ionicPopup', function (api, $scope, $ionicPopup) {

        // 退出登录
        $scope.loginOut = function () {
            api.save('/wap/member/login-out', {}).success(function (res) {
                // 跳转登录页
                ar.delCookie('bhy_u_sex');
                ar.delCookie('bhy_u_city');
                ar.delCookie('bhy_user_id');
                ar.delCookie('bhy_u_cityId');
                ar.delCookie('bhy_u_cityPid');
                localStorage.clear();
                location.href = '/wap/user/login';
            });
        }
    }]);

    // 资料首页
    module.controller("member.information", ['app.serviceApi', '$scope', '$ionicPopup', 'FileUploader', '$ionicLoading', '$ionicActionSheet', function (api, $scope, $ionicPopup, FileUploader, $ionicLoading, $ionicActionSheet) {
        requirejs(['amezeui', 'amezeui_ie8'], function (amezeui, amezeui_ie8) {

        });

        // 实例化上传图片插件
        var uploader = $scope.uploader = new FileUploader({
            url: '/wap/file/thumb-photo'
        });

        $scope.formData = [];
        $scope.imgList = [];
        var head_id = 0;
        api.list('/wap/member/photo-list', []).success(function (res) {
            $scope.imgList = res.data;
        });

        $scope.addNewImg = function () {
            var e = document.getElementById("pic_fileInput");
            var ev = document.createEvent("MouseEvents");
            ev.initEvent("click", true, true);
            e.dispatchEvent(ev);

            uploader.filters.push({
                name: 'file-type-Res',
                fn: function (item) {
                    if (!ar.msg_file_res_img(item)) {   // 验证文件是否是图片格式
                        $ionicPopup.alert({title: '只能上传图片类型的文件！'});
                        return false;
                    }
                    return true;
                }
            });

            uploader.onAfterAddingFile = function (fileItem) {  // 选择文件后
                fileItem.upload();   // 上传
            };
            uploader.onProgressItem = function (fileItem, progress) {   //进度条
                $scope.showLoading(progress);    // 显示loading
            };
            uploader.onSuccessItem = function (fileItem, response, status, headers) {  // 上传成功
                if (response.status > 0) {
                    /*if ($scope.imgList.length == 0) { // 第一张上传相片默认设为头像
                     $scope.imgList.push({id: response.id, thumb_path: response.thumb_path, is_head: 1});
                     $scope.userInfo.info.head_pic = response.thumb_path;
                     $scope.setUserStorage();
                     } else {*/
                    $scope.imgList.push({id: response.id, thumb_path: response.thumb_path, is_head: 0});
                    //}
                } else {
                    $ionicPopup.alert({title: '上传图片失败！'});
                }
            };
            uploader.onErrorItem = function (fileItem, response, status, headers) {  // 上传出错
                $ionicPopup.alert({title: '上传图片出错！'});
                $scope.hideLoading();  // 隐藏loading
            };
            uploader.onCompleteItem = function (fileItem, response, status, headers) {  // 上传结束
                $scope.hideLoading();  // 隐藏loading
            };

        }

        // 点击img，功能
        $scope.moreImg = function (index) {
            var id = $scope.imgList[index].id;
            var img = $scope.imgList[index].thumb_path;
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    {text: '设为头像'}
                ],
                destructiveText: '删除',
                titleText: '操作照片',
                cancelText: '取消',
                destructiveButtonClicked: function () {  // 点击删除
                    if (confirm("确认删除该照片？")) {
                        // 删除操作
                        api.save('/wap/member/del-photo', {'id': id}).success(function (res) {
                            $scope.imgList.splice(index, 1);
                            hideSheet();
                        });

                    } else {
                        return false;
                    }
                },
                buttonClicked: function (i) {
                    if ($scope.imgList[index].is_check != 1) {
                        $ionicPopup.alert({title: '图片未审核'});
                        hideSheet();
                        return false;
                    }
                    // 设置头像
                    api.save('/wap/member/set-head', {id: id, thumb_path: img}).success(function (res) {
                        $scope.imgList[head_id].is_head = 0;
                        $scope.imgList[index].is_head = 1;
                        head_id = index;
                        $scope.userInfo.info.head_pic = img;
                        $scope.setUserStorage();
                        hideSheet();
                    });
                    return true;
                }

            });

        }
        $scope.dynamicList = [];
        api.list('/wap/member/get-dynamic-list', {user_id: $scope.userInfo.id, page: 0}).success(function (res) {
            for (var i in res.data) {
                res.data[i].imgList = JSON.parse(res.data[i].pic);
                $scope.dynamicList.push(res.data[i]);
            }
        });
        $scope.getTravel('went_travel', $scope.userInfo.went_travel);// 我去过的地方
        $scope.getTravel('want_travel', $scope.userInfo.want_travel);// 我想去的地方
        $scope.getConfig('love_sport', $scope.userInfo.love_sport);// 喜欢的运动
        $scope.getConfig('want_film', $scope.userInfo.want_film);// 想看的电影
        $scope.getConfig('like_food', $scope.userInfo.like_food);// 喜欢的食物
    }
    ]);

    // 个人动态
    module.controller("member.dynamic", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {
        requirejs(['amezeui', 'amezeui_ie8'], function (amezeui, amezeui_ie8) {

        });

        $scope.formData = [];
        $scope.formData.userId = $location.$$search.userId;

        $scope.dynamic = [];

        // 当前登录用户的所有动态，点击加载，每页十条
        $scope.dynamic.list = [
            {
                id: 1, likeNumber: 68, commentNumber: 482, imgList: [
                {src: '/wechat/web/images/test/1.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/2.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/3.jpg', w: 200, h: 200}
            ]
            },
            {
                id: 2, likeNumber: 877, commentNumber: 1882, imgList: [
                {src: '/wechat/web/images/test/6.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/4.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/1.jpg', w: 200, h: 200}
            ]
            },
            {
                id: 3, likeNumber: 95, commentNumber: 381, imgList: [
                {src: '/wechat/web/images/test/2.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/5.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/3.jpg', w: 200, h: 200}
            ]
            },
            {
                id: 4, likeNumber: 1898, commentNumber: 3487, imgList: [
                {src: '/wechat/web/images/test/6.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/1.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/4.jpg', w: 200, h: 200}
            ]
            },
            {
                id: 5, likeNumber: 4577, commentNumber: 8841, imgList: [
                {src: '/wechat/web/images/test/5.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/6.jpg', w: 200, h: 200},
                {src: '/wechat/web/images/test/4.jpg', w: 200, h: 200}
            ]
            }

        ];

        $scope.dynamic.pageLast = true;  // 是否还有更多数据
        $scope.dynamic.like = true; // 当前登录用户是否已对该条动态点赞

        $scope.dynamic.clickLike = function () { // 点赞
            if ($scope.dynamic.like) {  // 如果已点赞，说明是再次点击，点赞数-1，相应样式变化
                $scope.dynamic.like = !$scope.dynamic.like;
                // 点赞数-1
            }
        };

        $scope.dynamic.loadMore = function () {  // 点击加载

        }

        $scope.jump = function () {
            $location.url($location.$$search.tempUrl);
        }

    }]);

    // 个性签名
    module.controller("member.signature", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.personalized = $scope.userInfo.personalized;
        $scope.saveData = function () {
            if ($scope.formData.personalized != '' && $scope.formData.personalized) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.personalized = $scope.formData.personalized;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }

        }

    }]);

    // 真实姓名
    module.controller("member.real_name", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.real_name = $scope.userInfo.info.real_name != '未知' ? $scope.userInfo.info.real_name : '';
        $scope.sex = ar.getCookie('bhy_u_sex') == 1 ? 1 : 0;  // 用户性别
        $scope.saveData = function () {

            if ($scope.formData.real_name != '' && $scope.formData.real_name) {
                var confirm = ar.saveDataConfirm($ionicPopup, '真实姓名一旦填写不可更改，确认保存吗？');
                confirm.then(function (res) {
                    if (res) {
                        api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                            $scope.userInfo.info.real_name = $scope.formData.real_name;
                            $scope.setUserStorage();
                            $location.url('/main/member/information');
                        })
                    } else {
                        return false;
                    }
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 出生年月
    module.controller("member.age", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        // 日期控件
        $scope.settings = {
            theme: 'mobiscroll',
            lang: 'zh',
            display: 'bottom',
            controls: ['date'],
            mode: $scope.mode
        };


        $scope.formData = [];
        $scope.age = '年龄';
        $scope.zodiac = {id: 0, name: '生肖'};
        $scope.constellation = {id: 0, name: '星座'};
        $scope.birthdayChange = function () {
            $scope.age = ar.getAgeByBirthday(ar.DateTimeToDate($scope.formData.birthday)) + '岁';
            $scope.zodiac = ar.getZodicByBirthday(ar.DateTimeToDate($scope.formData.birthday));
            $scope.constellation = ar.getConstellationByBirthday(ar.DateTimeToDate($scope.formData.birthday));
        }

        $scope.saveData = function () {
            if ($scope.formData.birthday && $scope.formData.birthday != '') {
                if (parseInt($scope.age) < 18) {
                    ar.saveDataAlert($ionicPopup, '如果您未满18岁，请退出本站，谢谢合作！');
                    return false;
                }
                var confirm = ar.saveDataConfirm($ionicPopup, '出生年月一旦填写不可更改，确认保存吗？');
                confirm.then(function (res) {
                    if (res) {
                        var formData = [];
                        formData.age = ar.getTimestampByBirthday(ar.DateTimeToDate($scope.formData.birthday)) + '-' + $scope.zodiac.id + '-' + $scope.constellation.id + '-' + ar.getAgeByBirthday(ar.DateTimeToDate($scope.formData.birthday));
                        api.save('/wap/member/save-data', formData).success(function (res) {
                            // 保存
                            $scope.userInfo.age = ar.getAgeByBirthday(ar.DateTimeToDate($scope.formData.birthday));
                            $scope.userInfo.info.age = ar.getTimestampByBirthday(ar.DateTimeToDate($scope.formData.birthday));
                            $scope.userInfo.info.zodiac = $scope.zodiac.id;
                            $scope.userInfo.info.constellation = $scope.constellation.id;
                            $scope.setUserStorage();
                            $location.url('/main/member/information');
                        })
                    } else {
                        return false;
                    }
                });
            } else {
                $location.url('/main/member/information');
            }
        }

    }]);

    // 身高
    module.controller("member.height", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.height = $scope.userInfo.info.height == '未知' ? '' : $scope.userInfo.info.height;

        $scope.heightList = config_infoData.height;

        $scope.saveData = function () {

            if ($scope.formData.height != '' && $scope.formData.height) {
                var confirm = ar.saveDataConfirm($ionicPopup, '身高一旦填写不可更改，确认保存吗？');
                confirm.then(function (res) {
                    if (res) {
                        api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                            $scope.userInfo.info.height = $scope.formData.height;
                            $scope.setUserStorage();
                            $location.url('/main/member/information');
                        })
                    } else {
                        return false;
                    }
                })
            } else {
                $location.url('/main/member/information');
            }
        }

    }]);

    // 婚姻状况
    module.controller("member.is_marriage", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.is_marriage = $scope.userInfo.info.is_marriage == '未知' ? '' : $scope.userInfo.info.is_marriage;

        $scope.marriageList = config_infoData.marriage;

        $scope.saveData = function () {

            if ($scope.formData.is_marriage != '' && $scope.formData.is_marriage) {
                var confirm = ar.saveDataConfirm($ionicPopup, '婚姻状况一旦填写不可更改，确认保存吗？');
                confirm.then(function (res) {
                    if (res) {
                        api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                            $scope.userInfo.info.is_marriage = $scope.formData.is_marriage;
                            $scope.setUserStorage();
                            $location.url('/main/member/information');
                        })
                    } else {
                        return false;
                    }
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 学历
    module.controller("member.education", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.education = $scope.userInfo.info.education == '未知' ? '' : $scope.userInfo.info.education;

        $scope.educationList = config_infoData.education;

        $scope.saveData = function () {

            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                // 保存
                $scope.userInfo.info.education = $scope.formData.education;
                $scope.setUserStorage();
                $location.url('/main/member/information');
            })
        }
    }]);

    // 职业
    module.controller("member.occupation", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.occupation = $scope.userInfo.info.occupation != '未知' && $scope.userInfo.info.occupation ? $scope.userInfo.info.occupation : 1;
        $scope.children_occupation = $scope.userInfo.info.children_occupation != '未知' && $scope.userInfo.info.children_occupation ? $scope.userInfo.info.children_occupation : 1;

        // 获取文档高度以适应ion-scroll
        $scope.bodyHeight = document.body.scrollHeight;
        if ($scope.bodyHeight == 0) $scope.bodyHeight = window.screen.height;
        $scope.scrollStyle = {
            'height': ($scope.bodyHeight - 44) + 'px'
        }

        $scope.occupationModel = config_infoData.occupation;

        // 用户职业
        $scope.useroccBig = $scope.occupation;  // 职业大类
        $scope.useroccSmall = $scope.children_occupation; // 职业小类

        // 如用户未填写职业，默认加载小类数据
        $scope.occupation = $scope.occupationModel[$scope.occupation - 1].children;


        $scope.selected_bigo = function (item) {
            $scope.occupation = item.children;
            $scope.big_selected = true;
            $scope.useroccBig = item.id;
        }

        $scope.selected_smallo = function (item) {
            $scope.useroccSmall = item.id;
        }

        $scope.saveData = function () {

            if ($scope.useroccSmall == 0) {
                $ionicPopup.alert({title: '请选择工作岗位'});
                return false;
            } else {
                $scope.formData.occupation = $scope.useroccBig + '-' + $scope.useroccSmall;
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.occupation = $scope.useroccBig;
                    $scope.userInfo.info.children_occupation = $scope.useroccSmall;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            }
        }

    }]);

    // 地区
    module.controller("member.address", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        // 加载数据
        $scope.provinceList = provines;

        // 用户数据
        var local = '';
        $scope.formData = [];
        $scope.formData.userprovince = ar.getObjById(provines, $scope.userInfo.province);
        $scope.formData.usercity = ar.getObjById(citys, $scope.userInfo.city);
        $scope.formData.userarea = ar.getObjById(area, $scope.userInfo.area);

        // 地区联动
        $scope.cityList = [];
        $scope.areaList = [];
        var address = function (name, pro) {
            var arr = name == 'city' ? citys : area;
            if (pro == null || pro == undefined || pro == 0) return null;
            for (var i in arr) {
                if (arr[i].parentId == pro) {
                    eval('$scope.' + name + 'List.push(arr[i])');
                }
            }
        }
        address('city', $scope.formData.userprovince.id);
        address('area', $scope.formData.usercity.id);

        // 选择省
        $scope.provinceSelect = function (pro) {
            $scope.formData.usercity = "0";
            $scope.formData.userarea = "0";
            $scope.cityList = [];  // 清空数组 市
            $scope.areaList = []; // 清空数组 区
            address('city', pro.id);
            local = pro.name;
        }

        // 选择市
        $scope.citySelect = function (cit) {
            $scope.areaList = []; // 清空数组 区
            address('area', cit.id);
            if (cit == "0") {
                $scope.formData.userarea = "0";
            }
            local = cit.name;
        }

        // 选择区
        $scope.areaSelect = function (are) {
            local = are.name;
        }

        $scope.saveData = function () {
            $scope.addressData = [];
            $scope.addressData.address = $scope.formData.userprovince.id;
            if ($scope.formData.usercity.id > 0) {
                $scope.addressData.address += '-' + $scope.formData.usercity.id;
            } else {
                $scope.addressData.address += '-0';
            }
            if ($scope.formData.userarea.id > 0) {
                $scope.addressData.address += '-' + $scope.formData.userarea.id + '-' + local;
            } else {
                $scope.addressData.address += '-0' + '-' + local;
            }
            api.save('/wap/member/save-data', $scope.addressData).success(function (res) {
                // 保存
                $scope.userInfo.info.local = local;
                $scope.userInfo.province = $scope.formData.userprovince.id;
                if ($scope.formData.usercity.id > 0) {
                    $scope.userInfo.city = $scope.formData.usercity.id;
                } else {
                    $scope.userInfo.city = '0';
                }
                if ($scope.formData.userarea.id > 0) {
                    $scope.userInfo.area = $scope.formData.userarea.id;
                } else {
                    $scope.userInfo.area = '0';
                }
                $scope.setUserStorage();
                $location.url('/main/member/information');
            })
        }

    }]);

    // 常出没地
    module.controller("member.haunt_address", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.haunt_address = $scope.userInfo.info.haunt_address != '未知' ? $scope.userInfo.info.haunt_address : '';
        $scope.saveData = function () {
            if ($scope.formData.haunt_address != '' && $scope.formData.haunt_address) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    // 保存
                    $scope.userInfo.info.haunt_address = $scope.formData.haunt_address;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }

    }]);

    // 微信号
    module.controller("member.wechat_number", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.wechat = $scope.userInfo.info.wechat != '未知' ? $scope.userInfo.info.wechat : '';
        $scope.saveData = function () {
            if ($scope.formData.wechat != '' && $scope.formData.wechat) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    // 保存
                    $scope.userInfo.info.wechat = $scope.formData.wechat;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }

    }]);

    // QQ号
    module.controller("member.qq_number", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.qq = $scope.userInfo.info.qq != '未知' ? $scope.userInfo.info.qq : '';
        $scope.saveData = function () {
            if ($scope.formData.qq != '' && $scope.formData) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    // 保存
                    $scope.userInfo.info.qq = $scope.formData.qq;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }

    }]);

    // 去过的地方
    module.controller("member.been_address", ['app.serviceApi', '$scope', '$ionicPopup', '$filter', '$ionicScrollDelegate', '$ionicLoading', '$location', function (api, $scope, $ionicPopup, $filter, $ionicScrollDelegate, $ionicLoading, $location) {

        $scope.formData = [];
        $scope.formData.userAddrIdList = $scope.userInfo.went_travel != null && $scope.userInfo.went_travel ? $scope.userInfo.went_travel.split(',') : [];// 用户已选择的地区，ID数据集，存数据库
        $scope.isMore = true;
        $scope.typeTab = 1;     // 默认国内
        $scope.domestic = [];   // 国内
        $scope.abroad = [];     // 国外
        $scope.data = [];
        $scope.pageSize = 1;     // 默认一页显示3条
        api.list('/wap/member/went-travel-list', {}).success(function (res) {    //typeId:2，国内。 typeId:3，国外
            $scope.data = res.data;
            for (var i in $scope.data) {
                for (var j in $scope.formData.userAddrIdList) {
                    if ($scope.formData.userAddrIdList[j] == $scope.data[i].id) {
                        $scope.data[i].checked = true;
                        break;
                    } else {
                        $scope.data[i].checked = false;
                    }
                }
                if ($scope.data[i].type == 2 && $scope.data[i].parentId == 0) {
                    $scope.domestic.push($scope.data[i]);
                }
                if ($scope.data[i].type == 3 && $scope.data[i].parentId == 0) {
                    $scope.abroad.push($scope.data[i]);
                }
            }
        });

        // 加载更多
        $scope.loadMore = function (typeTab) {
            if (typeTab == 1) {
                if ($scope.pageSize == $scope.domestic.length) {
                    $scope.isMore = false;
                }
            } else {
                if ($scope.pageSize == $scope.abroad.length) {
                    $scope.isMore = false;
                }
            }
            $scope.pageSize += 1;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        // 是否还有更多
        $scope.moreDataCanBeLoaded = function () {
            return $scope.isMore;
        }

        // 删除
        $scope.remove = function (event) {
            $scope.data[event].checked = false;
            $ionicScrollDelegate.$getByHandle('small').scrollTop();
        }

        // 横向滚动至底部
        $scope.scrollSmallToBottom = function (event) {
            if (event.target.checked) {
                $ionicScrollDelegate.$getByHandle('small').scrollBottom();
            } else {
                $ionicScrollDelegate.$getByHandle('small').scrollTop();
            }
        };

        $scope.showTab = function (tab) {
            $scope.typeTab = tab;
        }

        // 保存
        $scope.saveData = function () {
            $ionicLoading.show({template: '保存中...'});
            var formData = {went_travel: []};
            for (var i in $scope.data) {
                if ($scope.data[i].checked) {
                    formData.went_travel.push($scope.data[i].id);
                }
            }
            formData.went_travel = formData.went_travel.join(',');
            api.save('/wap/member/save-data', formData).success(function (res) {
                $scope.userInfo.went_travel = formData.went_travel;
                $scope.setUserStorage();
                $ionicLoading.hide();
                $location.url('/main/member/information');
            });


        }

    }
    ]);

    // 最近想去的地方
    module.controller("member.want_address", ['app.serviceApi', '$scope', '$ionicPopup', '$filter', '$ionicScrollDelegate', '$ionicLoading', '$location', function (api, $scope, $ionicPopup, $filter, $ionicScrollDelegate, $ionicLoading, $location) {

        $scope.formData = [];
        $scope.formData.userAddrIdList = $scope.userInfo.want_travel != null && $scope.userInfo.want_travel ? $scope.userInfo.want_travel.split(',') : [];  // 用户已选择的地区，ID数据集，存数据库
        $scope.isMore = true;
        $scope.typeTab = 1;     // 默认国内
        $scope.domestic = [];   // 国内
        $scope.abroad = [];     // 国外
        $scope.data = [];
        $scope.pageSize = 1;     // 默认一页显示3条
        api.list('/wap/member/went-travel-list', {}).success(function (res) {    //typeId:2，国内。 typeId:3，国外
            $scope.data = res.data;
            for (var i in $scope.data) {
                for (var j in $scope.formData.userAddrIdList) {
                    if ($scope.formData.userAddrIdList[j] == $scope.data[i].id) {
                        $scope.data[i].checked = true;
                        break;
                    } else {
                        $scope.data[i].checked = false;
                    }
                }
                if ($scope.data[i].type == 2 && $scope.data[i].parentId == 0) {
                    $scope.domestic.push($scope.data[i]);
                }
                if ($scope.data[i].type == 3 && $scope.data[i].parentId == 0) {
                    $scope.abroad.push($scope.data[i]);
                }
            }
        });

        // 加载更多
        $scope.loadMore = function (typeTab) {
            if (typeTab == 1) {
                if ($scope.pageSize == $scope.domestic.length) {
                    $scope.isMore = false;
                }
            } else {
                if ($scope.pageSize == $scope.abroad.length) {
                    $scope.isMore = false;
                }
            }
            $scope.pageSize += 1;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        // 是否还有更多
        $scope.moreDataCanBeLoaded = function () {
            return $scope.isMore;
        }

        // 删除
        $scope.remove = function (index) {
            $scope.data[index].checked = false;
            $ionicScrollDelegate.$getByHandle('small').scrollTop();
        }

        // 横向滚动至底部
        $scope.scrollSmallToBottom = function (event) {
            if (event.target.checked) {
                $ionicScrollDelegate.$getByHandle('small').scrollBottom();
            } else {
                $ionicScrollDelegate.$getByHandle('small').scrollTop();
            }
        };

        $scope.showTab = function (tab) {
            $scope.typeTab = tab;
        }

        // 保存
        $scope.saveData = function () {
            $ionicLoading.show({template: '保存中...'});
            var formData = {want_travel: []};
            for (var i in $scope.data) {
                if ($scope.data[i].checked) {
                    formData.want_travel.push($scope.data[i].id);
                }
            }
            formData.want_travel = formData.want_travel.join(',');
            api.save('/wap/member/save-data', formData).success(function (res) {
                $scope.userInfo.want_travel = formData.want_travel;
                $scope.setUserStorage();
                $ionicLoading.hide();
                $location.url('/main/member/information');
            });

        }
    }
    ]);

    // 喜欢的运动
    module.controller("member.sports", ['app.serviceApi', '$scope', '$ionicPopup', '$ionicScrollDelegate', '$ionicLoading', '$location', function (api, $scope, $ionicPopup, $ionicScrollDelegate, $ionicLoading, $location) {

        $scope.formData = [];
        $scope.formData.userSportsIdList = $scope.userInfo.love_sport != null && $scope.userInfo.love_sport ? $scope.userInfo.love_sport.split(',') : [];  // 用户数据

        // 默认数据处理
        api.list('/wap/member/config-list', {'type': 1}).success(function (res) {
            $scope.sportsList = res.data;
            for (var i in $scope.sportsList) {
                for (var j in $scope.formData.userSportsIdList) {
                    if ($scope.formData.userSportsIdList[j] == $scope.sportsList[i].id) {
                        $scope.sportsList[i].checked = true;
                        break;
                    } else {
                        $scope.sportsList[i].checked = false;
                    }
                }
            }
        });

        // 横向滚动至底部
        $scope.scrollSmallToBottom = function (event) {
            if (event.target.checked) {
                $ionicScrollDelegate.$getByHandle('small').scrollBottom();
            } else {
                $ionicScrollDelegate.$getByHandle('small').scrollTop();
            }
        };

        // 删除
        $scope.remove = function (index) {
            $scope.sportsList[index].checked = false;
            $ionicScrollDelegate.$getByHandle('small').scrollTop();
        }

        // 保存
        $scope.saveData = function () {
            $ionicLoading.show({template: '保存中...'});
            var formData = {love_sport: []};
            for (var i in $scope.sportsList) {
                if ($scope.sportsList[i].checked) {
                    formData.love_sport.push($scope.sportsList[i].id);
                }
            }
            formData.love_sport = formData.love_sport.join(',');
            api.save('/wap/member/save-data', formData).success(function (res) {
                $scope.userInfo.love_sport = formData.love_sport;
                $scope.setUserStorage();
                $ionicLoading.hide();
                $location.url('/main/member/information');
            });
        }

    }
    ]);

    // 喜欢的电影
    module.controller("member.movie", ['app.serviceApi', '$scope', '$ionicPopup', '$ionicScrollDelegate', '$filter', '$ionicLoading', '$location', function (api, $scope, $ionicPopup, $ionicScrollDelegate, $filter, $ionicLoading, $location) {

        $scope.formData = [];
        $scope.formData.userMovieIdList = $scope.userInfo.want_film != null && $scope.userInfo.want_film ? $scope.userInfo.want_film.split(',') : [];

        // 默认数据处理
        api.list('/wap/member/config-list', {'type': 2}).success(function (res) {
            $scope.list = res.data;
            for (var i in $scope.list) {
                for (var j in $scope.formData.userMovieIdList) {
                    if ($scope.list[i].id == $scope.formData.userMovieIdList[j]) {
                        $scope.list[i].checked = true;
                        break;
                    } else {
                        $scope.list[i].checked = false;
                    }
                }
            }
        });

        // 删除
        $scope.remove = function (index) {
            $scope.list[index].checked = false;
            $ionicScrollDelegate.$getByHandle('small').scrollTop();
        }

        // 横向滚动至底部
        $scope.scrollSmallToBottom = function (event) {
            if (event.target.checked) {
                $ionicScrollDelegate.$getByHandle('small').scrollBottom();
            } else {
                $ionicScrollDelegate.$getByHandle('small').scrollTop();
            }
        };

        // 保存
        $scope.saveData = function () {

            $ionicLoading.show({template: '保存中...'});
            var formData = {want_film: []};
            for (var i in $scope.list) {
                if ($scope.list[i].checked) {
                    formData.want_film.push($scope.list[i].id);
                }
            }
            formData.want_film = formData.want_film.join(',');
            api.save('/wap/member/save-data', formData).success(function (res) {
                $scope.userInfo.want_film = formData.want_film;
                $scope.setUserStorage();
                $ionicLoading.hide();
                $location.url('/main/member/information');
            });
        }

    }
    ]);

    // 喜欢的美食
    module.controller("member.delicacy", ['app.serviceApi', '$scope', '$ionicPopup', '$ionicScrollDelegate', '$filter', '$ionicLoading', '$location', function (api, $scope, $ionicPopup, $ionicScrollDelegate, $filter, $ionicLoading, $location) {

        $scope.formData = [];
        $scope.formData.userDelicacyIdList = $scope.userInfo.like_food != null && $scope.userInfo.like_food ? $scope.userInfo.like_food.split(',') : [];
        ;

        // 默认数据处理
        api.list('/wap/member/config-list', {'type': 3}).success(function (res) {
            $scope.foodList = res.data;
            for (var i in $scope.foodList) {
                for (var j in $scope.formData.userDelicacyIdList) {
                    if ($scope.foodList[i].id == $scope.formData.userDelicacyIdList[j]) {
                        $scope.foodList[i].checked = true;
                        break;
                    } else {
                        $scope.foodList[i].checked = false;
                    }
                }
            }
        });

        // 删除
        $scope.remove = function (index) {
            $scope.foodList[index].checked = false;
            $ionicScrollDelegate.$getByHandle('small').scrollTop();
        }

        // 横向滚动至底部
        $scope.scrollSmallToBottom = function (event) {
            if (event.target.checked) {
                $ionicScrollDelegate.$getByHandle('small').scrollBottom();
            } else {
                $ionicScrollDelegate.$getByHandle('small').scrollTop();
            }
        };

        // 保存
        $scope.saveData = function () {
            $ionicLoading.show({template: '保存中...'});
            var formData = {like_food: []};
            for (var i in $scope.foodList) {
                if ($scope.foodList[i].checked) {
                    formData.like_food.push($scope.foodList[i].id);
                }
            }
            formData.like_food = formData.like_food.join(',');
            api.save('/wap/member/save-data', formData).success(function (res) {
                $scope.userInfo.like_food = formData.like_food;
                $scope.setUserStorage();
                $ionicLoading.hide();
                $location.url('/main/member/information');
            });
        }

    }
    ]);

    // 对未来伴侣的期望
    module.controller("member.mate", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.mate = $scope.userInfo.info.mate != '未知' && $scope.userInfo.info.mate != undefined ? $scope.userInfo.info.mate : '';

        // 保存
        $scope.saveData = function () {
            if (ar.trim($scope.formData.mate)) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.mate = $scope.formData.mate;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 子女状况
    module.controller("member.children", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.is_child = $scope.userInfo.info.is_child != '未知' && $scope.userInfo.info.is_child ? $scope.userInfo.info.is_child : '';
        $scope.childrenList = config_infoData.children;

        // 保存
        $scope.saveData = function () {
            if ($scope.formData.is_child) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.is_child = $scope.formData.is_child;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }

    }]);

    // 民族
    module.controller("member.nation", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.nation = $scope.userInfo.info.nation != '未知' && $scope.userInfo.info.nation ? $scope.userInfo.info.nation : '';
        $scope.nationList = config_infoData.nation;

        // 保存
        $scope.saveData = function () {
            if ($scope.formData.nation) {
                var confirm = ar.saveDataConfirm($ionicPopup, '民族一旦填写不可更改，确认保存吗？');
                confirm.then(function (res) {
                    if (res) {
                        api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                            $scope.userInfo.info.nation = $scope.formData.nation;
                            $scope.setUserStorage();
                            $location.url('/main/member/information');
                        })
                    } else {
                        return false;
                    }
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 工作单位
    module.controller("member.work", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.work = $scope.userInfo.info.work != '未知' ? $scope.userInfo.info.work : '';

        // 保存
        $scope.saveData = function () {
            if (ar.trim($scope.formData.work)) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.work = $scope.formData.work;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 年收入
    module.controller("member.salary", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.year_income = $scope.userInfo.info.year_income != '未知' ? $scope.userInfo.info.year_income : '';
        $scope.salaryList = config_infoData.salary;

        // 保存
        $scope.saveData = function () {
            if ($scope.formData.year_income) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.year_income = $scope.formData.year_income;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 购房情况
    module.controller("member.house", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.is_purchase = $scope.userInfo.info.is_purchase != '未知' ? $scope.userInfo.info.is_purchase : '';
        $scope.houseList = config_infoData.house;

        // 保存
        $scope.saveData = function () {
            if ($scope.formData.is_purchase) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.is_purchase = $scope.formData.is_purchase;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 购车情况
    module.controller("member.car", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.is_car = $scope.userInfo.info.is_car != '未知' ? $scope.userInfo.info.is_car : '';
        $scope.carList = config_infoData.car;

        // 保存
        $scope.saveData = function () {
            if ($scope.formData.is_car) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.is_car = $scope.formData.is_car;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 血型
    module.controller("member.blood", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.blood = $scope.userInfo.info.blood != '未知' ? $scope.userInfo.info.blood : '';
        $scope.bloodList = config_infoData.blood;

        // 保存
        $scope.saveData = function () {
            if ($scope.formData.blood) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    // 保存
                    $scope.userInfo.info.blood = $scope.formData.blood;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 毕业院校
    module.controller("member.school", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.school = $scope.userInfo.info.school != '未知' ? $scope.userInfo.info.school : '';

        // 保存
        $scope.saveData = function () {
            if (ar.trim($scope.formData.school)) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.school = $scope.formData.school;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 择偶标准-年龄
    module.controller("member.zo_age", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {
        $scope.formData = [];
        $scope.formData.zo_age = '18-22';  //TODO 改为用户真实数据
        // 年龄范围 控件
        var minAge = [], maxAge = [];
        for (var i = 18; i <= 99; i++) {
            maxAge.push(i);
            if (i < 99) {
                minAge.push(i);
            }
        }
        $scope.settingsAge = {
            theme: 'mobiscroll',
            lang: 'zh',
            display: 'bottom',
            rows: 5,
            wheels: [
                [{
                    circular: false,
                    data: minAge,
                    label: '最低年龄'
                }, {
                    circular: false,
                    data: maxAge,
                    label: '最高年龄'
                }]
            ],
            showLabel: true,
            minWidth: 130,
            cssClass: 'md-pricerange',
            validate: function (event, inst) {
                var i,
                    values = event.values,
                    disabledValues = [];

                for (i = 0; i < maxAge.length; ++i) {
                    if (maxAge[i] <= values[0]) {
                        disabledValues.push(maxAge[i]);
                    }
                }
                return {
                    disabled: [
                        [], disabledValues
                    ]
                }
            },
            formatValue: function (data) {
                return data[0] + '-' + data[1];
            },
            parseValue: function (valueText) {
                if (valueText) {
                    return valueText.replace(/\s/gi, '').split('-');
                }
                return [18, 22];
            }
        };

        // 保存
        $scope.saveData = function () {
            if ($scope.formData.zo_age) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.zo_age = $scope.formData.zo_age;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }

        }
    }]);

    // 择偶标准-身高
    module.controller("member.zo_height", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {
        $scope.formData = [];
        $scope.formData.zo_height = '160-180';  //TODO 改为用户真实数据
        // 身高范围
        var minHeight = [], maxHeight = [];
        for (var i = 140; i <= 260; i++) {
            maxHeight.push(i);
            if (i < 260) {
                minHeight.push(i);
            }
        }
        $scope.settingsHeight = {
            theme: 'mobiscroll',
            lang: 'zh',
            display: 'bottom',
            rows: 5,
            wheels: [
                [{
                    circular: false,
                    data: minHeight,
                    label: '最低身高(厘米)'
                }, {
                    circular: false,
                    data: maxHeight,
                    label: '最高身高(厘米)'
                }]
            ],
            showLabel: true,
            minWidth: 130,
            cssClass: 'md-pricerange',
            validate: function (event, inst) {
                var i,
                    values = event.values,
                    disabledValues = [];

                for (i = 0; i < maxHeight.length; ++i) {
                    if (maxHeight[i] <= values[0]) {
                        disabledValues.push(maxHeight[i]);
                    }
                }

                return {
                    disabled: [
                        [], disabledValues
                    ]
                }
            },
            formatValue: function (data) {
                return data[0] + '-' + data[1];
            },
            parseValue: function (valueText) {
                if (valueText) {
                    return valueText.replace(/\s/gi, '').split('-');
                }
                return [160, 180];
            }
        };

        // 保存
        $scope.saveData = function () {
            if ($scope.formData.zo_height) {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    $scope.userInfo.info.zo_height = $scope.formData.zo_height;
                    $scope.setUserStorage();
                    $location.url('/main/member/information');
                })
            } else {
                $location.url('/main/member/information');
            }
        }
    }]);

    // 择偶标准-学历
    module.controller("member.zo_education", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.zo_education = $scope.userInfo.info.zo_education != '未知' ? $scope.userInfo.info.zo_education : '';
        $scope.zo_educationList = config_infoData.education;

        // 保存
        $scope.saveData = function () {
            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                $scope.userInfo.info.zo_education = $scope.formData.zo_education;
                $scope.setUserStorage();
                $location.url('/main/member/information');
            })
        }
    }]);

    // 择偶标准-婚姻状况
    module.controller("member.zo_marriage", ['app.serviceApi', '$scope', '$ionicPopup', '$location', '$ionicLoading', function (api, $scope, $ionicPopup, $location, $ionicLoading) {
        $scope.formData = [];
        $scope.marriageList = config_infoData.marriage;
        if (!$scope.userInfo.info.zo_marriage) {
            $scope.isNull = true;
        } else {
            $scope.isNull = false;
            $scope.userInfo.info.zo_marriage = $scope.userInfo.info.zo_marriage.split(',');
        }
        for (var i in $scope.marriageList) {
            for (var j in $scope.userInfo.info.zo_marriage) {
                if ($scope.userInfo.info.zo_marriage[j] == $scope.marriageList[i].id) {
                    $scope.marriageList[i].checked = true;
                    break;
                } else {
                    $scope.marriageList[i].checked = false;
                }
            }
        }

        $scope.isNullFunc = function (event) {
            if (event.target.checked) {
                for (var i in $scope.marriageList) {
                    $scope.marriageList[i].checked = false;
                }
            }
        }

        // 保存
        $scope.saveData = function () {
            $ionicLoading.show({template: '保存中...'});
            var formData = [];
            var zo_marriage = [];
            for (var i in $scope.marriageList) {
                if ($scope.marriageList[i].checked) {
                    zo_marriage.push($scope.marriageList[i].id);
                }
            }
            formData.zo_marriage = zo_marriage.join(',');
            api.save('/wap/member/save-data', formData).success(function (res) {
                $scope.userInfo.info.zo_marriage = formData.zo_marriage;
                $scope.setUserStorage();
                $ionicLoading.hide();
                $location.url('/main/member/information');
            })

        }

    }]);

    // 择偶标准-子女状况
    module.controller("member.zo_children", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];
        $scope.formData.zo_children = $scope.userInfo.info.zo_children != '未知' && $scope.userInfo.info.zo_children ? $scope.userInfo.info.zo_children : '';
        $scope.childrenList = config_infoData.children;

        // 保存
        $scope.saveData = function () {
            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                $scope.userInfo.info.zo_children = $scope.formData.zo_children;
                $scope.setUserStorage();
                $location.url('/main/member/information');
            })
        }

    }]);

    // 择偶标准-购房情况
    module.controller("member.zo_house", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];

        $scope.formData.zo_house = $scope.userInfo.info.zo_house != '未知' && $scope.userInfo.info.zo_house ? $scope.userInfo.info.zo_house : '';
        $scope.zo_houseList = config_infoData.house;

        // 保存
        $scope.saveData = function () {
            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                $scope.userInfo.info.zo_house = $scope.formData.zo_house;
                $scope.setUserStorage();
                $location.url('/main/member/information');
            })
        }
    }]);

    // 择偶标准-购车情况
    module.controller("member.zo_car", ['app.serviceApi', '$scope', '$ionicPopup', '$location', function (api, $scope, $ionicPopup, $location) {

        $scope.formData = [];

        $scope.formData.zo_car = $scope.userInfo.info.zo_car != '未知' && $scope.userInfo.info.zo_car ? $scope.userInfo.info.zo_car : '';
        $scope.zo_carList = config_infoData.car;

        // 保存
        $scope.saveData = function () {
            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                $scope.userInfo.info.zo_car = $scope.formData.zo_car;
                $scope.setUserStorage();
                $location.url('/main/member/information');
            })
        }
    }]);

    // 择偶标准-属相
    module.controller("member.zo_zodiac", ['app.serviceApi', '$scope', '$ionicPopup', '$ionicLoading', '$location', function (api, $scope, $ionicPopup, $ionicLoading, $location) {

        $scope.formData = [];
        if (!$scope.userInfo.info.zo_zodiac) {
            $scope.isNull = true;
        } else {
            $scope.isNull = false;
            $scope.userInfo.info.zo_zodiac = $scope.userInfo.info.zo_zodiac.split(',');
        }
        $scope.isSelectedNull = false;
        $scope.zodiacList = config_infoData.zodiac;
        for (var i in $scope.zodiacList) {
            for (var j in $scope.userInfo.info.zo_zodiac) {
                if ($scope.userInfo.info.zo_zodiac[j] == $scope.zodiacList[i].id) {
                    $scope.zodiacList[i].checked = true;
                    break;
                } else {
                    $scope.zodiacList[i].checked = false;
                }
            }
        }

        $scope.isNullFunc = function (event) {
            if (event.target.checked) {
                for (var i in $scope.zodiacList) {
                    $scope.zodiacList[i].checked = false;
                }
            }
        }

        // 保存
        $scope.saveData = function () {
            $ionicLoading.show({template: '保存中...'});
            var formData = [];
            var zo_zodiac = [];
            for (var i in $scope.zodiacList) {
                if ($scope.zodiacList[i].checked) {
                    zo_zodiac.push($scope.zodiacList[i].id);
                }
            }
            formData.zo_zodiac = zo_zodiac.join(',');
            api.save('/wap/member/save-data', formData).success(function (res) {
                $scope.userInfo.info.zo_zodiac = formData.zo_zodiac;
                $scope.setUserStorage();
                $ionicLoading.hide();
                $location.url('/main/member/information');
            })
        }

    }]);

    // 择偶标准-星座
    module.controller("member.zo_constellation", ['app.serviceApi', '$scope', '$ionicPopup', '$ionicLoading', '$location', function (api, $scope, $ionicPopup, $ionicLoading, $location) {

        $scope.formData = [];
        $scope.constellationList = config_infoData.constellation;
        if (!$scope.userInfo.info.zo_constellation) {
            $scope.isNull = true;
        } else {
            $scope.isNull = false;
            $scope.userInfo.info.zo_constellation = $scope.userInfo.info.zo_constellation.split(',');
        }
        for (var i in $scope.constellationList) {
            for (var j in $scope.userInfo.info.zo_constellation) {
                if ($scope.userInfo.info.zo_constellation[j] == $scope.constellationList[i].id) {
                    $scope.constellationList[i].checked = true;
                    break;
                } else {
                    $scope.constellationList[i].checked = false;
                }
            }
        }

        $scope.isNullFunc = function (event) {
            if (event.target.checked) {
                for (var i in $scope.constellationList) {
                    $scope.constellationList[i].checked = false;
                }
            }
        }

        // 保存
        $scope.saveData = function () {
            $ionicLoading.show({template: '保存中...'});
            var formData = [];
            var zo_constellation = [];
            for (var i in $scope.constellationList) {
                if ($scope.constellationList[i].checked) {
                    zo_constellation.push($scope.constellationList[i].id);
                }
            }
            formData.zo_constellation = zo_constellation.join(',');
            api.save('/wap/member/save-data', formData).success(function (res) {
                $scope.userInfo.info.zo_constellation = formData.zo_constellation;
                $scope.setUserStorage();
                $ionicLoading.hide();
                $location.url('/main/member/information');
            })
        }

    }]);


    // 关注的人
    module.controller("member.follow", ['app.serviceApi', '$scope', '$ionicPopup', '$ionicLoading', '$location', '$ionicActionSheet', function (api, $scope, $ionicPopup, $ionicLoading, $location, $ionicActionSheet) {
        $scope.followType = typeof $location.$$search.type == 'undefined' ? 'follow' : $location.$$search.type;
        $scope.followList = [];
        loadData();
        function loadData() {
            api.list('/wap/follow/follow-list', {type: $scope.followType}).success(function (res) {
                console.log(res.data);
                $scope.followList = res.data;
                for (var i in $scope.followList) {
                    $scope.followList[i].info = JSON.parse($scope.followList[i].info);
                    $scope.followList[i].auth = JSON.parse($scope.followList[i].auth);
                }
            });
        }


        // 取消关注
        $scope.delFollow = function (item, $index) {
            api.get('/wap/follow/del-follow', {
                user_id: ar.getCookie("bhy_user_id"),
                follow_id: item.user_id
            }).success(function (res) {
                if (res.data) {     // 成功
                    $scope.followList.splice($index, 1);
                } else {            // 失败
                    $ionicPopup.alert({title: '取消关注失败'});
                }
            })
        }

        // 切换，我关注的人，关注我的人
        $scope.switching = function (value) {
            $scope.followType = value;
            loadData();
        };

    }]);

    // 查看用户资料
    module.controller("member.user_info", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$location', function (api, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $location) {
        requirejs(['amezeui', 'amezeui_ie8'], function (amezeui, amezeui_ie8) {

        });
        var userInfo = ar.getStorage('userInfo');
        if (userInfo != null) {
            userInfo.info = JSON.parse(userInfo.info);
            userInfo.auth = JSON.parse(userInfo.auth);
        }
        // 用于想去的地方，去过的地方等
        var getTravel = function (name, serId) {
            if (serId != null && serId) {
                var arrSer = serId.split(',');
                eval("$scope." + name + "_count = " + arrSer.length);
                api.list('/wap/member/get-travel-list', {'area_id': serId}).success(function (res) {
                    eval("$scope." + name + " = " + JSON.stringify(res.data));
                });
            } else {
                eval("$scope." + name + "_count = " + 0);
            }
        }
        var getConfig = function (name, serId) {
            if (serId != null) {
                var arrSer = serId.split(',');
                eval("$scope." + name + "_count = " + arrSer.length);
                api.list('/wap/member/get-config-list', {'config_id': serId}).success(function (res) {
                    eval("$scope." + name + " = " + JSON.stringify(res.data));
                });
            } else {
                eval("$scope." + name + "_count = " + 0);
            }
        }
        // 权限判断
        var is_privacy = function (val) {
            switch (val) {
                case '1':
                    return true;
                case '2':
                    return $scope.formData.followed == 1 ? true : false;
                case '3':
                    return $scope.otherUserInfo.info.level > 0 ? true : false;
                case '4':
                    return false;
                default :
                    return false;
            }
        }
        $scope.formData = [];
        $scope.formData.userId = $location.$$search.userId;
        $scope.otherUserInfo = [];
        $scope.imgList = [];
        $scope.dynamicList = [];
        $scope.formData.follow = false;

        api.list("/wap/member/user-info-page-by-id", {'id': $scope.formData.userId}).success(function (res) {
            if (res.status) {
                // 用户信息
                $scope.otherUserInfo = res.userInfo;
                $scope.otherUserInfo.info = JSON.parse($scope.otherUserInfo.info);
                $scope.otherUserInfo.auth = JSON.parse($scope.otherUserInfo.auth);
                // 用户相册
                $scope.imgList = res.userPhoto.length > 0 ? res.userPhoto : [];
                // 用户动态
                if (res.dynamic) {
                    for (var i in res.dynamic) {
                        res.dynamic[i].imgList = JSON.parse(res.dynamic[i].pic);
                        $scope.dynamicList.push(res.dynamic[i]);
                    }
                }
                $scope.formData.follow = res.followStatus;// 关注状态
                $scope.formData.followed = res.followedStatus;// 被关注状态
                $scope.qqAuth = is_privacy($scope.otherUserInfo.privacy_qq);// qq权限
                $scope.perAuth = is_privacy($scope.otherUserInfo.privacy_per);// 个人动态权限
                $scope.wxAuth = is_privacy($scope.otherUserInfo.privacy_wechat);// 微信权限
                $scope.picAuth = is_privacy($scope.otherUserInfo.privacy_pic);// 相册权限 // TODO
                $scope.otherUserInfo.went_travel ? getTravel('went_travel', $scope.otherUserInfo.went_travel) : true;// 我去过的地方
                $scope.otherUserInfo.want_travel ? getTravel('want_travel', $scope.otherUserInfo.want_travel) : true;// 我想去的地方
                $scope.otherUserInfo.love_sport ? getConfig('love_sport', $scope.otherUserInfo.love_sport) : true;// 喜欢的运动
                $scope.otherUserInfo.want_film ? getConfig('want_film', $scope.otherUserInfo.want_film) : true;// 想看的电影
                $scope.otherUserInfo.like_food ? getConfig('like_food', $scope.otherUserInfo.like_food) : true;// 喜欢的食物
            }
        });

        $scope.localChat = function () {
            window.location.hash = "#/main/chat?id=" + $scope.otherUserInfo.id + "&head_pic=" + $scope.otherUserInfo.info.head_pic + "&real_name=" + $scope.otherUserInfo.info.real_name + "&sex=" + $scope.otherUserInfo.sex + "&age=" + $scope.otherUserInfo.info.age;
        }

        var followData = [];
        followData.user_id = ar.getCookie("bhy_user_id");
        followData.follow_id = $scope.formData.userId;
        // 未关注
        /*$scope.formData.follow = false;
         api.getStatus('/wap/follow/get-follow-status', followData).success(function (res) {
         if (res.data) {
         $scope.formData.follow = true;
         }
         });*/
        // 取消关注
        $scope.cancelFollow = function () {
            api.save('/wap/follow/del-follow', followData).success(function (res) {
                if (res.data) {
                    $scope.formData.follow = false;
                    // 成功，提示
                    $ionicPopup.alert({title: '取消关注成功'});
                }
            });
        }

        // 关注
        $scope.addFollow = function () {
            api.save('/wap/follow/add-follow', followData).success(function (res) {
                if (res.data) {
                    $scope.formData.follow = true;
                    // 成功，提示
                    $ionicPopup.alert({title: '加关注成功'});
                }
            });
        }

    }]);

    // 隐私设置
    module.controller("member.privacy", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.$on('$ionicView.beforeEnter', function () {
            api.list('/wap/follow/get-sum-black', {}).success(function (res) {
                $scope.blackSum = res.data;
            });
        });
    }]);

    // 隐私设置-照片权限
    module.controller("member.privacy_pic", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.formData = [];
        $scope.formData.privacy_pic = $scope.userInfo.privacy_pic ? $scope.userInfo.privacy_pic : 1;

        // 已经离开本页面
        $scope.$on('$ionicView.afterLeave', function () {
            // 保存数据
            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                $scope.userInfo.privacy_pic = $scope.formData.privacy_pic;
                $scope.getUserPrivacyStorage('');
            });
        });
    }]);

    // 隐私设置-个人动态权限
    module.controller("member.privacy_per", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.formData = [];
        $scope.formData.privacy_per = $scope.userInfo.privacy_per ? $scope.userInfo.privacy_per : 1;

        // 已经离开本页面
        $scope.$on('$ionicView.afterLeave', function () {
            // 保存数据
            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                $scope.userInfo.privacy_per = $scope.formData.privacy_per;
                $scope.getUserPrivacyStorage('');
            });
        });
    }]);

    // 隐私设置-微信显示权限
    module.controller("member.privacy_wechat", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.formData = [];
        $scope.formData.privacy_wechat = $scope.userInfo.privacy_wechat ? $scope.userInfo.privacy_wechat : 1;

        // 已经离开本页面
        $scope.$on('$ionicView.afterLeave', function () {
            // 保存数据
            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                $scope.userInfo.privacy_wechat = $scope.formData.privacy_wechat;
                $scope.getUserPrivacyStorage('');
            });
        });
    }]);

    // 隐私设置-QQ显示权限
    module.controller("member.privacy_qq", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.formData = [];
        $scope.formData.privacy_qq = $scope.userInfo.privacy_qq ? $scope.userInfo.privacy_qq : 1;

        // 已经离开本页面
        $scope.$on('$ionicView.afterLeave', function () {
            // 保存数据
            api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                $scope.userInfo.privacy_qq = $scope.formData.privacy_qq;
                $scope.getUserPrivacyStorage('');
            });
        });
    }]);

    // 隐私设置-黑名单
    module.controller("member.privacy_black", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.followList = [];
        api.list('/wap/follow/black-list', {}).success(function (res) {
            $scope.followList = res.data;
            for (var i in $scope.followList) {
                $scope.followList[i].info = JSON.parse($scope.followList[i].info);
                $scope.followList[i].auth = JSON.parse($scope.followList[i].auth);
            }
        });

        // 解除黑名单
        $scope.removeItem = function ($index, item) {
            api.save('/wap/follow/del-black', {'id': item.id}).success(function (res) {
                $scope.followList.splice($index, 1);
            });
        }
    }]);

    // 账户安全
    module.controller("member.security", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

        $scope.formData = [];

    }]);

    // 账户安全-密码修改
    module.controller("member.security_pass", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

        $scope.formData = [];
        // 保存
        $scope.saveData = function () {
            if ($scope.formData.pass == '') {
                $ionicPopup.alert({title: '请填写旧密码'});
                return false;
            }
            if ($scope.formData.new_pass1 == '' || $scope.formData.new_pass1.length < 6) {
                $ionicPopup.alert({title: '密码长度必须大于6个字符'});
                return false;
            }
            if ($scope.formData.new_pass1 != $scope.formData.new_pass1) {
                $ionicPopup.alert({title: '新密码不一致'});
                return false;
            }

            api.save('/wap/user/reset-password', $scope.formData).success(function (res) {
                if (res.data) {
                    $ionicPopup.alert({title: '密码修改成功'});
                    $scope.userInfo.reset_pass_time = parseInt(res.data);
                    $scope.getUserPrivacyStorage('#/main/member/security');
                } else {
                    $ionicPopup.alert({title: '密码修改失败'});
                }
            })

        }

    }]);

    // 账户安全-手机绑定
    module.controller("member.security_phone", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

        $scope.User = [];
        $scope.User.codeBtn = '获取验证码';
        $scope.User.mobile = $scope.userInfo.phone != null ? $scope.userInfo.phone : '';

        // 开始计时
        $scope.User.startTime = function () {
            $scope.User.max_time -= 1;
            $scope.User.codeBtn = "重新发送" + $scope.User.max_time;
            $scope.$apply();
        }

        // 结束计时，还原文字
        $scope.User.endTime = function () {
            $scope.User.codeSwitch = false;
            $scope.User.codeCls = false;
            $scope.User.codeBtn = '获取验证码';
            clearInterval($scope.User.timer);
            $scope.$apply();
        }

        // 获取验证码
        $scope.User.getCode = function () {

            if (!ar.validateMobile($scope.User.mobile)) {  // 验证手机格式
                $ionicPopup.alert({title: '手机号码格式不正确'});
                return false;
            }

            api.getMobileIsExist($scope.User.mobile).success(function (data) {
                if (!data.status) {
                    $ionicPopup.alert({title: data.msg});
                    return false;
                } else {
                    //计时
                    $scope.User.codeSwitch = true;
                    $scope.User.codeCls = true;
                    $scope.User.max_time = 60;
                    $scope.User.timer = setInterval($scope.User.startTime, 1000);
                    setTimeout($scope.User.endTime, $scope.User.max_time * 1000);

                    // 发送验证码
                    api.sendCodeMsg($scope.User.mobile).success(function (data) {

                        if (!data.status) {
                            $ionicPopup.alert({title: '短信发送失败，请稍后重试。'});
                            return false;
                        }
                    });
                }
            })

            $scope.saveData = function () {

                if ($scope.User.mobile == '') {
                    $ionicPopup.alert({title: '手机号不能为空'});
                    return false;
                }
                api.validateCode($scope.User.code).success(function (res) {
                    if (!res.status) {
                        $ionicPopup.alert({title: '验证码错误'});
                        return false;
                    } else {
                        var formData = [];
                        formData.phone = $scope.User.mobile;
                        api.save('/wap/user/update-user-data', formData).success(function (res) {
                            if (res.data) {
                                $ionicPopup.alert({title: '手机绑定成功'});
                                $scope.userInfo.phone = $scope.User.mobile;
                                $scope.getUserPrivacyStorage('#/main/member/security');
                            } else {
                                $ionicPopup.alert({title: '手机绑定失败'});
                            }
                        })
                    }
                })
            }
        }
    }]);

    // 账户安全-微信绑定
    module.controller("member.security_wechat", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.formData = [];
        $scope.formData.wechat = $scope.userInfo.info.wechat != '未知' ? $scope.userInfo.info.wechat : '';
        $scope.saveData = function () {
            alert($scope.formData.wechat);
            if ($scope.formData.wechat == '' || typeof($scope.formData.wechat) == 'undefined') {
                if (confirm('检测到您还未填写微信号，确定放弃吗？')) {
                    window.location.hash = '#/main/member/security';  //跳转
                } else {
                    return false;
                }
            } else {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    // 保存
                    $scope.userInfo.info.wechat = $scope.formData.wechat;
                    $scope.getUserPrivacyStorage('#/main/member/security');
                })
            }
        }
    }]);

    // 账户安全-QQ绑定
    module.controller("member.security_qq", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.formData = [];
        $scope.formData.qq = $scope.userInfo.info.qq != '未知' ? $scope.userInfo.info.qq : '';
        $scope.saveData = function () {
            if ($scope.formData.qq == '' || typeof($scope.formData.qq) == 'undefined') {
                if (confirm('检测到您还未填写微信号，确定放弃吗？')) {
                    window.location.hash = '#/main/member/security';  //跳转
                } else {
                    return false;
                }
            } else {
                api.save('/wap/member/save-data', $scope.formData).success(function (res) {
                    // 保存
                    $scope.userInfo.info.qq = $scope.formData.qq;
                    $scope.getUserPrivacyStorage('#/main/member/security');
                })
            }
        }
    }]);

    // 诚信认证
    module.controller("member.honesty", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        if (ar.getCookie('bhy_user_id')) {
            api.list("/wap/user/get-user-info", []).success(function (res) {
                $scope.userInfo = res.data;
                ar.setStorage('userInfo', res.data);
                if ($scope.userInfo != null) {
                    $scope.userInfo.info = JSON.parse($scope.userInfo.info);
                    $scope.userInfo.auth = JSON.parse($scope.userInfo.auth);
                }
            });
        }
        $scope.honesty = function (val) {
            return $scope.userInfo.honesty & val;
        }
    }]);

    // 诚信认证-身份认证
    module.controller("member.honesty_sfz", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', 'FileUploader', '$location', function (api, $scope, $timeout, $ionicPopup, FileUploader, $location) {
        api.list('/wap/member/photo-list', {type: 2, pageSize: 2}).success(function (res) {
            $scope.authList = res.data;
        });
        $scope.imgList = [];
        requirejs(['photoswipe', 'photoswipe_ui'], function (photoswipe, photoswipe_ui) {
            $scope.showImg = function (index) {
                var imgAttr = [];
                for (var i in $scope.authList) {
                    imgAttr[i] = $scope.authList[i].thumb_path.split('.')[0].split('_');
                    $scope.imgList[i] = {
                        src: $scope.authList[i].thumb_path.replace('thumb', 'picture'),
                        w: imgAttr[i][1],
                        h: imgAttr[i][2]
                    };
                }
                var pswpElement = document.querySelectorAll('.pswp')[0];
                var options = {index: index};
                options.mainClass = 'pswp--minimal--dark';
                options.barsSize = {top: 0, bottom: 0};
                options.captionEl = false;
                options.fullscreenEl = false;
                options.shareEl = false;
                options.history = false;
                options.bgOpacity = 0.85;
                options.tapToClose = true;
                options.tapToToggleControls = false;
                var gallery = new photoswipe(pswpElement, photoswipe_ui, $scope.imgList, options);
                gallery.init();
            }
        });
        // 实例化上传图片插件
        var uploader = $scope.uploader = new FileUploader({
            url: '/wap/file/thumb'
            //url: '/wap/file/thumb-photo?type=2'
        });

        $scope.formData = [];
        $scope.formData.real_name = $scope.userInfo.info.real_name != '未知' ? $scope.userInfo.info.real_name : '';
        $scope.formData.identity_id = $scope.userInfo.info.identity_id != '未知' ? $scope.userInfo.info.identity_id : '';
        $scope.formData.identity_address = $scope.userInfo.info.identity_address != '未知' ? $scope.userInfo.info.identity_address : '';

        $scope.addNewImg = function (name) {
            $scope.uploaderImage(uploader, name);
        }
        // 监听上传回传数据
        $scope.$on('thumb_path', function (event, name, data) {
            if (name == 'honesty1') {
                !$scope.authList[0] ? $scope.authList[0] = data : $scope.authList[0].thumb_path = data.thumb_path;
            } else {
                !$scope.authList[1] ? $scope.authList[1] = data : $scope.authList[1].thumb_path = data.thumb_path;
            }
        });

        $scope.saveData = function () {
            console.log($scope.authList);
            if ($scope.formData.real_name == '' || $scope.formData.identity_id == '' || $scope.formData.identity_address == '') {
                var confirm = ar.saveDataConfirm($ionicPopup, '检测到身份证信息未填写，确认放弃吗？');
                confirm.then(function (res) {
                    if (res) {
                        $location.url('/main/member/honesty');
                    } else {
                        return false;
                    }
                })
            } else {
                // 保存图片
                api.save('/wap/member/save-photo', $scope.authList).success(function (res) {
                    var formData = [];
                    formData.identity = $scope.formData.real_name + '_' + $scope.formData.identity_id + '_' + $scope.formData.identity_address;
                    // 保存数据
                    api.save('/wap/member/save-data', formData).success(function (res) {
                        $scope.userInfo.info.real_name = $scope.formData.real_name;
                        $scope.userInfo.info.identity_id = $scope.formData.identity_id;
                        $scope.userInfo.info.identity_address = $scope.formData.identity_address;
                        $scope.getUserPrivacyStorage('#/main/member/honesty');
                    });
                });
            }
        }
    }]);

    // 诚信认证-婚姻认证
    module.controller("member.honesty_marr", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', 'FileUploader', function (api, $scope, $timeout, $ionicPopup, FileUploader) {
        api.list('/wap/member/photo-list', {type: 4, pageSize: 1}).success(function (res) {
            $scope.authList = res.data;
        });
        $scope.imgList = [];
        requirejs(['photoswipe', 'photoswipe_ui'], function (photoswipe, photoswipe_ui) {
            $scope.showImg = function (index) {
                var imgAttr = [];
                for (var i in $scope.authList) {
                    imgAttr[i] = $scope.authList[i].thumb_path.split('.')[0].split('_');
                    $scope.imgList[i] = {
                        src: $scope.authList[i].thumb_path.replace('thumb', 'picture'),
                        w: imgAttr[i][1],
                        h: imgAttr[i][2]
                    };
                }
                var pswpElement = document.querySelectorAll('.pswp')[0];
                var options = {index: index};
                options.mainClass = 'pswp--minimal--dark';
                options.barsSize = {top: 0, bottom: 0};
                options.captionEl = false;
                options.fullscreenEl = false;
                options.shareEl = false;
                options.history = false;
                options.bgOpacity = 0.85;
                options.tapToClose = true;
                options.tapToToggleControls = false;
                var gallery = new photoswipe(pswpElement, photoswipe_ui, $scope.imgList, options);
                gallery.init();
            }
        });


        // 实例化上传图片插件
        var uploader = $scope.uploader = new FileUploader({
            url: '/wap/file/auth-pictures?type=4'
        });

        $scope.addNewImg = function (name) {
            $scope.uploaderImage(uploader, name);
        }
        // 监听上传回传数据
        $scope.$on('thumb_path', function (event, name, data) {
            !$scope.authList[0] ? $scope.authList[0] = data : $scope.authList[0].thumb_path = data.thumb_path;
        });
    }]);

    // 诚信认证-学历认证
    module.controller("member.honesty_edu", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', 'FileUploader', function (api, $scope, $timeout, $ionicPopup, FileUploader) {
        api.list('/wap/member/photo-list', {type: 3, pageSize: 1}).success(function (res) {
            $scope.authList = res.data;
        });
        $scope.imgList = [];
        requirejs(['photoswipe', 'photoswipe_ui'], function (photoswipe, photoswipe_ui) {
            $scope.showImg = function (index) {
                var imgAttr = [];
                for (var i in $scope.authList) {
                    imgAttr[i] = $scope.authList[i].thumb_path.split('.')[0].split('_');
                    $scope.imgList[i] = {
                        src: $scope.authList[i].thumb_path.replace('thumb', 'picture'),
                        w: imgAttr[i][1],
                        h: imgAttr[i][2]
                    };
                }
                var pswpElement = document.querySelectorAll('.pswp')[0];
                var options = {index: index};
                options.mainClass = 'pswp--minimal--dark';
                options.barsSize = {top: 0, bottom: 0};
                options.captionEl = false;
                options.fullscreenEl = false;
                options.shareEl = false;
                options.history = false;
                options.bgOpacity = 0.85;
                options.tapToClose = true;
                options.tapToToggleControls = false;
                var gallery = new photoswipe(pswpElement, photoswipe_ui, $scope.imgList, options);
                gallery.init();
            }
        });

        // 实例化上传图片插件
        var uploader = $scope.uploader = new FileUploader({
            url: '/wap/file/auth-pictures?type=3'
        });

        $scope.addNewImg = function (name) {
            $scope.uploaderImage(uploader, name);
        }
        // 监听上传回传数据
        $scope.$on('thumb_path', function (event, name, data) {
            !$scope.authList[0] ? $scope.authList[0] = data : $scope.authList[0].thumb_path = data.thumb_path;
        });
    }]);

    // 诚信认证-房产认证
    module.controller("member.honesty_housing", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', 'FileUploader', function (api, $scope, $timeout, $ionicPopup, FileUploader) {
        api.list('/wap/member/photo-list', {type: 5, pageSize: 1}).success(function (res) {
            $scope.authList = res.data;
        });
        $scope.imgList = [];
        requirejs(['photoswipe', 'photoswipe_ui'], function (photoswipe, photoswipe_ui) {
            $scope.showImg = function (index) {
                var imgAttr = [];
                for (var i in $scope.authList) {
                    imgAttr[i] = $scope.authList[i].thumb_path.split('.')[0].split('_');
                    $scope.imgList[i] = {
                        src: $scope.authList[i].thumb_path.replace('thumb', 'picture'),
                        w: imgAttr[i][1],
                        h: imgAttr[i][2]
                    };
                }
                var pswpElement = document.querySelectorAll('.pswp')[0];
                var options = {index: index};
                options.mainClass = 'pswp--minimal--dark';
                options.barsSize = {top: 0, bottom: 0};
                options.captionEl = false;
                options.fullscreenEl = false;
                options.shareEl = false;
                options.history = false;
                options.bgOpacity = 0.85;
                options.tapToClose = true;
                options.tapToToggleControls = false;
                var gallery = new photoswipe(pswpElement, photoswipe_ui, $scope.imgList, options);
                gallery.init();
            }
        });

        // 实例化上传图片插件
        var uploader = $scope.uploader = new FileUploader({
            url: '/wap/file/auth-pictures?type=5'
        });

        $scope.addNewImg = function (name) {
            $scope.uploaderImage(uploader, name);
        }
        // 监听上传回传数据
        $scope.$on('thumb_path', function (event, name, data) {
            !$scope.authList[0] ? $scope.authList[0] = data : $scope.authList[0].thumb_path = data.thumb_path;
        });
    }]);

    // 开通VIP
    module.controller("member.vip", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$interval', '$location', function (api, $scope, $timeout, $ionicPopup, $interval, $location) {
        $scope.formData = [];

        $scope.formData.timer = '78时00分12秒';

        // 用户的ID
        $scope.userId = 1;

        // 商品列表
        api.save('/wap/charge/get-charge-goods-list', {type: 1}).success(function (res) {
            $scope.goodsList = res;
        });

        var tid = $interval(function () {
            var totalSec = getTotalSecond($scope.formData.timer) - 1;
            if (totalSec >= 0) {
                $scope.formData.timer = getNewSyTime(totalSec);
            } else {
                $interval.cancel(tid);
            }

        }, 1000);

        //根据剩余时间字符串计算出总秒数
        function getTotalSecond(timestr) {
            var reg = /\d+/g;
            var timenums = new Array();
            while ((r = reg.exec(timestr)) != null) {
                timenums.push(parseInt(r));
            }
            var second = 0, i = 0;
            if (timenums.length == 4) {
                second += timenums[0] * 24 * 3600;
                i = 1;
            }
            second += timenums[i] * 3600 + timenums[++i] * 60 + timenums[++i];
            return second;
        }

        //根据剩余秒数生成时间格式
        function getNewSyTime(sec) {
            var s = sec % 60;
            sec = (sec - s) / 60; //min
            var m = sec % 60;
            sec = (sec - m) / 60; //hour
            var h = sec % 24;
            var d = (sec - h) / 24;//day
            var syTimeStr = "";
            if (d > 0) {
                syTimeStr += d.toString() + "天";
            }

            syTimeStr += ("0" + h.toString()).substr(-2) + "时"
                + ("0" + m.toString()).substr(-2) + "分"
                + ("0" + s.toString()).substr(-2) + "秒";

            return syTimeStr;
        }

        // 生成订单并跳转支付
        $scope.createOrder = function (_goodsId) {
            api.save('/wap/charge/produce-order', {
                goodsId: _goodsId,
                user_id: ar.getCookie('bhy_user_id')
            }).success(function (res) {
                if (res.status < 1) {
                    $ionicPopup.alert({title: res.msg});
                } else {
                    $location.url('/main/member_charge?orderId=' + res.data + '&tempUrl=/main/member/vip');
                }
            })
        }

    }]);


    // 我的账户
    module.controller("member.account", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

        api.list('/wap/member/bribery-info').success(function (res) {
            $scope.bribery = res.data;
        })
        $scope.money = false;
        $scope.showMoney = function () {
            $scope.money = true;
        }

        // 正在使用的服务(未到期)
        $scope.serviceList = [
            {serviceName:'VIP',endTime:'2017-06-21 17:20:15'}
        ];
    }]);

    // 我的账户-消费记录
    module.controller("member.account_record", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {
        /*api.get('url',{}).success(function(res){
         $scope.recordList = res.data;   // 一次性查询出所有数据

         })*/
        $scope.recordList = [        // TODO 测试数据
            {
                date: '2016年6月', amount: 351.00, items: [
                {id: 11, datetime: 1465084084, title: '提现', money: 254.00},
                {id: 12, datetime: 1465756982, title: '嘉瑞红包', money: 55.00},
                {id: 13, datetime: 1465797015, title: '嘉瑞红包', money: 42.00}
            ]
            },
            {
                date: '2016年5月', amount: 115.00, items: [
                {id: 9, datetime: 1462321087, title: '嘉瑞红包', money: 87.00},
                {id: 10, datetime: 1462975094, title: '嘉瑞红包', money: 18.00}
            ]
            },
            {
                date: '2016年4月', amount: 1186.00, items: [
                {id: 7, datetime: 1461575123, title: '嘉瑞红包', money: 187.00},
                {id: 8, datetime: 1461854935, title: '嘉瑞红包', money: 999.00}
            ]
            },
            {
                date: '2016年3月', amount: 514.20, items: [
                {id: 5, datetime: 1457165104, title: '嘉瑞红包', money: 320.00},
                {id: 6, datetime: 1458254518, title: '嘉瑞红包', money: 5.20}

            ]
            },
            {
                date: '2016年2月', amount: 311.00, items: [
                {id: 4, datetime: 1454474084, title: '提现', money: 189.00},
                {id: 3, datetime: 1454378584, title: '嘉瑞红包', money: 122.00}
            ]
            },
            {
                date: '2016年1月', amount: 136.50, items: [
                {id: 1, datetime: 1451965812, title: '嘉瑞红包', money: 88.50},
                {id: 2, datetime: 1452533636, title: '嘉瑞红包', money: 48.00}

            ]
            }
        ];
        $scope.pageSize = 1;
        $scope.isMore = true;

        // 加载更多
        $scope.loadMoreData = function () {
            if ($scope.pageSize > $scope.recordList.length) {
                $scope.isMore = false;
            }
            $scope.pageSize += 1;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        // 是否还有更多
        $scope.moreDataCanBeLoaded = function () {
            return $scope.isMore
        }


    }]);

    // 我的账户-消费记录详情
    module.controller("member.account_record_info", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {
        $scope.recordId = $location.$$search.id; // 记录ID
    }]);

    // 我的账户-嘉瑞红包
    module.controller("member.account_bribery", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', '$filter', function (api, $scope, $timeout, $ionicPopup, $location, $filter) {
        $scope.tab = 1;  // 1:收到的红包，2：发出的红包

        $scope.yearList = [];   // 年份
        for (var i = 2016; i <= new Date().getFullYear(); i++) {
            $scope.yearList.push({id: i, name: i + '年'});
        }
        $scope.year = $scope.yearList[$scope.yearList.length - 1].id;

        // 模拟数据  flag:1标识收到的红包,flag:2标识发出的红包,一次查询出一年的数据
        $scope.briberyList = [
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 1, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 1, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 1, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 1, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 1, status: 0},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 1, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 1, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 0},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1},
            {realName: '张小姐', money: 53.00, create_time: '6月20日 17:50', year: 2016, flag: 2, status: 1}
        ];

        $scope.numAndmoney = {number: 0, money: 0.00};   // 发出的、收到的红包， 数量，总额
        for (var i in $scope.briberyList) {
            if ($scope.briberyList[i].flag == $scope.tab && $scope.briberyList[i].status == 1 && $scope.briberyList[i].year == $scope.year) {
                $scope.numAndmoney.number += 1;
                $scope.numAndmoney.money += $scope.briberyList[i].money;
            }
        }
        $scope.isMore = true;  // 是否还有更多
        $scope.pageSize = 5;   // 一次加载5条

        //加载更多
        $scope.loadMore = function () {
            if ($scope.pageSize > $scope.numAndmoney.number) {
                $scope.isMore = false;
            }
            $scope.pageSize += 5;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        $scope.moreDataCanBeLoaded = function () {
            return $scope.isMore;
        }

        // 切换
        $scope.showTab = function (value) {
            $scope.numAndmoney.number = 0;
            $scope.numAndmoney.money = 0;
            $scope.tab = value;
            for (var i in $scope.briberyList) {
                if ($scope.briberyList[i].flag == value && $scope.briberyList[i].status == 1 && $scope.briberyList[i].year == $scope.year) {
                    $scope.numAndmoney.number += 1;
                    $scope.numAndmoney.money += $scope.briberyList[i].money;
                }
            }
        }


    }]);

    // 我的账户-提现
    module.controller("member.account_withdraw", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$interval', function (api, $scope, $timeout, $ionicPopup, $ionicModal, $interval) {

        $scope.formData = [];
        $scope.form = [];
        $scope.codeTitle = '获取验证码';
        $scope.money = 530; // 用户当前余额
        $scope.phone = '15084410950'; // 用户绑定的手机号码
        $ionicModal.fromTemplateUrl('selectCardModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.showSelectCard = function () {
            $scope.modal.show();
        };
        $scope.selectedCard = function () {
            $scope.modal.hide();
        };
        $scope.cardList = [
            {id: 1, name: '农业银行-借记卡', card_no: '6228480470845648832'},
            {id: 2, name: '中国银行-借记卡', card_no: '6228480470845642411'},
            {id: 3, name: '工商银行-借记卡', card_no: '6228480470845643984'},
            {id: 4, name: '重庆农村商业银行-借记卡', card_no: '62284804708456418060'}
        ];
        $scope.formData.bank = $scope.cardList[0];

        // 倒计时
        $scope.getCode = function () {
            if ($scope.form.phone != $scope.phone) {
                ar.saveDataAlert($ionicPopup, '输入的手机号码与绑定手机号码不符，请检查！' + $scope.phone.substring(0, 3) + "****" + $scope.phone.substring(7, 11));
                return false;
            }

            // 发送验证码
            api.sendCodeMsg($scope.form.phone).success(function (res) {
                if (!res) {
                    ar.saveDataAlert($ionicPopup, '获取验证码失败');
                }
            })

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
        }

        $scope.saveData = function () {
            // 比对验证码
            api.validateCode($scope.form.code).success(function (res) {
                if (res) {
                    // 保存数据到消费记录，用户余额减少

                } else {
                    ar.saveDataAlert($ionicPopup, '验证码错误');
                }
            })
        }


    }]);

    // 我的账户-我的银行卡
    module.controller("member.account_mycard", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.cardList = [
            {id: 1, name: '农业银行-借记卡', card_no: '6228480470845648832'},
            {id: 2, name: '中国银行-借记卡', card_no: '6228480470845642411'},
            {id: 3, name: '工商银行-借记卡', card_no: '6228480470845643984'},
            {id: 4, name: '重庆农村商业银行-借记卡', card_no: '62284804708456418060'}
        ];

    }]);

    // 我的账户-银行卡详情
    module.controller("member.account_mycard_info", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {
        $scope.cardId = $location.$$search.id;  // 银行卡ID

    }]);


    //  我的银行卡-添加
    module.controller("member.account_add_card", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {
        $scope.formData = [];
        $scope.userInfo.info.realname = '张晓三';
        // 卡类型联动
        $scope.bankNameChain = function () {
            $scope.formData.card_no = '';
            $scope.bankData = [
                {
                    "bin": "621098",
                    "bankName": "邮储银行-绿卡通-借记卡"
                },
                {
                    "bin": "622150",
                    "bankName": "邮储银行-绿卡银联标准卡-借记卡"
                },
                {
                    "bin": "622151",
                    "bankName": "邮储银行-绿卡银联标准卡-借记卡"
                },
                {
                    "bin": "622181",
                    "bankName": "邮储银行-绿卡专用卡-借记卡"
                },
                {
                    "bin": "622188",
                    "bankName": "邮储银行-绿卡银联标准卡-借记卡"
                },
                {
                    "bin": "955100",
                    "bankName": "邮储银行-绿卡(银联卡)-借记卡"
                },
                {
                    "bin": "621095",
                    "bankName": "邮储银行-绿卡VIP卡-借记卡"
                },
                {
                    "bin": "620062",
                    "bankName": "邮储银行-银联标准卡-借记卡"
                },
                {
                    "bin": "621285",
                    "bankName": "邮储银行-中职学生资助卡-借记卡"
                },
                {
                    "bin": "621798",
                    "bankName": "邮政储蓄银行-IC绿卡通VIP卡-借记卡"
                },
                {
                    "bin": "621799",
                    "bankName": "邮政储蓄银行-IC绿卡通-借记卡"
                },
                {
                    "bin": "621797",
                    "bankName": "邮政储蓄银行-IC联名卡-借记卡"
                },
                {
                    "bin": "620529",
                    "bankName": "邮政储蓄银行-IC预付费卡-预付费卡"
                },
                {
                    "bin": "622199",
                    "bankName": "邮储银行-绿卡银联标准卡-借记卡"
                },
                {
                    "bin": "621096",
                    "bankName": "邮储银行-绿卡通-借记卡"
                },
                {
                    "bin": "62215049",
                    "bankName": "邮储银行河南分行-绿卡储蓄卡(银联卡)-借记卡"
                },
                {
                    "bin": "62215050",
                    "bankName": "邮储银行河南分行-绿卡储蓄卡(银联卡)-借记卡"
                },
                {
                    "bin": "62215051",
                    "bankName": "邮储银行河南分行-绿卡储蓄卡(银联卡)-借记卡"
                },
                {
                    "bin": "62218850",
                    "bankName": "邮储银行河南分行-绿卡储蓄卡(银联卡)-借记卡"
                },
                {
                    "bin": "62218851",
                    "bankName": "邮储银行河南分行-绿卡储蓄卡(银联卡)-借记卡"
                },
                {
                    "bin": "62218849",
                    "bankName": "邮储银行河南分行-绿卡储蓄卡(银联卡)-借记卡"
                },
                {
                    "bin": "621622",
                    "bankName": "邮政储蓄银行-武警军人保障卡-借记卡"
                },
                {
                    "bin": "623219",
                    "bankName": "邮政储蓄银行-中国旅游卡（金卡）-借记卡"
                },
                {
                    "bin": "621674",
                    "bankName": "邮政储蓄银行-普通高中学生资助卡-借记卡"
                },
                {
                    "bin": "623218",
                    "bankName": "邮政储蓄银行-中国旅游卡（普卡）-借记卡"
                },
                {
                    "bin": "621599",
                    "bankName": "邮政储蓄银行-福农卡-借记卡"
                },
                {
                    "bin": "370246",
                    "bankName": "工商银行-牡丹运通卡金卡-贷记卡"
                },
                {
                    "bin": "370248",
                    "bankName": "工商银行-牡丹运通卡金卡-贷记卡"
                },
                {
                    "bin": "370249",
                    "bankName": "工商银行-牡丹运通卡金卡-贷记卡"
                },
                {
                    "bin": "427010",
                    "bankName": "工商银行-牡丹VISA卡(单位卡)-贷记卡"
                },
                {
                    "bin": "427018",
                    "bankName": "工商银行-牡丹VISA信用卡-贷记卡"
                },
                {
                    "bin": "427019",
                    "bankName": "工商银行-牡丹VISA卡(单位卡)-贷记卡"
                },
                {
                    "bin": "427020",
                    "bankName": "工商银行-牡丹VISA信用卡-贷记卡"
                },
                {
                    "bin": "427029",
                    "bankName": "工商银行-牡丹VISA信用卡-贷记卡"
                },
                {
                    "bin": "427030",
                    "bankName": "工商银行-牡丹VISA信用卡-贷记卡"
                },
                {
                    "bin": "427039",
                    "bankName": "工商银行-牡丹VISA信用卡-贷记卡"
                },
                {
                    "bin": "370247",
                    "bankName": "工商银行-牡丹运通卡普通卡-贷记卡"
                },
                {
                    "bin": "438125",
                    "bankName": "工商银行-牡丹VISA信用卡-贷记卡"
                },
                {
                    "bin": "438126",
                    "bankName": "工商银行-牡丹VISA白金卡-贷记卡"
                },
                {
                    "bin": "451804",
                    "bankName": "工商银行-牡丹贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "451810",
                    "bankName": "工商银行-牡丹贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "451811",
                    "bankName": "工商银行-牡丹贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "45806",
                    "bankName": "工商银行-牡丹信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "458071",
                    "bankName": "工商银行-牡丹贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "489734",
                    "bankName": "工商银行-牡丹欧元卡-贷记卡"
                },
                {
                    "bin": "489735",
                    "bankName": "工商银行-牡丹欧元卡-贷记卡"
                },
                {
                    "bin": "489736",
                    "bankName": "工商银行-牡丹欧元卡-贷记卡"
                },
                {
                    "bin": "510529",
                    "bankName": "工商银行-牡丹万事达国际借记卡-贷记卡"
                },
                {
                    "bin": "427062",
                    "bankName": "工商银行-牡丹VISA信用卡-贷记卡"
                },
                {
                    "bin": "524091",
                    "bankName": "工商银行-海航信用卡-贷记卡"
                },
                {
                    "bin": "427064",
                    "bankName": "工商银行-牡丹VISA信用卡-贷记卡"
                },
                {
                    "bin": "530970",
                    "bankName": "工商银行-牡丹万事达信用卡-贷记卡"
                },
                {
                    "bin": "53098",
                    "bankName": "工商银行-牡丹信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "530990",
                    "bankName": "工商银行-牡丹万事达信用卡-贷记卡"
                },
                {
                    "bin": "558360",
                    "bankName": "工商银行-牡丹万事达信用卡-贷记卡"
                },
                {
                    "bin": "620200",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620302",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620402",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620403",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620404",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "524047",
                    "bankName": "工商银行-牡丹万事达白金卡-贷记卡"
                },
                {
                    "bin": "620406",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620407",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "525498",
                    "bankName": "工商银行-海航信用卡个人普卡-贷记卡"
                },
                {
                    "bin": "620409",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620410",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620411",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620412",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620502",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620503",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620405",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620408",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620512",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620602",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620604",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620607",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620611",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620612",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620704",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620706",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620707",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620708",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620709",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620710",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620609",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620712",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620713",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620714",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620802",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620711",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620904",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620905",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621001",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "620902",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621103",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621105",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621106",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621107",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621102",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621203",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621204",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621205",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621206",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621207",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621208",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621209",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621210",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621302",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621303",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621202",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621305",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621306",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621307",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621309",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621311",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621313",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621211",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621315",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621304",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621402",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621404",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621405",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621406",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621407",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621408",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621409",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621410",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621502",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621317",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621511",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621602",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621603",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621604",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621605",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621608",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621609",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621610",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621611",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621612",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621613",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621614",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621615",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621616",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621617",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621607",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621606",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621804",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621807",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621813",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621814",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621817",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621901",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621904",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621905",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621906",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621907",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621908",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621909",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621910",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621911",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621912",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621913",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621915",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622002",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621903",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622004",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622005",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622006",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622007",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622008",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622010",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622011",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622012",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "621914",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622015",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622016",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622003",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622018",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622019",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622020",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622102",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622103",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622104",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622105",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622013",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622111",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622114",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622200",
                    "bankName": "工商银行-灵通卡-借记卡"
                },
                {
                    "bin": "622017",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622202",
                    "bankName": "工商银行-E时代卡-借记卡"
                },
                {
                    "bin": "622203",
                    "bankName": "工商银行-E时代卡-借记卡"
                },
                {
                    "bin": "622208",
                    "bankName": "工商银行-理财金卡-借记卡"
                },
                {
                    "bin": "622210",
                    "bankName": "工商银行-准贷记卡(个普)-准贷记卡"
                },
                {
                    "bin": "622211",
                    "bankName": "工商银行-准贷记卡(个普)-准贷记卡"
                },
                {
                    "bin": "622212",
                    "bankName": "工商银行-准贷记卡(个普)-准贷记卡"
                },
                {
                    "bin": "622213",
                    "bankName": "工商银行-准贷记卡(个普)-准贷记卡"
                },
                {
                    "bin": "622214",
                    "bankName": "工商银行-准贷记卡(个普)-准贷记卡"
                },
                {
                    "bin": "622110",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622220",
                    "bankName": "工商银行-准贷记卡(商普)-准贷记卡"
                },
                {
                    "bin": "622223",
                    "bankName": "工商银行-牡丹卡(商务卡)-准贷记卡"
                },
                {
                    "bin": "622225",
                    "bankName": "工商银行-准贷记卡(商金)-准贷记卡"
                },
                {
                    "bin": "622229",
                    "bankName": "工商银行-牡丹卡(商务卡)-准贷记卡"
                },
                {
                    "bin": "622230",
                    "bankName": "工商银行-贷记卡(个普)-贷记卡"
                },
                {
                    "bin": "622231",
                    "bankName": "工商银行-牡丹卡(个人卡)-贷记卡"
                },
                {
                    "bin": "622232",
                    "bankName": "工商银行-牡丹卡(个人卡)-贷记卡"
                },
                {
                    "bin": "622233",
                    "bankName": "工商银行-牡丹卡(个人卡)-贷记卡"
                },
                {
                    "bin": "622234",
                    "bankName": "工商银行-牡丹卡(个人卡)-贷记卡"
                },
                {
                    "bin": "622235",
                    "bankName": "工商银行-贷记卡(个金)-贷记卡"
                },
                {
                    "bin": "622237",
                    "bankName": "工商银行-牡丹交通卡-贷记卡"
                },
                {
                    "bin": "622215",
                    "bankName": "工商银行-准贷记卡(个金)-准贷记卡"
                },
                {
                    "bin": "622239",
                    "bankName": "工商银行-牡丹交通卡-贷记卡"
                },
                {
                    "bin": "622240",
                    "bankName": "工商银行-贷记卡(商普)-贷记卡"
                },
                {
                    "bin": "622245",
                    "bankName": "工商银行-贷记卡(商金)-贷记卡"
                },
                {
                    "bin": "622224",
                    "bankName": "工商银行-牡丹卡(商务卡)-准贷记卡"
                },
                {
                    "bin": "622303",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622304",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622305",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622306",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622307",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622308",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622309",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622238",
                    "bankName": "工商银行-牡丹交通卡-贷记卡"
                },
                {
                    "bin": "622314",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622315",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622317",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622302",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622402",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622403",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622404",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622313",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622504",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622505",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622509",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622513",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622517",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622502",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622604",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622605",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622606",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622510",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622703",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622715",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622806",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622902",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622903",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622706",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623002",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623006",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623008",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623011",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623012",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "622904",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623015",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623100",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623202",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623301",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623400",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623500",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623602",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623803",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623901",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "623014",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "624100",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "624200",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "624301",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "624402",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "62451804",
                    "bankName": "工商银行-牡丹贷记卡-贷记卡"
                },
                {
                    "bin": "62451810",
                    "bankName": "工商银行-牡丹贷记卡-贷记卡"
                },
                {
                    "bin": "62451811",
                    "bankName": "工商银行-牡丹贷记卡-贷记卡"
                },
                {
                    "bin": "6245806",
                    "bankName": "工商银行-牡丹信用卡-贷记卡"
                },
                {
                    "bin": "62458071",
                    "bankName": "工商银行-牡丹贷记卡-贷记卡"
                },
                {
                    "bin": "6253098",
                    "bankName": "工商银行-牡丹信用卡-贷记卡"
                },
                {
                    "bin": "623700",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "628288",
                    "bankName": "工商银行-中央预算单位公务卡-贷记卡"
                },
                {
                    "bin": "624000",
                    "bankName": "工商银行-牡丹灵通卡-借记卡"
                },
                {
                    "bin": "9558",
                    "bankName": "工商银行-牡丹灵通卡(银联卡)-借记卡"
                },
                {
                    "bin": "628286",
                    "bankName": "工商银行-财政预算单位公务卡-贷记卡"
                },
                {
                    "bin": "622206",
                    "bankName": "工商银行-牡丹卡白金卡-贷记卡"
                },
                {
                    "bin": "621225",
                    "bankName": "工商银行-牡丹卡普卡-借记卡"
                },
                {
                    "bin": "526836",
                    "bankName": "工商银行-国航知音牡丹信用卡-贷记卡"
                },
                {
                    "bin": "513685",
                    "bankName": "工商银行-国航知音牡丹信用卡-贷记卡"
                },
                {
                    "bin": "543098",
                    "bankName": "工商银行-国航知音牡丹信用卡-贷记卡"
                },
                {
                    "bin": "458441",
                    "bankName": "工商银行-国航知音牡丹信用卡-贷记卡"
                },
                {
                    "bin": "620058",
                    "bankName": "工商银行-银联标准卡-借记卡"
                },
                {
                    "bin": "621281",
                    "bankName": "工商银行-中职学生资助卡-借记卡"
                },
                {
                    "bin": "622246",
                    "bankName": "工商银行-专用信用消费卡-贷记卡"
                },
                {
                    "bin": "900000",
                    "bankName": "工商银行-牡丹社会保障卡-借记卡"
                },
                {
                    "bin": "544210",
                    "bankName": "中国工商银行-牡丹东航联名卡-贷记卡"
                },
                {
                    "bin": "548943",
                    "bankName": "中国工商银行-牡丹东航联名卡-贷记卡"
                },
                {
                    "bin": "370267",
                    "bankName": "中国工商银行-牡丹运通白金卡-贷记卡"
                },
                {
                    "bin": "621558",
                    "bankName": "中国工商银行-福农灵通卡-借记卡"
                },
                {
                    "bin": "621559",
                    "bankName": "中国工商银行-福农灵通卡-借记卡"
                },
                {
                    "bin": "621722",
                    "bankName": "工商银行-灵通卡-借记卡"
                },
                {
                    "bin": "621723",
                    "bankName": "工商银行-灵通卡-借记卡"
                },
                {
                    "bin": "620086",
                    "bankName": "中国工商银行-中国旅行卡-借记卡"
                },
                {
                    "bin": "621226",
                    "bankName": "工商银行-牡丹卡普卡-借记卡"
                },
                {
                    "bin": "402791",
                    "bankName": "工商银行-国际借记卡-借记卡"
                },
                {
                    "bin": "427028",
                    "bankName": "工商银行-国际借记卡-借记卡"
                },
                {
                    "bin": "427038",
                    "bankName": "工商银行-国际借记卡-借记卡"
                },
                {
                    "bin": "548259",
                    "bankName": "工商银行-国际借记卡-借记卡"
                },
                {
                    "bin": "356879",
                    "bankName": "中国工商银行-牡丹JCB信用卡-贷记卡"
                },
                {
                    "bin": "356880",
                    "bankName": "中国工商银行-牡丹JCB信用卡-贷记卡"
                },
                {
                    "bin": "356881",
                    "bankName": "中国工商银行-牡丹JCB信用卡-贷记卡"
                },
                {
                    "bin": "356882",
                    "bankName": "中国工商银行-牡丹JCB信用卡-贷记卡"
                },
                {
                    "bin": "528856",
                    "bankName": "中国工商银行-牡丹多币种卡-贷记卡"
                },
                {
                    "bin": "621618",
                    "bankName": "中国工商银行-武警军人保障卡-借记卡"
                },
                {
                    "bin": "620516",
                    "bankName": "工商银行-预付芯片卡-借记卡"
                },
                {
                    "bin": "621227",
                    "bankName": "工商银行-理财金账户金卡-借记卡"
                },
                {
                    "bin": "621721",
                    "bankName": "工商银行-灵通卡-借记卡"
                },
                {
                    "bin": "900010",
                    "bankName": "工商银行-牡丹宁波市民卡-借记卡"
                },
                {
                    "bin": "625330",
                    "bankName": "中国工商银行-中国旅游卡-贷记卡"
                },
                {
                    "bin": "625331",
                    "bankName": "中国工商银行-中国旅游卡-贷记卡"
                },
                {
                    "bin": "625332",
                    "bankName": "中国工商银行-中国旅游卡-贷记卡"
                },
                {
                    "bin": "623062",
                    "bankName": "中国工商银行-借记卡-借记卡"
                },
                {
                    "bin": "622236",
                    "bankName": "中国工商银行-借贷合一卡-贷记卡"
                },
                {
                    "bin": "621670",
                    "bankName": "中国工商银行-普通高中学生资助卡-借记卡"
                },
                {
                    "bin": "524374",
                    "bankName": "中国工商银行-牡丹多币种卡-贷记卡"
                },
                {
                    "bin": "550213",
                    "bankName": "中国工商银行-牡丹多币种卡-贷记卡"
                },
                {
                    "bin": "374738",
                    "bankName": "中国工商银行-牡丹百夫长信用卡-贷记卡"
                },
                {
                    "bin": "374739",
                    "bankName": "中国工商银行-牡丹百夫长信用卡-贷记卡"
                },
                {
                    "bin": "621288",
                    "bankName": "工商银行-工银财富卡-借记卡"
                },
                {
                    "bin": "625708",
                    "bankName": "中国工商银行-中小商户采购卡-贷记卡"
                },
                {
                    "bin": "625709",
                    "bankName": "中国工商银行-中小商户采购卡-贷记卡"
                },
                {
                    "bin": "622597",
                    "bankName": "中国工商银行-环球旅行金卡-贷记卡"
                },
                {
                    "bin": "622599",
                    "bankName": "中国工商银行-环球旅行白金卡-贷记卡"
                },
                {
                    "bin": "360883",
                    "bankName": "中国工商银行-牡丹工银大来卡-贷记卡"
                },
                {
                    "bin": "360884",
                    "bankName": "中国工商银行-牡丹工银大莱卡-贷记卡"
                },
                {
                    "bin": "625865",
                    "bankName": "中国工商银行-IC金卡-贷记卡"
                },
                {
                    "bin": "625866",
                    "bankName": "中国工商银行-IC白金卡-贷记卡"
                },
                {
                    "bin": "625899",
                    "bankName": "中国工商银行-工行IC卡（红卡）-贷记卡"
                },
                {
                    "bin": "625929",
                    "bankName": "工行布鲁塞尔-贷记卡-贷记卡"
                },
                {
                    "bin": "621376",
                    "bankName": "中国工商银行布鲁塞尔分行-借记卡-借记卡"
                },
                {
                    "bin": "620054",
                    "bankName": "中国工商银行布鲁塞尔分行-预付卡-预付费卡"
                },
                {
                    "bin": "620142",
                    "bankName": "中国工商银行布鲁塞尔分行-预付卡-预付费卡"
                },
                {
                    "bin": "621423",
                    "bankName": "中国工商银行（巴西）-借记卡-借记卡"
                },
                {
                    "bin": "625927",
                    "bankName": "中国工商银行（巴西）-贷记卡-贷记卡"
                },
                {
                    "bin": "621428",
                    "bankName": "中国工商银行金边分行-借记卡-借记卡"
                },
                {
                    "bin": "625939",
                    "bankName": "中国工商银行金边分行-信用卡-贷记卡"
                },
                {
                    "bin": "621434",
                    "bankName": "中国工商银行金边分行-借记卡-借记卡"
                },
                {
                    "bin": "625987",
                    "bankName": "中国工商银行金边分行-信用卡-贷记卡"
                },
                {
                    "bin": "621761",
                    "bankName": "中国工商银行加拿大分行-借记卡-借记卡"
                },
                {
                    "bin": "621749",
                    "bankName": "中国工商银行加拿大分行-借记卡-借记卡"
                },
                {
                    "bin": "620184",
                    "bankName": "中国工商银行加拿大分行-预付卡-预付费卡"
                },
                {
                    "bin": "625930",
                    "bankName": "工行加拿大-贷记卡-贷记卡"
                },
                {
                    "bin": "621300",
                    "bankName": "中国工商银行巴黎分行-借记卡-借记卡"
                },
                {
                    "bin": "621378",
                    "bankName": "中国工商银行巴黎分行-借记卡-借记卡"
                },
                {
                    "bin": "625114",
                    "bankName": "中国工商银行巴黎分行-贷记卡-贷记卡"
                },
                {
                    "bin": "622159",
                    "bankName": "中国工商银行法兰克福分行-贷记卡-贷记卡"
                },
                {
                    "bin": "621720",
                    "bankName": "中国工商银行法兰克福分行-借记卡-借记卡"
                },
                {
                    "bin": "625021",
                    "bankName": "中国工商银行法兰克福分行-贷记卡-贷记卡"
                },
                {
                    "bin": "625022",
                    "bankName": "中国工商银行法兰克福分行-贷记卡-贷记卡"
                },
                {
                    "bin": "625932",
                    "bankName": "工银法兰克福-贷记卡-贷记卡"
                },
                {
                    "bin": "621379",
                    "bankName": "中国工商银行法兰克福分行-借记卡-借记卡"
                },
                {
                    "bin": "620114",
                    "bankName": "中国工商银行法兰克福分行-预付卡-预付费卡"
                },
                {
                    "bin": "620146",
                    "bankName": "中国工商银行法兰克福分行-预付卡-预付费卡"
                },
                {
                    "bin": "622889",
                    "bankName": "中国工商银行(亚洲)有限公司-ICBC(Asia) Credit-贷记卡"
                },
                {
                    "bin": "625900",
                    "bankName": "中国工商银行(亚洲)有限公司-ICBC Credit Card-贷记卡"
                },
                {
                    "bin": "622949",
                    "bankName": "中国工商银行(亚洲)有限公司-EliteClubATMCard-借记卡"
                },
                {
                    "bin": "625915",
                    "bankName": "中国工商银行(亚洲)有限公司-港币信用卡-贷记卡"
                },
                {
                    "bin": "625916",
                    "bankName": "中国工商银行(亚洲)有限公司-港币信用卡-贷记卡"
                },
                {
                    "bin": "620030",
                    "bankName": "中国工商银行(亚洲)有限公司-工银亚洲预付卡-预付费卡"
                },
                {
                    "bin": "620050",
                    "bankName": "中国工商银行(亚洲)有限公司-预付卡-预付费卡"
                },
                {
                    "bin": "622944",
                    "bankName": "中国工商银行(亚洲)有限公司-CNYEasylinkCard-借记卡"
                },
                {
                    "bin": "625115",
                    "bankName": "中国工商银行(亚洲)有限公司-工银银联公司卡-贷记卡"
                },
                {
                    "bin": "620101",
                    "bankName": "中国工商银行(亚洲)有限公司--预付费卡"
                },
                {
                    "bin": "623335",
                    "bankName": "中国工商银行(亚洲)有限公司--预付费卡"
                },
                {
                    "bin": "622171",
                    "bankName": "中国工商银行(印尼)-印尼盾复合卡-贷记卡"
                },
                {
                    "bin": "621240",
                    "bankName": "中国工商银行(印尼)-借记卡-借记卡"
                },
                {
                    "bin": "621724",
                    "bankName": "中国工商银行印尼分行-借记卡-借记卡"
                },
                {
                    "bin": "625931",
                    "bankName": "工银印尼-贷记卡-贷记卡"
                },
                {
                    "bin": "621762",
                    "bankName": "中国工商银行（印度尼西亚）-借记卡-借记卡"
                },
                {
                    "bin": "625918",
                    "bankName": "中国工商银行印尼分行-信用卡-贷记卡"
                },
                {
                    "bin": "625113",
                    "bankName": "工行米兰-贷记卡-贷记卡"
                },
                {
                    "bin": "621371",
                    "bankName": "中国工商银行米兰分行-借记卡-借记卡"
                },
                {
                    "bin": "620143",
                    "bankName": "中国工商银行米兰分行-预付卡-预付费卡"
                },
                {
                    "bin": "620149",
                    "bankName": "中国工商银行米兰分行-预付卡-预付费卡"
                },
                {
                    "bin": "621730",
                    "bankName": "工行东京分行-工行东京借记卡-借记卡"
                },
                {
                    "bin": "625928",
                    "bankName": "工行阿拉木图-贷记卡-贷记卡"
                },
                {
                    "bin": "621414",
                    "bankName": "中国工商银行阿拉木图子行-借记卡-借记卡"
                },
                {
                    "bin": "625914",
                    "bankName": "中国工商银行阿拉木图子行-贷记卡-贷记卡"
                },
                {
                    "bin": "621375",
                    "bankName": "中国工商银行阿拉木图子行-借记卡-借记卡"
                },
                {
                    "bin": "620187",
                    "bankName": "中国工商银行阿拉木图子行-预付卡-预付费卡"
                },
                {
                    "bin": "621734",
                    "bankName": "工行首尔-借记卡-借记卡"
                },
                {
                    "bin": "621433",
                    "bankName": "中国工商银行万象分行-借记卡-借记卡"
                },
                {
                    "bin": "625986",
                    "bankName": "中国工商银行万象分行-贷记卡-贷记卡"
                },
                {
                    "bin": "621370",
                    "bankName": "中国工商银行卢森堡分行-借记卡-借记卡"
                },
                {
                    "bin": "625925",
                    "bankName": "中国工商银行卢森堡分行-贷记卡-贷记卡"
                },
                {
                    "bin": "622926",
                    "bankName": "中国工商银行澳门分行-E时代卡-借记卡"
                },
                {
                    "bin": "622927",
                    "bankName": "中国工商银行澳门分行-E时代卡-借记卡"
                },
                {
                    "bin": "622928",
                    "bankName": "中国工商银行澳门分行-E时代卡-借记卡"
                },
                {
                    "bin": "622929",
                    "bankName": "中国工商银行澳门分行-理财金账户-借记卡"
                },
                {
                    "bin": "622930",
                    "bankName": "中国工商银行澳门分行-理财金账户-借记卡"
                },
                {
                    "bin": "622931",
                    "bankName": "中国工商银行澳门分行-理财金账户-借记卡"
                },
                {
                    "bin": "621733",
                    "bankName": "中国工商银行（澳门）-借记卡-借记卡"
                },
                {
                    "bin": "621732",
                    "bankName": "中国工商银行（澳门）-借记卡-借记卡"
                },
                {
                    "bin": "620124",
                    "bankName": "中国工商银行澳门分行-预付卡-预付费卡"
                },
                {
                    "bin": "620183",
                    "bankName": "中国工商银行澳门分行-预付卡-预付费卡"
                },
                {
                    "bin": "620561",
                    "bankName": "中国工商银行澳门分行-工银闪付预付卡-预付费卡"
                },
                {
                    "bin": "625116",
                    "bankName": "中国工商银行澳门分行-工银银联公司卡-贷记卡"
                },
                {
                    "bin": "622227",
                    "bankName": "中国工商银行澳门分行-Diamond-贷记卡"
                },
                {
                    "bin": "625921",
                    "bankName": "工行马来西亚-贷记卡-贷记卡"
                },
                {
                    "bin": "621764",
                    "bankName": "工银马来西亚-借记卡-借记卡"
                },
                {
                    "bin": "625926",
                    "bankName": "工行阿姆斯特丹-贷记卡-贷记卡"
                },
                {
                    "bin": "621372",
                    "bankName": "中国工商银行阿姆斯特丹-借记卡-借记卡"
                },
                {
                    "bin": "623034",
                    "bankName": "工银新西兰-借记卡-借记卡"
                },
                {
                    "bin": "625110",
                    "bankName": "工银新西兰-信用卡-贷记卡"
                },
                {
                    "bin": "621464",
                    "bankName": "中国工商银行卡拉奇分行-借记卡-借记卡"
                },
                {
                    "bin": "625942",
                    "bankName": "中国工商银行卡拉奇分行-贷记卡-贷记卡"
                },
                {
                    "bin": "622158",
                    "bankName": "中国工商银行新加坡分行-贷记卡-贷记卡"
                },
                {
                    "bin": "625917",
                    "bankName": "中国工商银行新加坡分行-贷记卡-贷记卡"
                },
                {
                    "bin": "621765",
                    "bankName": "中国工商银行新加坡分行-借记卡-借记卡"
                },
                {
                    "bin": "620094",
                    "bankName": "中国工商银行新加坡分行-预付卡-预付费卡"
                },
                {
                    "bin": "620186",
                    "bankName": "中国工商银行新加坡分行-预付卡-预付费卡"
                },
                {
                    "bin": "621719",
                    "bankName": "中国工商银行新加坡分行-借记卡-借记卡"
                },
                {
                    "bin": "625922",
                    "bankName": "工行河内-贷记卡-贷记卡"
                },
                {
                    "bin": "621369",
                    "bankName": "工银河内-借记卡-借记卡"
                },
                {
                    "bin": "621763",
                    "bankName": "工银河内-工银越南盾借记卡-借记卡"
                },
                {
                    "bin": "625934",
                    "bankName": "工银河内-工银越南盾信用卡-贷记卡"
                },
                {
                    "bin": "620046",
                    "bankName": "工银河内-预付卡-预付费卡"
                },
                {
                    "bin": "621750",
                    "bankName": "中国工商银行马德里分行-借记卡-借记卡"
                },
                {
                    "bin": "625933",
                    "bankName": "工行马德里-贷记卡-贷记卡"
                },
                {
                    "bin": "621377",
                    "bankName": "中国工商银行马德里分行-借记卡-借记卡"
                },
                {
                    "bin": "620148",
                    "bankName": "中国工商银行马德里分行-预付卡-预付费卡"
                },
                {
                    "bin": "620185",
                    "bankName": "中国工商银行马德里分行-预付卡-预付费卡"
                },
                {
                    "bin": "625920",
                    "bankName": "工银泰国-贷记卡-贷记卡"
                },
                {
                    "bin": "621367",
                    "bankName": "工银泰国-借记卡-借记卡"
                },
                {
                    "bin": "625924",
                    "bankName": "工行伦敦-贷记卡-贷记卡"
                },
                {
                    "bin": "621374",
                    "bankName": "中国工商银行伦敦子行-借记卡-借记卡"
                },
                {
                    "bin": "621731",
                    "bankName": "中国工商银行伦敦子行-工银伦敦借记卡-借记卡"
                },
                {
                    "bin": "621781",
                    "bankName": "中国工商银行伦敦子行-借记卡-借记卡"
                },
                {
                    "bin": "103",
                    "bankName": "农业银行-金穗借记卡-借记卡"
                },
                {
                    "bin": "552599",
                    "bankName": "农业银行-金穗贷记卡-贷记卡"
                },
                {
                    "bin": "6349102",
                    "bankName": "农业银行-金穗信用卡-准贷记卡"
                },
                {
                    "bin": "6353591",
                    "bankName": "农业银行-金穗信用卡-准贷记卡"
                },
                {
                    "bin": "623206",
                    "bankName": "农业银行-中国旅游卡-借记卡"
                },
                {
                    "bin": "621671",
                    "bankName": "农业银行-普通高中学生资助卡-借记卡"
                },
                {
                    "bin": "620059",
                    "bankName": "农业银行-银联标准卡-借记卡"
                },
                {
                    "bin": "403361",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "404117",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "404118",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "404119",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "404120",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "404121",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "463758",
                    "bankName": "农业银行-VISA白金卡-贷记卡"
                },
                {
                    "bin": "49102",
                    "bankName": "农业银行-金穗信用卡(银联卡)-准贷记卡"
                },
                {
                    "bin": "514027",
                    "bankName": "农业银行-万事达白金卡-贷记卡"
                },
                {
                    "bin": "519412",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "519413",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "520082",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "520083",
                    "bankName": "农业银行-金穗贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "53591",
                    "bankName": "农业银行-金穗信用卡(银联卡)-准贷记卡"
                },
                {
                    "bin": "558730",
                    "bankName": "农业银行-金穗贷记卡-贷记卡"
                },
                {
                    "bin": "621282",
                    "bankName": "农业银行-中职学生资助卡-借记卡"
                },
                {
                    "bin": "621336",
                    "bankName": "农业银行-专用惠农卡-借记卡"
                },
                {
                    "bin": "621619",
                    "bankName": "农业银行-武警军人保障卡-借记卡"
                },
                {
                    "bin": "622821",
                    "bankName": "农业银行-金穗校园卡(银联卡)-借记卡"
                },
                {
                    "bin": "622822",
                    "bankName": "农业银行-金穗星座卡(银联卡)-借记卡"
                },
                {
                    "bin": "622823",
                    "bankName": "农业银行-金穗社保卡(银联卡)-借记卡"
                },
                {
                    "bin": "622824",
                    "bankName": "农业银行-金穗旅游卡(银联卡)-借记卡"
                },
                {
                    "bin": "622825",
                    "bankName": "农业银行-金穗青年卡(银联卡)-借记卡"
                },
                {
                    "bin": "622826",
                    "bankName": "农业银行-复合介质金穗通宝卡-借记卡"
                },
                {
                    "bin": "622827",
                    "bankName": "农业银行-金穗海通卡-借记卡"
                },
                {
                    "bin": "622828",
                    "bankName": "农业银行-退役金卡-借记卡"
                },
                {
                    "bin": "622836",
                    "bankName": "农业银行-金穗贷记卡-贷记卡"
                },
                {
                    "bin": "622837",
                    "bankName": "农业银行-金穗贷记卡-贷记卡"
                },
                {
                    "bin": "622840",
                    "bankName": "农业银行-金穗通宝卡(银联卡)-借记卡"
                },
                {
                    "bin": "622841",
                    "bankName": "农业银行-金穗惠农卡-借记卡"
                },
                {
                    "bin": "622843",
                    "bankName": "农业银行-金穗通宝银卡-借记卡"
                },
                {
                    "bin": "622844",
                    "bankName": "农业银行-金穗通宝卡(银联卡)-借记卡"
                },
                {
                    "bin": "622845",
                    "bankName": "农业银行-金穗通宝卡(银联卡)-借记卡"
                },
                {
                    "bin": "622846",
                    "bankName": "农业银行-金穗通宝卡-借记卡"
                },
                {
                    "bin": "622847",
                    "bankName": "农业银行-金穗通宝卡(银联卡)-借记卡"
                },
                {
                    "bin": "622848",
                    "bankName": "农业银行-金穗通宝卡(银联卡)-借记卡"
                },
                {
                    "bin": "622849",
                    "bankName": "农业银行-金穗通宝钻石卡-借记卡"
                },
                {
                    "bin": "623018",
                    "bankName": "农业银行-掌尚钱包-借记卡"
                },
                {
                    "bin": "625996",
                    "bankName": "农业银行-银联IC卡金卡-贷记卡"
                },
                {
                    "bin": "625997",
                    "bankName": "农业银行-银联预算单位公务卡金卡-贷记卡"
                },
                {
                    "bin": "625998",
                    "bankName": "农业银行-银联IC卡白金卡-贷记卡"
                },
                {
                    "bin": "628268",
                    "bankName": "农业银行-金穗公务卡-贷记卡"
                },
                {
                    "bin": "95595",
                    "bankName": "农业银行-借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "95596",
                    "bankName": "农业银行-借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "95597",
                    "bankName": "农业银行-借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "95598",
                    "bankName": "农业银行-借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "95599",
                    "bankName": "农业银行-借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "625826",
                    "bankName": "中国农业银行贷记卡-IC普卡-贷记卡"
                },
                {
                    "bin": "625827",
                    "bankName": "中国农业银行贷记卡-IC金卡-贷记卡"
                },
                {
                    "bin": "548478",
                    "bankName": "中国农业银行贷记卡-澳元卡-贷记卡"
                },
                {
                    "bin": "544243",
                    "bankName": "中国农业银行贷记卡-欧元卡-贷记卡"
                },
                {
                    "bin": "622820",
                    "bankName": "中国农业银行贷记卡-金穗通商卡-准贷记卡"
                },
                {
                    "bin": "622830",
                    "bankName": "中国农业银行贷记卡-金穗通商卡-准贷记卡"
                },
                {
                    "bin": "622838",
                    "bankName": "中国农业银行贷记卡-银联白金卡-贷记卡"
                },
                {
                    "bin": "625336",
                    "bankName": "中国农业银行贷记卡-中国旅游卡-贷记卡"
                },
                {
                    "bin": "628269",
                    "bankName": "中国农业银行贷记卡-银联IC公务卡-贷记卡"
                },
                {
                    "bin": "620501",
                    "bankName": "宁波市农业银行-市民卡B卡-借记卡"
                },
                {
                    "bin": "621660",
                    "bankName": "中国银行-联名卡-借记卡"
                },
                {
                    "bin": "621661",
                    "bankName": "中国银行-个人普卡-借记卡"
                },
                {
                    "bin": "621662",
                    "bankName": "中国银行-个人金卡-借记卡"
                },
                {
                    "bin": "621663",
                    "bankName": "中国银行-员工普卡-借记卡"
                },
                {
                    "bin": "621665",
                    "bankName": "中国银行-员工金卡-借记卡"
                },
                {
                    "bin": "621667",
                    "bankName": "中国银行-理财普卡-借记卡"
                },
                {
                    "bin": "621668",
                    "bankName": "中国银行-理财金卡-借记卡"
                },
                {
                    "bin": "621669",
                    "bankName": "中国银行-理财银卡-借记卡"
                },
                {
                    "bin": "621666",
                    "bankName": "中国银行-理财白金卡-借记卡"
                },
                {
                    "bin": "625908",
                    "bankName": "中国银行-中行金融IC卡白金卡-贷记卡"
                },
                {
                    "bin": "625910",
                    "bankName": "中国银行-中行金融IC卡普卡-贷记卡"
                },
                {
                    "bin": "625909",
                    "bankName": "中国银行-中行金融IC卡金卡-贷记卡"
                },
                {
                    "bin": "356833",
                    "bankName": "中国银行-中银JCB卡金卡-贷记卡"
                },
                {
                    "bin": "356835",
                    "bankName": "中国银行-中银JCB卡普卡-贷记卡"
                },
                {
                    "bin": "409665",
                    "bankName": "中国银行-员工普卡-贷记卡"
                },
                {
                    "bin": "409666",
                    "bankName": "中国银行-个人普卡-贷记卡"
                },
                {
                    "bin": "409668",
                    "bankName": "中国银行-中银威士信用卡员-贷记卡"
                },
                {
                    "bin": "409669",
                    "bankName": "中国银行-中银威士信用卡员-贷记卡"
                },
                {
                    "bin": "409670",
                    "bankName": "中国银行-个人白金卡-贷记卡"
                },
                {
                    "bin": "409671",
                    "bankName": "中国银行-中银威士信用卡-贷记卡"
                },
                {
                    "bin": "409672",
                    "bankName": "中国银行-长城公务卡-贷记卡"
                },
                {
                    "bin": "456351",
                    "bankName": "中国银行-长城电子借记卡-借记卡"
                },
                {
                    "bin": "512315",
                    "bankName": "中国银行-中银万事达信用卡-贷记卡"
                },
                {
                    "bin": "512316",
                    "bankName": "中国银行-中银万事达信用卡-贷记卡"
                },
                {
                    "bin": "512411",
                    "bankName": "中国银行-中银万事达信用卡-贷记卡"
                },
                {
                    "bin": "512412",
                    "bankName": "中国银行-中银万事达信用卡-贷记卡"
                },
                {
                    "bin": "514957",
                    "bankName": "中国银行-中银万事达信用卡-贷记卡"
                },
                {
                    "bin": "409667",
                    "bankName": "中国银行-中银威士信用卡员-贷记卡"
                },
                {
                    "bin": "518378",
                    "bankName": "中国银行-长城万事达信用卡-准贷记卡"
                },
                {
                    "bin": "518379",
                    "bankName": "中国银行-长城万事达信用卡-准贷记卡"
                },
                {
                    "bin": "518474",
                    "bankName": "中国银行-长城万事达信用卡-准贷记卡"
                },
                {
                    "bin": "518475",
                    "bankName": "中国银行-长城万事达信用卡-准贷记卡"
                },
                {
                    "bin": "518476",
                    "bankName": "中国银行-长城万事达信用卡-准贷记卡"
                },
                {
                    "bin": "438088",
                    "bankName": "中国银行-中银奥运信用卡-贷记卡"
                },
                {
                    "bin": "524865",
                    "bankName": "中国银行-长城信用卡-准贷记卡"
                },
                {
                    "bin": "525745",
                    "bankName": "中国银行-长城信用卡-准贷记卡"
                },
                {
                    "bin": "525746",
                    "bankName": "中国银行-长城信用卡-准贷记卡"
                },
                {
                    "bin": "547766",
                    "bankName": "中国银行-长城万事达信用卡-准贷记卡"
                },
                {
                    "bin": "552742",
                    "bankName": "中国银行-长城公务卡-贷记卡"
                },
                {
                    "bin": "553131",
                    "bankName": "中国银行-长城公务卡-贷记卡"
                },
                {
                    "bin": "558868",
                    "bankName": "中国银行-中银万事达信用卡-准贷记卡"
                },
                {
                    "bin": "514958",
                    "bankName": "中国银行-中银万事达信用卡-贷记卡"
                },
                {
                    "bin": "622752",
                    "bankName": "中国银行-长城人民币信用卡-准贷记卡"
                },
                {
                    "bin": "622753",
                    "bankName": "中国银行-长城人民币信用卡-准贷记卡"
                },
                {
                    "bin": "622755",
                    "bankName": "中国银行-长城人民币信用卡-准贷记卡"
                },
                {
                    "bin": "524864",
                    "bankName": "中国银行-长城信用卡-准贷记卡"
                },
                {
                    "bin": "622757",
                    "bankName": "中国银行-长城人民币信用卡-准贷记卡"
                },
                {
                    "bin": "622758",
                    "bankName": "中国银行-长城人民币信用卡-准贷记卡"
                },
                {
                    "bin": "622759",
                    "bankName": "中国银行-长城信用卡-准贷记卡"
                },
                {
                    "bin": "622760",
                    "bankName": "中国银行-银联单币贷记卡-贷记卡"
                },
                {
                    "bin": "622761",
                    "bankName": "中国银行-长城信用卡-准贷记卡"
                },
                {
                    "bin": "622762",
                    "bankName": "中国银行-长城信用卡-准贷记卡"
                },
                {
                    "bin": "622763",
                    "bankName": "中国银行-长城信用卡-准贷记卡"
                },
                {
                    "bin": "601382",
                    "bankName": "中国银行-长城电子借记卡-借记卡"
                },
                {
                    "bin": "622756",
                    "bankName": "中国银行-长城人民币信用卡-准贷记卡"
                },
                {
                    "bin": "628388",
                    "bankName": "中国银行-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "621256",
                    "bankName": "中国银行-一卡双账户普卡-借记卡"
                },
                {
                    "bin": "621212",
                    "bankName": "中国银行-财互通卡-借记卡"
                },
                {
                    "bin": "620514",
                    "bankName": "中国银行-电子现金卡-预付费卡"
                },
                {
                    "bin": "622754",
                    "bankName": "中国银行-长城人民币信用卡-准贷记卡"
                },
                {
                    "bin": "622764",
                    "bankName": "中国银行-长城单位信用卡普卡-准贷记卡"
                },
                {
                    "bin": "518377",
                    "bankName": "中国银行-中银女性主题信用卡-贷记卡"
                },
                {
                    "bin": "622765",
                    "bankName": "中国银行-长城单位信用卡金卡-准贷记卡"
                },
                {
                    "bin": "622788",
                    "bankName": "中国银行-白金卡-贷记卡"
                },
                {
                    "bin": "621283",
                    "bankName": "中国银行-中职学生资助卡-借记卡"
                },
                {
                    "bin": "620061",
                    "bankName": "中国银行-银联标准卡-借记卡"
                },
                {
                    "bin": "621725",
                    "bankName": "中国银行-金融IC卡-借记卡"
                },
                {
                    "bin": "620040",
                    "bankName": "中国银行-长城社会保障卡-预付费卡"
                },
                {
                    "bin": "558869",
                    "bankName": "中国银行-世界卡-准贷记卡"
                },
                {
                    "bin": "621330",
                    "bankName": "中国银行-社保联名卡-借记卡"
                },
                {
                    "bin": "621331",
                    "bankName": "中国银行-社保联名卡-借记卡"
                },
                {
                    "bin": "621332",
                    "bankName": "中国银行-医保联名卡-借记卡"
                },
                {
                    "bin": "621333",
                    "bankName": "中国银行-医保联名卡-借记卡"
                },
                {
                    "bin": "621297",
                    "bankName": "中国银行-公司借记卡-借记卡"
                },
                {
                    "bin": "377677",
                    "bankName": "中国银行-银联美运顶级卡-准贷记卡"
                },
                {
                    "bin": "621568",
                    "bankName": "中国银行-长城福农借记卡金卡-借记卡"
                },
                {
                    "bin": "621569",
                    "bankName": "中国银行-长城福农借记卡普卡-借记卡"
                },
                {
                    "bin": "625905",
                    "bankName": "中国银行-中行金融IC卡普卡-准贷记卡"
                },
                {
                    "bin": "625906",
                    "bankName": "中国银行-中行金融IC卡金卡-准贷记卡"
                },
                {
                    "bin": "625907",
                    "bankName": "中国银行-中行金融IC卡白金卡-准贷记卡"
                },
                {
                    "bin": "628313",
                    "bankName": "中国银行-长城银联公务IC卡白金卡-贷记卡"
                },
                {
                    "bin": "625333",
                    "bankName": "中国银行-中银旅游信用卡-准贷记卡"
                },
                {
                    "bin": "628312",
                    "bankName": "中国银行-长城银联公务IC卡金卡-贷记卡"
                },
                {
                    "bin": "623208",
                    "bankName": "中国银行-中国旅游卡-借记卡"
                },
                {
                    "bin": "621620",
                    "bankName": "中国银行-武警军人保障卡-借记卡"
                },
                {
                    "bin": "621756",
                    "bankName": "中国银行-社保联名借记IC卡-借记卡"
                },
                {
                    "bin": "621757",
                    "bankName": "中国银行-社保联名借记IC卡-借记卡"
                },
                {
                    "bin": "621758",
                    "bankName": "中国银行-医保联名借记IC卡-借记卡"
                },
                {
                    "bin": "621759",
                    "bankName": "中国银行-医保联名借记IC卡-借记卡"
                },
                {
                    "bin": "621785",
                    "bankName": "中国银行-借记IC个人普卡-借记卡"
                },
                {
                    "bin": "621786",
                    "bankName": "中国银行-借记IC个人金卡-借记卡"
                },
                {
                    "bin": "621787",
                    "bankName": "中国银行-借记IC个人普卡-借记卡"
                },
                {
                    "bin": "621788",
                    "bankName": "中国银行-借记IC白金卡-借记卡"
                },
                {
                    "bin": "621789",
                    "bankName": "中国银行-借记IC钻石卡-借记卡"
                },
                {
                    "bin": "621790",
                    "bankName": "中国银行-借记IC联名卡-借记卡"
                },
                {
                    "bin": "621672",
                    "bankName": "中国银行-普通高中学生资助卡-借记卡"
                },
                {
                    "bin": "625337",
                    "bankName": "中国银行-长城环球通港澳台旅游金卡-准贷记卡"
                },
                {
                    "bin": "625338",
                    "bankName": "中国银行-长城环球通港澳台旅游白金卡-准贷记卡"
                },
                {
                    "bin": "625568",
                    "bankName": "中国银行-中银福农信用卡-准贷记卡"
                },
                {
                    "bin": "620025",
                    "bankName": "中国银行（澳大利亚）-预付卡-预付费卡"
                },
                {
                    "bin": "620026",
                    "bankName": "中国银行（澳大利亚）-预付卡-预付费卡"
                },
                {
                    "bin": "621293",
                    "bankName": "中国银行（澳大利亚）-借记卡-借记卡"
                },
                {
                    "bin": "621294",
                    "bankName": "中国银行（澳大利亚）-借记卡-借记卡"
                },
                {
                    "bin": "621342",
                    "bankName": "中国银行（澳大利亚）-借记卡-借记卡"
                },
                {
                    "bin": "621343",
                    "bankName": "中国银行（澳大利亚）-借记卡-借记卡"
                },
                {
                    "bin": "621364",
                    "bankName": "中国银行（澳大利亚）-借记卡-借记卡"
                },
                {
                    "bin": "621394",
                    "bankName": "中国银行（澳大利亚）-借记卡-借记卡"
                },
                {
                    "bin": "621648",
                    "bankName": "中国银行金边分行-借记卡-借记卡"
                },
                {
                    "bin": "621248",
                    "bankName": "中国银行雅加达分行-借记卡-借记卡"
                },
                {
                    "bin": "621215",
                    "bankName": "中银东京分行-借记卡普卡-借记卡"
                },
                {
                    "bin": "621249",
                    "bankName": "中国银行首尔分行-借记卡-借记卡"
                },
                {
                    "bin": "622750",
                    "bankName": "中国银行澳门分行-人民币信用卡-贷记卡"
                },
                {
                    "bin": "622751",
                    "bankName": "中国银行澳门分行-人民币信用卡-贷记卡"
                },
                {
                    "bin": "622771",
                    "bankName": "中国银行澳门分行-中银卡-借记卡"
                },
                {
                    "bin": "622772",
                    "bankName": "中国银行澳门分行-中银卡-借记卡"
                },
                {
                    "bin": "622770",
                    "bankName": "中国银行澳门分行-中银卡-借记卡"
                },
                {
                    "bin": "625145",
                    "bankName": "中国银行澳门分行-中银银联双币商务卡-贷记卡"
                },
                {
                    "bin": "620531",
                    "bankName": "中国银行澳门分行-预付卡-预付费卡"
                },
                {
                    "bin": "620210",
                    "bankName": "中国银行澳门分行-澳门中国银行银联预付卡-预付费卡"
                },
                {
                    "bin": "620211",
                    "bankName": "中国银行澳门分行-澳门中国银行银联预付卡-预付费卡"
                },
                {
                    "bin": "622479",
                    "bankName": "中国银行澳门分行-熊猫卡-贷记卡"
                },
                {
                    "bin": "622480",
                    "bankName": "中国银行澳门分行-财富卡-贷记卡"
                },
                {
                    "bin": "622273",
                    "bankName": "中国银行澳门分行-银联港币卡-借记卡"
                },
                {
                    "bin": "622274",
                    "bankName": "中国银行澳门分行-银联澳门币卡-借记卡"
                },
                {
                    "bin": "620019",
                    "bankName": "中国银行(马来西亚)-预付卡-预付费卡"
                },
                {
                    "bin": "620035",
                    "bankName": "中国银行(马来西亚)-预付卡-预付费卡"
                },
                {
                    "bin": "621231",
                    "bankName": "中国银行马尼拉分行-双币种借记卡-借记卡"
                },
                {
                    "bin": "622789",
                    "bankName": "中行新加坡分行-BOCCUPPLATINUMCARD-贷记卡"
                },
                {
                    "bin": "621638",
                    "bankName": "中国银行胡志明分行-借记卡-借记卡"
                },
                {
                    "bin": "621334",
                    "bankName": "中国银行曼谷分行-借记卡-借记卡"
                },
                {
                    "bin": "625140",
                    "bankName": "中国银行曼谷分行-长城信用卡环球通-贷记卡"
                },
                {
                    "bin": "621395",
                    "bankName": "中国银行曼谷分行-借记卡-借记卡"
                },
                {
                    "bin": "620513",
                    "bankName": "中行宁波分行-长城宁波市民卡-预付费卡"
                },
                {
                    "bin": "5453242",
                    "bankName": "建设银行-龙卡信用卡-贷记卡"
                },
                {
                    "bin": "5491031",
                    "bankName": "建设银行-龙卡信用卡-贷记卡"
                },
                {
                    "bin": "5544033",
                    "bankName": "建设银行-龙卡信用卡-贷记卡"
                },
                {
                    "bin": "622725",
                    "bankName": "建设银行-龙卡准贷记卡-准贷记卡"
                },
                {
                    "bin": "622728",
                    "bankName": "建设银行-龙卡准贷记卡金卡-准贷记卡"
                },
                {
                    "bin": "621284",
                    "bankName": "建设银行-中职学生资助卡-借记卡"
                },
                {
                    "bin": "421349",
                    "bankName": "建设银行-乐当家银卡VISA-借记卡"
                },
                {
                    "bin": "434061",
                    "bankName": "建设银行-乐当家金卡VISA-借记卡"
                },
                {
                    "bin": "434062",
                    "bankName": "建设银行-乐当家白金卡-借记卡"
                },
                {
                    "bin": "436728",
                    "bankName": "建设银行-龙卡普通卡VISA-准贷记卡"
                },
                {
                    "bin": "436742",
                    "bankName": "建设银行-龙卡储蓄卡-借记卡"
                },
                {
                    "bin": "453242",
                    "bankName": "建设银行-VISA准贷记卡(银联卡)-准贷记卡"
                },
                {
                    "bin": "491031",
                    "bankName": "建设银行-VISA准贷记金卡-准贷记卡"
                },
                {
                    "bin": "524094",
                    "bankName": "建设银行-乐当家-借记卡"
                },
                {
                    "bin": "526410",
                    "bankName": "建设银行-乐当家-借记卡"
                },
                {
                    "bin": "53242",
                    "bankName": "建设银行-MASTER准贷记卡-准贷记卡"
                },
                {
                    "bin": "53243",
                    "bankName": "建设银行-乐当家-准贷记卡"
                },
                {
                    "bin": "544033",
                    "bankName": "建设银行-准贷记金卡-准贷记卡"
                },
                {
                    "bin": "552245",
                    "bankName": "建设银行-乐当家白金卡-借记卡"
                },
                {
                    "bin": "589970",
                    "bankName": "建设银行-金融复合IC卡-借记卡"
                },
                {
                    "bin": "620060",
                    "bankName": "建设银行-银联标准卡-借记卡"
                },
                {
                    "bin": "621080",
                    "bankName": "建设银行-银联理财钻石卡-借记卡"
                },
                {
                    "bin": "621081",
                    "bankName": "建设银行-金融IC卡-借记卡"
                },
                {
                    "bin": "621466",
                    "bankName": "建设银行-理财白金卡-借记卡"
                },
                {
                    "bin": "621467",
                    "bankName": "建设银行-社保IC卡-借记卡"
                },
                {
                    "bin": "621488",
                    "bankName": "建设银行-财富卡私人银行卡-借记卡"
                },
                {
                    "bin": "621499",
                    "bankName": "建设银行-理财金卡-借记卡"
                },
                {
                    "bin": "621598",
                    "bankName": "建设银行-福农卡-借记卡"
                },
                {
                    "bin": "621621",
                    "bankName": "建设银行-武警军人保障卡-借记卡"
                },
                {
                    "bin": "621700",
                    "bankName": "建设银行-龙卡通-借记卡"
                },
                {
                    "bin": "622280",
                    "bankName": "建设银行-银联储蓄卡-借记卡"
                },
                {
                    "bin": "622700",
                    "bankName": "建设银行-龙卡储蓄卡(银联卡)-借记卡"
                },
                {
                    "bin": "622707",
                    "bankName": "建设银行-准贷记卡-准贷记卡"
                },
                {
                    "bin": "622966",
                    "bankName": "建设银行-理财白金卡-借记卡"
                },
                {
                    "bin": "622988",
                    "bankName": "建设银行-理财金卡-借记卡"
                },
                {
                    "bin": "625955",
                    "bankName": "建设银行-准贷记卡普卡-准贷记卡"
                },
                {
                    "bin": "625956",
                    "bankName": "建设银行-准贷记卡金卡-准贷记卡"
                },
                {
                    "bin": "553242",
                    "bankName": "建设银行-龙卡信用卡-贷记卡"
                },
                {
                    "bin": "621082",
                    "bankName": "建设银行-建行陆港通龙卡-借记卡"
                },
                {
                    "bin": "621673",
                    "bankName": "中国建设银行-普通高中学生资助卡-借记卡"
                },
                {
                    "bin": "623211",
                    "bankName": "中国建设银行-中国旅游卡-借记卡"
                },
                {
                    "bin": "436742193",
                    "bankName": "建行厦门分行-龙卡储蓄卡-借记卡"
                },
                {
                    "bin": "622280193",
                    "bankName": "建行厦门分行-银联储蓄卡-借记卡"
                },
                {
                    "bin": "356896",
                    "bankName": "中国建设银行-龙卡JCB金卡-贷记卡"
                },
                {
                    "bin": "356899",
                    "bankName": "中国建设银行-龙卡JCB白金卡-贷记卡"
                },
                {
                    "bin": "356895",
                    "bankName": "中国建设银行-龙卡JCB普卡-贷记卡"
                },
                {
                    "bin": "436718",
                    "bankName": "中国建设银行-龙卡贷记卡公司卡-贷记卡"
                },
                {
                    "bin": "436738",
                    "bankName": "中国建设银行-龙卡贷记卡-贷记卡"
                },
                {
                    "bin": "436745",
                    "bankName": "中国建设银行-龙卡国际普通卡VISA-贷记卡"
                },
                {
                    "bin": "436748",
                    "bankName": "中国建设银行-龙卡国际金卡VISA-贷记卡"
                },
                {
                    "bin": "489592",
                    "bankName": "中国建设银行-VISA白金信用卡-贷记卡"
                },
                {
                    "bin": "531693",
                    "bankName": "中国建设银行-龙卡国际白金卡-贷记卡"
                },
                {
                    "bin": "532450",
                    "bankName": "中国建设银行-龙卡国际普通卡MASTER-贷记卡"
                },
                {
                    "bin": "532458",
                    "bankName": "中国建设银行-龙卡国际金卡MASTER-贷记卡"
                },
                {
                    "bin": "544887",
                    "bankName": "中国建设银行-龙卡万事达金卡-贷记卡"
                },
                {
                    "bin": "552801",
                    "bankName": "中国建设银行-龙卡贷记卡-贷记卡"
                },
                {
                    "bin": "557080",
                    "bankName": "中国建设银行-龙卡万事达白金卡-贷记卡"
                },
                {
                    "bin": "558895",
                    "bankName": "中国建设银行-龙卡贷记卡-贷记卡"
                },
                {
                    "bin": "559051",
                    "bankName": "中国建设银行-龙卡万事达信用卡-贷记卡"
                },
                {
                    "bin": "622166",
                    "bankName": "中国建设银行-龙卡人民币信用卡-贷记卡"
                },
                {
                    "bin": "622168",
                    "bankName": "中国建设银行-龙卡人民币信用金卡-贷记卡"
                },
                {
                    "bin": "622708",
                    "bankName": "中国建设银行-龙卡人民币白金卡-贷记卡"
                },
                {
                    "bin": "625964",
                    "bankName": "中国建设银行-龙卡IC信用卡普卡-贷记卡"
                },
                {
                    "bin": "625965",
                    "bankName": "中国建设银行-龙卡IC信用卡金卡-贷记卡"
                },
                {
                    "bin": "625966",
                    "bankName": "中国建设银行-龙卡IC信用卡白金卡-贷记卡"
                },
                {
                    "bin": "628266",
                    "bankName": "中国建设银行-龙卡银联公务卡普卡-贷记卡"
                },
                {
                    "bin": "628366",
                    "bankName": "中国建设银行-龙卡银联公务卡金卡-贷记卡"
                },
                {
                    "bin": "625362",
                    "bankName": "中国建设银行-中国旅游卡-贷记卡"
                },
                {
                    "bin": "625363",
                    "bankName": "中国建设银行-中国旅游卡-贷记卡"
                },
                {
                    "bin": "628316",
                    "bankName": "中国建设银行-龙卡IC公务卡-贷记卡"
                },
                {
                    "bin": "628317",
                    "bankName": "中国建设银行-龙卡IC公务卡-贷记卡"
                },
                {
                    "bin": "620021",
                    "bankName": "交通银行-交行预付卡-预付费卡"
                },
                {
                    "bin": "620521",
                    "bankName": "交通银行-世博预付IC卡-预付费卡"
                },
                {
                    "bin": "00405512",
                    "bankName": "交通银行-太平洋互连卡-借记卡"
                },
                {
                    "bin": "0049104",
                    "bankName": "交通银行-太平洋信用卡-贷记卡"
                },
                {
                    "bin": "0053783",
                    "bankName": "交通银行-太平洋信用卡-贷记卡"
                },
                {
                    "bin": "00601428",
                    "bankName": "交通银行-太平洋万事顺卡-借记卡"
                },
                {
                    "bin": "405512",
                    "bankName": "交通银行-太平洋互连卡(银联卡)-借记卡"
                },
                {
                    "bin": "434910",
                    "bankName": "交通银行-太平洋白金信用卡-贷记卡"
                },
                {
                    "bin": "458123",
                    "bankName": "交通银行-太平洋双币贷记卡-贷记卡"
                },
                {
                    "bin": "458124",
                    "bankName": "交通银行-太平洋双币贷记卡-贷记卡"
                },
                {
                    "bin": "49104",
                    "bankName": "交通银行-太平洋信用卡-贷记卡"
                },
                {
                    "bin": "520169",
                    "bankName": "交通银行-太平洋双币贷记卡-贷记卡"
                },
                {
                    "bin": "522964",
                    "bankName": "交通银行-太平洋白金信用卡-贷记卡"
                },
                {
                    "bin": "53783",
                    "bankName": "交通银行-太平洋信用卡-贷记卡"
                },
                {
                    "bin": "552853",
                    "bankName": "交通银行-太平洋双币贷记卡-贷记卡"
                },
                {
                    "bin": "601428",
                    "bankName": "交通银行-太平洋万事顺卡-借记卡"
                },
                {
                    "bin": "622250",
                    "bankName": "交通银行-太平洋人民币贷记卡-贷记卡"
                },
                {
                    "bin": "622251",
                    "bankName": "交通银行-太平洋人民币贷记卡-贷记卡"
                },
                {
                    "bin": "521899",
                    "bankName": "交通银行-太平洋双币贷记卡-贷记卡"
                },
                {
                    "bin": "622254",
                    "bankName": "交通银行-太平洋准贷记卡-准贷记卡"
                },
                {
                    "bin": "622255",
                    "bankName": "交通银行-太平洋准贷记卡-准贷记卡"
                },
                {
                    "bin": "622256",
                    "bankName": "交通银行-太平洋准贷记卡-准贷记卡"
                },
                {
                    "bin": "622257",
                    "bankName": "交通银行-太平洋准贷记卡-准贷记卡"
                },
                {
                    "bin": "622258",
                    "bankName": "交通银行-太平洋借记卡-借记卡"
                },
                {
                    "bin": "622259",
                    "bankName": "交通银行-太平洋借记卡-借记卡"
                },
                {
                    "bin": "622253",
                    "bankName": "交通银行-太平洋人民币贷记卡-贷记卡"
                },
                {
                    "bin": "622261",
                    "bankName": "交通银行-太平洋借记卡-借记卡"
                },
                {
                    "bin": "622284",
                    "bankName": "交通银行-太平洋MORE卡-准贷记卡"
                },
                {
                    "bin": "622656",
                    "bankName": "交通银行-白金卡-贷记卡"
                },
                {
                    "bin": "628216",
                    "bankName": "交通银行-交通银行公务卡普卡-贷记卡"
                },
                {
                    "bin": "622252",
                    "bankName": "交通银行-太平洋人民币贷记卡-贷记卡"
                },
                {
                    "bin": "66405512",
                    "bankName": "交通银行-太平洋互连卡-借记卡"
                },
                {
                    "bin": "6649104",
                    "bankName": "交通银行-太平洋信用卡-贷记卡"
                },
                {
                    "bin": "622260",
                    "bankName": "交通银行-太平洋借记卡-借记卡"
                },
                {
                    "bin": "66601428",
                    "bankName": "交通银行-太平洋万事顺卡-借记卡"
                },
                {
                    "bin": "955590",
                    "bankName": "交通银行-太平洋贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "955591",
                    "bankName": "交通银行-太平洋贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "955592",
                    "bankName": "交通银行-太平洋贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "955593",
                    "bankName": "交通银行-太平洋贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "6653783",
                    "bankName": "交通银行-太平洋信用卡-贷记卡"
                },
                {
                    "bin": "628218",
                    "bankName": "交通银行-交通银行公务卡金卡-贷记卡"
                },
                {
                    "bin": "622262",
                    "bankName": "交通银行-交银IC卡-借记卡"
                },
                {
                    "bin": "621069",
                    "bankName": "交通银行香港分行-交通银行港币借记卡-借记卡"
                },
                {
                    "bin": "620013",
                    "bankName": "交通银行香港分行-港币礼物卡-借记卡"
                },
                {
                    "bin": "625028",
                    "bankName": "交通银行香港分行-双币种信用卡-贷记卡"
                },
                {
                    "bin": "625029",
                    "bankName": "交通银行香港分行-双币种信用卡-贷记卡"
                },
                {
                    "bin": "621436",
                    "bankName": "交通银行香港分行-双币卡-借记卡"
                },
                {
                    "bin": "621002",
                    "bankName": "交通银行香港分行-银联人民币卡-借记卡"
                },
                {
                    "bin": "621335",
                    "bankName": "交通银行澳门分行-银联借记卡-借记卡"
                },
                {
                    "bin": "433670",
                    "bankName": "中信银行-中信借记卡-借记卡"
                },
                {
                    "bin": "433680",
                    "bankName": "中信银行-中信借记卡-借记卡"
                },
                {
                    "bin": "442729",
                    "bankName": "中信银行-中信国际借记卡-借记卡"
                },
                {
                    "bin": "442730",
                    "bankName": "中信银行-中信国际借记卡-借记卡"
                },
                {
                    "bin": "620082",
                    "bankName": "中信银行-中国旅行卡-借记卡"
                },
                {
                    "bin": "622690",
                    "bankName": "中信银行-中信借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622691",
                    "bankName": "中信银行-中信借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622692",
                    "bankName": "中信银行-中信贵宾卡(银联卡)-借记卡"
                },
                {
                    "bin": "622696",
                    "bankName": "中信银行-中信理财宝金卡-借记卡"
                },
                {
                    "bin": "622698",
                    "bankName": "中信银行-中信理财宝白金卡-借记卡"
                },
                {
                    "bin": "622998",
                    "bankName": "中信银行-中信钻石卡-借记卡"
                },
                {
                    "bin": "622999",
                    "bankName": "中信银行-中信钻石卡-借记卡"
                },
                {
                    "bin": "433671",
                    "bankName": "中信银行-中信借记卡-借记卡"
                },
                {
                    "bin": "968807",
                    "bankName": "中信银行-中信理财宝(银联卡)-借记卡"
                },
                {
                    "bin": "968808",
                    "bankName": "中信银行-中信理财宝(银联卡)-借记卡"
                },
                {
                    "bin": "968809",
                    "bankName": "中信银行-中信理财宝(银联卡)-借记卡"
                },
                {
                    "bin": "621771",
                    "bankName": "中信银行-借记卡-借记卡"
                },
                {
                    "bin": "621767",
                    "bankName": "中信银行-理财宝IC卡-借记卡"
                },
                {
                    "bin": "621768",
                    "bankName": "中信银行-理财宝IC卡-借记卡"
                },
                {
                    "bin": "621770",
                    "bankName": "中信银行-理财宝IC卡-借记卡"
                },
                {
                    "bin": "621772",
                    "bankName": "中信银行-理财宝IC卡-借记卡"
                },
                {
                    "bin": "621773",
                    "bankName": "中信银行-理财宝IC卡-借记卡"
                },
                {
                    "bin": "620527",
                    "bankName": "中信银行-主账户复合电子现金卡-借记卡"
                },
                {
                    "bin": "303",
                    "bankName": "光大银行-阳光卡-借记卡"
                },
                {
                    "bin": "356837",
                    "bankName": "光大银行-阳光商旅信用卡-贷记卡"
                },
                {
                    "bin": "356838",
                    "bankName": "光大银行-阳光商旅信用卡-贷记卡"
                },
                {
                    "bin": "486497",
                    "bankName": "光大银行-阳光商旅信用卡-贷记卡"
                },
                {
                    "bin": "622660",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622662",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622663",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622664",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622665",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622666",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622667",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622669",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622670",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622671",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622672",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622668",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622661",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622674",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "90030",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "622673",
                    "bankName": "光大银行-阳光卡(银联卡)-借记卡"
                },
                {
                    "bin": "620518",
                    "bankName": "光大银行-借记卡普卡-借记卡"
                },
                {
                    "bin": "621489",
                    "bankName": "光大银行-社会保障IC卡-借记卡"
                },
                {
                    "bin": "621492",
                    "bankName": "光大银行-IC借记卡普卡-借记卡"
                },
                {
                    "bin": "620535",
                    "bankName": "光大银行-手机支付卡-借记卡"
                },
                {
                    "bin": "623156",
                    "bankName": "光大银行-联名IC卡普卡-借记卡"
                },
                {
                    "bin": "621490",
                    "bankName": "光大银行-借记IC卡白金卡-借记卡"
                },
                {
                    "bin": "621491",
                    "bankName": "光大银行-借记IC卡金卡-借记卡"
                },
                {
                    "bin": "620085",
                    "bankName": "光大银行-阳光旅行卡-借记卡"
                },
                {
                    "bin": "623155",
                    "bankName": "光大银行-借记IC卡钻石卡-借记卡"
                },
                {
                    "bin": "623157",
                    "bankName": "光大银行-联名IC卡金卡-借记卡"
                },
                {
                    "bin": "623158",
                    "bankName": "光大银行-联名IC卡白金卡-借记卡"
                },
                {
                    "bin": "623159",
                    "bankName": "光大银行-联名IC卡钻石卡-借记卡"
                },
                {
                    "bin": "999999",
                    "bankName": "华夏银行-华夏卡(银联卡)-借记卡"
                },
                {
                    "bin": "621222",
                    "bankName": "华夏银行-华夏白金卡-借记卡"
                },
                {
                    "bin": "623020",
                    "bankName": "华夏银行-华夏普卡-借记卡"
                },
                {
                    "bin": "623021",
                    "bankName": "华夏银行-华夏金卡-借记卡"
                },
                {
                    "bin": "623022",
                    "bankName": "华夏银行-华夏白金卡-借记卡"
                },
                {
                    "bin": "623023",
                    "bankName": "华夏银行-华夏钻石卡-借记卡"
                },
                {
                    "bin": "622630",
                    "bankName": "华夏银行-华夏卡(银联卡)-借记卡"
                },
                {
                    "bin": "622631",
                    "bankName": "华夏银行-华夏至尊金卡(银联卡)-借记卡"
                },
                {
                    "bin": "622632",
                    "bankName": "华夏银行-华夏丽人卡(银联卡)-借记卡"
                },
                {
                    "bin": "622633",
                    "bankName": "华夏银行-华夏万通卡-借记卡"
                },
                {
                    "bin": "622615",
                    "bankName": "民生银行-民生借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622616",
                    "bankName": "民生银行-民生银联借记卡－金卡-借记卡"
                },
                {
                    "bin": "622618",
                    "bankName": "民生银行-钻石卡-借记卡"
                },
                {
                    "bin": "622622",
                    "bankName": "民生银行-民生借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622617",
                    "bankName": "民生银行-民生借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622619",
                    "bankName": "民生银行-民生借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "415599",
                    "bankName": "民生银行-民生借记卡-借记卡"
                },
                {
                    "bin": "421393",
                    "bankName": "民生银行-民生国际卡-借记卡"
                },
                {
                    "bin": "421865",
                    "bankName": "民生银行-民生国际卡(银卡)-借记卡"
                },
                {
                    "bin": "427570",
                    "bankName": "民生银行-民生国际卡(欧元卡)-借记卡"
                },
                {
                    "bin": "427571",
                    "bankName": "民生银行-民生国际卡(澳元卡)-借记卡"
                },
                {
                    "bin": "472067",
                    "bankName": "民生银行-民生国际卡-借记卡"
                },
                {
                    "bin": "472068",
                    "bankName": "民生银行-民生国际卡-借记卡"
                },
                {
                    "bin": "622620",
                    "bankName": "民生银行-薪资理财卡-借记卡"
                },
                {
                    "bin": "621691",
                    "bankName": "民生银行-借记卡普卡-借记卡"
                },
                {
                    "bin": "545392",
                    "bankName": "民生银行-民生MasterCard-贷记卡"
                },
                {
                    "bin": "545393",
                    "bankName": "民生银行-民生MasterCard-贷记卡"
                },
                {
                    "bin": "545431",
                    "bankName": "民生银行-民生MasterCard-贷记卡"
                },
                {
                    "bin": "545447",
                    "bankName": "民生银行-民生MasterCard-贷记卡"
                },
                {
                    "bin": "356859",
                    "bankName": "民生银行-民生JCB信用卡-贷记卡"
                },
                {
                    "bin": "356857",
                    "bankName": "民生银行-民生JCB金卡-贷记卡"
                },
                {
                    "bin": "407405",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "421869",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "421870",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "421871",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "512466",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "356856",
                    "bankName": "民生银行-民生JCB普卡-贷记卡"
                },
                {
                    "bin": "528948",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "552288",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622600",
                    "bankName": "民生银行-民生信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622601",
                    "bankName": "民生银行-民生信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622602",
                    "bankName": "民生银行-民生银联白金信用卡-贷记卡"
                },
                {
                    "bin": "517636",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622621",
                    "bankName": "民生银行-民生银联个人白金卡-贷记卡"
                },
                {
                    "bin": "628258",
                    "bankName": "民生银行-公务卡金卡-贷记卡"
                },
                {
                    "bin": "556610",
                    "bankName": "民生银行-民生贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622603",
                    "bankName": "民生银行-民生银联商务信用卡-贷记卡"
                },
                {
                    "bin": "464580",
                    "bankName": "民生银行-民VISA无限卡-贷记卡"
                },
                {
                    "bin": "464581",
                    "bankName": "民生银行-民生VISA商务白金卡-贷记卡"
                },
                {
                    "bin": "523952",
                    "bankName": "民生银行-民生万事达钛金卡-贷记卡"
                },
                {
                    "bin": "545217",
                    "bankName": "民生银行-民生万事达世界卡-贷记卡"
                },
                {
                    "bin": "553161",
                    "bankName": "民生银行-民生万事达白金公务卡-贷记卡"
                },
                {
                    "bin": "356858",
                    "bankName": "民生银行-民生JCB白金卡-贷记卡"
                },
                {
                    "bin": "622623",
                    "bankName": "民生银行-银联标准金卡-贷记卡"
                },
                {
                    "bin": "625911",
                    "bankName": "民生银行-银联芯片普卡-贷记卡"
                },
                {
                    "bin": "377152",
                    "bankName": "民生银行-民生运通双币信用卡普卡-贷记卡"
                },
                {
                    "bin": "377153",
                    "bankName": "民生银行-民生运通双币信用卡金卡-贷记卡"
                },
                {
                    "bin": "377158",
                    "bankName": "民生银行-民生运通双币信用卡钻石卡-贷记卡"
                },
                {
                    "bin": "377155",
                    "bankName": "民生银行-民生运通双币标准信用卡白金卡-贷记卡"
                },
                {
                    "bin": "625912",
                    "bankName": "民生银行-银联芯片金卡-贷记卡"
                },
                {
                    "bin": "625913",
                    "bankName": "民生银行-银联芯片白金卡-贷记卡"
                },
                {
                    "bin": "406365",
                    "bankName": "广发银行股份有限公司-广发VISA信用卡-贷记卡"
                },
                {
                    "bin": "406366",
                    "bankName": "广发银行股份有限公司-广发VISA信用卡-贷记卡"
                },
                {
                    "bin": "428911",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "436768",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "436769",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "487013",
                    "bankName": "广发银行股份有限公司-广发VISA信用卡-贷记卡"
                },
                {
                    "bin": "491032",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "491034",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "491035",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "491036",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "491037",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "491038",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "518364",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "520152",
                    "bankName": "广发银行股份有限公司-广发万事达信用卡-贷记卡"
                },
                {
                    "bin": "520382",
                    "bankName": "广发银行股份有限公司-广发万事达信用卡-贷记卡"
                },
                {
                    "bin": "548844",
                    "bankName": "广发银行股份有限公司-广发信用卡-贷记卡"
                },
                {
                    "bin": "552794",
                    "bankName": "广发银行股份有限公司-广发万事达信用卡-贷记卡"
                },
                {
                    "bin": "622555",
                    "bankName": "广发银行股份有限公司-广发银联标准金卡-贷记卡"
                },
                {
                    "bin": "622556",
                    "bankName": "广发银行股份有限公司-广发银联标准普卡-贷记卡"
                },
                {
                    "bin": "622557",
                    "bankName": "广发银行股份有限公司-广发银联标准真情金卡-贷记卡"
                },
                {
                    "bin": "622558",
                    "bankName": "广发银行股份有限公司-广发银联标准白金卡-贷记卡"
                },
                {
                    "bin": "622559",
                    "bankName": "广发银行股份有限公司-广发银联标准真情普卡-贷记卡"
                },
                {
                    "bin": "622560",
                    "bankName": "广发银行股份有限公司-广发真情白金卡-贷记卡"
                },
                {
                    "bin": "622568",
                    "bankName": "广发银行股份有限公司-广发理财通卡-借记卡"
                },
                {
                    "bin": "528931",
                    "bankName": "广发银行股份有限公司-广发万事达信用卡-贷记卡"
                },
                {
                    "bin": "9111",
                    "bankName": "广发银行股份有限公司-广发理财通(银联卡)-借记卡"
                },
                {
                    "bin": "558894",
                    "bankName": "广发银行股份有限公司-广发万事达信用卡-贷记卡"
                },
                {
                    "bin": "625072",
                    "bankName": "广发银行股份有限公司-银联标准金卡-贷记卡"
                },
                {
                    "bin": "625071",
                    "bankName": "广发银行股份有限公司-银联标准普卡-贷记卡"
                },
                {
                    "bin": "628260",
                    "bankName": "广发银行股份有限公司-银联公务金卡-贷记卡"
                },
                {
                    "bin": "628259",
                    "bankName": "广发银行股份有限公司-银联公务普卡-贷记卡"
                },
                {
                    "bin": "621462",
                    "bankName": "广发银行股份有限公司-理财通卡-借记卡"
                },
                {
                    "bin": "625805",
                    "bankName": "广发银行股份有限公司-银联真情普卡-贷记卡"
                },
                {
                    "bin": "625806",
                    "bankName": "广发银行股份有限公司-银联真情金卡-贷记卡"
                },
                {
                    "bin": "625807",
                    "bankName": "广发银行股份有限公司-银联真情白金卡-贷记卡"
                },
                {
                    "bin": "625808",
                    "bankName": "广发银行股份有限公司-银联标准普卡-贷记卡"
                },
                {
                    "bin": "625809",
                    "bankName": "广发银行股份有限公司-银联标准金卡-贷记卡"
                },
                {
                    "bin": "625810",
                    "bankName": "广发银行股份有限公司-银联标准白金卡-贷记卡"
                },
                {
                    "bin": "685800",
                    "bankName": "广发银行股份有限公司-广发万事达信用卡-贷记卡"
                },
                {
                    "bin": "620037",
                    "bankName": "广发银行股份有限公司-广发青年银行预付卡-预付费卡"
                },
                {
                    "bin": "6858000",
                    "bankName": "广发银行股份有限公司-广发理财通-贷记卡"
                },
                {
                    "bin": "6858001",
                    "bankName": "广发银行股份有限公司-广发理财通-借记卡"
                },
                {
                    "bin": "6858009",
                    "bankName": "广发银行股份有限公司-广发理财通-借记卡"
                },
                {
                    "bin": "623506",
                    "bankName": "广发银行股份有限公司-广发财富管理多币IC卡-借记卡"
                },
                {
                    "bin": "412963",
                    "bankName": "平安银行（借记卡）-发展借记卡-借记卡"
                },
                {
                    "bin": "415752",
                    "bankName": "平安银行（借记卡）-国际借记卡-借记卡"
                },
                {
                    "bin": "415753",
                    "bankName": "平安银行（借记卡）-国际借记卡-借记卡"
                },
                {
                    "bin": "622535",
                    "bankName": "平安银行（借记卡）-聚财卡金卡-借记卡"
                },
                {
                    "bin": "622536",
                    "bankName": "平安银行（借记卡）-聚财卡VIP金卡-借记卡"
                },
                {
                    "bin": "622538",
                    "bankName": "平安银行（借记卡）-发展卡(银联卡)-借记卡"
                },
                {
                    "bin": "622539",
                    "bankName": "平安银行（借记卡）-聚财卡白金卡和钻石卡-借记卡"
                },
                {
                    "bin": "998800",
                    "bankName": "平安银行（借记卡）-发展借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "412962",
                    "bankName": "平安银行（借记卡）-发展借记卡-借记卡"
                },
                {
                    "bin": "622983",
                    "bankName": "平安银行（借记卡）-聚财卡钻石卡-借记卡"
                },
                {
                    "bin": "620010",
                    "bankName": "平安银行（借记卡）-公益预付卡-预付费卡"
                },
                {
                    "bin": "356885",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "356886",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "356887",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "356888",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "356890",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "402658",
                    "bankName": "招商银行-两地一卡通-借记卡"
                },
                {
                    "bin": "410062",
                    "bankName": "招商银行-招行国际卡(银联卡)-借记卡"
                },
                {
                    "bin": "439188",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "439227",
                    "bankName": "招商银行-VISA商务信用卡-贷记卡"
                },
                {
                    "bin": "468203",
                    "bankName": "招商银行-招行国际卡(银联卡)-借记卡"
                },
                {
                    "bin": "479228",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "479229",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "512425",
                    "bankName": "招商银行-招行国际卡(银联卡)-借记卡"
                },
                {
                    "bin": "521302",
                    "bankName": "招商银行-世纪金花联名信用卡-贷记卡"
                },
                {
                    "bin": "524011",
                    "bankName": "招商银行-招行国际卡(银联卡)-借记卡"
                },
                {
                    "bin": "356889",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "545620",
                    "bankName": "招商银行-万事达信用卡-贷记卡"
                },
                {
                    "bin": "545621",
                    "bankName": "招商银行-万事达信用卡-贷记卡"
                },
                {
                    "bin": "545947",
                    "bankName": "招商银行-万事达信用卡-贷记卡"
                },
                {
                    "bin": "545948",
                    "bankName": "招商银行-万事达信用卡-贷记卡"
                },
                {
                    "bin": "552534",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "552587",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "622575",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "622576",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "622577",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "622579",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "622580",
                    "bankName": "招商银行-一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "545619",
                    "bankName": "招商银行-万事达信用卡-贷记卡"
                },
                {
                    "bin": "622581",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "622582",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "622588",
                    "bankName": "招商银行-一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "622598",
                    "bankName": "招商银行-公司卡(银联卡)-借记卡"
                },
                {
                    "bin": "622609",
                    "bankName": "招商银行-金卡-借记卡"
                },
                {
                    "bin": "690755",
                    "bankName": "招商银行-招行一卡通-借记卡"
                },
                {
                    "bin": "95555",
                    "bankName": "招商银行-一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "545623",
                    "bankName": "招商银行-万事达信用卡-贷记卡"
                },
                {
                    "bin": "621286",
                    "bankName": "招商银行-金葵花卡-借记卡"
                },
                {
                    "bin": "620520",
                    "bankName": "招商银行-电子现金卡-预付费卡"
                },
                {
                    "bin": "621483",
                    "bankName": "招商银行-银联IC普卡-借记卡"
                },
                {
                    "bin": "621485",
                    "bankName": "招商银行-银联IC金卡-借记卡"
                },
                {
                    "bin": "621486",
                    "bankName": "招商银行-银联金葵花IC卡-借记卡"
                },
                {
                    "bin": "628290",
                    "bankName": "招商银行-IC公务卡-贷记卡"
                },
                {
                    "bin": "622578",
                    "bankName": "招商银行-招商银行信用卡-贷记卡"
                },
                {
                    "bin": "370285",
                    "bankName": "招商银行信用卡中心-美国运通绿卡-贷记卡"
                },
                {
                    "bin": "370286",
                    "bankName": "招商银行信用卡中心-美国运通金卡-贷记卡"
                },
                {
                    "bin": "370287",
                    "bankName": "招商银行信用卡中心-美国运通商务绿卡-贷记卡"
                },
                {
                    "bin": "370289",
                    "bankName": "招商银行信用卡中心-美国运通商务金卡-贷记卡"
                },
                {
                    "bin": "439225",
                    "bankName": "招商银行信用卡中心-VISA信用卡-贷记卡"
                },
                {
                    "bin": "518710",
                    "bankName": "招商银行信用卡中心-MASTER信用卡-贷记卡"
                },
                {
                    "bin": "518718",
                    "bankName": "招商银行信用卡中心-MASTER信用金卡-贷记卡"
                },
                {
                    "bin": "628362",
                    "bankName": "招商银行信用卡中心-银联标准公务卡(金卡)-贷记卡"
                },
                {
                    "bin": "439226",
                    "bankName": "招商银行信用卡中心-VISA信用卡-贷记卡"
                },
                {
                    "bin": "628262",
                    "bankName": "招商银行信用卡中心-银联标准财政公务卡-贷记卡"
                },
                {
                    "bin": "625802",
                    "bankName": "招商银行信用卡中心-芯片IC信用卡-贷记卡"
                },
                {
                    "bin": "625803",
                    "bankName": "招商银行信用卡中心-芯片IC信用卡-贷记卡"
                },
                {
                    "bin": "621299",
                    "bankName": "招商银行香港分行-香港一卡通-借记卡"
                },
                {
                    "bin": "90592",
                    "bankName": "兴业银行-兴业卡-借记卡"
                },
                {
                    "bin": "966666",
                    "bankName": "兴业银行-兴业卡(银联卡)-借记卡"
                },
                {
                    "bin": "622909",
                    "bankName": "兴业银行-兴业卡(银联标准卡)-借记卡"
                },
                {
                    "bin": "622908",
                    "bankName": "兴业银行-兴业自然人生理财卡-借记卡"
                },
                {
                    "bin": "438588",
                    "bankName": "兴业银行-兴业智能卡(银联卡)-借记卡"
                },
                {
                    "bin": "438589",
                    "bankName": "兴业银行-兴业智能卡-借记卡"
                },
                {
                    "bin": "461982",
                    "bankName": "兴业银行-visa标准双币个人普卡-贷记卡"
                },
                {
                    "bin": "486493",
                    "bankName": "兴业银行-VISA商务普卡-贷记卡"
                },
                {
                    "bin": "486494",
                    "bankName": "兴业银行-VISA商务金卡-贷记卡"
                },
                {
                    "bin": "486861",
                    "bankName": "兴业银行-VISA运动白金信用卡-贷记卡"
                },
                {
                    "bin": "523036",
                    "bankName": "兴业银行-万事达信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "451289",
                    "bankName": "兴业银行-VISA信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "527414",
                    "bankName": "兴业银行-加菲猫信用卡-贷记卡"
                },
                {
                    "bin": "528057",
                    "bankName": "兴业银行-个人白金卡-贷记卡"
                },
                {
                    "bin": "622901",
                    "bankName": "兴业银行-银联信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622922",
                    "bankName": "兴业银行-银联白金信用卡-贷记卡"
                },
                {
                    "bin": "628212",
                    "bankName": "兴业银行-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "451290",
                    "bankName": "兴业银行-VISA信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "524070",
                    "bankName": "兴业银行-万事达信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "625084",
                    "bankName": "兴业银行-银联标准贷记普卡-贷记卡"
                },
                {
                    "bin": "625085",
                    "bankName": "兴业银行-银联标准贷记金卡-贷记卡"
                },
                {
                    "bin": "625086",
                    "bankName": "兴业银行-银联标准贷记金卡-贷记卡"
                },
                {
                    "bin": "625087",
                    "bankName": "兴业银行-银联标准贷记金卡-贷记卡"
                },
                {
                    "bin": "548738",
                    "bankName": "兴业银行-兴业信用卡-贷记卡"
                },
                {
                    "bin": "549633",
                    "bankName": "兴业银行-兴业信用卡-贷记卡"
                },
                {
                    "bin": "552398",
                    "bankName": "兴业银行-兴业信用卡-贷记卡"
                },
                {
                    "bin": "625082",
                    "bankName": "兴业银行-银联标准贷记普卡-贷记卡"
                },
                {
                    "bin": "625083",
                    "bankName": "兴业银行-银联标准贷记普卡-贷记卡"
                },
                {
                    "bin": "625960",
                    "bankName": "兴业银行-兴业芯片普卡-贷记卡"
                },
                {
                    "bin": "625961",
                    "bankName": "兴业银行-兴业芯片金卡-贷记卡"
                },
                {
                    "bin": "625962",
                    "bankName": "兴业银行-兴业芯片白金卡-贷记卡"
                },
                {
                    "bin": "625963",
                    "bankName": "兴业银行-兴业芯片钻石卡-贷记卡"
                },
                {
                    "bin": "356851",
                    "bankName": "浦东发展银行-浦发JCB金卡-贷记卡"
                },
                {
                    "bin": "356852",
                    "bankName": "浦东发展银行-浦发JCB白金卡-贷记卡"
                },
                {
                    "bin": "404738",
                    "bankName": "浦东发展银行-信用卡VISA普通-贷记卡"
                },
                {
                    "bin": "404739",
                    "bankName": "浦东发展银行-信用卡VISA金卡-贷记卡"
                },
                {
                    "bin": "456418",
                    "bankName": "浦东发展银行-浦发银行VISA年青卡-贷记卡"
                },
                {
                    "bin": "498451",
                    "bankName": "浦东发展银行-VISA白金信用卡-贷记卡"
                },
                {
                    "bin": "515672",
                    "bankName": "浦东发展银行-浦发万事达白金卡-贷记卡"
                },
                {
                    "bin": "356850",
                    "bankName": "浦东发展银行-浦发JCB普卡-贷记卡"
                },
                {
                    "bin": "517650",
                    "bankName": "浦东发展银行-浦发万事达金卡-贷记卡"
                },
                {
                    "bin": "525998",
                    "bankName": "浦东发展银行-浦发万事达普卡-贷记卡"
                },
                {
                    "bin": "622177",
                    "bankName": "浦东发展银行-浦发单币卡-贷记卡"
                },
                {
                    "bin": "622277",
                    "bankName": "浦东发展银行-浦发银联单币麦兜普卡-贷记卡"
                },
                {
                    "bin": "622516",
                    "bankName": "浦东发展银行-东方轻松理财卡-借记卡"
                },
                {
                    "bin": "622518",
                    "bankName": "浦东发展银行-东方轻松理财卡-借记卡"
                },
                {
                    "bin": "622520",
                    "bankName": "浦东发展银行-东方轻松理财智业金卡-准贷记卡"
                },
                {
                    "bin": "622521",
                    "bankName": "浦东发展银行-东方卡(银联卡)-借记卡"
                },
                {
                    "bin": "622522",
                    "bankName": "浦东发展银行-东方卡(银联卡)-借记卡"
                },
                {
                    "bin": "622523",
                    "bankName": "浦东发展银行-东方卡(银联卡)-借记卡"
                },
                {
                    "bin": "628222",
                    "bankName": "浦东发展银行-公务卡金卡-贷记卡"
                },
                {
                    "bin": "84301",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "84336",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "84373",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "628221",
                    "bankName": "浦东发展银行-公务卡普卡-贷记卡"
                },
                {
                    "bin": "84385",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "84390",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "87000",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "87010",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "87030",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "87040",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "84380",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "984301",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "984303",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "84361",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "87050",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "622176",
                    "bankName": "浦东发展银行-浦发单币卡-贷记卡"
                },
                {
                    "bin": "622276",
                    "bankName": "浦东发展银行-浦发联名信用卡-贷记卡"
                },
                {
                    "bin": "622228",
                    "bankName": "浦东发展银行-浦发银联白金卡-贷记卡"
                },
                {
                    "bin": "621352",
                    "bankName": "浦东发展银行-轻松理财普卡-借记卡"
                },
                {
                    "bin": "621351",
                    "bankName": "浦东发展银行-移动联名卡-借记卡"
                },
                {
                    "bin": "621390",
                    "bankName": "浦东发展银行-轻松理财消贷易卡-借记卡"
                },
                {
                    "bin": "621792",
                    "bankName": "浦东发展银行-轻松理财普卡（复合卡）-借记卡"
                },
                {
                    "bin": "625957",
                    "bankName": "浦东发展银行-贷记卡-贷记卡"
                },
                {
                    "bin": "625958",
                    "bankName": "浦东发展银行-贷记卡-贷记卡"
                },
                {
                    "bin": "621791",
                    "bankName": "浦东发展银行-东方借记卡（复合卡）-借记卡"
                },
                {
                    "bin": "84342",
                    "bankName": "浦东发展银行-东方卡-借记卡"
                },
                {
                    "bin": "620530",
                    "bankName": "浦东发展银行-电子现金卡（IC卡）-预付费卡"
                },
                {
                    "bin": "625993",
                    "bankName": "浦东发展银行-移动浦发联名卡-贷记卡"
                },
                {
                    "bin": "622519",
                    "bankName": "浦东发展银行-东方-标准准贷记卡-准贷记卡"
                },
                {
                    "bin": "621793",
                    "bankName": "浦东发展银行-轻松理财金卡（复合卡）-借记卡"
                },
                {
                    "bin": "621795",
                    "bankName": "浦东发展银行-轻松理财白金卡（复合卡）-借记卡"
                },
                {
                    "bin": "621796",
                    "bankName": "浦东发展银行-轻松理财钻石卡（复合卡）-借记卡"
                },
                {
                    "bin": "622500",
                    "bankName": "浦东发展银行-东方卡-贷记卡"
                },
                {
                    "bin": "623078",
                    "bankName": "恒丰银行-九州IC卡-借记卡"
                },
                {
                    "bin": "622384",
                    "bankName": "恒丰银行-九州借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "940034",
                    "bankName": "恒丰银行-九州借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "6091201",
                    "bankName": "天津市商业银行-津卡-借记卡"
                },
                {
                    "bin": "940015",
                    "bankName": "天津市商业银行-银联卡(银联卡)-借记卡"
                },
                {
                    "bin": "940008",
                    "bankName": "齐鲁银行股份有限公司-齐鲁卡(银联卡)-借记卡"
                },
                {
                    "bin": "622379",
                    "bankName": "齐鲁银行股份有限公司-齐鲁卡(银联卡)-借记卡"
                },
                {
                    "bin": "622886",
                    "bankName": "烟台商业银行-金通卡-借记卡"
                },
                {
                    "bin": "622391",
                    "bankName": "潍坊银行-鸢都卡(银联卡)-借记卡"
                },
                {
                    "bin": "940072",
                    "bankName": "潍坊银行-鸳都卡(银联卡)-借记卡"
                },
                {
                    "bin": "622359",
                    "bankName": "临沂商业银行-沂蒙卡(银联卡)-借记卡"
                },
                {
                    "bin": "940066",
                    "bankName": "临沂商业银行-沂蒙卡(银联卡)-借记卡"
                },
                {
                    "bin": "622857",
                    "bankName": "日照市商业银行-黄海卡-借记卡"
                },
                {
                    "bin": "940065",
                    "bankName": "日照市商业银行-黄海卡(银联卡)-借记卡"
                },
                {
                    "bin": "621019",
                    "bankName": "浙商银行-商卡-借记卡"
                },
                {
                    "bin": "6223091100",
                    "bankName": "浙商银行天津分行-商卡-借记卡"
                },
                {
                    "bin": "6223092900",
                    "bankName": "浙商银行上海分行-商卡-借记卡"
                },
                {
                    "bin": "6223093310",
                    "bankName": "浙商银行营业部-商卡(银联卡)-借记卡"
                },
                {
                    "bin": "6223093320",
                    "bankName": "浙商银行宁波分行-商卡(银联卡)-借记卡"
                },
                {
                    "bin": "6223093330",
                    "bankName": "浙商银行温州分行-商卡(银联卡)-借记卡"
                },
                {
                    "bin": "6223093370",
                    "bankName": "浙商银行绍兴分行-商卡-借记卡"
                },
                {
                    "bin": "6223093380",
                    "bankName": "浙商银行义乌分行-商卡(银联卡)-借记卡"
                },
                {
                    "bin": "6223096510",
                    "bankName": "浙商银行成都分行-商卡(银联卡)-借记卡"
                },
                {
                    "bin": "6223097910",
                    "bankName": "浙商银行西安分行-商卡-借记卡"
                },
                {
                    "bin": "621268",
                    "bankName": "渤海银行-浩瀚金卡-借记卡"
                },
                {
                    "bin": "622884",
                    "bankName": "渤海银行-渤海银行借记卡-借记卡"
                },
                {
                    "bin": "621453",
                    "bankName": "渤海银行-金融IC卡-借记卡"
                },
                {
                    "bin": "622684",
                    "bankName": "渤海银行-渤海银行公司借记卡-借记卡"
                },
                {
                    "bin": "621062",
                    "bankName": "花旗银行(中国)有限公司-借记卡普卡-借记卡"
                },
                {
                    "bin": "621063",
                    "bankName": "花旗银行(中国)有限公司-借记卡高端卡-借记卡"
                },
                {
                    "bin": "625076",
                    "bankName": "花旗中国-花旗礼享卡-贷记卡"
                },
                {
                    "bin": "625077",
                    "bankName": "花旗中国-花旗礼享卡-贷记卡"
                },
                {
                    "bin": "625074",
                    "bankName": "花旗中国-花旗礼享卡-贷记卡"
                },
                {
                    "bin": "625075",
                    "bankName": "花旗中国-花旗礼享卡-贷记卡"
                },
                {
                    "bin": "622933",
                    "bankName": "东亚银行中国有限公司-紫荆卡-借记卡"
                },
                {
                    "bin": "622938",
                    "bankName": "东亚银行中国有限公司-显卓理财卡-借记卡"
                },
                {
                    "bin": "623031",
                    "bankName": "东亚银行中国有限公司-借记卡-借记卡"
                },
                {
                    "bin": "622946",
                    "bankName": "汇丰银(中国)有限公司-汇丰中国卓越理财卡-借记卡"
                },
                {
                    "bin": "622942",
                    "bankName": "渣打银行中国有限公司-渣打银行智通借记卡-借记卡"
                },
                {
                    "bin": "622994",
                    "bankName": "渣打银行中国有限公司-渣打银行白金借记卡-借记卡"
                },
                {
                    "bin": "621016",
                    "bankName": "星展银行-星展银行借记卡-借记卡"
                },
                {
                    "bin": "621015",
                    "bankName": "星展银行-星展银行借记卡-借记卡"
                },
                {
                    "bin": "622950",
                    "bankName": "恒生银行-恒生通财卡-借记卡"
                },
                {
                    "bin": "622951",
                    "bankName": "恒生银行-恒生优越通财卡-借记卡"
                },
                {
                    "bin": "621060",
                    "bankName": "友利银行(中国)有限公司-友利借记卡-借记卡"
                },
                {
                    "bin": "621072",
                    "bankName": "新韩银行-新韩卡-借记卡"
                },
                {
                    "bin": "621201",
                    "bankName": "韩亚银行（中国）-韩亚卡-借记卡"
                },
                {
                    "bin": "621077",
                    "bankName": "华侨银行（中国）-卓锦借记卡-借记卡"
                },
                {
                    "bin": "621298",
                    "bankName": "永亨银行（中国）有限公司-永亨卡-借记卡"
                },
                {
                    "bin": "621213",
                    "bankName": "南洋商业银行（中国）-借记卡-借记卡"
                },
                {
                    "bin": "621289",
                    "bankName": "南洋商业银行（中国）-财互通卡-借记卡"
                },
                {
                    "bin": "621290",
                    "bankName": "南洋商业银行（中国）-财互通卡-借记卡"
                },
                {
                    "bin": "621291",
                    "bankName": "南洋商业银行（中国）-财互通卡-借记卡"
                },
                {
                    "bin": "621292",
                    "bankName": "南洋商业银行（中国）-财互通卡-借记卡"
                },
                {
                    "bin": "621245",
                    "bankName": "法国兴业银行（中国）-法兴标准借记卡-借记卡"
                },
                {
                    "bin": "621328",
                    "bankName": "大华银行（中国）-尊享理财卡-借记卡"
                },
                {
                    "bin": "621277",
                    "bankName": "大新银行（中国）-借记卡-借记卡"
                },
                {
                    "bin": "621651",
                    "bankName": "企业银行（中国）-瑞卡-借记卡"
                },
                {
                    "bin": "623183",
                    "bankName": "上海银行-慧通钻石卡-借记卡"
                },
                {
                    "bin": "623185",
                    "bankName": "上海银行-慧通金卡-借记卡"
                },
                {
                    "bin": "621005",
                    "bankName": "上海银行-私人银行卡-借记卡"
                },
                {
                    "bin": "622172",
                    "bankName": "上海银行-综合保险卡-借记卡"
                },
                {
                    "bin": "622985",
                    "bankName": "上海银行-申卡社保副卡(有折)-借记卡"
                },
                {
                    "bin": "622987",
                    "bankName": "上海银行-申卡社保副卡(无折)-借记卡"
                },
                {
                    "bin": "622267",
                    "bankName": "上海银行-白金IC借记卡-借记卡"
                },
                {
                    "bin": "622278",
                    "bankName": "上海银行-慧通白金卡(配折)-借记卡"
                },
                {
                    "bin": "622279",
                    "bankName": "上海银行-慧通白金卡(不配折)-借记卡"
                },
                {
                    "bin": "622468",
                    "bankName": "上海银行-申卡(银联卡)-借记卡"
                },
                {
                    "bin": "622892",
                    "bankName": "上海银行-申卡借记卡-借记卡"
                },
                {
                    "bin": "940021",
                    "bankName": "上海银行-银联申卡(银联卡)-借记卡"
                },
                {
                    "bin": "621050",
                    "bankName": "上海银行-单位借记卡-借记卡"
                },
                {
                    "bin": "620522",
                    "bankName": "上海银行-首发纪念版IC卡-借记卡"
                },
                {
                    "bin": "356827",
                    "bankName": "上海银行-申卡贷记卡-贷记卡"
                },
                {
                    "bin": "356828",
                    "bankName": "上海银行-申卡贷记卡-贷记卡"
                },
                {
                    "bin": "356830",
                    "bankName": "上海银行-J分期付款信用卡-贷记卡"
                },
                {
                    "bin": "402673",
                    "bankName": "上海银行-申卡贷记卡-贷记卡"
                },
                {
                    "bin": "402674",
                    "bankName": "上海银行-申卡贷记卡-贷记卡"
                },
                {
                    "bin": "438600",
                    "bankName": "上海银行-上海申卡IC-借记卡"
                },
                {
                    "bin": "486466",
                    "bankName": "上海银行-申卡贷记卡-贷记卡"
                },
                {
                    "bin": "519498",
                    "bankName": "上海银行-申卡贷记卡普通卡-贷记卡"
                },
                {
                    "bin": "520131",
                    "bankName": "上海银行-申卡贷记卡金卡-贷记卡"
                },
                {
                    "bin": "524031",
                    "bankName": "上海银行-万事达白金卡-贷记卡"
                },
                {
                    "bin": "548838",
                    "bankName": "上海银行-万事达星运卡-贷记卡"
                },
                {
                    "bin": "622148",
                    "bankName": "上海银行-申卡贷记卡金卡-贷记卡"
                },
                {
                    "bin": "622149",
                    "bankName": "上海银行-申卡贷记卡普通卡-贷记卡"
                },
                {
                    "bin": "622268",
                    "bankName": "上海银行-安融卡-贷记卡"
                },
                {
                    "bin": "356829",
                    "bankName": "上海银行-分期付款信用卡-贷记卡"
                },
                {
                    "bin": "622300",
                    "bankName": "上海银行-信用卡-贷记卡"
                },
                {
                    "bin": "628230",
                    "bankName": "上海银行-个人公务卡-贷记卡"
                },
                {
                    "bin": "622269",
                    "bankName": "上海银行-安融卡-贷记卡"
                },
                {
                    "bin": "625099",
                    "bankName": "上海银行-上海银行银联白金卡-贷记卡"
                },
                {
                    "bin": "625953",
                    "bankName": "上海银行-贷记IC卡-贷记卡"
                },
                {
                    "bin": "625350",
                    "bankName": "上海银行-中国旅游卡（IC普卡）-贷记卡"
                },
                {
                    "bin": "625351",
                    "bankName": "上海银行-中国旅游卡（IC金卡）-贷记卡"
                },
                {
                    "bin": "625352",
                    "bankName": "上海银行-中国旅游卡（IC白金卡）-贷记卡"
                },
                {
                    "bin": "519961",
                    "bankName": "上海银行-万事达钻石卡-贷记卡"
                },
                {
                    "bin": "625839",
                    "bankName": "上海银行-淘宝IC普卡-贷记卡"
                },
                {
                    "bin": "622393",
                    "bankName": "厦门银行股份有限公司-银鹭借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "6886592",
                    "bankName": "厦门银行股份有限公司-银鹭卡-借记卡"
                },
                {
                    "bin": "940023",
                    "bankName": "厦门银行股份有限公司-银联卡(银联卡)-借记卡"
                },
                {
                    "bin": "623019",
                    "bankName": "厦门银行股份有限公司-凤凰花卡-借记卡"
                },
                {
                    "bin": "621600",
                    "bankName": "厦门银行股份有限公司-凤凰花卡-借记卡"
                },
                {
                    "bin": "421317",
                    "bankName": "北京银行-京卡借记卡-借记卡"
                },
                {
                    "bin": "602969",
                    "bankName": "北京银行-京卡(银联卡)-借记卡"
                },
                {
                    "bin": "621030",
                    "bankName": "北京银行-京卡借记卡-借记卡"
                },
                {
                    "bin": "621420",
                    "bankName": "北京银行-京卡-借记卡"
                },
                {
                    "bin": "621468",
                    "bankName": "北京银行-京卡-借记卡"
                },
                {
                    "bin": "623111",
                    "bankName": "北京银行-借记IC卡-借记卡"
                },
                {
                    "bin": "422160",
                    "bankName": "北京银行-京卡贵宾金卡-借记卡"
                },
                {
                    "bin": "422161",
                    "bankName": "北京银行-京卡贵宾白金卡-借记卡"
                },
                {
                    "bin": "622388",
                    "bankName": "福建海峡银行股份有限公司-榕城卡(银联卡)-借记卡"
                },
                {
                    "bin": "621267",
                    "bankName": "福建海峡银行股份有限公司-福州市民卡-借记卡"
                },
                {
                    "bin": "620043",
                    "bankName": "福建海峡银行股份有限公司-福州市民卡-预付费卡"
                },
                {
                    "bin": "623063",
                    "bankName": "福建海峡银行股份有限公司-海福卡（IC卡）-借记卡"
                },
                {
                    "bin": "622865",
                    "bankName": "吉林银行-君子兰一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "940012",
                    "bankName": "吉林银行-君子兰卡(银联卡)-借记卡"
                },
                {
                    "bin": "623131",
                    "bankName": "吉林银行-长白山金融IC卡-借记卡"
                },
                {
                    "bin": "622178",
                    "bankName": "吉林银行-信用卡-贷记卡"
                },
                {
                    "bin": "622179",
                    "bankName": "吉林银行-信用卡-贷记卡"
                },
                {
                    "bin": "628358",
                    "bankName": "吉林银行-公务卡-贷记卡"
                },
                {
                    "bin": "622394",
                    "bankName": "镇江市商业银行-金山灵通卡(银联卡)-借记卡"
                },
                {
                    "bin": "940025",
                    "bankName": "镇江市商业银行-金山灵通卡(银联卡)-借记卡"
                },
                {
                    "bin": "621279",
                    "bankName": "宁波银行-银联标准卡-借记卡"
                },
                {
                    "bin": "622281",
                    "bankName": "宁波银行-汇通借记卡-借记卡"
                },
                {
                    "bin": "622316",
                    "bankName": "宁波银行-汇通卡(银联卡)-借记卡"
                },
                {
                    "bin": "940022",
                    "bankName": "宁波银行-明州卡-借记卡"
                },
                {
                    "bin": "621418",
                    "bankName": "宁波银行-汇通借记卡-借记卡"
                },
                {
                    "bin": "512431",
                    "bankName": "宁波银行-汇通国际卡银联双币卡-贷记卡"
                },
                {
                    "bin": "520194",
                    "bankName": "宁波银行-汇通国际卡银联双币卡-贷记卡"
                },
                {
                    "bin": "621626",
                    "bankName": "平安银行-新磁条借记卡-借记卡"
                },
                {
                    "bin": "623058",
                    "bankName": "平安银行-平安银行IC借记卡-借记卡"
                },
                {
                    "bin": "602907",
                    "bankName": "平安银行-万事顺卡-借记卡"
                },
                {
                    "bin": "622986",
                    "bankName": "平安银行-平安银行借记卡-借记卡"
                },
                {
                    "bin": "622989",
                    "bankName": "平安银行-平安银行借记卡-借记卡"
                },
                {
                    "bin": "622298",
                    "bankName": "平安银行-万事顺借记卡-借记卡"
                },
                {
                    "bin": "622338",
                    "bankName": "焦作市商业银行-月季借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "940032",
                    "bankName": "焦作市商业银行-月季城市通(银联卡)-借记卡"
                },
                {
                    "bin": "623205",
                    "bankName": "焦作市商业银行-中国旅游卡-借记卡"
                },
                {
                    "bin": "621977",
                    "bankName": "温州银行-金鹿卡-借记卡"
                },
                {
                    "bin": "603445",
                    "bankName": "广州银行股份有限公司-羊城借记卡-借记卡"
                },
                {
                    "bin": "622467",
                    "bankName": "广州银行股份有限公司-羊城借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "940016",
                    "bankName": "广州银行股份有限公司-羊城借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "621463",
                    "bankName": "广州银行股份有限公司-金融IC借记卡-借记卡"
                },
                {
                    "bin": "990027",
                    "bankName": "汉口银行-九通卡(银联卡)-借记卡"
                },
                {
                    "bin": "622325",
                    "bankName": "汉口银行-九通卡-借记卡"
                },
                {
                    "bin": "623029",
                    "bankName": "汉口银行-借记卡-借记卡"
                },
                {
                    "bin": "623105",
                    "bankName": "汉口银行-借记卡-借记卡"
                },
                {
                    "bin": "622475",
                    "bankName": "龙江银行股份有限公司-金鹤卡-借记卡"
                },
                {
                    "bin": "621244",
                    "bankName": "盛京银行-玫瑰卡-借记卡"
                },
                {
                    "bin": "623081",
                    "bankName": "盛京银行-玫瑰IC卡-借记卡"
                },
                {
                    "bin": "623108",
                    "bankName": "盛京银行-玫瑰IC卡-借记卡"
                },
                {
                    "bin": "566666",
                    "bankName": "盛京银行-玫瑰卡-借记卡"
                },
                {
                    "bin": "622455",
                    "bankName": "盛京银行-玫瑰卡-借记卡"
                },
                {
                    "bin": "940039",
                    "bankName": "盛京银行-玫瑰卡(银联卡)-借记卡"
                },
                {
                    "bin": "622466",
                    "bankName": "盛京银行-玫瑰卡(银联卡)-贷记卡"
                },
                {
                    "bin": "628285",
                    "bankName": "盛京银行-盛京银行公务卡-贷记卡"
                },
                {
                    "bin": "622420",
                    "bankName": "洛阳银行-都市一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "940041",
                    "bankName": "洛阳银行-都市一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "623118",
                    "bankName": "洛阳银行----借记卡"
                },
                {
                    "bin": "622399",
                    "bankName": "辽阳银行股份有限公司-新兴卡(银联卡)-借记卡"
                },
                {
                    "bin": "940043",
                    "bankName": "辽阳银行股份有限公司-新兴卡(银联卡)-借记卡"
                },
                {
                    "bin": "628309",
                    "bankName": "辽阳银行股份有限公司-公务卡-贷记卡"
                },
                {
                    "bin": "623151",
                    "bankName": "辽阳银行股份有限公司-新兴卡-借记卡"
                },
                {
                    "bin": "603708",
                    "bankName": "大连银行-北方明珠卡-借记卡"
                },
                {
                    "bin": "622993",
                    "bankName": "大连银行-人民币借记卡-借记卡"
                },
                {
                    "bin": "623070",
                    "bankName": "大连银行-金融IC借记卡-借记卡"
                },
                {
                    "bin": "623069",
                    "bankName": "大连银行-大连市社会保障卡-借记卡"
                },
                {
                    "bin": "623172",
                    "bankName": "大连银行-借记IC卡-借记卡"
                },
                {
                    "bin": "623173",
                    "bankName": "大连银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622383",
                    "bankName": "大连银行-大连市商业银行贷记卡-贷记卡"
                },
                {
                    "bin": "622385",
                    "bankName": "大连银行-大连市商业银行贷记卡-贷记卡"
                },
                {
                    "bin": "628299",
                    "bankName": "大连银行-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "603506",
                    "bankName": "苏州市商业银行-姑苏卡-借记卡"
                },
                {
                    "bin": "622498",
                    "bankName": "河北银行股份有限公司-如意借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622499",
                    "bankName": "河北银行股份有限公司-如意借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "940046",
                    "bankName": "河北银行股份有限公司-如意卡(银联卡)-借记卡"
                },
                {
                    "bin": "623000",
                    "bankName": "河北银行股份有限公司-借记IC卡-借记卡"
                },
                {
                    "bin": "603367",
                    "bankName": "杭州商业银行-西湖卡-借记卡"
                },
                {
                    "bin": "622878",
                    "bankName": "杭州商业银行-西湖卡-借记卡"
                },
                {
                    "bin": "623061",
                    "bankName": "杭州商业银行-借记IC卡-借记卡"
                },
                {
                    "bin": "623209",
                    "bankName": "杭州商业银行--借记卡"
                },
                {
                    "bin": "628242",
                    "bankName": "南京银行-梅花信用卡公务卡-贷记卡"
                },
                {
                    "bin": "622595",
                    "bankName": "南京银行-梅花信用卡商务卡-贷记卡"
                },
                {
                    "bin": "621259",
                    "bankName": "南京银行-白金卡-借记卡"
                },
                {
                    "bin": "622596",
                    "bankName": "南京银行-商务卡-贷记卡"
                },
                {
                    "bin": "622333",
                    "bankName": "东莞市商业银行-万顺通卡(银联卡)-借记卡"
                },
                {
                    "bin": "940050",
                    "bankName": "东莞市商业银行-万顺通卡(银联卡)-借记卡"
                },
                {
                    "bin": "621439",
                    "bankName": "东莞市商业银行-万顺通借记卡-借记卡"
                },
                {
                    "bin": "623010",
                    "bankName": "东莞市商业银行-社会保障卡-借记卡"
                },
                {
                    "bin": "940051",
                    "bankName": "金华银行股份有限公司-双龙卡(银联卡)-借记卡"
                },
                {
                    "bin": "628204",
                    "bankName": "金华银行股份有限公司-公务卡-贷记卡"
                },
                {
                    "bin": "622449",
                    "bankName": "金华银行股份有限公司-双龙借记卡-借记卡"
                },
                {
                    "bin": "623067",
                    "bankName": "金华银行股份有限公司-双龙社保卡-借记卡"
                },
                {
                    "bin": "622450",
                    "bankName": "金华银行股份有限公司-双龙贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "621751",
                    "bankName": "乌鲁木齐市商业银行-雪莲借记IC卡-借记卡"
                },
                {
                    "bin": "628278",
                    "bankName": "乌鲁木齐市商业银行-乌鲁木齐市公务卡-贷记卡"
                },
                {
                    "bin": "625502",
                    "bankName": "乌鲁木齐市商业银行-福农卡贷记卡-贷记卡"
                },
                {
                    "bin": "625503",
                    "bankName": "乌鲁木齐市商业银行-福农卡准贷记卡-准贷记卡"
                },
                {
                    "bin": "625135",
                    "bankName": "乌鲁木齐市商业银行-雪莲准贷记卡-准贷记卡"
                },
                {
                    "bin": "622476",
                    "bankName": "乌鲁木齐市商业银行-雪莲贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "621754",
                    "bankName": "乌鲁木齐市商业银行-雪莲借记IC卡-借记卡"
                },
                {
                    "bin": "622143",
                    "bankName": "乌鲁木齐市商业银行-雪莲借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "940001",
                    "bankName": "乌鲁木齐市商业银行-雪莲卡(银联卡)-借记卡"
                },
                {
                    "bin": "622486",
                    "bankName": "绍兴银行股份有限公司-兰花卡(银联卡)-借记卡"
                },
                {
                    "bin": "603602",
                    "bankName": "绍兴银行股份有限公司-兰花卡-借记卡"
                },
                {
                    "bin": "623026",
                    "bankName": "绍兴银行-兰花IC借记卡-借记卡"
                },
                {
                    "bin": "623086",
                    "bankName": "绍兴银行-社保IC借记卡-借记卡"
                },
                {
                    "bin": "628291",
                    "bankName": "绍兴银行-兰花公务卡-贷记卡"
                },
                {
                    "bin": "621532",
                    "bankName": "成都商业银行-芙蓉锦程福农卡-借记卡"
                },
                {
                    "bin": "621482",
                    "bankName": "成都商业银行-芙蓉锦程天府通卡-借记卡"
                },
                {
                    "bin": "622135",
                    "bankName": "成都商业银行-锦程卡(银联卡)-借记卡"
                },
                {
                    "bin": "622152",
                    "bankName": "成都商业银行-锦程卡金卡-借记卡"
                },
                {
                    "bin": "622153",
                    "bankName": "成都商业银行-锦程卡定活一卡通金卡-借记卡"
                },
                {
                    "bin": "622154",
                    "bankName": "成都商业银行-锦程卡定活一卡通-借记卡"
                },
                {
                    "bin": "622996",
                    "bankName": "成都商业银行-锦程力诚联名卡-借记卡"
                },
                {
                    "bin": "622997",
                    "bankName": "成都商业银行-锦程力诚联名卡-借记卡"
                },
                {
                    "bin": "940027",
                    "bankName": "成都商业银行-锦程卡(银联卡)-借记卡"
                },
                {
                    "bin": "622442",
                    "bankName": "抚顺银行股份有限公司-绿叶卡(银联卡)-借记卡"
                },
                {
                    "bin": "940053",
                    "bankName": "抚顺银行股份有限公司-绿叶卡(银联卡)-借记卡"
                },
                {
                    "bin": "623099",
                    "bankName": "抚顺银行-借记IC卡-借记卡"
                },
                {
                    "bin": "623007",
                    "bankName": "临商银行-借记卡-借记卡"
                },
                {
                    "bin": "940055",
                    "bankName": "宜昌市商业银行-三峡卡(银联卡)-借记卡"
                },
                {
                    "bin": "622397",
                    "bankName": "宜昌市商业银行-信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622398",
                    "bankName": "葫芦岛市商业银行-一通卡-借记卡"
                },
                {
                    "bin": "940054",
                    "bankName": "葫芦岛市商业银行-一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "622331",
                    "bankName": "天津市商业银行-津卡-借记卡"
                },
                {
                    "bin": "622426",
                    "bankName": "天津市商业银行-津卡贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "625995",
                    "bankName": "天津市商业银行-贷记IC卡-贷记卡"
                },
                {
                    "bin": "621452",
                    "bankName": "天津市商业银行----借记卡"
                },
                {
                    "bin": "628205",
                    "bankName": "天津银行-商务卡-贷记卡"
                },
                {
                    "bin": "622421",
                    "bankName": "郑州银行股份有限公司-世纪一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "940056",
                    "bankName": "郑州银行股份有限公司-世纪一卡通-借记卡"
                },
                {
                    "bin": "96828",
                    "bankName": "郑州银行股份有限公司-世纪一卡通-借记卡"
                },
                {
                    "bin": "628214",
                    "bankName": "宁夏银行-宁夏银行公务卡-贷记卡"
                },
                {
                    "bin": "625529",
                    "bankName": "宁夏银行-宁夏银行福农贷记卡-贷记卡"
                },
                {
                    "bin": "622428",
                    "bankName": "宁夏银行-如意卡(银联卡)-贷记卡"
                },
                {
                    "bin": "621529",
                    "bankName": "宁夏银行-宁夏银行福农借记卡-借记卡"
                },
                {
                    "bin": "622429",
                    "bankName": "宁夏银行-如意借记卡-借记卡"
                },
                {
                    "bin": "621417",
                    "bankName": "宁夏银行-如意IC卡-借记卡"
                },
                {
                    "bin": "623089",
                    "bankName": "宁夏银行-宁夏银行如意借记卡-借记卡"
                },
                {
                    "bin": "623200",
                    "bankName": "宁夏银行-中国旅游卡-借记卡"
                },
                {
                    "bin": "622363",
                    "bankName": "珠海华润银行股份有限公司-万事顺卡-借记卡"
                },
                {
                    "bin": "940048",
                    "bankName": "珠海华润银行股份有限公司-万事顺卡(银联卡)-借记卡"
                },
                {
                    "bin": "621455",
                    "bankName": "珠海华润银行股份有限公司-珠海华润银行IC借记卡-借记卡"
                },
                {
                    "bin": "940057",
                    "bankName": "齐商银行-金达卡(银联卡)-借记卡"
                },
                {
                    "bin": "622311",
                    "bankName": "齐商银行-金达借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "623119",
                    "bankName": "齐商银行-金达IC卡-借记卡"
                },
                {
                    "bin": "622990",
                    "bankName": "锦州银行股份有限公司-7777卡-借记卡"
                },
                {
                    "bin": "940003",
                    "bankName": "锦州银行股份有限公司-万通卡(银联卡)-借记卡"
                },
                {
                    "bin": "622877",
                    "bankName": "徽商银行-黄山卡-借记卡"
                },
                {
                    "bin": "622879",
                    "bankName": "徽商银行-黄山卡-借记卡"
                },
                {
                    "bin": "621775",
                    "bankName": "徽商银行-借记卡-借记卡"
                },
                {
                    "bin": "623203",
                    "bankName": "徽商银行-徽商银行中国旅游卡（安徽）-借记卡"
                },
                {
                    "bin": "603601",
                    "bankName": "徽商银行合肥分行-黄山卡-借记卡"
                },
                {
                    "bin": "622137",
                    "bankName": "徽商银行芜湖分行-黄山卡(银联卡)-借记卡"
                },
                {
                    "bin": "622327",
                    "bankName": "徽商银行马鞍山分行-黄山卡(银联卡)-借记卡"
                },
                {
                    "bin": "622340",
                    "bankName": "徽商银行淮北分行-黄山卡(银联卡)-借记卡"
                },
                {
                    "bin": "622366",
                    "bankName": "徽商银行安庆分行-黄山卡(银联卡)-借记卡"
                },
                {
                    "bin": "9896",
                    "bankName": "重庆银行-长江卡-借记卡"
                },
                {
                    "bin": "622134",
                    "bankName": "重庆银行-长江卡(银联卡)-借记卡"
                },
                {
                    "bin": "940018",
                    "bankName": "重庆银行-长江卡(银联卡)-借记卡"
                },
                {
                    "bin": "623016",
                    "bankName": "重庆银行-长江卡-借记卡"
                },
                {
                    "bin": "623096",
                    "bankName": "重庆银行-借记IC卡-借记卡"
                },
                {
                    "bin": "940049",
                    "bankName": "哈尔滨银行-丁香一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "622425",
                    "bankName": "哈尔滨银行-丁香借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "621577",
                    "bankName": "哈尔滨银行-福农借记卡-借记卡"
                },
                {
                    "bin": "622133",
                    "bankName": "贵阳银行股份有限公司-甲秀银联借记卡-借记卡"
                },
                {
                    "bin": "888",
                    "bankName": "贵阳银行股份有限公司-甲秀卡-借记卡"
                },
                {
                    "bin": "621735",
                    "bankName": "贵阳银行股份有限公司-一卡通-借记卡"
                },
                {
                    "bin": "622170",
                    "bankName": "贵阳银行股份有限公司--借记卡"
                },
                {
                    "bin": "622136",
                    "bankName": "西安银行股份有限公司-福瑞卡-借记卡"
                },
                {
                    "bin": "622981",
                    "bankName": "西安银行股份有限公司-金丝路卡-借记卡"
                },
                {
                    "bin": "60326500",
                    "bankName": "无锡市商业银行-太湖卡-借记卡"
                },
                {
                    "bin": "60326513",
                    "bankName": "无锡市商业银行-太湖卡-借记卡"
                },
                {
                    "bin": "622485",
                    "bankName": "无锡市商业银行-太湖金保卡(银联卡)-借记卡"
                },
                {
                    "bin": "622415",
                    "bankName": "丹东银行股份有限公司-银杏卡(银联卡)-借记卡"
                },
                {
                    "bin": "940060",
                    "bankName": "丹东银行股份有限公司-银杏卡(银联卡)-借记卡"
                },
                {
                    "bin": "623098",
                    "bankName": "丹东银行-借记IC卡-借记卡"
                },
                {
                    "bin": "628329",
                    "bankName": "丹东银行-丹东银行公务卡-贷记卡"
                },
                {
                    "bin": "622139",
                    "bankName": "兰州银行股份有限公司-敦煌国际卡(银联卡)-借记卡"
                },
                {
                    "bin": "940040",
                    "bankName": "兰州银行股份有限公司-敦煌卡-借记卡"
                },
                {
                    "bin": "621242",
                    "bankName": "兰州银行股份有限公司-敦煌卡-借记卡"
                },
                {
                    "bin": "621538",
                    "bankName": "兰州银行-敦煌卡-借记卡"
                },
                {
                    "bin": "621496",
                    "bankName": "兰州银行股份有限公司-敦煌金融IC卡-借记卡"
                },
                {
                    "bin": "623129",
                    "bankName": "兰州银行股份有限公司-金融社保卡-借记卡"
                },
                {
                    "bin": "940006",
                    "bankName": "南昌银行-金瑞卡(银联卡)-借记卡"
                },
                {
                    "bin": "621269",
                    "bankName": "南昌银行-南昌银行借记卡-借记卡"
                },
                {
                    "bin": "622275",
                    "bankName": "南昌银行-金瑞卡-借记卡"
                },
                {
                    "bin": "621216",
                    "bankName": "晋商银行-晋龙一卡通-借记卡"
                },
                {
                    "bin": "622465",
                    "bankName": "晋商银行-晋龙一卡通-借记卡"
                },
                {
                    "bin": "940031",
                    "bankName": "晋商银行-晋龙卡(银联卡)-借记卡"
                },
                {
                    "bin": "621252",
                    "bankName": "青岛银行-金桥通卡-借记卡"
                },
                {
                    "bin": "622146",
                    "bankName": "青岛银行-金桥卡(银联卡)-借记卡"
                },
                {
                    "bin": "940061",
                    "bankName": "青岛银行-金桥卡(银联卡)-借记卡"
                },
                {
                    "bin": "621419",
                    "bankName": "青岛银行-金桥卡-借记卡"
                },
                {
                    "bin": "623170",
                    "bankName": "青岛银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622440",
                    "bankName": "吉林银行-雾凇卡(银联卡)-借记卡"
                },
                {
                    "bin": "940047",
                    "bankName": "吉林银行-雾凇卡(银联卡)-借记卡"
                },
                {
                    "bin": "69580",
                    "bankName": "南通商业银行-金桥卡-借记卡"
                },
                {
                    "bin": "940017",
                    "bankName": "南通商业银行-金桥卡(银联卡)-借记卡"
                },
                {
                    "bin": "622418",
                    "bankName": "南通商业银行-金桥卡(银联卡)-借记卡"
                },
                {
                    "bin": "622162",
                    "bankName": "九江银行股份有限公司-庐山卡-借记卡"
                },
                {
                    "bin": "623077",
                    "bankName": "日照银行-黄海卡、财富卡借记卡-借记卡"
                },
                {
                    "bin": "622413",
                    "bankName": "鞍山银行-千山卡(银联卡)-借记卡"
                },
                {
                    "bin": "940002",
                    "bankName": "鞍山银行-千山卡(银联卡)-借记卡"
                },
                {
                    "bin": "623188",
                    "bankName": "鞍山银行-千山卡-借记卡"
                },
                {
                    "bin": "621237",
                    "bankName": "秦皇岛银行股份有限公司-秦卡-借记卡"
                },
                {
                    "bin": "62249802",
                    "bankName": "秦皇岛银行股份有限公司-秦卡-借记卡"
                },
                {
                    "bin": "94004602",
                    "bankName": "秦皇岛银行股份有限公司-秦卡-借记卡"
                },
                {
                    "bin": "623003",
                    "bankName": "秦皇岛银行股份有限公司-秦卡-IC卡-借记卡"
                },
                {
                    "bin": "622310",
                    "bankName": "青海银行-三江银行卡(银联卡)-借记卡"
                },
                {
                    "bin": "940068",
                    "bankName": "青海银行-三江卡-借记卡"
                },
                {
                    "bin": "622321",
                    "bankName": "台州银行-大唐贷记卡-贷记卡"
                },
                {
                    "bin": "625001",
                    "bankName": "台州银行-大唐准贷记卡-准贷记卡"
                },
                {
                    "bin": "622427",
                    "bankName": "台州银行-大唐卡(银联卡)-借记卡"
                },
                {
                    "bin": "940069",
                    "bankName": "台州银行-大唐卡-借记卡"
                },
                {
                    "bin": "623039",
                    "bankName": "台州银行-借记卡-借记卡"
                },
                {
                    "bin": "628273",
                    "bankName": "台州银行-公务卡-贷记卡"
                },
                {
                    "bin": "940070",
                    "bankName": "盐城商行-金鹤卡(银联卡)-借记卡"
                },
                {
                    "bin": "694301",
                    "bankName": "长沙银行股份有限公司-芙蓉卡-借记卡"
                },
                {
                    "bin": "940071",
                    "bankName": "长沙银行股份有限公司-芙蓉卡(银联卡)-借记卡"
                },
                {
                    "bin": "622368",
                    "bankName": "长沙银行股份有限公司-芙蓉卡(银联卡)-借记卡"
                },
                {
                    "bin": "621446",
                    "bankName": "长沙银行股份有限公司-芙蓉金融IC卡-借记卡"
                },
                {
                    "bin": "625901",
                    "bankName": "长沙银行股份有限公司-市民卡-贷记卡"
                },
                {
                    "bin": "622898",
                    "bankName": "长沙银行股份有限公司-芙蓉贷记卡-贷记卡"
                },
                {
                    "bin": "622900",
                    "bankName": "长沙银行股份有限公司-芙蓉贷记卡-贷记卡"
                },
                {
                    "bin": "628281",
                    "bankName": "长沙银行股份有限公司-公务卡钻石卡-贷记卡"
                },
                {
                    "bin": "628282",
                    "bankName": "长沙银行股份有限公司-公务卡金卡-贷记卡"
                },
                {
                    "bin": "628283",
                    "bankName": "长沙银行股份有限公司-公务卡普卡-贷记卡"
                },
                {
                    "bin": "620519",
                    "bankName": "长沙银行股份有限公司-市民卡-预付费卡"
                },
                {
                    "bin": "621739",
                    "bankName": "长沙银行股份有限公司-借记IC卡-借记卡"
                },
                {
                    "bin": "622967",
                    "bankName": "赣州银行股份有限公司-长征卡-借记卡"
                },
                {
                    "bin": "940073",
                    "bankName": "赣州银行股份有限公司-长征卡(银联卡)-借记卡"
                },
                {
                    "bin": "622370",
                    "bankName": "泉州银行-海峡银联卡(银联卡)-借记卡"
                },
                {
                    "bin": "683970",
                    "bankName": "泉州银行-海峡储蓄卡-借记卡"
                },
                {
                    "bin": "940074",
                    "bankName": "泉州银行-海峡银联卡(银联卡)-借记卡"
                },
                {
                    "bin": "621437",
                    "bankName": "泉州银行-海峡卡-借记卡"
                },
                {
                    "bin": "628319",
                    "bankName": "泉州银行-公务卡-贷记卡"
                },
                {
                    "bin": "622400",
                    "bankName": "营口银行股份有限公司-辽河一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "623177",
                    "bankName": "营口银行股份有限公司-营银卡-借记卡"
                },
                {
                    "bin": "990871",
                    "bankName": "昆明商业银行-春城卡(银联卡)-借记卡"
                },
                {
                    "bin": "621415",
                    "bankName": "昆明商业银行-富滇IC卡（复合卡）-借记卡"
                },
                {
                    "bin": "622126",
                    "bankName": "阜新银行股份有限公司-金通卡(银联卡)-借记卡"
                },
                {
                    "bin": "623166",
                    "bankName": "阜新银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622132",
                    "bankName": "嘉兴银行-南湖借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "621340",
                    "bankName": "廊坊银行-白金卡-借记卡"
                },
                {
                    "bin": "621341",
                    "bankName": "廊坊银行-金卡-借记卡"
                },
                {
                    "bin": "622140",
                    "bankName": "廊坊银行-银星卡(银联卡)-借记卡"
                },
                {
                    "bin": "623073",
                    "bankName": "廊坊银行-龙凤呈祥卡-借记卡"
                },
                {
                    "bin": "622141",
                    "bankName": "泰隆城市信用社-泰隆卡(银联卡)-借记卡"
                },
                {
                    "bin": "621480",
                    "bankName": "泰隆城市信用社-借记IC卡-借记卡"
                },
                {
                    "bin": "622147",
                    "bankName": "内蒙古银行-百灵卡(银联卡)-借记卡"
                },
                {
                    "bin": "621633",
                    "bankName": "内蒙古银行-成吉思汗卡-借记卡"
                },
                {
                    "bin": "622301",
                    "bankName": "湖州市商业银行-百合卡-借记卡"
                },
                {
                    "bin": "623171",
                    "bankName": "湖州市商业银行--借记卡"
                },
                {
                    "bin": "621266",
                    "bankName": "沧州银行股份有限公司-狮城卡-借记卡"
                },
                {
                    "bin": "62249804",
                    "bankName": "沧州银行股份有限公司-狮城卡-借记卡"
                },
                {
                    "bin": "94004604",
                    "bankName": "沧州银行股份有限公司-狮城卡-借记卡"
                },
                {
                    "bin": "621422",
                    "bankName": "沧州银行-狮城卡-借记卡"
                },
                {
                    "bin": "622335",
                    "bankName": "南宁市商业银行-桂花卡(银联卡)-借记卡"
                },
                {
                    "bin": "622336",
                    "bankName": "包商银行-雄鹰卡(银联卡)-借记卡"
                },
                {
                    "bin": "622165",
                    "bankName": "包商银行-包头市商业银行借记卡-借记卡"
                },
                {
                    "bin": "628295",
                    "bankName": "包商银行-包商银行内蒙古自治区公务卡-贷记卡"
                },
                {
                    "bin": "625950",
                    "bankName": "包商银行-贷记卡-贷记卡"
                },
                {
                    "bin": "621760",
                    "bankName": "包商银行-借记卡-借记卡"
                },
                {
                    "bin": "622337",
                    "bankName": "连云港市商业银行-金猴神通借记卡-借记卡"
                },
                {
                    "bin": "622411",
                    "bankName": "威海商业银行-通达卡(银联卡)-借记卡"
                },
                {
                    "bin": "623102",
                    "bankName": "威海市商业银行-通达借记IC卡-借记卡"
                },
                {
                    "bin": "622342",
                    "bankName": "攀枝花市商业银行-攀枝花卡(银联卡)-借记卡"
                },
                {
                    "bin": "623048",
                    "bankName": "攀枝花市商业银行-攀枝花卡-借记卡"
                },
                {
                    "bin": "622367",
                    "bankName": "绵阳市商业银行-科技城卡(银联卡)-借记卡"
                },
                {
                    "bin": "622392",
                    "bankName": "泸州市商业银行-酒城卡(银联卡)-借记卡"
                },
                {
                    "bin": "623085",
                    "bankName": "泸州市商业银行-酒城IC卡-借记卡"
                },
                {
                    "bin": "622395",
                    "bankName": "大同市商业银行-云冈卡(银联卡)-借记卡"
                },
                {
                    "bin": "622441",
                    "bankName": "三门峡银行-天鹅卡(银联卡)-借记卡"
                },
                {
                    "bin": "622448",
                    "bankName": "广东南粤银行-南珠卡(银联卡)-借记卡"
                },
                {
                    "bin": "622982",
                    "bankName": "张家口市商业银行股份有限公司-如意借记卡-借记卡"
                },
                {
                    "bin": "621413",
                    "bankName": "张家口市商业银行-好运IC借记卡-借记卡"
                },
                {
                    "bin": "622856",
                    "bankName": "桂林市商业银行-漓江卡(银联卡)-借记卡"
                },
                {
                    "bin": "621037",
                    "bankName": "龙江银行-福农借记卡-借记卡"
                },
                {
                    "bin": "621097",
                    "bankName": "龙江银行-联名借记卡-借记卡"
                },
                {
                    "bin": "621588",
                    "bankName": "龙江银行-福农借记卡-借记卡"
                },
                {
                    "bin": "62321601",
                    "bankName": "龙江银行-中国旅游卡-借记卡"
                },
                {
                    "bin": "623032",
                    "bankName": "龙江银行-龙江IC卡-借记卡"
                },
                {
                    "bin": "622644",
                    "bankName": "龙江银行-社会保障卡-借记卡"
                },
                {
                    "bin": "623518",
                    "bankName": "龙江银行----借记卡"
                },
                {
                    "bin": "622860",
                    "bankName": "龙江银行股份有限公司-玉兔卡(银联卡)-借记卡"
                },
                {
                    "bin": "622870",
                    "bankName": "江苏长江商业银行-长江卡-借记卡"
                },
                {
                    "bin": "622866",
                    "bankName": "徐州市商业银行-彭城借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622292",
                    "bankName": "柳州银行股份有限公司-龙城卡-借记卡"
                },
                {
                    "bin": "622291",
                    "bankName": "柳州银行股份有限公司-龙城卡-借记卡"
                },
                {
                    "bin": "621412",
                    "bankName": "柳州银行股份有限公司-龙城IC卡-借记卡"
                },
                {
                    "bin": "622880",
                    "bankName": "柳州银行股份有限公司-龙城卡VIP卡-借记卡"
                },
                {
                    "bin": "622881",
                    "bankName": "柳州银行股份有限公司-龙城致富卡-借记卡"
                },
                {
                    "bin": "620118",
                    "bankName": "柳州银行股份有限公司-东盟商旅卡-预付费卡"
                },
                {
                    "bin": "623072",
                    "bankName": "南充市商业银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622897",
                    "bankName": "南充市商业银行-熊猫团团卡-借记卡"
                },
                {
                    "bin": "628279",
                    "bankName": "莱商银行-银联标准卡-贷记卡"
                },
                {
                    "bin": "622864",
                    "bankName": "莱芜银行-金凤卡-借记卡"
                },
                {
                    "bin": "621403",
                    "bankName": "莱商银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622561",
                    "bankName": "德阳银行-锦程卡定活一卡通-借记卡"
                },
                {
                    "bin": "622562",
                    "bankName": "德阳银行-锦程卡定活一卡通金卡-借记卡"
                },
                {
                    "bin": "622563",
                    "bankName": "德阳银行-锦程卡定活一卡通-借记卡"
                },
                {
                    "bin": "622167",
                    "bankName": "唐山市商业银行-唐山市城通卡-借记卡"
                },
                {
                    "bin": "622508",
                    "bankName": "六盘水商行-凉都卡-借记卡"
                },
                {
                    "bin": "622777",
                    "bankName": "曲靖市商业银行-珠江源卡-借记卡"
                },
                {
                    "bin": "621497",
                    "bankName": "曲靖市商业银行-珠江源IC卡-借记卡"
                },
                {
                    "bin": "622532",
                    "bankName": "晋城银行股份有限公司-珠联璧合卡-借记卡"
                },
                {
                    "bin": "622888",
                    "bankName": "东莞商行-恒通贷记卡-贷记卡"
                },
                {
                    "bin": "628398",
                    "bankName": "东莞商行-公务卡-贷记卡"
                },
                {
                    "bin": "622868",
                    "bankName": "温州银行-金鹿信用卡-贷记卡"
                },
                {
                    "bin": "622899",
                    "bankName": "温州银行-金鹿信用卡-贷记卡"
                },
                {
                    "bin": "628255",
                    "bankName": "温州银行-金鹿公务卡-贷记卡"
                },
                {
                    "bin": "625988",
                    "bankName": "温州银行-贷记IC卡-贷记卡"
                },
                {
                    "bin": "622566",
                    "bankName": "汉口银行-汉口银行贷记卡-贷记卡"
                },
                {
                    "bin": "622567",
                    "bankName": "汉口银行-汉口银行贷记卡-贷记卡"
                },
                {
                    "bin": "622625",
                    "bankName": "汉口银行-九通香港旅游贷记普卡-贷记卡"
                },
                {
                    "bin": "622626",
                    "bankName": "汉口银行-九通香港旅游贷记金卡-贷记卡"
                },
                {
                    "bin": "625946",
                    "bankName": "汉口银行-贷记卡-贷记卡"
                },
                {
                    "bin": "628200",
                    "bankName": "汉口银行-九通公务卡-贷记卡"
                },
                {
                    "bin": "621076",
                    "bankName": "江苏银行-聚宝借记卡-借记卡"
                },
                {
                    "bin": "504923",
                    "bankName": "江苏银行-月季卡-借记卡"
                },
                {
                    "bin": "622173",
                    "bankName": "江苏银行-紫金卡-借记卡"
                },
                {
                    "bin": "622422",
                    "bankName": "江苏银行-绿扬卡(银联卡)-借记卡"
                },
                {
                    "bin": "622447",
                    "bankName": "江苏银行-月季卡(银联卡)-借记卡"
                },
                {
                    "bin": "622131",
                    "bankName": "江苏银行-九州借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "940076",
                    "bankName": "江苏银行-月季卡(银联卡)-借记卡"
                },
                {
                    "bin": "621579",
                    "bankName": "江苏银行-聚宝惠民福农卡-借记卡"
                },
                {
                    "bin": "622876",
                    "bankName": "江苏银行-江苏银行聚宝IC借记卡-借记卡"
                },
                {
                    "bin": "622873",
                    "bankName": "江苏银行-聚宝IC借记卡VIP卡-借记卡"
                },
                {
                    "bin": "531659",
                    "bankName": "平安银行股份有限公司-白金信用卡-贷记卡"
                },
                {
                    "bin": "622157",
                    "bankName": "平安银行股份有限公司-白金信用卡-贷记卡"
                },
                {
                    "bin": "435744",
                    "bankName": "平安银行股份有限公司-沃尔玛百分卡-贷记卡"
                },
                {
                    "bin": "435745",
                    "bankName": "平安银行股份有限公司-沃尔玛百分卡-贷记卡"
                },
                {
                    "bin": "483536",
                    "bankName": "平安银行股份有限公司-VISA白金卡-贷记卡"
                },
                {
                    "bin": "622525",
                    "bankName": "平安银行股份有限公司-人民币信用卡金卡-贷记卡"
                },
                {
                    "bin": "622526",
                    "bankName": "平安银行股份有限公司-人民币信用卡普卡-贷记卡"
                },
                {
                    "bin": "998801",
                    "bankName": "平安银行股份有限公司-发展信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "998802",
                    "bankName": "平安银行股份有限公司-发展信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "528020",
                    "bankName": "平安银行股份有限公司-平安银行信用卡-贷记卡"
                },
                {
                    "bin": "622155",
                    "bankName": "平安银行股份有限公司-平安银行信用卡-贷记卡"
                },
                {
                    "bin": "622156",
                    "bankName": "平安银行股份有限公司-平安银行信用卡-贷记卡"
                },
                {
                    "bin": "526855",
                    "bankName": "平安银行股份有限公司-平安银行信用卡-贷记卡"
                },
                {
                    "bin": "356869",
                    "bankName": "平安银行股份有限公司-信用卡-贷记卡"
                },
                {
                    "bin": "356868",
                    "bankName": "平安银行股份有限公司-信用卡-贷记卡"
                },
                {
                    "bin": "625360",
                    "bankName": "平安银行股份有限公司-平安中国旅游信用卡-贷记卡"
                },
                {
                    "bin": "625361",
                    "bankName": "平安银行股份有限公司-平安中国旅游白金信用卡-贷记卡"
                },
                {
                    "bin": "628296",
                    "bankName": "平安银行股份有限公司-公务卡-贷记卡"
                },
                {
                    "bin": "625825",
                    "bankName": "平安银行股份有限公司-白金IC卡-贷记卡"
                },
                {
                    "bin": "625823",
                    "bankName": "平安银行股份有限公司-贷记IC卡-贷记卡"
                },
                {
                    "bin": "622962",
                    "bankName": "长治市商业银行-长治商行银联晋龙卡-借记卡"
                },
                {
                    "bin": "622936",
                    "bankName": "承德市商业银行-热河卡-借记卡"
                },
                {
                    "bin": "623060",
                    "bankName": "承德银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622937",
                    "bankName": "德州银行-长河借记卡-借记卡"
                },
                {
                    "bin": "623101",
                    "bankName": "德州银行----借记卡"
                },
                {
                    "bin": "621460",
                    "bankName": "遵义市商业银行-社保卡-借记卡"
                },
                {
                    "bin": "622939",
                    "bankName": "遵义市商业银行-尊卡-借记卡"
                },
                {
                    "bin": "622960",
                    "bankName": "邯郸市商业银行-邯银卡-借记卡"
                },
                {
                    "bin": "623523",
                    "bankName": "邯郸市商业银行-邯郸银行贵宾IC借记卡-借记卡"
                },
                {
                    "bin": "621591",
                    "bankName": "安顺市商业银行-黄果树福农卡-借记卡"
                },
                {
                    "bin": "622961",
                    "bankName": "安顺市商业银行-黄果树借记卡-借记卡"
                },
                {
                    "bin": "628210",
                    "bankName": "江苏银行-紫金信用卡(公务卡)-贷记卡"
                },
                {
                    "bin": "622283",
                    "bankName": "江苏银行-紫金信用卡-贷记卡"
                },
                {
                    "bin": "625902",
                    "bankName": "江苏银行-天翼联名信用卡-贷记卡"
                },
                {
                    "bin": "621010",
                    "bankName": "平凉市商业银行-广成卡-借记卡"
                },
                {
                    "bin": "622980",
                    "bankName": "玉溪市商业银行-红塔卡-借记卡"
                },
                {
                    "bin": "623135",
                    "bankName": "玉溪市商业银行-红塔卡-借记卡"
                },
                {
                    "bin": "621726",
                    "bankName": "浙江民泰商业银行-金融IC卡-借记卡"
                },
                {
                    "bin": "621088",
                    "bankName": "浙江民泰商业银行-民泰借记卡-借记卡"
                },
                {
                    "bin": "620517",
                    "bankName": "浙江民泰商业银行-金融IC卡C卡-预付费卡"
                },
                {
                    "bin": "622740",
                    "bankName": "浙江民泰商业银行-银联标准普卡金卡-贷记卡"
                },
                {
                    "bin": "625036",
                    "bankName": "浙江民泰商业银行-商惠通-准贷记卡"
                },
                {
                    "bin": "621014",
                    "bankName": "上饶市商业银行-三清山卡-借记卡"
                },
                {
                    "bin": "621004",
                    "bankName": "东营银行-胜利卡-借记卡"
                },
                {
                    "bin": "622972",
                    "bankName": "泰安市商业银行-岱宗卡-借记卡"
                },
                {
                    "bin": "623196",
                    "bankName": "泰安市商业银行-市民一卡通-借记卡"
                },
                {
                    "bin": "621028",
                    "bankName": "浙江稠州商业银行-义卡-借记卡"
                },
                {
                    "bin": "623083",
                    "bankName": "浙江稠州商业银行-义卡借记IC卡-借记卡"
                },
                {
                    "bin": "628250",
                    "bankName": "浙江稠州商业银行-公务卡-贷记卡"
                },
                {
                    "bin": "622973",
                    "bankName": "乌海银行股份有限公司-狮城借记卡-借记卡"
                },
                {
                    "bin": "623153",
                    "bankName": "乌海银行股份有限公司----借记卡"
                },
                {
                    "bin": "623121",
                    "bankName": "自贡市商业银行-借记IC卡-借记卡"
                },
                {
                    "bin": "621070",
                    "bankName": "自贡市商业银行-锦程卡-借记卡"
                },
                {
                    "bin": "622977",
                    "bankName": "龙江银行股份有限公司-万通卡-借记卡"
                },
                {
                    "bin": "622978",
                    "bankName": "鄂尔多斯银行股份有限公司-天骄卡-借记卡"
                },
                {
                    "bin": "628253",
                    "bankName": "鄂尔多斯银行-天骄公务卡-贷记卡"
                },
                {
                    "bin": "623093",
                    "bankName": "鄂尔多斯银行股份有限公司-天骄借记复合卡-借记卡"
                },
                {
                    "bin": "628378",
                    "bankName": "鄂尔多斯银行股份有限公司----贷记卡"
                },
                {
                    "bin": "622979",
                    "bankName": "鹤壁银行-鹤卡-借记卡"
                },
                {
                    "bin": "621035",
                    "bankName": "许昌银行-连城卡-借记卡"
                },
                {
                    "bin": "621200",
                    "bankName": "济宁银行股份有限公司-儒商卡-借记卡"
                },
                {
                    "bin": "623116",
                    "bankName": "济宁银行股份有限公司----借记卡"
                },
                {
                    "bin": "621038",
                    "bankName": "铁岭银行-龙凤卡-借记卡"
                },
                {
                    "bin": "621086",
                    "bankName": "乐山市商业银行-大福卡-借记卡"
                },
                {
                    "bin": "621498",
                    "bankName": "乐山市商业银行----借记卡"
                },
                {
                    "bin": "621296",
                    "bankName": "长安银行-长长卡-借记卡"
                },
                {
                    "bin": "621448",
                    "bankName": "长安银行-借记IC卡-借记卡"
                },
                {
                    "bin": "621044",
                    "bankName": "宝鸡商行-姜炎卡-借记卡"
                },
                {
                    "bin": "622945",
                    "bankName": "重庆三峡银行-财富人生卡-借记卡"
                },
                {
                    "bin": "621755",
                    "bankName": "重庆三峡银行-借记卡-借记卡"
                },
                {
                    "bin": "622940",
                    "bankName": "石嘴山银行-麒麟借记卡-借记卡"
                },
                {
                    "bin": "623120",
                    "bankName": "石嘴山银行-麒麟借记卡-借记卡"
                },
                {
                    "bin": "628355",
                    "bankName": "石嘴山银行-麒麟公务卡-贷记卡"
                },
                {
                    "bin": "621089",
                    "bankName": "盘锦市商业银行-鹤卡-借记卡"
                },
                {
                    "bin": "623161",
                    "bankName": "盘锦市商业银行-盘锦市商业银行鹤卡-借记卡"
                },
                {
                    "bin": "621029",
                    "bankName": "昆仑银行股份有限公司-瑞卡-借记卡"
                },
                {
                    "bin": "621766",
                    "bankName": "昆仑银行股份有限公司-金融IC卡-借记卡"
                },
                {
                    "bin": "623139",
                    "bankName": "昆仑银行股份有限公司--借记卡"
                },
                {
                    "bin": "621071",
                    "bankName": "平顶山银行股份有限公司-佛泉卡-借记卡"
                },
                {
                    "bin": "623152",
                    "bankName": "平顶山银行股份有限公司----借记卡"
                },
                {
                    "bin": "628339",
                    "bankName": "平顶山银行-平顶山银行公务卡-贷记卡"
                },
                {
                    "bin": "621074",
                    "bankName": "朝阳银行-鑫鑫通卡-借记卡"
                },
                {
                    "bin": "621515",
                    "bankName": "朝阳银行-朝阳银行福农卡-借记卡"
                },
                {
                    "bin": "623030",
                    "bankName": "朝阳银行-红山卡-借记卡"
                },
                {
                    "bin": "621345",
                    "bankName": "宁波东海银行-绿叶卡-借记卡"
                },
                {
                    "bin": "621090",
                    "bankName": "遂宁市商业银行-锦程卡-借记卡"
                },
                {
                    "bin": "623178",
                    "bankName": "遂宁是商业银行-金荷卡-借记卡"
                },
                {
                    "bin": "621091",
                    "bankName": "保定银行-直隶卡-借记卡"
                },
                {
                    "bin": "623168",
                    "bankName": "保定银行-直隶卡-借记卡"
                },
                {
                    "bin": "621238",
                    "bankName": "邢台银行股份有限公司-金牛卡-借记卡"
                },
                {
                    "bin": "621057",
                    "bankName": "凉山州商业银行-锦程卡-借记卡"
                },
                {
                    "bin": "623199",
                    "bankName": "凉山州商业银行-金凉山卡-借记卡"
                },
                {
                    "bin": "621075",
                    "bankName": "漯河银行-福卡-借记卡"
                },
                {
                    "bin": "623037",
                    "bankName": "漯河银行-福源卡-借记卡"
                },
                {
                    "bin": "628303",
                    "bankName": "漯河银行-福源公务卡-贷记卡"
                },
                {
                    "bin": "621233",
                    "bankName": "达州市商业银行-锦程卡-借记卡"
                },
                {
                    "bin": "621235",
                    "bankName": "新乡市商业银行-新卡-借记卡"
                },
                {
                    "bin": "621223",
                    "bankName": "晋中银行-九州方圆借记卡-借记卡"
                },
                {
                    "bin": "621780",
                    "bankName": "晋中银行-九州方圆卡-借记卡"
                },
                {
                    "bin": "621221",
                    "bankName": "驻马店银行-驿站卡-借记卡"
                },
                {
                    "bin": "623138",
                    "bankName": "驻马店银行-驿站卡-借记卡"
                },
                {
                    "bin": "628389",
                    "bankName": "驻马店银行-公务卡-贷记卡"
                },
                {
                    "bin": "621239",
                    "bankName": "衡水银行-金鼎卡-借记卡"
                },
                {
                    "bin": "623068",
                    "bankName": "衡水银行-借记IC卡-借记卡"
                },
                {
                    "bin": "621271",
                    "bankName": "周口银行-如愿卡-借记卡"
                },
                {
                    "bin": "628315",
                    "bankName": "周口银行-公务卡-贷记卡"
                },
                {
                    "bin": "621272",
                    "bankName": "阳泉市商业银行-金鼎卡-借记卡"
                },
                {
                    "bin": "621738",
                    "bankName": "阳泉市商业银行-金鼎卡-借记卡"
                },
                {
                    "bin": "621273",
                    "bankName": "宜宾市商业银行-锦程卡-借记卡"
                },
                {
                    "bin": "623079",
                    "bankName": "宜宾市商业银行-借记IC卡-借记卡"
                },
                {
                    "bin": "621263",
                    "bankName": "库尔勒市商业银行-孔雀胡杨卡-借记卡"
                },
                {
                    "bin": "621325",
                    "bankName": "雅安市商业银行-锦城卡-借记卡"
                },
                {
                    "bin": "623084",
                    "bankName": "雅安市商业银行----借记卡"
                },
                {
                    "bin": "621337",
                    "bankName": "商丘商行-百汇卡-借记卡"
                },
                {
                    "bin": "621327",
                    "bankName": "安阳银行-安鼎卡-借记卡"
                },
                {
                    "bin": "621753",
                    "bankName": "信阳银行-信阳卡-借记卡"
                },
                {
                    "bin": "628331",
                    "bankName": "信阳银行-公务卡-贷记卡"
                },
                {
                    "bin": "623160",
                    "bankName": "信阳银行-信阳卡-借记卡"
                },
                {
                    "bin": "621366",
                    "bankName": "华融湘江银行-华融卡-借记卡"
                },
                {
                    "bin": "621388",
                    "bankName": "华融湘江银行-华融卡-借记卡"
                },
                {
                    "bin": "621348",
                    "bankName": "营口沿海银行-祥云借记卡-借记卡"
                },
                {
                    "bin": "621359",
                    "bankName": "景德镇商业银行-瓷都卡-借记卡"
                },
                {
                    "bin": "621360",
                    "bankName": "哈密市商业银行-瓜香借记卡-借记卡"
                },
                {
                    "bin": "621217",
                    "bankName": "湖北银行-金牛卡-借记卡"
                },
                {
                    "bin": "622959",
                    "bankName": "湖北银行-汉江卡-借记卡"
                },
                {
                    "bin": "621270",
                    "bankName": "湖北银行-借记卡-借记卡"
                },
                {
                    "bin": "622396",
                    "bankName": "湖北银行-三峡卡-借记卡"
                },
                {
                    "bin": "622511",
                    "bankName": "湖北银行-至尊卡-借记卡"
                },
                {
                    "bin": "623076",
                    "bankName": "湖北银行-金融IC卡-借记卡"
                },
                {
                    "bin": "621391",
                    "bankName": "西藏银行-借记IC卡-借记卡"
                },
                {
                    "bin": "621339",
                    "bankName": "新疆汇和银行-汇和卡-借记卡"
                },
                {
                    "bin": "621469",
                    "bankName": "广东华兴银行-借记卡-借记卡"
                },
                {
                    "bin": "621625",
                    "bankName": "广东华兴银行-华兴银联公司卡-借记卡"
                },
                {
                    "bin": "623688",
                    "bankName": "广东华兴银行-华兴联名IC卡-借记卡"
                },
                {
                    "bin": "623113",
                    "bankName": "广东华兴银行-华兴金融IC借记卡-借记卡"
                },
                {
                    "bin": "621601",
                    "bankName": "濮阳银行-龙翔卡-借记卡"
                },
                {
                    "bin": "621655",
                    "bankName": "宁波通商银行-借记卡-借记卡"
                },
                {
                    "bin": "621636",
                    "bankName": "甘肃银行-神舟兴陇借记卡-借记卡"
                },
                {
                    "bin": "623182",
                    "bankName": "甘肃银行-甘肃银行神州兴陇IC卡-借记卡"
                },
                {
                    "bin": "623087",
                    "bankName": "枣庄银行-借记IC卡-借记卡"
                },
                {
                    "bin": "621696",
                    "bankName": "本溪市商业银行-借记卡-借记卡"
                },
                {
                    "bin": "627069",
                    "bankName": "平安银行股份有限公司-一账通借贷合一钻石卡-借记卡"
                },
                {
                    "bin": "627068",
                    "bankName": "平安银行股份有限公司-一账通借贷合一白金卡-借记卡"
                },
                {
                    "bin": "627066",
                    "bankName": "平安银行股份有限公司-一账通借贷合一卡普卡-借记卡"
                },
                {
                    "bin": "627067",
                    "bankName": "平安银行股份有限公司-一账通借贷合一卡金卡-借记卡"
                },
                {
                    "bin": "622955",
                    "bankName": "盛京银行-医保卡-借记卡"
                },
                {
                    "bin": "622478",
                    "bankName": "上海农商银行-如意卡(银联卡)-借记卡"
                },
                {
                    "bin": "940013",
                    "bankName": "上海农商银行-如意卡(银联卡)-借记卡"
                },
                {
                    "bin": "621495",
                    "bankName": "上海农商银行-鑫通卡-借记卡"
                },
                {
                    "bin": "621688",
                    "bankName": "上海农商银行-国际如意卡-借记卡"
                },
                {
                    "bin": "623162",
                    "bankName": "上海农商银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622443",
                    "bankName": "昆山农信社-江通卡(银联卡)-借记卡"
                },
                {
                    "bin": "940029",
                    "bankName": "昆山农信社-银联汇通卡(银联卡)-借记卡"
                },
                {
                    "bin": "623132",
                    "bankName": "昆山农信社-琼花卡-借记卡"
                },
                {
                    "bin": "622462",
                    "bankName": "常熟市农村商业银行-粒金贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "628272",
                    "bankName": "常熟市农村商业银行-公务卡-贷记卡"
                },
                {
                    "bin": "625101",
                    "bankName": "常熟市农村商业银行-粒金准贷卡-准贷记卡"
                },
                {
                    "bin": "622323",
                    "bankName": "常熟农村商业银行-粒金借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "9400301",
                    "bankName": "常熟农村商业银行-粒金卡(银联卡)-借记卡"
                },
                {
                    "bin": "623071",
                    "bankName": "常熟农村商业银行-粒金IC卡-借记卡"
                },
                {
                    "bin": "603694",
                    "bankName": "常熟农村商业银行-粒金卡-借记卡"
                },
                {
                    "bin": "622128",
                    "bankName": "深圳农村商业银行-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "622129",
                    "bankName": "深圳农村商业银行-信通商务卡(银联卡)-借记卡"
                },
                {
                    "bin": "623035",
                    "bankName": "深圳农村商业银行-信通卡-借记卡"
                },
                {
                    "bin": "623186",
                    "bankName": "深圳农村商业银行-信通商务卡-借记卡"
                },
                {
                    "bin": "909810",
                    "bankName": "广州农村商业银行股份有限公司-麒麟卡-借记卡"
                },
                {
                    "bin": "940035",
                    "bankName": "广州农村商业银行股份有限公司-麒麟卡(银联卡)-借记卡"
                },
                {
                    "bin": "621522",
                    "bankName": "广州农村商业银行-福农太阳卡-借记卡"
                },
                {
                    "bin": "622439",
                    "bankName": "广州农村商业银行股份有限公司-麒麟储蓄卡-借记卡"
                },
                {
                    "bin": "622271",
                    "bankName": "广东南海农村商业银行-盛通卡-借记卡"
                },
                {
                    "bin": "940037",
                    "bankName": "广东南海农村商业银行-盛通卡(银联卡)-借记卡"
                },
                {
                    "bin": "940038",
                    "bankName": "佛山顺德农村商业银行-恒通卡(银联卡)-借记卡"
                },
                {
                    "bin": "985262",
                    "bankName": "佛山顺德农村商业银行-恒通卡-借记卡"
                },
                {
                    "bin": "622322",
                    "bankName": "佛山顺德农村商业银行-恒通卡(银联卡)-借记卡"
                },
                {
                    "bin": "621017",
                    "bankName": "昆明农联社-金碧白金卡-借记卡"
                },
                {
                    "bin": "018572",
                    "bankName": "昆明农联社-金碧卡-借记卡"
                },
                {
                    "bin": "622369",
                    "bankName": "昆明农联社-金碧一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "940042",
                    "bankName": "昆明农联社-银联卡(银联卡)-借记卡"
                },
                {
                    "bin": "623190",
                    "bankName": "昆明农联社-金碧卡一卡通-借记卡"
                },
                {
                    "bin": "622412",
                    "bankName": "湖北农信社-信通卡-借记卡"
                },
                {
                    "bin": "621523",
                    "bankName": "湖北农信-福农小康卡-借记卡"
                },
                {
                    "bin": "623055",
                    "bankName": "湖北农信社-福卡IC借记卡-借记卡"
                },
                {
                    "bin": "621013",
                    "bankName": "湖北农信社-福卡(VIP卡)-借记卡"
                },
                {
                    "bin": "940044",
                    "bankName": "武汉农信-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "622312",
                    "bankName": "徐州市郊农村信用合作联社-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "628381",
                    "bankName": "江阴农村商业银行-暨阳公务卡-贷记卡"
                },
                {
                    "bin": "622481",
                    "bankName": "江阴市农村商业银行-合作贷记卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622341",
                    "bankName": "江阴农村商业银行-合作借记卡-借记卡"
                },
                {
                    "bin": "940058",
                    "bankName": "江阴农村商业银行-合作卡(银联卡)-借记卡"
                },
                {
                    "bin": "623115",
                    "bankName": "江阴农村商业银行-暨阳卡-借记卡"
                },
                {
                    "bin": "622867",
                    "bankName": "重庆农村商业银行股份有限公司-信合平安卡-借记卡"
                },
                {
                    "bin": "622885",
                    "bankName": "重庆农村商业银行股份有限公司-信合希望卡-借记卡"
                },
                {
                    "bin": "940020",
                    "bankName": "重庆农村商业银行股份有限公司-信合一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "621258",
                    "bankName": "重庆农村商业银行-江渝借记卡VIP卡-借记卡"
                },
                {
                    "bin": "621465",
                    "bankName": "重庆农村商业银行-江渝IC借记卡-借记卡"
                },
                {
                    "bin": "621528",
                    "bankName": "重庆农村商业银行-江渝乡情福农卡-借记卡"
                },
                {
                    "bin": "900105",
                    "bankName": "山东农村信用联合社-信通卡-借记卡"
                },
                {
                    "bin": "900205",
                    "bankName": "山东农村信用联合社-信通卡-借记卡"
                },
                {
                    "bin": "622319",
                    "bankName": "山东农村信用联合社-信通卡-借记卡"
                },
                {
                    "bin": "621521",
                    "bankName": "山东省农村信用社联合社-泰山福农卡-借记卡"
                },
                {
                    "bin": "621690",
                    "bankName": "山东省农村信用社联合社-VIP卡-借记卡"
                },
                {
                    "bin": "622320",
                    "bankName": "山东省农村信用社联合社-泰山如意卡-借记卡"
                },
                {
                    "bin": "62231902",
                    "bankName": "青岛农信-信通卡-借记卡"
                },
                {
                    "bin": "90010502",
                    "bankName": "青岛农信-信通卡-借记卡"
                },
                {
                    "bin": "90020502",
                    "bankName": "青岛农信-信通卡-借记卡"
                },
                {
                    "bin": "622328",
                    "bankName": "东莞农村商业银行-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "940062",
                    "bankName": "东莞农村商业银行-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "625288",
                    "bankName": "东莞农村商业银行-信通信用卡-贷记卡"
                },
                {
                    "bin": "623038",
                    "bankName": "东莞农村商业银行-信通借记卡-借记卡"
                },
                {
                    "bin": "625888",
                    "bankName": "东莞农村商业银行-贷记IC卡-贷记卡"
                },
                {
                    "bin": "622332",
                    "bankName": "张家港农村商业银行-一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "940063",
                    "bankName": "张家港农村商业银行-一卡通(银联卡)-借记卡"
                },
                {
                    "bin": "623123",
                    "bankName": "张家港农村商业银行--借记卡"
                },
                {
                    "bin": "622127",
                    "bankName": "福建省农村信用社联合社-万通(借记)卡-借记卡"
                },
                {
                    "bin": "622184",
                    "bankName": "福建省农村信用社联合社-万通(借记)卡-借记卡"
                },
                {
                    "bin": "621251",
                    "bankName": "福建省农村信用社联合社-福建海峡旅游卡-借记卡"
                },
                {
                    "bin": "621589",
                    "bankName": "福建省农村信用社联合社-福万通福农卡-借记卡"
                },
                {
                    "bin": "623036",
                    "bankName": "福建省农村信用社联合社-借记卡-借记卡"
                },
                {
                    "bin": "621701",
                    "bankName": "福建省农村信用社联合社-社保卡-借记卡"
                },
                {
                    "bin": "622138",
                    "bankName": "北京农村商业银行-信通卡-借记卡"
                },
                {
                    "bin": "621066",
                    "bankName": "北京农村商业银行-惠通卡-借记卡"
                },
                {
                    "bin": "621560",
                    "bankName": "北京农村商业银行-凤凰福农卡-借记卡"
                },
                {
                    "bin": "621068",
                    "bankName": "北京农村商业银行-惠通卡-借记卡"
                },
                {
                    "bin": "620088",
                    "bankName": "北京农村商业银行-中国旅行卡-借记卡"
                },
                {
                    "bin": "621067",
                    "bankName": "北京农村商业银行-凤凰卡-借记卡"
                },
                {
                    "bin": "625186",
                    "bankName": "北京农商行-凤凰标准卡-贷记卡"
                },
                {
                    "bin": "628336",
                    "bankName": "北京农商行-凤凰公务卡-贷记卡"
                },
                {
                    "bin": "625526",
                    "bankName": "北京农商行-凤凰福农卡-贷记卡"
                },
                {
                    "bin": "622531",
                    "bankName": "天津农村商业银行-吉祥商联IC卡-借记卡"
                },
                {
                    "bin": "622329",
                    "bankName": "天津农村商业银行-信通借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "623103",
                    "bankName": "天津农村商业银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622339",
                    "bankName": "鄞州农村合作银行-蜜蜂借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "620500",
                    "bankName": "宁波鄞州农村合作银行-蜜蜂电子钱包(IC)-借记卡"
                },
                {
                    "bin": "621024",
                    "bankName": "宁波鄞州农村合作银行-蜜蜂IC借记卡-借记卡"
                },
                {
                    "bin": "622289",
                    "bankName": "宁波鄞州农村合作银行-蜜蜂贷记IC卡-贷记卡"
                },
                {
                    "bin": "622389",
                    "bankName": "宁波鄞州农村合作银行-蜜蜂贷记卡-贷记卡"
                },
                {
                    "bin": "628300",
                    "bankName": "宁波鄞州农村合作银行-公务卡-贷记卡"
                },
                {
                    "bin": "622343",
                    "bankName": "佛山市三水区农村信用合作社-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "625516",
                    "bankName": "成都农村商业银行-福农卡-准贷记卡"
                },
                {
                    "bin": "621516",
                    "bankName": "成都农村商业银行-福农卡-借记卡"
                },
                {
                    "bin": "622345",
                    "bankName": "成都农村商业银行股份有限公司-天府借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622452",
                    "bankName": "江苏农信社-圆鼎卡(银联卡)-借记卡"
                },
                {
                    "bin": "621578",
                    "bankName": "江苏省农村信用社联合社-福农卡-借记卡"
                },
                {
                    "bin": "622324",
                    "bankName": "江苏农信社-圆鼎卡(银联卡)-借记卡"
                },
                {
                    "bin": "623066",
                    "bankName": "江苏省农村信用社联合社-圆鼎借记IC卡-借记卡"
                },
                {
                    "bin": "622648",
                    "bankName": "吴江农商行-垂虹贷记卡-贷记卡"
                },
                {
                    "bin": "628248",
                    "bankName": "吴江农商行-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "622488",
                    "bankName": "吴江农商行-垂虹卡(银联卡)-借记卡"
                },
                {
                    "bin": "623110",
                    "bankName": "吴江农商行----借记卡"
                },
                {
                    "bin": "622858",
                    "bankName": "浙江省农村信用社联合社-丰收卡(银联卡)-借记卡"
                },
                {
                    "bin": "621058",
                    "bankName": "浙江省农村信用社联合社-丰收小额贷款卡-借记卡"
                },
                {
                    "bin": "621527",
                    "bankName": "浙江省农村信用社联合社-丰收福农卡-借记卡"
                },
                {
                    "bin": "623091",
                    "bankName": "浙江省农村信用社联合社-借记IC卡-借记卡"
                },
                {
                    "bin": "622288",
                    "bankName": "浙江省农村信用社联合社-丰收贷记卡-贷记卡"
                },
                {
                    "bin": "628280",
                    "bankName": "浙江省农村信用社联合社-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "622686",
                    "bankName": "浙江省农村信用社联合社----贷记卡"
                },
                {
                    "bin": "622855",
                    "bankName": "苏州银行股份有限公司-新苏卡(银联卡)-借记卡"
                },
                {
                    "bin": "621461",
                    "bankName": "苏州银行股份有限公司-新苏卡-借记卡"
                },
                {
                    "bin": "623521",
                    "bankName": "苏州银行股份有限公司-金桂卡-借记卡"
                },
                {
                    "bin": "622859",
                    "bankName": "珠海农村商业银行-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "622869",
                    "bankName": "太仓农村商业银行-郑和卡(银联卡)-借记卡"
                },
                {
                    "bin": "623075",
                    "bankName": "太仓农村商业银行-郑和IC借记卡-借记卡"
                },
                {
                    "bin": "622882",
                    "bankName": "尧都区农村信用合作社联社-天河卡-借记卡"
                },
                {
                    "bin": "622893",
                    "bankName": "贵州省农村信用社联合社-信合卡-借记卡"
                },
                {
                    "bin": "621590",
                    "bankName": "贵州省农村信用社联合社-信合福农卡-借记卡"
                },
                {
                    "bin": "622895",
                    "bankName": "无锡农村商业银行-金阿福-借记卡"
                },
                {
                    "bin": "623125",
                    "bankName": "无锡农村商业银行-借记IC卡-借记卡"
                },
                {
                    "bin": "622169",
                    "bankName": "湖南省农村信用社联合社-福祥借记卡-借记卡"
                },
                {
                    "bin": "621519",
                    "bankName": "湖南省农村信用社联合社-福祥卡-借记卡"
                },
                {
                    "bin": "621539",
                    "bankName": "湖南省农村信用社联合社-福祥卡-借记卡"
                },
                {
                    "bin": "623090",
                    "bankName": "湖南省农村信用社联合社-福祥借记IC卡-借记卡"
                },
                {
                    "bin": "622681",
                    "bankName": "江西农信联合社-百福卡-借记卡"
                },
                {
                    "bin": "622682",
                    "bankName": "江西农信联合社-百福卡-借记卡"
                },
                {
                    "bin": "622683",
                    "bankName": "江西农信联合社-百福卡-借记卡"
                },
                {
                    "bin": "621592",
                    "bankName": "江西农信联合社-百福福农卡-借记卡"
                },
                {
                    "bin": "622991",
                    "bankName": "河南省农村信用社联合社-金燕卡-借记卡"
                },
                {
                    "bin": "621585",
                    "bankName": "河南省农村信用社联合社-金燕快货通福农卡-借记卡"
                },
                {
                    "bin": "623013",
                    "bankName": "河南省农村信用社联合社-借记卡-借记卡"
                },
                {
                    "bin": "623059",
                    "bankName": "河南省农村信用社联合社--借记卡"
                },
                {
                    "bin": "621021",
                    "bankName": "河北省农村信用社联合社-信通卡-借记卡"
                },
                {
                    "bin": "622358",
                    "bankName": "河北省农村信用社联合社-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "623025",
                    "bankName": "河北省农村信用社联合社-借记卡-借记卡"
                },
                {
                    "bin": "622506",
                    "bankName": "陕西省农村信用社联合社-陕西信合富秦卡-借记卡"
                },
                {
                    "bin": "621566",
                    "bankName": "陕西省农村信用社联合社-富秦家乐福农卡-借记卡"
                },
                {
                    "bin": "623027",
                    "bankName": "陕西省农村信用社联合社-富秦卡-借记卡"
                },
                {
                    "bin": "623028",
                    "bankName": "陕西省农村信用社联合社-社会保障卡（陕西信合）-借记卡"
                },
                {
                    "bin": "628323",
                    "bankName": "陕西省农村信用社联合社-富秦公务卡-贷记卡"
                },
                {
                    "bin": "622992",
                    "bankName": "广西农村信用社联合社-桂盛卡-借记卡"
                },
                {
                    "bin": "623133",
                    "bankName": "广西农村信用社联合社-桂盛IC借记卡-借记卡"
                },
                {
                    "bin": "628330",
                    "bankName": "广西壮族自治区农村信用社联合社--贷记卡"
                },
                {
                    "bin": "621008",
                    "bankName": "新疆维吾尔自治区农村信用社联合-玉卡-借记卡"
                },
                {
                    "bin": "621525",
                    "bankName": "新疆农村信用社联合社-福农卡-借记卡"
                },
                {
                    "bin": "621287",
                    "bankName": "新疆维吾尔自治区农村信用社联合-玉卡金融IC借记卡-借记卡"
                },
                {
                    "bin": "622935",
                    "bankName": "吉林农信联合社-吉卡-借记卡"
                },
                {
                    "bin": "621531",
                    "bankName": "吉林农信联合社-吉林农信银联标准吉卡福农借记卡-借记卡"
                },
                {
                    "bin": "623181",
                    "bankName": "吉林省农村信用社联合社-借记IC卡-借记卡"
                },
                {
                    "bin": "622947",
                    "bankName": "黄河农村商业银行-黄河卡-借记卡"
                },
                {
                    "bin": "621561",
                    "bankName": "黄河农村商业银行-黄河富农卡福农卡-借记卡"
                },
                {
                    "bin": "623095",
                    "bankName": "黄河农村商业银行-借记IC卡-借记卡"
                },
                {
                    "bin": "621526",
                    "bankName": "安徽省农村信用社联合社-金农易贷福农卡-借记卡"
                },
                {
                    "bin": "622953",
                    "bankName": "安徽省农村信用社联合社-金农卡-借记卡"
                },
                {
                    "bin": "621536",
                    "bankName": "海南省农村信用社联合社-大海福农卡-借记卡"
                },
                {
                    "bin": "621036",
                    "bankName": "海南省农村信用社联合社-大海卡-借记卡"
                },
                {
                    "bin": "621458",
                    "bankName": "海南省农村信用社联合社-金融IC借记卡-借记卡"
                },
                {
                    "bin": "621517",
                    "bankName": "青海省农村信用社联合社-紫丁香福农卡-借记卡"
                },
                {
                    "bin": "621065",
                    "bankName": "青海省农村信用社联合社-紫丁香借记卡-借记卡"
                },
                {
                    "bin": "623017",
                    "bankName": "青海省农村信用社联合社-紫丁香-借记卡"
                },
                {
                    "bin": "628289",
                    "bankName": "青海省农村信用社联合社-青海省公务卡-贷记卡"
                },
                {
                    "bin": "622477",
                    "bankName": "广东省农村信用社联合社-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "622362",
                    "bankName": "广东省农村信用社联合社-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "621018",
                    "bankName": "广东省农村信用社联合社-珠江平安卡-借记卡"
                },
                {
                    "bin": "621518",
                    "bankName": "广东省农村信用社联合社-珠江平安福农卡-借记卡"
                },
                {
                    "bin": "621728",
                    "bankName": "广东省农村信用社联合社-珠江平安卡-借记卡"
                },
                {
                    "bin": "622470",
                    "bankName": "广东省农村信用社联合社-信通卡(银联卡)-借记卡"
                },
                {
                    "bin": "622976",
                    "bankName": "内蒙古自治区农村信用社联合式-信合金牛卡-借记卡"
                },
                {
                    "bin": "621533",
                    "bankName": "内蒙古自治区农村信用社联合式-金牛福农卡-借记卡"
                },
                {
                    "bin": "621362",
                    "bankName": "内蒙古自治区农村信用社联合式-白金卡-借记卡"
                },
                {
                    "bin": "621033",
                    "bankName": "四川省农村信用社联合社-蜀信卡-借记卡"
                },
                {
                    "bin": "621099",
                    "bankName": "四川省农村信用社联合社-蜀信贵宾卡-借记卡"
                },
                {
                    "bin": "621457",
                    "bankName": "四川省农村信用社联合社-蜀信卡-借记卡"
                },
                {
                    "bin": "621459",
                    "bankName": "四川省农村信用社联合社-蜀信社保卡-借记卡"
                },
                {
                    "bin": "621530",
                    "bankName": "四川省农村信用社联合社-蜀信福农卡-借记卡"
                },
                {
                    "bin": "623201",
                    "bankName": "四川省农村信用社联合社-蜀信旅游卡-借记卡"
                },
                {
                    "bin": "628297",
                    "bankName": "四川省农村信用社联合社-兴川公务卡-贷记卡"
                },
                {
                    "bin": "621061",
                    "bankName": "甘肃省农村信用社联合社-飞天卡-借记卡"
                },
                {
                    "bin": "621520",
                    "bankName": "甘肃省农村信用社联合社-福农卡-借记卡"
                },
                {
                    "bin": "623065",
                    "bankName": "甘肃省农村信用社联合社-飞天金融IC借记卡-借记卡"
                },
                {
                    "bin": "628332",
                    "bankName": "甘肃省农村信用社联合社-公务卡-贷记卡"
                },
                {
                    "bin": "621449",
                    "bankName": "辽宁省农村信用社联合社-金信卡-借记卡"
                },
                {
                    "bin": "621026",
                    "bankName": "辽宁省农村信用社联合社-金信卡-借记卡"
                },
                {
                    "bin": "622968",
                    "bankName": "山西省农村信用社联合社-关帝银行卡-借记卡"
                },
                {
                    "bin": "621280",
                    "bankName": "山西省农村信用社-信合通-借记卡"
                },
                {
                    "bin": "621580",
                    "bankName": "山西省农村信用社联合社-信合通-借记卡"
                },
                {
                    "bin": "623051",
                    "bankName": "山西省农村信用社联合社-信合通金融IC卡-借记卡"
                },
                {
                    "bin": "621073",
                    "bankName": "天津滨海农村商业银行-四海通卡-借记卡"
                },
                {
                    "bin": "623109",
                    "bankName": "天津滨海农村商业银行-四海通e芯卡-借记卡"
                },
                {
                    "bin": "621228",
                    "bankName": "黑龙江省农村信用社联合社-鹤卡-借记卡"
                },
                {
                    "bin": "621557",
                    "bankName": "黑龙江省农村信用社联合社-丰收时贷福农卡-借记卡"
                },
                {
                    "bin": "623516",
                    "bankName": "黑龙江省农村信用社联合社--借记卡"
                },
                {
                    "bin": "621361",
                    "bankName": "武汉农村商业银行-汉卡-借记卡"
                },
                {
                    "bin": "623033",
                    "bankName": "武汉农村商业银行-汉卡-借记卡"
                },
                {
                    "bin": "623207",
                    "bankName": "武汉农村商业银行-中国旅游卡-借记卡"
                },
                {
                    "bin": "622891",
                    "bankName": "江南农村商业银行-阳湖卡(银联卡)-借记卡"
                },
                {
                    "bin": "621363",
                    "bankName": "江南农村商业银行-天天红火卡-借记卡"
                },
                {
                    "bin": "623189",
                    "bankName": "江南农村商业银行-借记IC卡-借记卡"
                },
                {
                    "bin": "623510",
                    "bankName": "海口联合农村商业银行-海口联合农村商业银行合卡-借记卡"
                },
                {
                    "bin": "621056802",
                    "bankName": "安吉交银村镇银行-吉祥借记卡-借记卡"
                },
                {
                    "bin": "621056801",
                    "bankName": "大邑交银兴民村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621056803",
                    "bankName": "石河子交银村镇银行-戈壁明珠卡-借记卡"
                },
                {
                    "bin": "622995",
                    "bankName": "湖北嘉鱼吴江村镇银行-垂虹卡-借记卡"
                },
                {
                    "bin": "6229756114",
                    "bankName": "青岛即墨京都村镇银行-凤凰卡-借记卡"
                },
                {
                    "bin": "6229756115",
                    "bankName": "湖北仙桃京都村镇银行-凤凰卡-借记卡"
                },
                {
                    "bin": "62105913",
                    "bankName": "句容茅山村镇银行-暨阳卡-借记卡"
                },
                {
                    "bin": "62105916",
                    "bankName": "兴化苏南村镇银行-暨阳卡-借记卡"
                },
                {
                    "bin": "62105915",
                    "bankName": "海口苏南村镇银行-暨阳卡-借记卡"
                },
                {
                    "bin": "62105905",
                    "bankName": "海口苏南村镇银行-暨阳卡-借记卡"
                },
                {
                    "bin": "62105901",
                    "bankName": "双流诚民村镇银行-暨阳卡-借记卡"
                },
                {
                    "bin": "62105900",
                    "bankName": "宣汉诚民村镇银行-暨阳卡-借记卡"
                },
                {
                    "bin": "621053",
                    "bankName": "福建建瓯石狮村镇银行-玉竹卡-借记卡"
                },
                {
                    "bin": "621260002",
                    "bankName": "恩施常农商村镇银行-恩施村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621260001",
                    "bankName": "咸丰常农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621092003",
                    "bankName": "浙江乐清联合村镇银行-联合卡-借记卡"
                },
                {
                    "bin": "621092002",
                    "bankName": "浙江嘉善联合村镇银行-联合卡-借记卡"
                },
                {
                    "bin": "621092001",
                    "bankName": "浙江长兴联合村镇银行-联合卡-借记卡"
                },
                {
                    "bin": "621092006",
                    "bankName": "浙江义乌联合村镇银行-联合卡-借记卡"
                },
                {
                    "bin": "621092004",
                    "bankName": "浙江常山联合村镇银行-联合卡-借记卡"
                },
                {
                    "bin": "621092005",
                    "bankName": "浙江温岭联合村镇银行-联合卡-借记卡"
                },
                {
                    "bin": "621230",
                    "bankName": "浙江平湖工银村镇银行-金平卡-借记卡"
                },
                {
                    "bin": "621229",
                    "bankName": "重庆璧山工银村镇银行-翡翠卡-借记卡"
                },
                {
                    "bin": "621250004",
                    "bankName": "北京密云汇丰村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621250003",
                    "bankName": "福建永安汇丰村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621250001",
                    "bankName": "湖北随州曾都汇丰村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621250005",
                    "bankName": "广东恩平汇丰村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621250002",
                    "bankName": "重庆大足汇丰村镇银行有限责任公司-借记卡-借记卡"
                },
                {
                    "bin": "621241001",
                    "bankName": "江苏沭阳东吴村镇银行-新苏借记卡-借记卡"
                },
                {
                    "bin": "622218",
                    "bankName": "重庆农村商业银行-银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "628267",
                    "bankName": "重庆农村商业银行-公务卡-贷记卡"
                },
                {
                    "bin": "621346003",
                    "bankName": "鄂尔多斯市东胜蒙银村镇银行-龙源腾借记卡-借记卡"
                },
                {
                    "bin": "621346002",
                    "bankName": "方大村镇银行-胡杨卡神州卡-借记卡"
                },
                {
                    "bin": "621346001",
                    "bankName": "深圳龙岗鼎业村镇银行-鼎业卡-借记卡"
                },
                {
                    "bin": "621326919",
                    "bankName": "北京大兴九银村镇银行-北京大兴九银村镇银行卡-借记卡"
                },
                {
                    "bin": "621326763",
                    "bankName": "中山小榄村镇银行-菊卡-借记卡"
                },
                {
                    "bin": "621338001",
                    "bankName": "江苏邗江民泰村镇银行-金荷花借记卡-借记卡"
                },
                {
                    "bin": "621353008",
                    "bankName": "天津静海新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353108",
                    "bankName": "天津静海新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353002",
                    "bankName": "安徽当涂新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353102",
                    "bankName": "安徽当涂新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353005",
                    "bankName": "安徽和县新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353105",
                    "bankName": "安徽和县新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353007",
                    "bankName": "望江新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353107",
                    "bankName": "望江新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353003",
                    "bankName": "郎溪新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353103",
                    "bankName": "郎溪新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353001",
                    "bankName": "广州番禹新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621353101",
                    "bankName": "广州番禹新华村镇银行-新华卡-借记卡"
                },
                {
                    "bin": "621356014",
                    "bankName": "宁波镇海中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356013",
                    "bankName": "宁海中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356016",
                    "bankName": "来安中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356015",
                    "bankName": "全椒中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356005",
                    "bankName": "青州中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356018",
                    "bankName": "嘉祥中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356006",
                    "bankName": "临邑中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356004",
                    "bankName": "沂水中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356003",
                    "bankName": "曹县中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356017",
                    "bankName": "单县中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356007",
                    "bankName": "谷城中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356009",
                    "bankName": "老河口中银富登村镇银行-中银富登村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621356008",
                    "bankName": "枣阳中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356002",
                    "bankName": "京山中银富登村镇银行-京山富登借记卡-借记卡"
                },
                {
                    "bin": "621356001",
                    "bankName": "蕲春中银富登村镇银行-中银富登借记卡-借记卡"
                },
                {
                    "bin": "621356010",
                    "bankName": "潜江中银富登村镇银行-中银富登村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621356012",
                    "bankName": "松滋中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621356011",
                    "bankName": "监利中银富登村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621347002",
                    "bankName": "北京顺义银座村镇银行-大唐卡-借记卡"
                },
                {
                    "bin": "621347008",
                    "bankName": "浙江景宁银座村镇银行-大唐卡-借记卡"
                },
                {
                    "bin": "621347005",
                    "bankName": "浙江三门银座村镇银行-大唐卡-借记卡"
                },
                {
                    "bin": "621347003",
                    "bankName": "江西赣州银座村镇银行-大唐卡-借记卡"
                },
                {
                    "bin": "621347001",
                    "bankName": "深圳福田银座村镇银行-大唐卡-借记卡"
                },
                {
                    "bin": "621347006",
                    "bankName": "重庆渝北银座村镇银行-大唐卡-借记卡"
                },
                {
                    "bin": "621347007",
                    "bankName": "重庆黔江银座村镇银行-大唐卡-借记卡"
                },
                {
                    "bin": "621350010",
                    "bankName": "北京怀柔融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350020",
                    "bankName": "河间融惠村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350431",
                    "bankName": "榆树融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350451",
                    "bankName": "巴彦融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350001",
                    "bankName": "延寿融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350013",
                    "bankName": "拜泉融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350005",
                    "bankName": "桦川融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350009",
                    "bankName": "江苏如东融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350003",
                    "bankName": "安义融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350002",
                    "bankName": "乐平融兴村镇银行--借记卡"
                },
                {
                    "bin": "621350015",
                    "bankName": "偃师融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350004",
                    "bankName": "新安融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350006",
                    "bankName": "应城融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350011",
                    "bankName": "洪湖融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350016",
                    "bankName": "株洲县融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350007",
                    "bankName": "耒阳融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350755",
                    "bankName": "深圳宝安融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350017",
                    "bankName": "海南保亭融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350014",
                    "bankName": "遂宁安居融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350019",
                    "bankName": "重庆沙坪坝融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350012",
                    "bankName": "重庆大渡口融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350008",
                    "bankName": "重庆市武隆融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350018",
                    "bankName": "重庆市酋阳融兴村镇银行-融兴普惠卡-借记卡"
                },
                {
                    "bin": "621350943",
                    "bankName": "会宁会师村镇银行-会师普惠卡-借记卡"
                },
                {
                    "bin": "621392",
                    "bankName": "南阳村镇银行-玉都卡-借记卡"
                },
                {
                    "bin": "621399017",
                    "bankName": "宁晋民生村镇银行-宁晋民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399008",
                    "bankName": "梅河口民生村镇银行-梅河口民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399001",
                    "bankName": "上海松江民生村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621399012",
                    "bankName": "嘉定民生村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621399025",
                    "bankName": "天台民生村镇银行-天台民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399026",
                    "bankName": "天长民生村镇银行-天长民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399023",
                    "bankName": "宁国民生村镇银行-宁国民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399024",
                    "bankName": "池州贵池民生村镇银行----借记卡"
                },
                {
                    "bin": "621399002",
                    "bankName": "安溪民生村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621399018",
                    "bankName": "漳浦民生村镇银行-漳浦民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399010",
                    "bankName": "长垣民生村镇银行-长垣民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399009",
                    "bankName": "江夏民生村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621399011",
                    "bankName": "宜都民生村镇银行-宜都民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399013",
                    "bankName": "钟祥民生村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621399005",
                    "bankName": "綦江民生村镇银行-綦江民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399006",
                    "bankName": "潼南民生村镇银行-潼南民生村镇银行借记卡-借记卡"
                },
                {
                    "bin": "621399021",
                    "bankName": "普洱民生村镇银行----借记卡"
                },
                {
                    "bin": "621399019",
                    "bankName": "景洪民生村镇银行----借记卡"
                },
                {
                    "bin": "621399027",
                    "bankName": "腾冲民生村镇银行-腾冲民生村镇银行-借记卡"
                },
                {
                    "bin": "621399020",
                    "bankName": "志丹民生村镇银行--借记卡"
                },
                {
                    "bin": "621399022",
                    "bankName": "榆林榆阳民生村镇银行----借记卡"
                },
                {
                    "bin": "621365006",
                    "bankName": "浙江萧山湖商村镇银行-湖商卡-借记卡"
                },
                {
                    "bin": "621365001",
                    "bankName": "浙江建德湖商村镇银行-湖商卡-借记卡"
                },
                {
                    "bin": "621365005",
                    "bankName": "浙江德清湖商村镇银行-湖商卡-借记卡"
                },
                {
                    "bin": "621365004",
                    "bankName": "安徽粤西湖商村镇银行-湖商卡-借记卡"
                },
                {
                    "bin": "621365003",
                    "bankName": "安徽蒙城湖商村镇银行-湖商卡-借记卡"
                },
                {
                    "bin": "621365002",
                    "bankName": "安徽利辛湖商村镇银行-湖商卡-借记卡"
                },
                {
                    "bin": "621481",
                    "bankName": "晋中市榆次融信村镇银行-魏榆卡-借记卡"
                },
                {
                    "bin": "621393001",
                    "bankName": "梅县客家村镇银行-围龙借记卡-借记卡"
                },
                {
                    "bin": "621623001",
                    "bankName": "宝生村镇银行-宝生村镇银行一卡通-借记卡"
                },
                {
                    "bin": "621397001",
                    "bankName": "江苏大丰江南村镇银行-江南卡-借记卡"
                },
                {
                    "bin": "621627001",
                    "bankName": "吉安稠州村镇银行--借记卡"
                },
                {
                    "bin": "621627007",
                    "bankName": "广州花都稠州村镇银行-义卡借记卡-借记卡"
                },
                {
                    "bin": "621627003",
                    "bankName": "重庆北碚稠州村镇银行-义卡-借记卡"
                },
                {
                    "bin": "621627006",
                    "bankName": "忠县稠州村镇银行-义卡-借记卡"
                },
                {
                    "bin": "621627010",
                    "bankName": "云南安宁稠州村镇银行-义卡-借记卡"
                },
                {
                    "bin": "621635101",
                    "bankName": "象山国民村镇银行--借记卡"
                },
                {
                    "bin": "621635114",
                    "bankName": "宁波市鄞州国民村镇银行-鄞州国民村镇银行借记IC卡-借记卡"
                },
                {
                    "bin": "621635003",
                    "bankName": "南宁江南国民村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621635103",
                    "bankName": "南宁江南国民村镇银行-蜜蜂借记IC卡-借记卡"
                },
                {
                    "bin": "621635004",
                    "bankName": "桂林国民村镇银行-蜜蜂卡-借记卡"
                },
                {
                    "bin": "621635104",
                    "bankName": "桂林国民村镇银行-桂林国民村镇银行蜜蜂IC借记卡-借记卡"
                },
                {
                    "bin": "621635112",
                    "bankName": "银海国民村镇银行--借记卡"
                },
                {
                    "bin": "621635111",
                    "bankName": "平果国民村镇银行-平果国民村镇银行蜜蜂借记卡-借记卡"
                },
                {
                    "bin": "621635013",
                    "bankName": "钦州市钦南国民村镇银行-钦南国民村镇银行蜜蜂借记卡-借记卡"
                },
                {
                    "bin": "621635113",
                    "bankName": "钦州市钦南国民村镇银行-钦南国民村镇银行蜜蜂IC借记卡-借记卡"
                },
                {
                    "bin": "621635010",
                    "bankName": "防城港防城国民村镇银行-蜜蜂借记卡-借记卡"
                },
                {
                    "bin": "621635005",
                    "bankName": "东兴国民村镇银行-——-借记卡"
                },
                {
                    "bin": "621635105",
                    "bankName": "东兴国民村镇银行--借记卡"
                },
                {
                    "bin": "621635106",
                    "bankName": "石河子国民村镇银行----借记卡"
                },
                {
                    "bin": "621650002",
                    "bankName": "文昌国民村镇银行-赀业卡-借记卡"
                },
                {
                    "bin": "621650001",
                    "bankName": "琼海国民村镇银行-椰卡-借记卡"
                },
                {
                    "bin": "62163113",
                    "bankName": "北京门头沟珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163103",
                    "bankName": "大连保税区珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163119",
                    "bankName": "启东珠江村镇银行-启东珠江卡-借记卡"
                },
                {
                    "bin": "62163120",
                    "bankName": "盱眙珠江村镇银行-盱眙珠江卡-借记卡"
                },
                {
                    "bin": "62163117",
                    "bankName": "青岛城阳珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163115",
                    "bankName": "莱州珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163104",
                    "bankName": "莱芜珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163118",
                    "bankName": "安阳珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163108",
                    "bankName": "辉县珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163107",
                    "bankName": "信阳珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "621310",
                    "bankName": "三水珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163101",
                    "bankName": "鹤山珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163102",
                    "bankName": "中山东凤珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163109",
                    "bankName": "新津珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62163110",
                    "bankName": "广汉珠江村镇银行--借记卡"
                },
                {
                    "bin": "62163111",
                    "bankName": "彭山珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "621653002",
                    "bankName": "安徽肥西石银村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621653004",
                    "bankName": "重庆南川石银村镇银行-麒麟借记卡-借记卡"
                },
                {
                    "bin": "621653005",
                    "bankName": "重庆江津石银村镇银行-麒麟借记卡-借记卡"
                },
                {
                    "bin": "621653007",
                    "bankName": "银川掌政石银村镇银行-麒麟借记卡-借记卡"
                },
                {
                    "bin": "621653006",
                    "bankName": "大武口石银村镇银行-麒麟借记卡-借记卡"
                },
                {
                    "bin": "621653001",
                    "bankName": "吴忠市滨河村镇银行-麒麟借记卡-借记卡"
                },
                {
                    "bin": "62308299",
                    "bankName": "广元贵商村镇银行-利卡-借记卡"
                },
                {
                    "bin": "621628660",
                    "bankName": "佛山高明顺银村镇银行-恒通卡-借记卡"
                },
                {
                    "bin": "621316001",
                    "bankName": "青岛胶南海汇村镇银行-海汇卡-借记卡"
                },
                {
                    "bin": "62319801",
                    "bankName": "惠州仲恺东盈村镇银行----借记卡"
                },
                {
                    "bin": "62319806",
                    "bankName": "东莞大朗东盈村镇银行-东盈卡-借记卡"
                },
                {
                    "bin": "62319802",
                    "bankName": "云浮新兴东盈民生村镇银行-东盈卡-借记卡"
                },
                {
                    "bin": "62319803",
                    "bankName": "贺州八步东盈村镇银行-东盈卡-借记卡"
                },
                {
                    "bin": "621355002",
                    "bankName": "宜兴阳羡村镇银行-阳羡卡-借记卡"
                },
                {
                    "bin": "621355001",
                    "bankName": "昆山鹿城村镇银行-鹿城卡-借记卡"
                },
                {
                    "bin": "621396",
                    "bankName": "东营莱商村镇银行-绿洲卡-借记卡"
                },
                {
                    "bin": "621656001",
                    "bankName": "河南方城凤裕村镇银行-金裕卡-借记卡"
                },
                {
                    "bin": "621659001",
                    "bankName": "永清吉银村镇银行-长白山卡-借记卡"
                },
                {
                    "bin": "621659006",
                    "bankName": "长春双阳吉银村镇银行--借记卡"
                },
                {
                    "bin": "621398001",
                    "bankName": "江都吉银村镇银行-长白山卡-借记卡"
                },
                {
                    "bin": "621676001",
                    "bankName": "湖北咸安武农商村镇银行-汉卡-借记卡"
                },
                {
                    "bin": "621676002",
                    "bankName": "湖北赤壁武弄商村镇银行-汉卡-借记卡"
                },
                {
                    "bin": "621676003",
                    "bankName": "广州增城长江村镇银行-汉卡-借记卡"
                },
                {
                    "bin": "621680002",
                    "bankName": "张家港渝农商村镇银行-江渝卡-借记卡"
                },
                {
                    "bin": "621680009",
                    "bankName": "福建沙县渝农商村镇银行-江渝卡-借记卡"
                },
                {
                    "bin": "621680005",
                    "bankName": "广西鹿寨渝农商村镇银行-江渝卡-借记卡"
                },
                {
                    "bin": "621680004",
                    "bankName": "云南大理渝农商村镇银行-江渝卡-借记卡"
                },
                {
                    "bin": "621680006",
                    "bankName": "云南祥云渝农商村镇银行-江渝卡-借记卡"
                },
                {
                    "bin": "621680008",
                    "bankName": "云南鹤庆渝农商村镇银行-江渝卡-借记卡"
                },
                {
                    "bin": "621680011",
                    "bankName": "云南香格里拉渝农商村镇银行-江渝卡-借记卡"
                },
                {
                    "bin": "621681001",
                    "bankName": "沈阳于洪永安村镇银行-永安卡-借记卡"
                },
                {
                    "bin": "621682002",
                    "bankName": "北京房山沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682101",
                    "bankName": "济南长清沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682102",
                    "bankName": "济南槐荫沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682106",
                    "bankName": "泰安沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682103",
                    "bankName": "宁阳沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682105",
                    "bankName": "东平沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682110",
                    "bankName": "聊城沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682111",
                    "bankName": "临清沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682109",
                    "bankName": "阳谷沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682108",
                    "bankName": "茌平沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682107",
                    "bankName": "日照沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682202",
                    "bankName": "长沙星沙沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682201",
                    "bankName": "宁乡沪农商行村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682203",
                    "bankName": "醴陵沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682205",
                    "bankName": "衡阳沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682209",
                    "bankName": "澧县沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682208",
                    "bankName": "临澧沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682210",
                    "bankName": "石门沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682213",
                    "bankName": "慈利沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682211",
                    "bankName": "涟源沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682212",
                    "bankName": "双峰沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682207",
                    "bankName": "桂阳沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682206",
                    "bankName": "永兴沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682003",
                    "bankName": "深圳光明沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682301",
                    "bankName": "阿拉沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682302",
                    "bankName": "嵩明沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682305",
                    "bankName": "个旧沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682307",
                    "bankName": "开远沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682306",
                    "bankName": "蒙自沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682309",
                    "bankName": "建水沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682308",
                    "bankName": "弥勒沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682310",
                    "bankName": "保山隆阳沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682303",
                    "bankName": "瑞丽沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621682311",
                    "bankName": "临沧临翔沪农商村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621687913",
                    "bankName": "宝丰豫丰村镇银行-豫丰卡-借记卡"
                },
                {
                    "bin": "62169501",
                    "bankName": "新密郑银村镇银行--借记卡"
                },
                {
                    "bin": "62169503",
                    "bankName": "鄢陵郑银村镇银行--借记卡"
                },
                {
                    "bin": "62352801",
                    "bankName": "安徽五河永泰村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621697813",
                    "bankName": "天津华明村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621697793",
                    "bankName": "任丘泰寿村镇银行-同心卡-借记卡"
                },
                {
                    "bin": "621697873",
                    "bankName": "芜湖泰寿村镇银行-同心卡-借记卡"
                },
                {
                    "bin": "62311701",
                    "bankName": "长葛轩辕村镇银行--借记卡"
                },
                {
                    "bin": "621689004",
                    "bankName": "北流柳银村镇银行-广西北流柳银村镇银行龙城卡-借记卡"
                },
                {
                    "bin": "621689005",
                    "bankName": "陆川柳银村镇银行-借记卡-借记卡"
                },
                {
                    "bin": "621689006",
                    "bankName": "博白柳银村镇银行-龙城卡-借记卡"
                },
                {
                    "bin": "621689003",
                    "bankName": "兴业柳银村镇银行-龙城卡-借记卡"
                },
                {
                    "bin": "621387973",
                    "bankName": "浙江兰溪越商村镇银行-兰江卡-借记卡"
                },
                {
                    "bin": "621382019",
                    "bankName": "北京昌平兆丰村镇银行--借记卡"
                },
                {
                    "bin": "621382018",
                    "bankName": "天津津南村镇银行--借记卡"
                },
                {
                    "bin": "621382020",
                    "bankName": "清徐惠民村镇银行--借记卡"
                },
                {
                    "bin": "621382001",
                    "bankName": "固阳包商惠农村镇银行--借记卡"
                },
                {
                    "bin": "621382002",
                    "bankName": "宁城包商村镇银行--借记卡"
                },
                {
                    "bin": "621382010",
                    "bankName": "科尔沁包商村镇银行--借记卡"
                },
                {
                    "bin": "621382007",
                    "bankName": "集宁包商村镇银行--借记卡"
                },
                {
                    "bin": "621382003",
                    "bankName": "准格尔旗包商村镇银行--借记卡"
                },
                {
                    "bin": "621382004",
                    "bankName": "乌审旗包商村镇银行--借记卡"
                },
                {
                    "bin": "621382025",
                    "bankName": "大连金州联丰村镇银行--借记卡"
                },
                {
                    "bin": "621382013",
                    "bankName": "九台龙嘉村镇银行----借记卡"
                },
                {
                    "bin": "621382017",
                    "bankName": "江苏南通如皋包商村镇银行--借记卡"
                },
                {
                    "bin": "621382021",
                    "bankName": "仪征包商村镇银行--借记卡"
                },
                {
                    "bin": "621382023",
                    "bankName": "鄄城包商村镇银行--借记卡"
                },
                {
                    "bin": "621382015",
                    "bankName": "漯河市郾城包商村镇银行----借记卡"
                },
                {
                    "bin": "621382016",
                    "bankName": "掇刀包商村镇银行--借记卡"
                },
                {
                    "bin": "621382014",
                    "bankName": "新都桂城村镇银行--借记卡"
                },
                {
                    "bin": "621382024",
                    "bankName": "广元包商贵民村镇银行--借记卡"
                },
                {
                    "bin": "621382011",
                    "bankName": "息烽包商黔隆村镇银行--借记卡"
                },
                {
                    "bin": "621382022",
                    "bankName": "毕节发展村镇银行--借记卡"
                },
                {
                    "bin": "621382026",
                    "bankName": "宁夏贺兰回商村镇银行--借记卡"
                },
                {
                    "bin": "621383001",
                    "bankName": "辽宁大石桥隆丰村镇银行-隆丰卡-借记卡"
                },
                {
                    "bin": "621278333",
                    "bankName": "通城惠民村镇银行----借记卡"
                },
                {
                    "bin": "621386001",
                    "bankName": "武陟射阳村镇银行-金鹤卡-借记卡"
                },
                {
                    "bin": "623678353",
                    "bankName": "山东临朐聚丰村镇银行-聚丰卡-借记卡"
                },
                {
                    "bin": "623608001",
                    "bankName": "德庆华润村镇银行-德庆华润村镇银行借记金卡-借记卡"
                },
                {
                    "bin": "623608002",
                    "bankName": "百色右江华润村镇银行-百色右江华润村镇银行金卡-借记卡"
                },
                {
                    "bin": "62351501",
                    "bankName": "江苏丹阳保得村镇银行-丹桂IC借记卡-借记卡"
                },
                {
                    "bin": "62168301",
                    "bankName": "江苏丰县民丰村镇银行-金鼎卡-借记卡"
                },
                {
                    "bin": "62168302",
                    "bankName": "江苏灌南民丰村镇银行-金鼎卡-借记卡"
                },
                {
                    "bin": "622372",
                    "bankName": "东亚银行有限公司(25020344)-cup credit card-贷记卡"
                },
                {
                    "bin": "622365",
                    "bankName": "东亚银行有限公司(25020344)-电子网络人民币卡-借记卡"
                },
                {
                    "bin": "622471",
                    "bankName": "东亚银行有限公司(25020344)-人民币信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622943",
                    "bankName": "东亚银行有限公司(25020344)-银联借记卡-借记卡"
                },
                {
                    "bin": "622472",
                    "bankName": "东亚银行有限公司(25020344)-人民币信用卡金卡-贷记卡"
                },
                {
                    "bin": "623318",
                    "bankName": "东亚银行有限公司(25020344)-银联双币借记卡-借记卡"
                },
                {
                    "bin": "621411",
                    "bankName": "东亚银行澳门分行(25020446)-银联借记卡-借记卡"
                },
                {
                    "bin": "622371",
                    "bankName": "花旗银行有限公司(25030344)-花旗人民币信用卡-贷记卡"
                },
                {
                    "bin": "625091",
                    "bankName": "花旗银行有限公司(25030344)-双币卡-贷记卡"
                },
                {
                    "bin": "622293",
                    "bankName": "大新银行有限公司(25040344)-信用卡(普通卡)-贷记卡"
                },
                {
                    "bin": "622295",
                    "bankName": "大新银行有限公司(25040344)-商务信用卡-贷记卡"
                },
                {
                    "bin": "622296",
                    "bankName": "大新银行有限公司(25040344)-商务信用卡-贷记卡"
                },
                {
                    "bin": "622297",
                    "bankName": "大新银行有限公司(25040344)-预付卡(普通卡)-借记卡"
                },
                {
                    "bin": "622373",
                    "bankName": "大新银行有限公司(25040344)-人民币信用卡-贷记卡"
                },
                {
                    "bin": "622375",
                    "bankName": "大新银行有限公司(25040344)-人民币借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622451",
                    "bankName": "大新银行有限公司(25040344)-大新人民币信用卡金卡-贷记卡"
                },
                {
                    "bin": "622294",
                    "bankName": "大新银行有限公司(25040344)-大新港币信用卡(金卡)-贷记卡"
                },
                {
                    "bin": "625940",
                    "bankName": "大新银行有限公司(25040344)-贷记卡-贷记卡"
                },
                {
                    "bin": "622489",
                    "bankName": "大新银行有限公司(25040344)-借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "622871",
                    "bankName": "永亨银行(25060344)-永亨尊贵理财卡-借记卡"
                },
                {
                    "bin": "622958",
                    "bankName": "永亨银行(25060344)-永亨贵宾理财卡-借记卡"
                },
                {
                    "bin": "622963",
                    "bankName": "永亨银行(25060344)-永亨贵宾理财卡-借记卡"
                },
                {
                    "bin": "622957",
                    "bankName": "永亨银行(25060344)-永亨贵宾理财卡-借记卡"
                },
                {
                    "bin": "622798",
                    "bankName": "永亨银行(25060344)-港币贷记卡-贷记卡"
                },
                {
                    "bin": "625010",
                    "bankName": "永亨银行(25060344)-永亨银联白金卡-贷记卡"
                },
                {
                    "bin": "622381",
                    "bankName": "中国建设银行亚洲股份有限公司(25070344)-人民币信用卡-贷记卡"
                },
                {
                    "bin": "622675",
                    "bankName": "中国建设银行亚洲股份有限公司(25070344)-银联卡-贷记卡"
                },
                {
                    "bin": "622676",
                    "bankName": "中国建设银行亚洲股份有限公司(25070344)-银联卡-贷记卡"
                },
                {
                    "bin": "622677",
                    "bankName": "中国建设银行亚洲股份有限公司(25070344)-银联卡-贷记卡"
                },
                {
                    "bin": "622382",
                    "bankName": "中国建设银行亚洲股份有限公司(25070344)-人民币卡(银联卡)-借记卡"
                },
                {
                    "bin": "621487",
                    "bankName": "中国建设银行亚洲股份有限公司(25070344)-借记卡-借记卡"
                },
                {
                    "bin": "621083",
                    "bankName": "中国建设银行亚洲股份有限公司(25070344)-建行陆港通龙卡-借记卡"
                },
                {
                    "bin": "622487",
                    "bankName": "星展银行香港有限公司(25080344)-银联人民币银行卡-借记卡"
                },
                {
                    "bin": "622490",
                    "bankName": "星展银行香港有限公司(25080344)-银联人民币银行卡-借记卡"
                },
                {
                    "bin": "622491",
                    "bankName": "星展银行香港有限公司(25080344)-银联银行卡-借记卡"
                },
                {
                    "bin": "622492",
                    "bankName": "星展银行香港有限公司(25080344)-银联银行卡-借记卡"
                },
                {
                    "bin": "621744",
                    "bankName": "星展银行香港有限公司(25080344)-借记卡-借记卡"
                },
                {
                    "bin": "621745",
                    "bankName": "星展银行香港有限公司(25080344)-借记卡-借记卡"
                },
                {
                    "bin": "621746",
                    "bankName": "星展银行香港有限公司(25080344)-借记卡-借记卡"
                },
                {
                    "bin": "621747",
                    "bankName": "星展银行香港有限公司(25080344)-借记卡-借记卡"
                },
                {
                    "bin": "621034",
                    "bankName": "上海商业银行(25090344)-上银卡-借记卡"
                },
                {
                    "bin": "622386",
                    "bankName": "上海商业银行(25090344)-人民币信用卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622952",
                    "bankName": "上海商业银行(25090344)-上银卡ShacomCard-借记卡"
                },
                {
                    "bin": "625107",
                    "bankName": "上海商业银行(25090344)-Dual Curr.Corp.Card-贷记卡"
                },
                {
                    "bin": "622387",
                    "bankName": "永隆银行有限公司(25100344)-永隆人民币信用卡-贷记卡"
                },
                {
                    "bin": "622423",
                    "bankName": "永隆银行有限公司(25100344)-永隆人民币信用卡-贷记卡"
                },
                {
                    "bin": "622971",
                    "bankName": "永隆银行有限公司(25100344)-永隆港币卡-借记卡"
                },
                {
                    "bin": "622970",
                    "bankName": "永隆银行有限公司(25100344)-永隆人民币卡-借记卡"
                },
                {
                    "bin": "625062",
                    "bankName": "永隆银行有限公司(25100344)-永隆双币卡-贷记卡"
                },
                {
                    "bin": "625063",
                    "bankName": "永隆银行有限公司(25100344)-永隆双币卡-贷记卡"
                },
                {
                    "bin": "622360",
                    "bankName": "香港上海汇丰银行有限公司(25120344)-人民币卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622361",
                    "bankName": "香港上海汇丰银行有限公司(25120344)-人民币金卡(银联卡)-贷记卡"
                },
                {
                    "bin": "625034",
                    "bankName": "香港上海汇丰银行有限公司(25120344)-银联卡-贷记卡"
                },
                {
                    "bin": "625096",
                    "bankName": "香港上海汇丰银行有限公司(25120344)-汇丰银联双币卡-贷记卡"
                },
                {
                    "bin": "625098",
                    "bankName": "香港上海汇丰银行有限公司(25120344)-汇丰银联双币钻石卡-贷记卡"
                },
                {
                    "bin": "622406",
                    "bankName": "香港上海汇丰银行有限公司(25130344)-TMCard-借记卡"
                },
                {
                    "bin": "622407",
                    "bankName": "香港上海汇丰银行有限公司(25130344)-TMCard-借记卡"
                },
                {
                    "bin": "621442",
                    "bankName": "香港上海汇丰银行有限公司(25130344)-借记卡-借记卡"
                },
                {
                    "bin": "621443",
                    "bankName": "香港上海汇丰银行有限公司(25130344)-借记卡-借记卡"
                },
                {
                    "bin": "625026",
                    "bankName": "恒生银行有限公司(25140344)-港币贷记白金卡-贷记卡"
                },
                {
                    "bin": "625024",
                    "bankName": "恒生银行有限公司(25140344)-港币贷记普卡-贷记卡"
                },
                {
                    "bin": "622376",
                    "bankName": "恒生银行有限公司(25140344)-恒生人民币信用卡-贷记卡"
                },
                {
                    "bin": "622378",
                    "bankName": "恒生银行有限公司(25140344)-恒生人民币白金卡-贷记卡"
                },
                {
                    "bin": "622377",
                    "bankName": "恒生银行有限公司(25140344)-恒生人民币金卡-贷记卡"
                },
                {
                    "bin": "625092",
                    "bankName": "恒生银行有限公司(25140344)-银联人民币钻石商务卡-贷记卡"
                },
                {
                    "bin": "622409",
                    "bankName": "恒生银行(25150344)-恒生银行港卡借记卡-借记卡"
                },
                {
                    "bin": "622410",
                    "bankName": "恒生银行(25150344)-恒生银行港卡借记卡-借记卡"
                },
                {
                    "bin": "621440",
                    "bankName": "恒生银行(25150344)-港币借记卡（普卡）-借记卡"
                },
                {
                    "bin": "621441",
                    "bankName": "恒生银行(25150344)-港币借记卡（金卡）-借记卡"
                },
                {
                    "bin": "623106",
                    "bankName": "恒生银行(25150344)-港币借记卡(普卡)-借记卡"
                },
                {
                    "bin": "623107",
                    "bankName": "恒生银行(25150344)-港币借记卡(普卡)-借记卡"
                },
                {
                    "bin": "622453",
                    "bankName": "中信嘉华银行有限公司(25160344)-人民币信用卡金卡-贷记卡"
                },
                {
                    "bin": "622456",
                    "bankName": "中信嘉华银行有限公司(25160344)-信用卡普通卡-贷记卡"
                },
                {
                    "bin": "622459",
                    "bankName": "中信嘉华银行有限公司(25160344)-人民币借记卡(银联卡)-借记卡"
                },
                {
                    "bin": "624303",
                    "bankName": "中信嘉华银行有限公司(25160344)-信银国际国航知音双币信用卡-贷记卡"
                },
                {
                    "bin": "623328",
                    "bankName": "中信嘉华银行有限公司(25160344)-CNCBI HKD CUP Debit Card-借记卡"
                },
                {
                    "bin": "622272",
                    "bankName": "创兴银行有限公司(25170344)-银联贺礼卡(创兴银行)-借记卡"
                },
                {
                    "bin": "622463",
                    "bankName": "创兴银行有限公司(25170344)-港币借记卡-借记卡"
                },
                {
                    "bin": "621087",
                    "bankName": "创兴银行有限公司(25170344)-人民币提款卡-借记卡"
                },
                {
                    "bin": "625008",
                    "bankName": "创兴银行有限公司(25170344)-银联双币信用卡-贷记卡"
                },
                {
                    "bin": "625009",
                    "bankName": "创兴银行有限公司(25170344)-银联双币信用卡-贷记卡"
                },
                {
                    "bin": "625055",
                    "bankName": "中银信用卡(国际)有限公司(25180344)-商务金卡-贷记卡"
                },
                {
                    "bin": "625040",
                    "bankName": "中银信用卡(国际)有限公司(25180344)-中银银联双币信用卡-贷记卡"
                },
                {
                    "bin": "625042",
                    "bankName": "中银信用卡(国际)有限公司(25180344)-中银银联双币信用卡-贷记卡"
                },
                {
                    "bin": "625141",
                    "bankName": "中银信用卡(国际)有限公司(25180446)-澳门币贷记卡-贷记卡"
                },
                {
                    "bin": "625143",
                    "bankName": "中银信用卡(国际)有限公司(25180446)-澳门币贷记卡-贷记卡"
                },
                {
                    "bin": "621741",
                    "bankName": "中国银行（香港）(25190344)-接触式晶片借记卡-借记卡"
                },
                {
                    "bin": "623040",
                    "bankName": "中国银行（香港）(25190344)-接触式银联双币预制晶片借记卡-借记卡"
                },
                {
                    "bin": "620202",
                    "bankName": "中国银行（香港）(25190344)-中国银行银联预付卡-预付费卡"
                },
                {
                    "bin": "620203",
                    "bankName": "中国银行（香港）(25190344)-中国银行银联预付卡-预付费卡"
                },
                {
                    "bin": "625136",
                    "bankName": "中国银行（香港）(25190344)-中银Good Day银联双币白金卡-贷记卡"
                },
                {
                    "bin": "621782",
                    "bankName": "中国银行（香港）(25190344)-中银纯电子现金双币卡-借记卡"
                },
                {
                    "bin": "623309",
                    "bankName": "中国银行（香港）(25190344)-中国银行银联公司借记卡-借记卡"
                },
                {
                    "bin": "625046",
                    "bankName": "南洋商业银行(25200344)-银联双币信用卡-贷记卡"
                },
                {
                    "bin": "625044",
                    "bankName": "南洋商业银行(25200344)-银联双币信用卡-贷记卡"
                },
                {
                    "bin": "625058",
                    "bankName": "南洋商业银行(25200344)-双币商务卡-贷记卡"
                },
                {
                    "bin": "621743",
                    "bankName": "南洋商业银行(25200344)-接触式晶片借记卡-借记卡"
                },
                {
                    "bin": "623041",
                    "bankName": "南洋商业银行(25200344)-接触式银联双币预制晶片借记卡-借记卡"
                },
                {
                    "bin": "620208",
                    "bankName": "南洋商业银行(25200344)-南洋商业银行银联预付卡-预付费卡"
                },
                {
                    "bin": "620209",
                    "bankName": "南洋商业银行(25200344)-南洋商业银行银联预付卡-预付费卡"
                },
                {
                    "bin": "621042",
                    "bankName": "南洋商业银行(25200344)-银联港币卡-借记卡"
                },
                {
                    "bin": "621783",
                    "bankName": "南洋商业银行(25200344)-中银纯电子现金双币卡-借记卡"
                },
                {
                    "bin": "623308",
                    "bankName": "南洋商业银行(25200344)-南洋商业银联公司借记卡-借记卡"
                },
                {
                    "bin": "625048",
                    "bankName": "集友银行(25210344)-银联双币信用卡-贷记卡"
                },
                {
                    "bin": "625053",
                    "bankName": "集友银行(25210344)-银联双币信用卡-贷记卡"
                },
                {
                    "bin": "625060",
                    "bankName": "集友银行(25210344)-双币商务卡-贷记卡"
                },
                {
                    "bin": "621742",
                    "bankName": "集友银行(25210344)-接触式晶片借记卡-借记卡"
                },
                {
                    "bin": "623042",
                    "bankName": "集友银行(25210344)-接触式银联双币预制晶片借记卡-借记卡"
                },
                {
                    "bin": "620206",
                    "bankName": "集友银行(25210344)-集友银行银联预付卡-预付费卡"
                },
                {
                    "bin": "620207",
                    "bankName": "集友银行(25210344)-集友银行银联预付卡-预付费卡"
                },
                {
                    "bin": "621043",
                    "bankName": "集友银行(25210344)-银联港币卡-借记卡"
                },
                {
                    "bin": "621784",
                    "bankName": "集友银行(25210344)-中银纯电子现金双币卡-借记卡"
                },
                {
                    "bin": "623310",
                    "bankName": "集友银行(25210344)-集友银行银联公司借记卡-借记卡"
                },
                {
                    "bin": "622493",
                    "bankName": "AEON信贷财务亚洲有限公司(25230344)-EONJUSCO银联卡-贷记卡"
                },
                {
                    "bin": "625198",
                    "bankName": "大丰银行有限公司(25250446)-银联双币白金卡-贷记卡"
                },
                {
                    "bin": "625196",
                    "bankName": "大丰银行有限公司(25250446)-银联双币金卡-贷记卡"
                },
                {
                    "bin": "622547",
                    "bankName": "大丰银行有限公司(25250446)-港币借记卡-借记卡"
                },
                {
                    "bin": "622548",
                    "bankName": "大丰银行有限公司(25250446)-澳门币借记卡-借记卡"
                },
                {
                    "bin": "622546",
                    "bankName": "大丰银行有限公司(25250446)-人民币借记卡-借记卡"
                },
                {
                    "bin": "625147",
                    "bankName": "澳门大丰银行(25250446)-中银银联双币商务卡-贷记卡"
                },
                {
                    "bin": "620072",
                    "bankName": "大丰银行有限公司(25250446)-大丰预付卡-预付费卡"
                },
                {
                    "bin": "620204",
                    "bankName": "大丰银行有限公司(25250446)-大丰银行预付卡-预付费卡"
                },
                {
                    "bin": "620205",
                    "bankName": "大丰银行有限公司(25250446)-大丰银行预付卡-预付费卡"
                },
                {
                    "bin": "621064",
                    "bankName": "AEON信贷财务亚洲有限公司(25260344)-EON银联礼品卡-借记卡"
                },
                {
                    "bin": "622941",
                    "bankName": "AEON信贷财务亚洲有限公司(25260344)-EON银联礼品卡-借记卡"
                },
                {
                    "bin": "622974",
                    "bankName": "AEON信贷财务亚洲有限公司(25260344)-EON银联礼品卡-借记卡"
                },
                {
                    "bin": "621084",
                    "bankName": "中国建设银行澳门股份有限公司(25270446)-扣款卡-借记卡"
                },
                {
                    "bin": "622948",
                    "bankName": "渣打银行香港有限公司(25280344)-港币借记卡-借记卡"
                },
                {
                    "bin": "621740",
                    "bankName": "渣打银行（香港）(25280344)-银联标准卡-借记卡"
                },
                {
                    "bin": "622482",
                    "bankName": "渣打银行香港有限公司(25280344)-双币信用卡-贷记卡"
                },
                {
                    "bin": "622483",
                    "bankName": "渣打银行香港有限公司(25280344)-双币信用卡-贷记卡"
                },
                {
                    "bin": "622484",
                    "bankName": "渣打银行香港有限公司(25280344)-双币信用卡-贷记卡"
                },
                {
                    "bin": "620070",
                    "bankName": "中国银盛(25290344)-中国银盛预付卡-预付费卡"
                },
                {
                    "bin": "620068",
                    "bankName": "中国银盛(25300344)-中国银盛预付卡-预付费卡"
                },
                {
                    "bin": "620107",
                    "bankName": "中国建设银行（亚洲）(25330344)-预付卡-借记卡"
                },
                {
                    "bin": "623334",
                    "bankName": "K & R International Limited(25380344)-环球通-预付费卡"
                },
                {
                    "bin": "625842",
                    "bankName": "Kasikorn Bank PCL(26030764)-贷记卡-贷记卡"
                },
                {
                    "bin": "6258433",
                    "bankName": "Kasikorn Bank PCL(26030764)-贷记卡-贷记卡"
                },
                {
                    "bin": "6258434",
                    "bankName": "Kasikorn Bank PCL(26030764)-贷记卡-贷记卡"
                },
                {
                    "bin": "622495",
                    "bankName": "Travelex(26040344)-Travelex港币卡-借记卡"
                },
                {
                    "bin": "622496",
                    "bankName": "Travelex(26040344)-Travelex美元卡-借记卡"
                },
                {
                    "bin": "620152",
                    "bankName": "Travelex(26040344)-CashPassportCounsumer-预付费卡"
                },
                {
                    "bin": "620153",
                    "bankName": "Travelex(26040344)-CashPassportCounsumer-预付费卡"
                },
                {
                    "bin": "622433",
                    "bankName": "新加坡大华银行(26070702)-UOBCUPCARD-贷记卡"
                },
                {
                    "bin": "622861",
                    "bankName": "澳门永亨银行股份有限公司(26080446)-人民币卡-借记卡"
                },
                {
                    "bin": "622932",
                    "bankName": "澳门永亨银行股份有限公司(26080446)-港币借记卡-借记卡"
                },
                {
                    "bin": "622862",
                    "bankName": "澳门永亨银行股份有限公司(26080446)-澳门币借记卡-借记卡"
                },
                {
                    "bin": "622775",
                    "bankName": "澳门永亨银行股份有限公司(26080446)-澳门币贷记卡-贷记卡"
                },
                {
                    "bin": "622785",
                    "bankName": "澳门永亨银行股份有限公司(26080446)-港币贷记卡-贷记卡"
                },
                {
                    "bin": "622920",
                    "bankName": "日本三井住友卡公司(26110392)-MITSUISUMITOMOGINREN-贷记卡"
                },
                {
                    "bin": "622434",
                    "bankName": "澳门国际银行(26220446)-人民币卡-借记卡"
                },
                {
                    "bin": "622436",
                    "bankName": "澳门国际银行(26220446)-澳门币卡-借记卡"
                },
                {
                    "bin": "622435",
                    "bankName": "澳门国际银行(26220446)-港币卡-借记卡"
                },
                {
                    "bin": "621232",
                    "bankName": "大西洋银行股份有限公司(26230446)-财运卡-借记卡"
                },
                {
                    "bin": "622432",
                    "bankName": "大西洋银行股份有限公司(26230446)-澳门币卡-借记卡"
                },
                {
                    "bin": "621247",
                    "bankName": "大西洋银行股份有限公司(26230446)-财运卡-借记卡"
                },
                {
                    "bin": "623043",
                    "bankName": "大西洋银行股份有限公司(26230446)-财运卡-借记卡"
                },
                {
                    "bin": "623064",
                    "bankName": "大西洋银行股份有限公司(26230446)-财运卡-借记卡"
                },
                {
                    "bin": "601100",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601101",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112010",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112011",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112012",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112089",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601121",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601123",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601124",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601125",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601126",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601127",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601128",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011290",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011291",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011292",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011293",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112013",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011295",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601122",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011297",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112980",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112981",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112986",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112987",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112988",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112989",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112990",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112991",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112992",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112993",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011294",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011296",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112996",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112997",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011300",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113080",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113081",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113089",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601131",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601136",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601137",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601138",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011390",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112995",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011392",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011393",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113940",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113941",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113943",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113944",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113945",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113946",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113984",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113985",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113986",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113988",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112994",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011391",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601140",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601142",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601143",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601144",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601145",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601146",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601147",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601148",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601149",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601174",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113989",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601178",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6011399",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601186",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601187",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601188",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601189",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "644",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "65",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6506",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6507",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6508",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601177",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "601179",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "6509",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60110",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60112",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60113",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60114",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "60119",
                    "bankName": "Discover Financial Services，I(26290840)-发现卡-贷记卡"
                },
                {
                    "bin": "621253",
                    "bankName": "澳门商业银行(26320446)-银联人民币卡-借记卡"
                },
                {
                    "bin": "621254",
                    "bankName": "澳门商业银行(26320446)-银联澳门币卡-借记卡"
                },
                {
                    "bin": "621255",
                    "bankName": "澳门商业银行(26320446)-银联港币卡-借记卡"
                },
                {
                    "bin": "625014",
                    "bankName": "澳门商业银行(26320446)-双币种普卡-贷记卡"
                },
                {
                    "bin": "625016",
                    "bankName": "澳门商业银行(26320446)-双币种白金卡-贷记卡"
                },
                {
                    "bin": "622549",
                    "bankName": "哈萨克斯坦国民储蓄银行(26330398)-HalykbankClassic-借记卡"
                },
                {
                    "bin": "622550",
                    "bankName": "哈萨克斯坦国民储蓄银行(26330398)-HalykbankGolden-借记卡"
                },
                {
                    "bin": "622354",
                    "bankName": "Bangkok Bank Pcl(26350764)-贷记卡-贷记卡"
                },
                {
                    "bin": "625017",
                    "bankName": "中国工商银行（澳门）(26470446)-普卡-贷记卡"
                },
                {
                    "bin": "625018",
                    "bankName": "中国工商银行（澳门）(26470446)-金卡-贷记卡"
                },
                {
                    "bin": "625019",
                    "bankName": "中国工商银行（澳门）(26470446)-白金卡-贷记卡"
                },
                {
                    "bin": "621224",
                    "bankName": "可汗银行(26530496)-借记卡-借记卡"
                },
                {
                    "bin": "622954",
                    "bankName": "可汗银行(26530496)-银联蒙图借记卡-借记卡"
                },
                {
                    "bin": "621295",
                    "bankName": "越南Vietcombank(26550704)-借记卡-借记卡"
                },
                {
                    "bin": "625124",
                    "bankName": "越南Vietcombank(26550704)-贷记卡-贷记卡"
                },
                {
                    "bin": "625154",
                    "bankName": "越南Vietcombank(26550704)-贷记卡-贷记卡"
                },
                {
                    "bin": "621049",
                    "bankName": "蒙古郭勒姆特银行(26620496)-Golomt Unionpay-借记卡"
                },
                {
                    "bin": "622444",
                    "bankName": "蒙古郭勒姆特银行(26620496)-贷记卡-贷记卡"
                },
                {
                    "bin": "622414",
                    "bankName": "蒙古郭勒姆特银行(26620496)-借记卡-借记卡"
                },
                {
                    "bin": "620011",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620027",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620031",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620039",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620103",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620106",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620120",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620123",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620125",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620220",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620278",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "620812",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "621006",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621011",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621012",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621020",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621023",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621025",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621027",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621031",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "620132",
                    "bankName": "BC卡公司(26630410)-BC-CUPGiftCard-借记卡"
                },
                {
                    "bin": "621039",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621078",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "621220",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "625003",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "621003",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "625011",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625012",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625020",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625023",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625025",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625027",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625031",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "621032",
                    "bankName": "BC卡公司(26630410)-中国通卡-借记卡"
                },
                {
                    "bin": "625039",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625078",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625079",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625103",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625106",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625006",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625112",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625120",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625123",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625125",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625127",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625131",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625032",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625139",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625178",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625179",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625220",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625320",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625111",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625132",
                    "bankName": "BC卡公司(26630410)-中国通卡-贷记卡"
                },
                {
                    "bin": "625244",
                    "bankName": "BC卡公司(26630410)-贷记卡-贷记卡"
                },
                {
                    "bin": "625243",
                    "bankName": "BC卡公司(26630410)-贷记卡-贷记卡"
                },
                {
                    "bin": "621484",
                    "bankName": "BC卡公司(26630410)-借记卡-借记卡"
                },
                {
                    "bin": "621640",
                    "bankName": "BC卡公司(26630410)-借记卡-借记卡"
                },
                {
                    "bin": "621040",
                    "bankName": "莫斯科人民储蓄银行(26690643)-cup-unioncard-借记卡"
                },
                {
                    "bin": "621045",
                    "bankName": "丝绸之路银行(26700860)-Classic/Gold-借记卡"
                },
                {
                    "bin": "621264",
                    "bankName": "俄罗斯远东商业银行(26780643)-借记卡-借记卡"
                },
                {
                    "bin": "622356",
                    "bankName": "CSC(26790422)-贷记卡-贷记卡"
                },
                {
                    "bin": "621234",
                    "bankName": "CSC(26790422)-CSC借记卡-借记卡"
                },
                {
                    "bin": "622145",
                    "bankName": "Allied Bank(26930608)-贷记卡-贷记卡"
                },
                {
                    "bin": "625013",
                    "bankName": "Allied Bank(26930608)-贷记卡-贷记卡"
                },
                {
                    "bin": "622130",
                    "bankName": "日本三菱信用卡公司(27090392)-贷记卡-贷记卡"
                },
                {
                    "bin": "621257",
                    "bankName": "Baiduri Bank Berhad(27130096)-借记卡-借记卡"
                },
                {
                    "bin": "621055",
                    "bankName": "越南西贡商业银行(27200704)-借记卡-借记卡"
                },
                {
                    "bin": "620009",
                    "bankName": "越南西贡商业银行(27200704)-预付卡-预付费卡"
                },
                {
                    "bin": "625002",
                    "bankName": "越南西贡商业银行(27200704)-贷记卡-贷记卡"
                },
                {
                    "bin": "625033",
                    "bankName": "菲律宾BDO(27240608)-银联卡-贷记卡"
                },
                {
                    "bin": "625035",
                    "bankName": "菲律宾BDO(27240608)-银联卡-贷记卡"
                },
                {
                    "bin": "625007",
                    "bankName": "菲律宾RCBC(27250608)-贷记卡-贷记卡"
                },
                {
                    "bin": "620015",
                    "bankName": "新加坡星网电子付款私人有限公司(27520702)-预付卡-预付费卡"
                },
                {
                    "bin": "620024",
                    "bankName": "Royal Bank Open Stock Company(27550031)-预付卡-预付费卡"
                },
                {
                    "bin": "625004",
                    "bankName": "Royal Bank Open Stock Company(27550031)-贷记卡-贷记卡"
                },
                {
                    "bin": "621344",
                    "bankName": "Royal Bank Open Stock Company(27550031)-借记卡-借记卡"
                },
                {
                    "bin": "621349",
                    "bankName": "乌兹别克斯坦INFINBANK(27650860)-借记卡-借记卡"
                },
                {
                    "bin": "620108",
                    "bankName": "Russian Standard Bank(27670643)-预付卡-预付费卡"
                },
                {
                    "bin": "6216846",
                    "bankName": "Russian Standard Bank(27670643)-UnionPay-借记卡"
                },
                {
                    "bin": "6216848",
                    "bankName": "Russian Standard Bank(27670643)-UnionPay-借记卡"
                },
                {
                    "bin": "6250386",
                    "bankName": "Russian Standard Bank(27670643)-UnionPay-贷记卡"
                },
                {
                    "bin": "6250388",
                    "bankName": "Russian Standard Bank(27670643)-UnionPay-贷记卡"
                },
                {
                    "bin": "6201086",
                    "bankName": "Russian Standard Bank(27670643)-预付卡-预付费卡"
                },
                {
                    "bin": "6201088",
                    "bankName": "Russian Standard Bank(27670643)-预付卡-预付费卡"
                },
                {
                    "bin": "621354",
                    "bankName": "BCEL(27710418)-借记卡-借记卡"
                },
                {
                    "bin": "621274",
                    "bankName": "澳门BDA(27860446)-汇业卡-借记卡"
                },
                {
                    "bin": "621324",
                    "bankName": "澳门BDA(27860446)-汇业卡-借记卡"
                },
                {
                    "bin": "620532",
                    "bankName": "澳门通股份有限公司(28020446)-双币闪付卡-预付费卡"
                },
                {
                    "bin": "620126",
                    "bankName": "澳门通股份有限公司(28020446)-旅游卡-预付费卡"
                },
                {
                    "bin": "620537",
                    "bankName": "澳门通股份有限公司(28020446)-旅游卡-预付费卡"
                },
                {
                    "bin": "625904",
                    "bankName": "韩国乐天(28030410)-贷记卡-贷记卡"
                },
                {
                    "bin": "621645",
                    "bankName": "巴基斯坦FAYSAL BANK(28040586)-借记卡-借记卡"
                },
                {
                    "bin": "621624",
                    "bankName": "OJSCBASIAALLIANCEBANK(28160860)-UnionPay-借记卡"
                },
                {
                    "bin": "623339",
                    "bankName": "OJSC Russian Investment Bank(28260417)-借记卡-借记卡"
                },
                {
                    "bin": "625104",
                    "bankName": "俄罗斯ORIENT EXPRESS BANK(28450643)-信用卡-贷记卡"
                },
                {
                    "bin": "621647",
                    "bankName": "俄罗斯ORIENT EXPRESS BANK(28450643)-借记卡-借记卡"
                },
                {
                    "bin": "621642",
                    "bankName": "Mongolia Trade Develop. Bank(28530496)-普卡/金卡-借记卡"
                },
                {
                    "bin": "621654",
                    "bankName": "Krung Thaj Bank Public Co. Ltd(28550764)-借记卡-借记卡"
                },
                {
                    "bin": "625804",
                    "bankName": "韩国KB(28590410)-贷记卡-贷记卡"
                },
                {
                    "bin": "625814",
                    "bankName": "韩国三星卡公司(28660410)-三星卡-贷记卡"
                },
                {
                    "bin": "625817",
                    "bankName": "韩国三星卡公司(28660410)-三星卡-贷记卡"
                },
                {
                    "bin": "621649",
                    "bankName": "CJSC Fononbank(28720762)-Fonon Bank Card-借记卡"
                },
                {
                    "bin": "620079",
                    "bankName": "Commercial Bank of Dubai(28790784)-PrepaidCard-借记卡"
                },
                {
                    "bin": "620091",
                    "bankName": "Commercial Bank of Dubai(28790784)-PrepaidCard-借记卡"
                },
                {
                    "bin": "620105",
                    "bankName": "The Bancorp Bank(28880840)-UnionPay Travel Card-预付费卡"
                },
                {
                    "bin": "622164",
                    "bankName": "The Bancorp Bank(28880840)-China UnionPay Travel Card-预付费卡"
                },
                {
                    "bin": "621657",
                    "bankName": "巴基斯坦HabibBank(28990586)-借记卡-借记卡"
                },
                {
                    "bin": "623024",
                    "bankName": "新韩卡公司(29010410)-借记卡-借记卡"
                },
                {
                    "bin": "625840",
                    "bankName": "新韩卡公司(29010410)-贷记卡-贷记卡"
                },
                {
                    "bin": "625841",
                    "bankName": "新韩卡公司(29010410)-贷记卡-贷记卡"
                },
                {
                    "bin": "621694",
                    "bankName": "Capital Bank of Mongolia(29120496)-借记卡-借记卡"
                },
                {
                    "bin": "6233451",
                    "bankName": "JSC Liberty Bank(29140268)-Classic-借记卡"
                },
                {
                    "bin": "6233452",
                    "bankName": "JSC Liberty Bank(29140268)-Gold-借记卡"
                },
                {
                    "bin": "623347",
                    "bankName": "JSC Liberty Bank(29140268)-Diamond-借记卡"
                },
                {
                    "bin": "620129",
                    "bankName": "The Mauritius Commercial Bank(29170480)-预付卡-借记卡"
                },
                {
                    "bin": "621301",
                    "bankName": "格鲁吉亚 Invest Bank(29230268)-借记卡-借记卡"
                },
                {
                    "bin": "624306",
                    "bankName": "Cim Finance Ltd(29440480)-贷记卡-贷记卡"
                },
                {
                    "bin": "624322",
                    "bankName": "Cim Finance Ltd(29440480)-贷记卡-贷记卡"
                },
                {
                    "bin": "623300",
                    "bankName": "Rawbank S.a.r.l(29460180)-预付卡-预付费卡"
                },
                {
                    "bin": "623302",
                    "bankName": "PVB Card Corporation(29470608)-预付卡-预付费卡"
                },
                {
                    "bin": "623303",
                    "bankName": "PVB Card Corporation(29470608)-预付卡-预付费卡"
                },
                {
                    "bin": "623304",
                    "bankName": "PVB Card Corporation(29470608)-预付卡-借记卡"
                },
                {
                    "bin": "623324",
                    "bankName": "PVB Card Corporation(29470608)-预付卡-借记卡"
                },
                {
                    "bin": "623307",
                    "bankName": "U Microfinance Bank Limited(29600586)-U Paisa ATM &Debit Card-借记卡"
                },
                {
                    "bin": "623311",
                    "bankName": "Ecobank Nigeria(29620566)-Prepaid Card-预付费卡"
                },
                {
                    "bin": "623312",
                    "bankName": "Al Baraka Bank(Pakistan)(29630586)-al baraka classic card-借记卡"
                },
                {
                    "bin": "623313",
                    "bankName": "OJSC Hamkor bank(29640860)-借记卡-借记卡"
                },
                {
                    "bin": "623323",
                    "bankName": "NongHyup Bank(29650410)-NH Card-借记卡"
                },
                {
                    "bin": "623341",
                    "bankName": "NongHyup Bank(29650410)-NH Card-借记卡"
                },
                {
                    "bin": "624320",
                    "bankName": "NongHyup Bank(29650410)-NH Card-贷记卡"
                },
                {
                    "bin": "624321",
                    "bankName": "NongHyup Bank(29650410)-NH Card-贷记卡"
                },
                {
                    "bin": "624324",
                    "bankName": "NongHyup Bank(29650410)-NH Card-贷记卡"
                },
                {
                    "bin": "624325",
                    "bankName": "NongHyup Bank(29650410)-NH Card-贷记卡"
                },
                {
                    "bin": "623314",
                    "bankName": "Fidelity Bank Plc(29660566)-借记卡-借记卡"
                },
                {
                    "bin": "623331",
                    "bankName": "State Bank of Mauritius(29810480)-Prepaid card-预付费卡"
                },
                {
                    "bin": "623348",
                    "bankName": "State Bank of Mauritius(29810480)-Debit Card-借记卡"
                },
                {
                    "bin": "623336",
                    "bankName": "JSC ATFBank(29830398)-预付卡-借记卡"
                },
                {
                    "bin": "623337",
                    "bankName": "JSC ATFBank(29830398)-借记卡-借记卡"
                },
                {
                    "bin": "623338",
                    "bankName": "JSC ATFBank(29830398)-借记卡-借记卡"
                },
                {
                    "bin": "624323",
                    "bankName": "JSC ATFBank(29830398)-贷记卡-贷记卡"
                },
                {
                    "bin": "622346",
                    "bankName": "中国银行香港有限公司(47980344)-人民币信用卡金卡-贷记卡"
                },
                {
                    "bin": "622347",
                    "bankName": "中国银行香港有限公司(47980344)-信用卡普通卡-贷记卡"
                },
                {
                    "bin": "622348",
                    "bankName": "中国银行香港有限公司(47980344)-中银卡(人民币)-借记卡"
                },
                {
                    "bin": "622349",
                    "bankName": "南洋商业银行(47980344)-人民币信用卡金卡-贷记卡"
                },
                {
                    "bin": "622350",
                    "bankName": "南洋商业银行(47980344)-信用卡普通卡-贷记卡"
                },
                {
                    "bin": "622352",
                    "bankName": "集友银行(47980344)-人民币信用卡金卡-贷记卡"
                },
                {
                    "bin": "622353",
                    "bankName": "集友银行(47980344)-信用卡普通卡-贷记卡"
                },
                {
                    "bin": "622355",
                    "bankName": "集友银行(47980344)-中银卡-借记卡"
                },
                {
                    "bin": "621041",
                    "bankName": "中国银行(香港)(47980344)-银联港币借记卡-借记卡"
                },
                {
                    "bin": "622351",
                    "bankName": "南洋商业银行(47980344)-中银卡(人民币)-借记卡"
                },
                {
                    "bin": "620048",
                    "bankName": "中银通商务支付有限公司(48080000)-预付卡-预付费卡"
                },
                {
                    "bin": "620515",
                    "bankName": "中银通商务支付有限公司(48080000)-预付卡-预付费卡"
                },
                {
                    "bin": "920000",
                    "bankName": "中银通商务支付有限公司(48080000)-预付卡-预付费卡"
                },
                {
                    "bin": "620550",
                    "bankName": "中银通商务支付有限公司(48080000)--预付费卡"
                },
                {
                    "bin": "621563",
                    "bankName": "中银通商务支付有限公司(48080000)--预付费卡"
                },
                {
                    "bin": "921001",
                    "bankName": "中银通商务支付有限公司(48080000)--预付费卡"
                },
                {
                    "bin": "921002",
                    "bankName": "中银通商务支付有限公司(48080000)--预付费卡"
                },
                {
                    "bin": "921000",
                    "bankName": "中银通支付(48080001)-安徽合肥通卡-预付费卡"
                },
                {
                    "bin": "620038",
                    "bankName": "中银通商务支付有限公司(48100000)-铁路卡-预付费卡"
                },
                {
                    "bin": "622812",
                    "bankName": "中国邮政储蓄银行信用卡中心(61000000)-银联标准白金卡-贷记卡"
                },
                {
                    "bin": "622810",
                    "bankName": "中国邮政储蓄银行信用卡中心(61000000)-银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "622811",
                    "bankName": "中国邮政储蓄银行信用卡中心(61000000)-银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "628310",
                    "bankName": "中国邮政储蓄银行信用卡中心(61000000)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "625919",
                    "bankName": "中国邮政储蓄银行信用卡中心(61000000)-上海购物信用卡-贷记卡"
                },
                {
                    "bin": "376968",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡银联卡-贷记卡"
                },
                {
                    "bin": "376969",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡银联卡-贷记卡"
                },
                {
                    "bin": "400360",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "403391",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "403392",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "376966",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡银联卡-贷记卡"
                },
                {
                    "bin": "404158",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "404159",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "404171",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "404172",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "404173",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "404174",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "404157",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "433667",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "433668",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "433669",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "514906",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "403393",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "520108",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "433666",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "558916",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "622678",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "622679",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "622680",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "622688",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "622689",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "628206",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联公务卡-贷记卡"
                },
                {
                    "bin": "556617",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "628209",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联公务卡-贷记卡"
                },
                {
                    "bin": "518212",
                    "bankName": "中信银行信用卡中心(63020000)-中信贷记卡-贷记卡"
                },
                {
                    "bin": "628208",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联公务卡-贷记卡"
                },
                {
                    "bin": "356390",
                    "bankName": "中信银行信用卡中心(63020000)-中信JCB美元卡-贷记卡"
                },
                {
                    "bin": "356391",
                    "bankName": "中信银行信用卡中心(63020000)-中信JCB美元卡-贷记卡"
                },
                {
                    "bin": "356392",
                    "bankName": "中信银行信用卡中心(63020000)-中信JCB美元卡-贷记卡"
                },
                {
                    "bin": "622916",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联IC卡普卡-贷记卡"
                },
                {
                    "bin": "622918",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联IC卡金卡-贷记卡"
                },
                {
                    "bin": "622919",
                    "bankName": "中信银行信用卡中心(63020000)-中信银联IC卡白金卡-贷记卡"
                },
                {
                    "bin": "628370",
                    "bankName": "中信银行信用卡中心(63020000)-公务IC普卡-贷记卡"
                },
                {
                    "bin": "628371",
                    "bankName": "中信银行信用卡中心(63020000)-公务IC金卡-贷记卡"
                },
                {
                    "bin": "628372",
                    "bankName": "中信银行信用卡中心(63020000)-公务IC白金卡-贷记卡"
                },
                {
                    "bin": "622657",
                    "bankName": "光大银行(63030000)-存贷合一白金卡-贷记卡"
                },
                {
                    "bin": "622685",
                    "bankName": "光大银行(63030000)-存贷合一卡普卡-贷记卡"
                },
                {
                    "bin": "622659",
                    "bankName": "光大银行(63030000)-理财信用卡-贷记卡"
                },
                {
                    "bin": "622687",
                    "bankName": "中国光大银行(63030000)-存贷合一钻石卡-贷记卡"
                },
                {
                    "bin": "625978",
                    "bankName": "中国光大银行(63030000)-存贷合一IC卡-贷记卡"
                },
                {
                    "bin": "625980",
                    "bankName": "中国光大银行(63030000)-存贷合一IC卡-贷记卡"
                },
                {
                    "bin": "625981",
                    "bankName": "中国光大银行(63030000)-存贷合一IC卡-贷记卡"
                },
                {
                    "bin": "625979",
                    "bankName": "中国光大银行(63030000)-存贷合一IC卡-贷记卡"
                },
                {
                    "bin": "356839",
                    "bankName": "中国光大银行(63030000)-阳光商旅信用卡-贷记卡"
                },
                {
                    "bin": "356840",
                    "bankName": "中国光大银行(63030000)-阳光商旅信用卡-贷记卡"
                },
                {
                    "bin": "406252",
                    "bankName": "中国光大银行(63030000)-阳光信用卡(银联-贷记卡"
                },
                {
                    "bin": "406254",
                    "bankName": "中国光大银行(63030000)-阳光信用卡(银联-贷记卡"
                },
                {
                    "bin": "425862",
                    "bankName": "中国光大银行(63030000)-阳光商旅信用卡-贷记卡"
                },
                {
                    "bin": "481699",
                    "bankName": "中国光大银行(63030000)-阳光白金信用卡-贷记卡"
                },
                {
                    "bin": "524090",
                    "bankName": "中国光大银行(63030000)-安邦俱乐部信用卡-贷记卡"
                },
                {
                    "bin": "543159",
                    "bankName": "中国光大银行(63030000)-足球锦标赛纪念卡-贷记卡"
                },
                {
                    "bin": "622161",
                    "bankName": "中国光大银行(63030000)-光大银行联名公务卡-贷记卡"
                },
                {
                    "bin": "622570",
                    "bankName": "中国光大银行(63030000)-积分卡-贷记卡"
                },
                {
                    "bin": "622650",
                    "bankName": "中国光大银行(63030000)-炎黄卡普卡-贷记卡"
                },
                {
                    "bin": "622655",
                    "bankName": "中国光大银行(63030000)-炎黄卡白金卡-贷记卡"
                },
                {
                    "bin": "622658",
                    "bankName": "中国光大银行(63030000)-炎黄卡金卡-贷记卡"
                },
                {
                    "bin": "625975",
                    "bankName": "中国光大银行(63030000)-贷记IC卡-贷记卡"
                },
                {
                    "bin": "625977",
                    "bankName": "中国光大银行(63030000)-贷记IC卡-贷记卡"
                },
                {
                    "bin": "628201",
                    "bankName": "中国光大银行(63030000)-银联公务卡-贷记卡"
                },
                {
                    "bin": "628202",
                    "bankName": "中国光大银行(63030000)-银联公务卡-贷记卡"
                },
                {
                    "bin": "625976",
                    "bankName": "中国光大银行(63030000)-贷记IC卡-贷记卡"
                },
                {
                    "bin": "625339",
                    "bankName": "中国光大银行(63030000)-银联贷记IC旅游卡-贷记卡"
                },
                {
                    "bin": "622801",
                    "bankName": "中国光大银行(63030000)-贷记IC卡-贷记卡"
                },
                {
                    "bin": "523959",
                    "bankName": "华夏银行(63040000)-华夏万事达信用卡-贷记卡"
                },
                {
                    "bin": "528709",
                    "bankName": "华夏银行(63040000)-万事达信用卡金卡-贷记卡"
                },
                {
                    "bin": "539867",
                    "bankName": "华夏银行(63040000)-万事达普卡-贷记卡"
                },
                {
                    "bin": "539868",
                    "bankName": "华夏银行(63040000)-万事达普卡-贷记卡"
                },
                {
                    "bin": "622637",
                    "bankName": "华夏银行(63040000)-华夏信用卡金卡-贷记卡"
                },
                {
                    "bin": "622638",
                    "bankName": "华夏银行(63040000)-华夏白金卡-贷记卡"
                },
                {
                    "bin": "628318",
                    "bankName": "华夏银行(63040000)-华夏公务信用卡-贷记卡"
                },
                {
                    "bin": "528708",
                    "bankName": "华夏银行(63040000)-万事达信用卡金卡-贷记卡"
                },
                {
                    "bin": "622636",
                    "bankName": "华夏银行(63040000)-华夏信用卡普卡-贷记卡"
                },
                {
                    "bin": "625967",
                    "bankName": "华夏银行(63040000)-华夏标准金融IC信用卡-贷记卡"
                },
                {
                    "bin": "625968",
                    "bankName": "华夏银行(63040000)-华夏标准金融IC信用卡-贷记卡"
                },
                {
                    "bin": "625969",
                    "bankName": "华夏银行(63040000)-华夏标准金融IC信用卡-贷记卡"
                },
                {
                    "bin": "625971",
                    "bankName": "浦发银行信用卡中心(63100000)-移动浦发借贷合一联名卡-贷记卡"
                },
                {
                    "bin": "625970",
                    "bankName": "浦发银行信用卡中心(63100000)-贷记卡-贷记卡"
                },
                {
                    "bin": "377187",
                    "bankName": "浦发银行信用卡中心(63100000)-浦发私人银行信用卡-贷记卡"
                },
                {
                    "bin": "625831",
                    "bankName": "浦发银行信用卡中心(63100000)-中国移动浦发银行联名手机卡-贷记卡"
                },
                {
                    "bin": "622265",
                    "bankName": "东亚银行(中国)有限公司(63200000)-东亚银行普卡-贷记卡"
                },
                {
                    "bin": "622266",
                    "bankName": "东亚银行(中国)有限公司(63200000)-东亚银行金卡-贷记卡"
                },
                {
                    "bin": "625972",
                    "bankName": "东亚银行(中国)有限公司(63200000)-百家网点纪念版IC贷记卡-贷记卡"
                },
                {
                    "bin": "625973",
                    "bankName": "东亚银行(中国)有限公司(63200000)-百家网点纪念版IC贷记卡-贷记卡"
                },
                {
                    "bin": "625093",
                    "bankName": "南洋商业银行(63320000)-银联个人白金信用卡-贷记卡"
                },
                {
                    "bin": "625095",
                    "bankName": "南洋商业银行(63320000)-银联商务白金信用卡-贷记卡"
                },
                {
                    "bin": "522001",
                    "bankName": "北京银行(64031000)-万事达双币金卡-贷记卡"
                },
                {
                    "bin": "622163",
                    "bankName": "北京银行(64031000)-银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "622853",
                    "bankName": "北京银行(64031000)-银联标准贷记卡-贷记卡"
                },
                {
                    "bin": "628203",
                    "bankName": "北京银行(64031000)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "622851",
                    "bankName": "北京银行(64031000)-北京银行中荷人寿联名卡-贷记卡"
                },
                {
                    "bin": "622852",
                    "bankName": "北京银行(64031000)-尊尚白金卡-贷记卡"
                },
                {
                    "bin": "625903",
                    "bankName": "宁波银行(64083300)-汇通贷记卡-贷记卡"
                },
                {
                    "bin": "622282",
                    "bankName": "宁波银行(64083300)-汇通贷记卡-贷记卡"
                },
                {
                    "bin": "622318",
                    "bankName": "宁波银行(64083300)-汇通卡(银联卡)-贷记卡"
                },
                {
                    "bin": "622778",
                    "bankName": "宁波银行(64083300)-汇通白金卡-贷记卡"
                },
                {
                    "bin": "628207",
                    "bankName": "宁波银行(64083300)-汇通公务卡-贷记卡"
                },
                {
                    "bin": "628379",
                    "bankName": "齐鲁银行股份有限公司(64094510)-泉城公务卡-贷记卡"
                },
                {
                    "bin": "625050",
                    "bankName": "广州银行股份有限公司(64135810)-广州银行信用卡-贷记卡"
                },
                {
                    "bin": "625836",
                    "bankName": "广州银行股份有限公司(64135810)-贷记IC卡-贷记卡"
                },
                {
                    "bin": "628367",
                    "bankName": "广州银行股份有限公司(64135810)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "628333",
                    "bankName": "龙江银行股份有限公司(64162640)-公务卡-贷记卡"
                },
                {
                    "bin": "622921",
                    "bankName": "河北银行股份有限公司(64221210)-如意贷记卡-贷记卡"
                },
                {
                    "bin": "628321",
                    "bankName": "河北银行股份有限公司(64221210)-如意贷记卡-贷记卡"
                },
                {
                    "bin": "625598",
                    "bankName": "河北银行股份有限公司(64221210)-福农卡-贷记卡"
                },
                {
                    "bin": "622286",
                    "bankName": "杭州市商业银行(64233311)-西湖贷记卡-贷记卡"
                },
                {
                    "bin": "628236",
                    "bankName": "杭州市商业银行(64233311)-西湖贷记卡-贷记卡"
                },
                {
                    "bin": "625800",
                    "bankName": "杭州市商业银行(64233311)-西湖信用卡-贷记卡"
                },
                {
                    "bin": "621777",
                    "bankName": "南京银行(64243010)-借记IC卡-借记卡"
                },
                {
                    "bin": "628228",
                    "bankName": "成都市商业银行(64296510)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "622813",
                    "bankName": "成都市商业银行(64296510)-银联标准卡-贷记卡"
                },
                {
                    "bin": "622818",
                    "bankName": "成都市商业银行(64296510)-银联标准卡-贷记卡"
                },
                {
                    "bin": "628359",
                    "bankName": "临商银行(64314730)-公务卡-贷记卡"
                },
                {
                    "bin": "628270",
                    "bankName": "珠海华润银行(64375850)-公务信用卡-贷记卡"
                },
                {
                    "bin": "628311",
                    "bankName": "齐商银行(64384530)-金达公务卡-贷记卡"
                },
                {
                    "bin": "628261",
                    "bankName": "锦州银行(64392270)-公务卡-贷记卡"
                },
                {
                    "bin": "628251",
                    "bankName": "徽商银行(64403600)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "622651",
                    "bankName": "徽商银行(64403600)-贷记卡-贷记卡"
                },
                {
                    "bin": "625828",
                    "bankName": "徽商银行(64403600)-贷记IC卡-贷记卡"
                },
                {
                    "bin": "625652",
                    "bankName": "徽商银行(64403600)-公司卡-贷记卡"
                },
                {
                    "bin": "625700",
                    "bankName": "徽商银行(64403600)-采购卡-贷记卡"
                },
                {
                    "bin": "622613",
                    "bankName": "重庆银行股份有限公司(64416910)-银联标准卡-贷记卡"
                },
                {
                    "bin": "628220",
                    "bankName": "重庆银行股份有限公司(64416910)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "622809",
                    "bankName": "哈尔滨商行(64422610)-丁香贷记卡-贷记卡"
                },
                {
                    "bin": "628224",
                    "bankName": "哈尔滨商行(64422610)-哈尔滨银行公务卡-贷记卡"
                },
                {
                    "bin": "625119",
                    "bankName": "哈尔滨银行(64422610)-联名卡-贷记卡"
                },
                {
                    "bin": "625577",
                    "bankName": "哈尔滨银行(64422610)-福农准贷记卡-准贷记卡"
                },
                {
                    "bin": "625952",
                    "bankName": "哈尔滨银行(64422610)-贷记IC卡-贷记卡"
                },
                {
                    "bin": "621752",
                    "bankName": "哈尔滨银行(64422611)-金融IC借记卡-借记卡"
                },
                {
                    "bin": "628213",
                    "bankName": "贵阳银行股份有限公司(64437010)-甲秀公务卡-贷记卡"
                },
                {
                    "bin": "628263",
                    "bankName": "兰州银行(64478210)-敦煌公务卡-贷记卡"
                },
                {
                    "bin": "628305",
                    "bankName": "南昌银行(64484210)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "628239",
                    "bankName": "青岛银行(64504520)-公务卡-贷记卡"
                },
                {
                    "bin": "628238",
                    "bankName": "九江银行股份有限公司(64544240)-庐山公务卡-贷记卡"
                },
                {
                    "bin": "628257",
                    "bankName": "日照银行(64554770)-黄海公务卡-贷记卡"
                },
                {
                    "bin": "622817",
                    "bankName": "青海银行(64588510)-三江贷记卡-贷记卡"
                },
                {
                    "bin": "628287",
                    "bankName": "青海银行(64588510)-三江贷记卡(公务卡)-贷记卡"
                },
                {
                    "bin": "625959",
                    "bankName": "青海银行(64588510)-三江贷记IC卡-贷记卡"
                },
                {
                    "bin": "62536601",
                    "bankName": "青海银行(64588510)-中国旅游卡-贷记卡"
                },
                {
                    "bin": "628391",
                    "bankName": "潍坊银行(64624580)-鸢都公务卡-贷记卡"
                },
                {
                    "bin": "628233",
                    "bankName": "赣州银行股份有限公司(64634280)-长征公务卡-贷记卡"
                },
                {
                    "bin": "628231",
                    "bankName": "富滇银行(64667310)-富滇公务卡-贷记卡"
                },
                {
                    "bin": "628275",
                    "bankName": "浙江泰隆商业银行(64733450)-泰隆公务卡(单位卡)-贷记卡"
                },
                {
                    "bin": "622565",
                    "bankName": "浙江泰隆商业银行(64733450)-泰隆尊尚白金卡、钻石卡-贷记卡"
                },
                {
                    "bin": "622287",
                    "bankName": "浙江泰隆商业银行(64733450)-泰隆信用卡-贷记卡"
                },
                {
                    "bin": "622717",
                    "bankName": "浙江泰隆商业银行(64733450)-融易通-准贷记卡"
                },
                {
                    "bin": "628252",
                    "bankName": "内蒙古银行(64741910)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "628306",
                    "bankName": "湖州银行(64753360)-公务卡-贷记卡"
                },
                {
                    "bin": "628227",
                    "bankName": "广西北部湾银行(64786110)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "623001",
                    "bankName": "广西北部湾银行(64786110)-IC借记卡-借记卡"
                },
                {
                    "bin": "628234",
                    "bankName": "威海市商业银行(64814650)-通达公务卡-贷记卡"
                },
                {
                    "bin": "621727",
                    "bankName": "广东南粤银行股份有限公司(64895910)-湛江市民卡-借记卡"
                },
                {
                    "bin": "623128",
                    "bankName": "广东南粤银行股份有限公司(64895910)----借记卡"
                },
                {
                    "bin": "628237",
                    "bankName": "广东南粤银行(64895919)-公务卡-贷记卡"
                },
                {
                    "bin": "628219",
                    "bankName": "桂林银行(64916170)-漓江公务卡-贷记卡"
                },
                {
                    "bin": "621456",
                    "bankName": "桂林银行(64916170)-漓江卡-借记卡"
                },
                {
                    "bin": "621562",
                    "bankName": "桂林银行(64916170)-福农IC卡-借记卡"
                },
                {
                    "bin": "622270",
                    "bankName": "龙江银行股份有限公司(64922690)-玉兔贷记卡-贷记卡"
                },
                {
                    "bin": "628368",
                    "bankName": "龙江银行股份有限公司(64922690)-玉兔贷记卡(公务卡)-贷记卡"
                },
                {
                    "bin": "625588",
                    "bankName": "龙江银行(64922690)-福农准贷记卡-准贷记卡"
                },
                {
                    "bin": "625090",
                    "bankName": "龙江银行股份有限公司(64922690)-联名贷记卡-贷记卡"
                },
                {
                    "bin": "62536602",
                    "bankName": "龙江银行股份有限公司(64922690)-中国旅游卡-贷记卡"
                },
                {
                    "bin": "628293",
                    "bankName": "柳州银行(64956140)-龙城公务卡-贷记卡"
                },
                {
                    "bin": "622611",
                    "bankName": "上海农商银行贷记卡(65012900)-鑫卡-贷记卡"
                },
                {
                    "bin": "622722",
                    "bankName": "上海农商银行贷记卡(65012900)-商务卡-贷记卡"
                },
                {
                    "bin": "628211",
                    "bankName": "上海农商银行贷记卡(65012900)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "625500",
                    "bankName": "上海农商银行贷记卡(65012900)-福农卡-准贷记卡"
                },
                {
                    "bin": "625989",
                    "bankName": "上海农商银行贷记卡(65012900)-鑫通卡-贷记卡"
                },
                {
                    "bin": "625080",
                    "bankName": "广州农村商业银行(65055810)-太阳信用卡-贷记卡"
                },
                {
                    "bin": "628235",
                    "bankName": "广州农村商业银行(65055810)-公务卡-贷记卡"
                },
                {
                    "bin": "628322",
                    "bankName": "佛山顺德农村商业银行(65085883)-恒通贷记卡（公务卡）-贷记卡"
                },
                {
                    "bin": "625088",
                    "bankName": "佛山顺德农村商业银行(65085883)-恒通贷记卡-贷记卡"
                },
                {
                    "bin": "622469",
                    "bankName": "云南省农村信用社(65097300)-金碧贷记卡-贷记卡"
                },
                {
                    "bin": "628307",
                    "bankName": "云南省农村信用社(65097300)-金碧公务卡-贷记卡"
                },
                {
                    "bin": "628229",
                    "bankName": "承德银行(65131410)-热河公务卡-贷记卡"
                },
                {
                    "bin": "628397",
                    "bankName": "德州银行(65154680)-长河公务卡-贷记卡"
                },
                {
                    "bin": "622802",
                    "bankName": "福建省农村信用社联合社(65173900)-万通贷记卡-贷记卡"
                },
                {
                    "bin": "622290",
                    "bankName": "福建省农村信用社联合社(65173900)-福建海峡旅游卡-贷记卡"
                },
                {
                    "bin": "628232",
                    "bankName": "福建省农村信用社联合社(65173900)-万通贷记卡-贷记卡"
                },
                {
                    "bin": "625128",
                    "bankName": "福建省农村信用社联合社(65173900)-福万通贷记卡-贷记卡"
                },
                {
                    "bin": "622829",
                    "bankName": "天津农村商业银行(65191100)-吉祥信用卡-贷记卡"
                },
                {
                    "bin": "625819",
                    "bankName": "天津农村商业银行(65191100)-贷记IC卡-贷记卡"
                },
                {
                    "bin": "628301",
                    "bankName": "天津农村商业银行(65191100)-吉祥信用卡-贷记卡"
                },
                {
                    "bin": "622808",
                    "bankName": "成都农村商业银行股份有限公司(65226510)-天府贷记卡-贷记卡"
                },
                {
                    "bin": "628308",
                    "bankName": "成都农村商业银行股份有限公司(65226510)-天府公务卡-贷记卡"
                },
                {
                    "bin": "623088",
                    "bankName": "成都农村商业银行股份有限公司(65226510)-天府借记卡-借记卡"
                },
                {
                    "bin": "622815",
                    "bankName": "江苏省农村信用社联合社(65243000)-圆鼎贷记卡-贷记卡"
                },
                {
                    "bin": "622816",
                    "bankName": "江苏省农村信用社联合社(65243000)-圆鼎贷记卡-贷记卡"
                },
                {
                    "bin": "628226",
                    "bankName": "江苏省农村信用社联合社(65243000)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "628223",
                    "bankName": "上饶银行(65264330)-三清山公务卡-贷记卡"
                },
                {
                    "bin": "621416",
                    "bankName": "上饶银行(65264331)-三清山IC卡-借记卡"
                },
                {
                    "bin": "628217",
                    "bankName": "东营银行(65274550)-财政公务卡-贷记卡"
                },
                {
                    "bin": "628382",
                    "bankName": "临汾市尧都区农村信用合作联社(65341770)-天河贷记公务卡-贷记卡"
                },
                {
                    "bin": "625158",
                    "bankName": "临汾市尧都区农村信用合作联社(65341770)-天河贷记卡-贷记卡"
                },
                {
                    "bin": "622569",
                    "bankName": "无锡农村商业银行(65373020)-金阿福贷记卡-贷记卡"
                },
                {
                    "bin": "628369",
                    "bankName": "无锡农村商业银行(65373020)-银联标准公务卡-贷记卡"
                },
                {
                    "bin": "628386",
                    "bankName": "湖南农村信用社联合社(65385500)-福祥公务卡-贷记卡"
                },
                {
                    "bin": "625519",
                    "bankName": "湖南农信(65385500)-福农卡-贷记卡"
                },
                {
                    "bin": "625506",
                    "bankName": "湖南农信(65385500)-福祥贷记卡（福农卡）-贷记卡"
                },
                {
                    "bin": "622906",
                    "bankName": "湖南农村信用社联合社(65385500)-福祥贷记卡-贷记卡"
                },
                {
                    "bin": "628392",
                    "bankName": "江西省农村信用社联合社(65394200)-百福公务卡-贷记卡"
                },
                {
                    "bin": "623092",
                    "bankName": "江西省农村信用社联合社(65394200)-借记IC卡-借记卡"
                },
                {
                    "bin": "621778",
                    "bankName": "安徽省农村信用社(65473600)-金农卡-借记卡"
                },
                {
                    "bin": "620528",
                    "bankName": "邢台银行(65541310)-金牛市民卡-借记卡"
                },
                {
                    "bin": "621748",
                    "bankName": "商丘市商业银行(65675060)-百汇卡-借记卡"
                },
                {
                    "bin": "628271",
                    "bankName": "商丘市商业银行(65675061)-公务卡-贷记卡"
                },
                {
                    "bin": "628328",
                    "bankName": "华融湘江银行(65705500)-华融湘江银行华融公务卡普卡-贷记卡"
                },
                {
                    "bin": "625829",
                    "bankName": "Bank of China(Malaysia)(99900458)-贷记卡-贷记卡"
                },
                {
                    "bin": "625943",
                    "bankName": "Bank of China(Malaysia)(99900458)-贷记卡-贷记卡"
                },
                {
                    "bin": "622790",
                    "bankName": "中行新加坡分行(99900702)-Great Wall Platinum-贷记卡"
                },
                {
                    "bin": "623251",
                    "bankName": "建设银行-单位结算卡-借记卡"
                },
                {
                    "bin": "623165",
                    "bankName": "西安银行股份有限公司-金丝路借记卡-借记卡"
                },
                {
                    "bin": "628351",
                    "bankName": "玉溪市商业银行-红塔卡-贷记卡"
                },
                {
                    "bin": "621635109",
                    "bankName": "合浦国民村镇银行--借记卡"
                },
                {
                    "bin": "621635108",
                    "bankName": "昌吉国民村镇银行--借记卡"
                },
                {
                    "bin": "62163121",
                    "bankName": "常宁珠江村镇银行-珠江太阳卡-借记卡"
                },
                {
                    "bin": "62316904",
                    "bankName": "枞阳泰业村镇银行-枞阳泰业村镇银行泰业卡-借记卡"
                },
                {
                    "bin": "62316905",
                    "bankName": "东源泰业村镇银行-东源泰业村镇银行泰业卡-借记卡"
                },
                {
                    "bin": "62316902",
                    "bankName": "东莞长安村镇银行-长银卡-借记卡"
                },
                {
                    "bin": "62316903",
                    "bankName": "灵山泰业村镇银行-灵山泰业村镇银行泰业卡-借记卡"
                },
                {
                    "bin": "62316901",
                    "bankName": "开县泰业村镇银行-开县泰业村镇银行泰业卡-借记卡"
                },
                {
                    "bin": "62316906",
                    "bankName": "东莞厚街华业村镇银行-易事通卡-借记卡"
                },
                {
                    "bin": "62361026",
                    "bankName": "西安高陵阳光村镇银行-金丝路阳光卡-借记卡"
                },
                {
                    "bin": "62361025",
                    "bankName": "陕西洛南阳光村镇银行-金丝路阳光卡-借记卡"
                },
                {
                    "bin": "62168305",
                    "bankName": "江苏溧水民丰村镇银行-金鼎卡-借记卡"
                },
                {
                    "bin": "62335101",
                    "bankName": "CJSC “Spitamen Bank”(30030762)-classic-借记卡"
                },
                {
                    "bin": "62335102",
                    "bankName": "CJSC “Spitamen Bank”(30030762)-gold-借记卡"
                },
                {
                    "bin": "62335103",
                    "bankName": "CJSC “Spitamen Bank”(30030762)-platinum-借记卡"
                },
                {
                    "bin": "62335104",
                    "bankName": "CJSC “Spitamen Bank”(30030762)-diamond-借记卡"
                },
                {
                    "bin": "62335105",
                    "bankName": "CJSC “Spitamen Bank”(30030762)-classic-借记卡"
                },
                {
                    "bin": "62335106",
                    "bankName": "CJSC “Spitamen Bank”(30030762)-gold-借记卡"
                },
                {
                    "bin": "62335107",
                    "bankName": "CJSC “Spitamen Bank”(30030762)-platinum-借记卡"
                },
                {
                    "bin": "62335108",
                    "bankName": "CJSC “Spitamen Bank”(30030762)-diamond-借记卡"
                }
            ];
            /*api.get('url',{}).success(function(res){
             $scope.bankData = res;
             })*/
            for (var i in $scope.bankData) {
                if ($scope.formData.card_no.indexOf($scope.bankData[i].bin) != -1) {
                    $scope.bankData[i].bankName.split('-');
                    $scope.formData.name = $scope.bankData[i].bankName.split('-')[0] + '-' + $scope.bankData[i].bankName.split('-')[2];
                    break;
                }
            }
        }

        $scope.saveData = function () {
            // 验证
            if (!$scope.formData.card_no) {
                ar.saveDataAlert($ionicPopup, '请输入银行卡号');
                return false;
            }
            if (!$scope.formData.name) {
                ar.saveDataAlert($ionicPopup, '请核对银行卡号是否正确');
                return false;
            }
            // 保存
            api.save('url', {}).success(function (res) {
                if (res.status > 0) {
                    $location.url($location.$$search.tempUrl);
                } else {
                    ar.saveDataAlert($ionicPopup, res.msg);
                }
            })
        }
    }]);

    // 我的约会
    module.controller("member.rendezvous", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

    }]);

    // 我的约会-发布约会
    module.controller("member.rendezvous_add", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$location', function (api, $scope, $timeout, $ionicPopup, $ionicModal, $location) {

        $scope.formData = [];
        if ($location.search().id) {
            api.list('/wap/rendezvous/get-rendezvous-info', {id: $location.search().id}).success(function (res) {
                $scope.formData = res.data;
                $scope.formData.theme = parseInt($scope.formData.theme);
            });
        }

        // 跳转-返回
        $scope.jump = function () {
            if ($location.$$search.tempUrl) {    // 因为只有2种情况，所以只需要判断是否有值
                $location.url('/main/rendezvous');
            } else {
                $location.url('/main/member/rendezvous');
            }
        }


        // 约会主题
        $ionicModal.fromTemplateUrl('themeModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.themeModal = modal;
        });
        $scope.openThemeModal = function () {
            $scope.themeModal.show();
        };
        $scope.closeThemeModal = function () {
            $scope.themeModal.hide();
        };

        // 约会标题
        $ionicModal.fromTemplateUrl('themeTitleModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.themeTitleModal = modal;
        });
        $scope.openThemeTitleModal = function () {
            $scope.themeTitleModal.show();
        };
        $scope.closeThemeTitleModal = function () {
            $scope.themeTitleModal.hide();
        };

        // 性别限制
        $ionicModal.fromTemplateUrl('sexModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.sexModal = modal;
        });
        $scope.openSexModal = function () {
            $scope.sexModal.show();
        };
        $scope.closeSexModal = function () {
            $scope.sexModal.hide();
        };

        // 我的出发地
        $ionicModal.fromTemplateUrl('fromModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.fromModal = modal;
        });
        $scope.openFromModal = function () {
            $scope.fromModal.show();
        };
        $scope.closeFromModal = function () {
            $scope.fromModal.hide();
        };


        // 目的地
        $ionicModal.fromTemplateUrl('destinationModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.destinationModal = modal;
        });
        $scope.openDestinationModal = function () {
            $scope.destinationModal.show();
        };
        $scope.closeDestinationModal = function () {
            $scope.destinationModal.hide();
        };

        // 约会时间
        $ionicModal.fromTemplateUrl('dateModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.dateModal = modal;
        });
        $scope.openDateModal = function () {
            $scope.dateModal.show();
        };
        $scope.closeDateModal = function () {
            $scope.dateModal.hide();
        };

        // 费用说明
        $ionicModal.fromTemplateUrl('moneyModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.moneyModal = modal;
        });
        $scope.openMoneyModal = function () {
            $scope.moneyModal.show();
        };
        $scope.closeMoneyModal = function () {
            $scope.moneyModal.hide();
        };

        // 对约伴的要求
        $ionicModal.fromTemplateUrl('requirementModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.requirementModal = modal;
        });
        $scope.openRequirementModal = function () {
            $scope.requirementModal.show();
        };
        $scope.closeRequirementModal = function () {
            $scope.requirementModal.hide();
        };

        // 默认选项
        $scope.formData.sex = "0";

        $scope.formData.themeList = [
            {id: 1, title: '娱乐'},
            {id: 2, title: '美食'},
            {id: 3, title: '旅游'},
            {id: 4, title: '运动健身'},
            {id: -1, title: '其他'},
        ]

        // 保存，发布
        $scope.saveData = function () {
            $scope.formData.rendezvous_time = ar.currentDate;
            if (!$scope.formData.theme) {
                $ionicPopup.alert({title: '请选择约会主题'});
                return false;
            }
            if (!$scope.formData.title) {
                $ionicPopup.alert({title: '请填写约会标题'});
                return false;
            }

            if (!$scope.formData.destination) {
                $ionicPopup.alert({title: '请填写目的地'});
                return false;
            }
            if (!$scope.formData.rendezvous_time) {
                $ionicPopup.alert({title: '请填写出发时间'});
                return false;
            }
            if (!$scope.formData.fee_des) {
                $ionicPopup.alert({title: '请选择费用说明'});
                return false;
            }

            api.save('/wap/rendezvous/release', $scope.formData).success(function (res) {
                if (res.data) {
                    $ionicPopup.alert({title: '发布成功！'});
                    window.location.hash = '#/main/member/rendezvous_put';
                }
            })
        }

    }]);

    // 我的约会-发布约会-约会主题
    module.controller("member.rendezvous_theme", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

        $scope.selTheme = function () {

            $scope.closeThemeModal();
        }

    }]);

    // 我的约会-发布约会-约会标题
    module.controller("member.rendezvous_themeTitle", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

        $scope.save = function () {
            $scope.closeThemeTitleModal();
            console.info($scope.formData.themeTitle, $scope.formData.content);
        }

    }]);

    // 我的约会-发布约会-性别限制
    module.controller("member.rendezvous_sex", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.selSex = function () {
            $scope.closeSexModal();
            console.log($scope.formData.sex);
        }
    }]);

    // 我的约会-发布约会-我的出发地
    module.controller("member.rendezvous_from", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.saveFrom = function () {
            $scope.closeFromModal();
            console.log($scope.formData.from);
        }
    }]);

    // 我的约会-发布约会-目的地
    module.controller("member.rendezvous_destination", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.saveDestination = function () {
            $scope.closeDestinationModal();
            console.log($scope.formData.destination);
        }
    }]);

    // 我的约会-发布约会-出发时间
    module.controller("member.rendezvous_date", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.saveDate = function () {
            $scope.closeDateModal();
            console.log($scope.formData.rendezvous_time);
        }
    }]);

    // 我的约会-发布约会-费用说明
    module.controller("member.rendezvous_money", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {
        $scope.selMoney = function () {
            $scope.closeMoneyModal();
            console.log($scope.formData.fee_des);
        }
    }]);

    // 我的约会-发布约会-对约伴的要求
    module.controller("member.rendezvous_requirement", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

        $scope.userSex = 0;  // 用户性别 默认女0

        $scope.labelList = config_infoData.label;

        $scope.lab = [];

        $scope.nothing = false;  // 不限


        // 添加标签
        $scope.addLabel = function (value) {
            if ($scope.lab.indexOf(value) == -1) {  // 标签不存在才允许添加
                $scope.lab.push(value);
            }
            if (value == '不限') {
                $scope.lab = [];
                $scope.lab.push(value);
                $scope.nothing = true;
            }
        }

        // 删除标签
        $scope.removeLabel = function (index, value) {
            if (value == '不限') {
                $scope.nothing = false;
            }
            $scope.lab.splice(index, 1);
        }

        $scope.saveRequirement = function () {
            $scope.closeRequirementModal();
            $scope.formData.we_want = $scope.lab.join(',');
            console.log($scope.formData.we_want);
        }
    }]);


    // 我的约会-我发布的约会
    module.controller("member.rendezvous_put", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicActionSheet', '$location', '$ionicScrollDelegate', function (api, $scope, $timeout, $ionicPopup, $ionicActionSheet, $location, $ionicScrollDelegate) {

        $scope.formData = [];
        $scope.dateList = [];
        $scope.putList = [];
        $scope.formData.pageNum = 0;
        // 获取我发布的约会列表
        var getPutList = function (date, pageNum) {
            var formData = [];
            formData.user_id = ar.getCookie('bhy_user_id');
            formData.pageNum = pageNum + 1;
            formData.date = date;
            $scope.formData.date = date;
            $scope.formData.pageNum = pageNum + 1;
            api.list('/wap/rendezvous/list', formData).success(function (res) {
                res.data.length < 10 ? $scope.isMore = false : $scope.isMore = true;
                for (var i in res.data) {
                    var label = res.data[i].we_want.split(',');
                    res.data[i].label = [];
                    res.data[i].label = label;
                    $scope.putList.push(res.data[i]);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
        // 修改约会状态
        var upStatus = function (id, status) {
            var formData = [];
            formData.id = id;
            formData.status = status;
            api.save('/wap/rendezvous/update-status', formData).success(function (res) {
            });
        }
        // 只能查看最近半年的数据
        for (var i = 0; i < 6; i++) {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - i);
            var _title = dt.getFullYear() + '年' + (dt.getMonth() + 1) + '月';
            var _time = dt.getFullYear() + '-' + (dt.getMonth() + 1);
            $scope.dateList.push({title: _title, value: dt.toLocaleString(), time: _time});
        }
        $scope.dateTitle = $scope.dateList[0].title; // 默认当前月
        var arr = $scope.dateList[0].time.split('-');
        $scope.formData.year = arr[0];
        $scope.formData.month = arr[1] < 10 ? '0' + arr[1] : arr[1];
        $scope.datePicker = false;
        $scope.showDate = function () {
            $scope.datePicker = !$scope.datePicker;
        }

        // 选择日期改变样式、并查询数据
        $scope.seletedDate = function (title, time) {
            $scope.dateTitle = title;
            var arr = time.split('-');
            $scope.formData.year = arr[0];
            $scope.formData.month = arr[1] < 10 ? '0' + arr[1] : arr[1];
            getPutList(time, 0);
            $scope.putList = []; // 根据日期查询的数据
            $scope.datePicker = false;
        }

        $scope.isMore = true;

        // 加载更多
        $scope.loadMore = function () {
            getPutList($scope.formData.date, $scope.formData.pageNum);
        }

        // 是否还有更多
        $scope.moreDataCanBeLoaded = function () {
            return $scope.isMore;
        }

        // 操作
        $scope.showhandle = function (id, itemIndex) {
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    {text: '关闭'},
                    {text: '修改'}
                ],
                destructiveText: '删除',
                titleText: '操作',
                cancelText: '取消',
                cancel: function () {
                    // add cancel code..
                },
                destructiveButtonClicked: function () {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '确定删除此条记录？删除后不可恢复。',
                        template: false,
                        cancelText: '点错了',
                        okText: '确定'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            // 删除
                            upStatus($scope.putList[itemIndex].id, 0);
                            $scope.putList.splice(itemIndex, 1);
                            hideSheet();
                        } else {
                            return false;
                        }
                    });
                },
                buttonClicked: function (index) {
                    if (index == 0) {  // 关闭约会
                        $scope.putList[itemIndex].status = "3";
                        upStatus($scope.putList[itemIndex].id, 3);
                        hideSheet();
                    }
                    if (index == 1) { // 修改
                        $location.url('/main/member/rendezvous_add?id=' + $scope.putList[itemIndex].id);
                    }
                }
            });
        }

        // 跳转-参与的人
        $scope.involved = function (id, theme, title) {
            $location.url('/main/member/rendezvous_involved?id=' + id + '&theme=' + theme + '&title=' + title);
        }

        $scope.openTxt = false;
        // 展开全文
        $scope.openText = function ($event) {
            $event.stopPropagation();
            $scope.openTxt = true;
        }


    }]);

    // 我的约会-我参与的约会
    module.controller("member.rendezvous_part", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', function (api, $scope, $timeout, $ionicPopup) {

        $scope.formData = [];
        $scope.partList = [];
        $scope.formData.pageNum = 0;
        var getPutList = function (pageNum) {
            var formData = [];
            formData.user_id = ar.getCookie('bhy_user_id');
            formData.pageNum = pageNum + 1;
            $scope.formData.pageNum = pageNum + 1;
            api.list('/wap/rendezvous/apply-list', formData).success(function (res) {
                res.data.length < 10 ? $scope.isMore = false : $scope.isMore = true;
                for (var i in res.data) {
                    var label = res.data[i].we_want.split(',');
                    res.data[i].label = [];
                    res.data[i].label = label;
                    res.data[i].info = JSON.parse(res.data[i].info);
                    res.data[i].auth = JSON.parse(res.data[i].auth);
                    $scope.partList.push(res.data[i]);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        $scope.isMore = true;

        // 加载更多
        $scope.loadMore = function () {
            getPutList($scope.formData.pageNum);
        }

        // 是否还有更多
        $scope.moreDataCanBeLoaded = function () {
            return $scope.isMore;
        }

        $scope.delPart = function (id, itemIndex) {
            var confirmPopup = $ionicPopup.confirm({
                title: '确定删除此条记录？删除后将不显示在对方参与列表。',
                template: false,
                cancelText: '点错了',
                okText: '确定'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    // 删除
                    api.save('/wap/rendezvous/delete-apply', {id: id}).success(function (res) {
                        $scope.partList.splice(itemIndex, 1);
                    });
                } else {
                    return false;
                }
            });
        }

        $scope.openTxt = false;
        // 展开全文
        $scope.openText = function ($event) {
            $event.stopPropagation();
            $scope.openTxt = true;
        }

        $scope.acceptAlert = function (phone) {
            if (phone == null || typeof(phone) == undefined) {
                $ionicPopup.alert({title: '请等待TA联系'});
            } else {
                $ionicPopup.alert({title: 'TA的手机号码：' + phone});
            }
        }

    }]);

    // 我的约会-参与的人
    module.controller("member.rendezvous_involved", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {

        $scope.partList = [];
        $scope.rendzvous = [];
        $scope.involvedList = [];
        $scope.rendzvous.id = $location.$$search.id;
        $scope.rendzvous.title = $location.$$search.title;
        $scope.rendzvous.theme = $location.$$search.theme;

        api.list('/wap/rendezvous/rendezvous-apply-list', {id: $location.$$search.id}).success(function (res) {
            $scope.involvedList = res.data;
            for (var i in res.data) {
                $scope.involvedList[i].info = JSON.parse(res.data[i].info);
                $scope.involvedList[i].auth = JSON.parse(res.data[i].auth);
            }
        });

        $scope.isAccept = false;
        $scope.isIgnore = false;
        // 接受
        $scope.accept = function (id, itemIndex) {
            var confirmPopup = $ionicPopup.confirm({
                title: '确定接受吗？',
                template: false,
                cancelText: '点错了',
                okText: '确定'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    // 确定
                    var formData = [];
                    formData.id = id;
                    formData.status = 1;
                    api.save('/wap/rendezvous/update-apply-status', formData).success(function (res) {
                        $scope.involvedList[itemIndex].status = 1;
                    });
                    $scope.isAccept = true;
                } else {
                    return false;
                }
            });
        }

        // 忽略
        $scope.ignore = function (id, itemIndex) {
            var confirmPopup = $ionicPopup.confirm({
                title: '确定忽略吗？',
                template: false,
                cancelText: '点错了',
                okText: '确定'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    // 确定
                    var formData = [];
                    formData.id = id;
                    formData.status = 2;
                    api.save('/wap/rendezvous/update-apply-status', formData).success(function (res) {
                        $scope.involvedList[itemIndex].status = 2;
                    });
                    $scope.isIgnore = true;
                } else {
                    return false;
                }
            });
        }


    }]);

    // 我的专属红娘
    module.controller("member.matchmaker", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', '$filter', function (api, $scope, $timeout, $ionicPopup, $location, $filter) {

        $scope.userName = $filter('sex')($scope.userInfo.info.real_name, $scope.userInfo.sex, $scope.userInfo.info.age);
        $scope.matchmakerList = [];
        var formData = [];
        if ($scope.userInfo.matchmaking) {
            $scope.title = '服务红娘';
            $scope.showTitle = '专属红娘';
            $scope.showMatchmaker = true;
            formData.matchmaker = $scope.userInfo.matchmaking + '-' + $scope.userInfo.matchmaker;
        } else if ($scope.userInfo.matchmaker) {
            $scope.showMatchmaker = true;
            $scope.title = '专属红娘';
            formData.matchmaker = $scope.userInfo.matchmaker;
        } else {
            $scope.showMatchmaker = false;
            $scope.title = '值班红娘';
            formData.matchmaker = 0;
        }
        api.list('/wap/matchmaker/user-matchmaker-list', formData).success(function (res) {
            $scope.matchmakerList = res.data;
            if (formData.matchmaker == 0 && $scope.matchmakerList.length > 1) {
                $scope.matchmakerList = [];
                $scope.matchmakerList[0] = res.data[0];
            }
        });
        $scope.getMatchmakerList = function () {
            if ($scope.title == '服务红娘') {
                $scope.title = '专属红娘';
                $scope.showTitle = '服务红娘';
                $scope.matchmakerList.reverse();
            } else {
                $scope.title = '服务红娘';
                $scope.showTitle = '专属红娘';
                $scope.matchmakerList.reverse();
            }
        }

        $scope.showPhone = function () {
            $scope.phone = $scope.matchmakerList[0].landline ? $scope.matchmakerList[0].landline : $scope.matchmakerList[0].phone;
            ar.saveDataAlert($ionicPopup, '电话：' + $scope.phone);
        }

    }]);

    // 专属红娘资料
    module.controller("member.matchmaker_info", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {

        $scope.matchmakerList = [];
        var formData = [];
        formData.matchmaker = $location.$$search.job;
        api.list('/wap/matchmaker/user-matchmaker-list', formData).success(function (res) {
            $scope.matchmakerList = res.data;
        });

        if ($scope.userInfo.matchmaking == formData.matchmaker) {
            $scope.title = '服务红娘';
        } else if ($scope.userInfo.matchmaker == formData.matchmaker) {
            $scope.title = '专属红娘';
        } else {
            $scope.title = '值班红娘';
        }

    }]);

    // 红娘服务的四大优势
    module.controller("member.matchmaker_service", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {

    }]);

    // 关于嘉瑞
    module.controller("member.about", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {

    }]);

    // 帮助中心
    module.controller("member.help", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {

    }]);

    module.controller("member.help_notice", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {

    }]);

    module.controller("member.help_appointment", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {

    }]);

    module.controller("member.help_protocol", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$location', function (api, $scope, $timeout, $ionicPopup, $location) {

    }]);

    return module;
})


