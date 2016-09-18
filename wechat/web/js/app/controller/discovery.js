/**
 * Created by NSK. on 2016/4/5/0005.
 */
define(['app/module', 'app/directive/directiveApi'
    , 'app/service/serviceApi'
], function (module) {

    // 发现
    module.controller("discovery.index", ['app.serviceApi', '$rootScope', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$location', '$filter', 'FileUploader', 'dataFilter', function (api, $rootScope, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $location, $filter, FileUploader, dataFilter) {

        $scope.reportData = {};
        $scope.formData = {};
        $scope.formData.auth = 1;
        $scope.discoveryList = [];

        //用户已屏蔽的动态id，从localStorage获取
        $scope.display = ar.getStorage('display') ? ar.getStorage('display') : [];

        // 发现列表过滤条件：黑名单
        $scope.indexFilter = function (dis) {
            if(dis.user_id == $scope.userInfo.user_id) {
                return true;
            }
            if (dis.fid > 0) {
                return false;// 动态被举报
            }
            if (dis.auth == '2') {   // 用户设置该条动态为关注的人可见
                return dataFilter.data.follow.indexOf(dis.user_id) != -1 && $scope.display.indexOf(dis.id) == -1;
            } else if (dis.auth == '4') {
                return false;
            }
            return dataFilter.data.blacked.indexOf(dis.user_id) == -1 && $scope.display.indexOf(dis.id) == -1;
        }

        $scope.jump = function (disId, disUserId, type) {
            if (type == 'userInfo') {
                if (disUserId >= 10000) {
                    if (disUserId == $scope.userInfo.user_id) {
                        $location.url('/member/information');
                    } else {
                        $location.url('/userInfo?userId=' + disUserId);
                    }
                } else {
                    if (disUserId == $scope.userInfo.user_id) {
                        $location.url('/member/admin_information');
                    } else {
                        $location.url('/admin_info?userId=' + disUserId);
                    }
                }
            }
            if (type == 'single') {
                $location.url('/discovery_single?id=' + disId);
            }

        }

        $scope.more = function (isUser, dis, index) {
            if (dis.user_id >= 10000) {
                var btnList = [
                    {text: '举报'},
                    {text: '屏蔽'}
                ];
            } else {
                var btnList = [
                    {text: '屏蔽'}
                ];
            }

            if (isUser) {   // 判断该条动态是否所属当前用户
                btnList = [
                    {text: '删除'}
                ];
            }

            $ionicActionSheet.show({
                buttons: btnList,
                titleText: '更多',
                cancelText: '取消',
                cancel: function () {
                },
                buttonClicked: function (i, btnObj) {
                    if (btnObj.text == '屏蔽') {
                        dis.moreLoading = true;
                        $scope.display.push(dis.id);
                        ar.setStorage('display', $scope.display);
                        $scope.discoveryList.splice(index, 1);
                        dis.moreLoading = false;
                        // 将参数ID存入localStorage：display
                    }
                    if (btnObj.text == '举报') {
                        $location.url('/member/report?id=' + dis.id + '&userName=' + dis.real_name + '&type=2&title=动态&tempUrl=' + $location.$$url);
                    }
                    if (btnObj.text == '删除') {
                        dis.moreLoading = true;
                        api.save('/wap/member/delete-dynamic', {id: dis.id}).success(function (res) {
                            $scope.display.push(dis.id);
                            ar.setStorage('display', $scope.display);
                            for(var i = 0 ; i < $scope.discoveryList.length; i++ ){
                                if($scope.discoveryList[i].id == dis.id){
                                    $scope.discoveryList.splice(i, 1);
                                }
                            }
                        }).error(function(){
                            ar.saveDataAlert($ionicPopup,'删除失败，请刷新重试！');
                            dis.moreLoading = false;
                        }).finally(function(){
                            dis.moreLoading = false;
                        });
                    }
                    return true;
                }
            });
        }

        // 点赞
        $scope.clickLike = function (dis) {
            var i = ar.getArrI($scope.discoveryList, 'id', dis.id);
            var add = 0;
            if ($scope.discoveryList[i].cid > 0) {
                add = -1;
                $scope.discoveryList[i].cid = -1;
            } else {
                add = 1;
                $scope.discoveryList[i].cid = 1;
            }
            $scope.discoveryList[i].like_num = parseInt($scope.discoveryList[i].like_num) + add;

            api.save('/wap/member/set-click-like', {dynamicId: dis.id, add: add});

        }

        $scope.page = 0;
        $scope.isMore = true;
        // 加载更多
        $scope.loadMore = function () {
            api.list('/wap/member/get-dynamic-list', {
                user_id: $location.$$search.userId,
                page: $scope.page
            }).success(function (res) {  //  查询出所有动态，分页
                if (res.data.length < 1) {
                    $scope.isMore = false;
                }
                for (var i in res.data) {
                    res.data[i].imgList = JSON.parse(res.data[i].pic);
                    res.data[i].sfzCheck = res.data[i].honesty_value & 1;
                    res.data[i].real_name = res.data[i].real_name.replace(/\"/g, '');
                    res.data[i].head_pic = res.data[i].head_pic.replace(/\"/g, '');
                    res.data[i].level = res.data[i].level.replace(/\"/g, '');
                    res.data[i].age = res.data[i].age.replace(/\"/g, '');
                    $scope.discoveryList.push(res.data[i]);
                }

                $scope.page += 1;
                ar.initPhotoSwipeFromDOM('.bhy-gallery', $scope, $ionicPopup);
            }).finally(function () {
                $timeout(function(){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },800);
            })
        };

        // 下拉刷新
        $scope.doRefresh = function () {
            var refreshForm = {};
            refreshForm.limit = $scope.discoveryList.length;
            api.list('/wap/member/get-dynamic-list?timestamp='+new Date().getTime(), refreshForm).success(function (res) {
                $scope.discoveryList = [];
                for (var i in res.data) {
                    res.data[i].imgList = JSON.parse(res.data[i].pic);
                    res.data[i].sfzCheck = res.data[i].honesty_value & 1;
                    res.data[i].real_name = res.data[i].real_name.replace(/\"/g, '');
                    res.data[i].head_pic = res.data[i].head_pic.replace(/\"/g, '');
                    res.data[i].level = res.data[i].level.replace(/\"/g, '');
                    res.data[i].age = res.data[i].age.replace(/\"/g, '');
                    $scope.discoveryList.push(res.data[i]);
                }
                ar.initPhotoSwipeFromDOM('.bhy-gallery', $scope, $ionicPopup);
            }).finally(function () {
                $timeout(function(){
                    $scope.$broadcast('scroll.refreshComplete');
                },800);
            });
        };

        // 是否还有更多
        $scope.moreDataCanBeLoaded = function () {
            return $scope.isMore;
        };

        $rootScope.$on('reload', function(d,data) {
            if(data){
                $scope.doRefresh();
            }
        });

    }]);

    // 发现-评论
    module.controller("discovery.single", ['app.serviceApi', '$scope', '$location', '$ionicActionSheet', '$ionicModal', '$ionicPopup', '$ionicScrollDelegate','$timeout', function (api, $scope, $location, $ionicActionSheet, $ionicModal, $ionicPopup, $ionicScrollDelegate,$timeout) {
        $scope.formData = {};
        $scope.formData.private = false; // 私密评论默认未选中
        $scope.isMore = true;
        $scope.pageSize = 20;
        $scope.commentList = [];
        $scope.isShowCommentList = true;
        $scope.sendLoading = false;  // 发送中
        $scope.jump = function (id) {
            if (id >= 10000) {
                if (id == $scope.userInfo.id) {
                    $location.url('/member/information');
                } else {
                    $location.url('/userInfo?userId=' + id);
                }
            } else {
                if (id == $scope.userInfo.id) {
                    $location.url('/member/admin_information');
                } else {
                    $location.url('/admin_info?userId=' + id);
                }
            }

        }
        //用户已屏蔽的动态id，从localStorage获取
        $scope.display = ar.getStorage('display') ? ar.getStorage('display') : [];

        $scope.showComment = function(){
            $scope.isShowCommentList = !$scope.isShowCommentList;
            $ionicScrollDelegate.$getByHandle('discoveryMain').resize();
        }

        var userInfo = ar.getStorage('userInfo');
        var info = JSON.parse(userInfo.info);
        $scope.user_id = userInfo.id;
        api.list('/wap/member/get-dynamic', {id: $location.$$search.id}).success(function (res) {
            res.data.imgList = JSON.parse(res.data.pic);
            res.data.sfzCheck = res.data.honesty_value & 1;
            res.data.real_name = res.data.real_name.replace(/\"/g, '');
            res.data.head_pic = res.data.head_pic.replace(/\"/g, '');
            res.data.level = res.data.level.replace(/\"/g, '');
            res.data.age = res.data.age.replace(/\"/g, '');
            $scope.dis = res.data;
            for (var i in res.data.comment) {
                res.data.comment[i].headPic = res.data.comment[i].headPic.replace(/\"/g, '');
                res.data.comment[i].name = res.data.comment[i].name.replace(/\"/g, '');
                res.data.comment[i].age = res.data.comment[i].age.replace(/\"/g, '');
            }
            //$comment = ar.cleanQuotes(JSON.stringify(res.data.comment));
            //$scope.commentList = JSON.parse($comment);
            $scope.commentList = res.data.comment;
            ar.initPhotoSwipeFromDOM('.bhy-gallery', $scope, $ionicPopup);
        })

        // 点赞
        $scope.clickLike = function (dis) {
            var add = 0;
            if ($scope.dis.cid > 0) {
                add = -1;
                $scope.dis.cid = -1;
            } else {
                add = 1;
                $scope.dis.cid = 1;
            }
            $scope.dis.like_num = parseInt($scope.dis.like_num) + add;
            api.save('/wap/member/set-click-like', {dynamicId: dis.id, add: add});
        }

        $scope.checkPrivate = function () {
            $scope.formData.private = !$scope.formData.private;
            if ($scope.formData.private) {
                ar.saveDataAlert($ionicPopup, '私密评论将只有您和该条动态发布者可见此条评论。');
            }
        }

        // 发表评论
        $scope.sendComment = function () {
            if(!$scope.formData.content){
                ar.saveDataAlert($ionicPopup,'请输入评论内容！');
                return false;
            }
            $scope.sendLoading = true;
            $scope.formData.dynamicId = $location.$$search.id;
            api.save('/wap/member/add-comment', $scope.formData).success(function (res) {
                if (res.data.id > 0) {
                    $scope.commentList.push({
                        id: res.data.id,
                        user_id: userInfo.id,
                        headPic: info.head_pic,
                        name: info.real_name,
                        private: $scope.formData.private == 'true' ? 1 : 0,
                        create_time: res.data.create_time,
                        content: $scope.formData.content,
                        age: $scope.userInfo.info.age,
                        sex: $scope.userInfo.sex
                    });
                    $scope.dis.comment_num = parseInt($scope.dis.comment_num) + 1;
                    $ionicScrollDelegate.scrollBottom(true);
                }
            }).error(function(){
                ar.saveDataAlert($ionicPopup,'评论失败，请刷新重试！');
                $scope.formData.content = '';
                $scope.sendLoading = false;
            }).finally(function(){
                $scope.formData.content = '';
                $scope.sendLoading = false;
            })
        }

        $scope.more = function (isUser, dis) {
            if (dis.user_id >= 10000) {
                var btnList = [
                    {text: '举报'},
                    {text: '屏蔽'}
                ];
            } else {
                var btnList = [
                    {text: '屏蔽'}
                ];
            }

            if (isUser) {   // 判断该条动态是否所属当前用户
                btnList = [
                    {text: '删除'}
                ];
            }

            $ionicActionSheet.show({
                buttons: btnList,
                titleText: '更多',
                cancelText: '取消',
                cancel: function () {
                },
                buttonClicked: function (index, btnObj) {
                    if (btnObj.text == '屏蔽') {
                        $scope.display.push(dis.id);
                        ar.setStorage('display', $scope.display);
                        $location.url('/discovery');
                        // 将参数ID存入localStorage：display
                    }
                    if (btnObj.text == '举报') {
                        $location.url('/member/report?id=' + dis.id + '&type=2&title=动态&tempUrl=' + $location.$$url);
                    }
                    if (btnObj.text == '删除') {
                        $scope.display.push(dis.id);
                        ar.setStorage('display', $scope.display);
                        // 改变状态 api.save
                        api.save('/wap/member/delete-dynamic', {id: dis.id}).success(function (res) {
                            $location.url('/discovery');
                        });
                    }
                    return true;
                }
            });
        }

        // 加载更多
        $scope.loadMore = function () {
            api.list('/wap/member/get-dynamic', {id: $location.$$search.id}).success(function (res) {
                if ($scope.pageSize > res.commentCount) {
                    $scope.isMore = false;
                }
                $scope.pageSize += 20;
            }).finally(function(){
                $timeout(function(){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },800);

            })
        }

        //是否还有更多
        $scope.moreDataCanBeLoaded = function () {
            return $scope.isMore;
        }

    }]);

    // 新消息
    module.controller("discovery.message", ['app.serviceApi', '$scope', '$location', '$ionicActionSheet', '$ionicModal', '$ionicPopup', '$ionicScrollDelegate', function (api, $scope, $location, $ionicActionSheet, $ionicModal, $ionicPopup, $ionicScrollDelegate) {
        var timesstamp = '';

        if(ar.getStorage('discoveryTime')){
            timesstamp = ar.getStorage('discoveryTime');
        }else{
            timesstamp = '';
        }

        $scope.disList = [];
        api.get('/wap/member/comment-list',{create_time:timesstamp}).success(function(res){
            if(res.status){
                for(var i in res.data){
                    res.data[i].info = JSON.parse(res.data[i].info);
                    res.data[i].pic = JSON.parse(res.data[i].pic);
                }
                $scope.disList = res.data;
            }
        })

        ar.setStorage('discoveryTime',ar.timeStamp());
        // 获取评论总数
        api.get('/wap/member/comment-num',{}).success(function(res){
            $scope.discoverySum = res.data;
            // 存入Storage
            ar.setStorage('discoverySum',res.data);
        })

        $scope.loadData = function(){
            api.get('/wap/member/comment-list',{create_time:''}).success(function(res){
                if(res.status){
                    for(var i in res.data){
                        res.data[i].info = JSON.parse(res.data[i].info);
                        res.data[i].pic = JSON.parse(res.data[i].pic);
                    }
                    $scope.disList = res.data;
                }
            })
        }
    }]);

})
