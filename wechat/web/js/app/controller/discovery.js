/**
 * Created by NSK. on 2016/4/5/0005.
 */
define(['app/module', 'app/directive/directiveApi'
    , 'app/service/serviceApi'
], function (module) {

    // 发现
    module.controller("discovery.index", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', function (api, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading) {

        // 图片放大查看插件
        requirejs(['jquery'], function ($) {
            requirejs(['klass', 'photoswipe'], function (klass, PhotoSwipe) {
                $(document).ready(function () {
                    window.event.stopPropagation();
                    var myPhotoSwipe = $(".dis_con_p a").photoSwipe({
                        enableMouseWheel: false,
                        enableKeyboard: false,
                        allowRotationOnUserZoom: true
                    });
                });
            })
        })

        $scope.discoveryList = [
            {
                id: 1, name: '张小姐', time: '17:40', content: '地方公司空间的花费撕开对方会告诉你不过就是不爽', imgList: [
                {id: 1, url: '/wechat/web/images/test/1.jpg'},
                {id: 2, url: '/wechat/web/images/test/2.jpg'},
                {id: 3, url: '/wechat/web/images/test/3.jpg'}
            ], browseNumber: 2544, commentNumber: 525, likeNumber: 89
            },
            {
                id: 2, name: '郭先生', time: '13:12', content: '地岁的威尔二万人订单', imgList: [
                {id: 1, url: '/wechat/web/images/test/3.jpg'},
                {id: 2, url: '/wechat/web/images/test/7.jpg'},
                {id: 3, url: '/wechat/web/images/test/6.jpg'}
            ], browseNumber: 2544, commentNumber: 525, likeNumber: 89
            },
            {
                id: 3, name: '毛女士', time: '12:40', content: '对方扫扫地', imgList: [
                {id: 1, url: '/wechat/web/images/test/8.jpg'},
                {id: 2, url: '/wechat/web/images/test/2.jpg'},
                {id: 3, url: '/wechat/web/images/test/5.jpg'}
            ], browseNumber: 2544, commentNumber: 525, likeNumber: 89
            },
            {
                id: 4, name: '邱小姐', time: '11:43', content: '到访台湾台湾人体验围绕太阳勿扰', imgList: [
                {id: 1, url: '/wechat/web/images/test/7.jpg'},
                {id: 2, url: '/wechat/web/images/test/3.jpg'},
                {id: 3, url: '/wechat/web/images/test/1.jpg'}
            ], browseNumber: 2544, commentNumber: 525, likeNumber: 89
            },
            {
                id: 5, name: '隋小姐', time: '10:15', content: '年翻跟斗风格飞过海对方', imgList: [
                {id: 1, url: '/wechat/web/images/test/2.jpg'},
                {id: 2, url: '/wechat/web/images/test/3.jpg'},
                {id: 3, url: '/wechat/web/images/test/4.jpg'}
            ], browseNumber: 2544, commentNumber: 525, likeNumber: 89
            },
        ]

        $scope.user = [];
        $scope.user.userLike = false;

        // 点赞
        $scope.clickLike = function (likeNumber) {
            if (!$scope.user.userLike) {
                $scope.user.userLike = true;
                likeNumber += 1;  // 点赞数 +1
            } else {
                $scope.user.userLike = false;
            }
        }

        // 加载更多
        $scope.loadMore = function () {

            $scope.$broadcast('scroll.infiniteScrollComplete');
            //api.get('url').success(function(res) {

            $scope.discoveryList.push({
                id: 5, name: '隋小姐', time: '10:15', content: '年翻跟斗风格飞过海对方', imgList: [
                    {id: 1, url: '/wechat/web/images/test/2.jpg'},
                    {id: 2, url: '/wechat/web/images/test/3.jpg'},
                    {id: 3, url: '/wechat/web/images/test/4.jpg'}
                ], browseNumber: 2544, commentNumber: 525, likeNumber: 89
            });

            $scope.$broadcast('scroll.infiniteScrollComplete');
            //});
        };
        $scope.$on('$stateChangeSuccess', function () {
            $scope.loadMore();
        });

        // 是否还有更多
        $scope.moreDataCanBeLoaded = function () {
            return true;
        };

        $ionicModal.fromTemplateUrl('released.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.openModal = function () {
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };

        $scope.released = function () {
            $scope.openModal();
        }

    }]);

    // 发现-个人
    module.controller("discovery.single", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$stateParams', function (api, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $stateParams) {

        // 图片放大查看插件
        requirejs(['jquery'], function ($) {
            requirejs(['klass', 'photoswipe'], function (klass, PhotoSwipe) {

                $(document).ready(function () {
                    var myPhotoSwipe = $(".dis_con_p a").photoSwipe({
                        enableMouseWheel: false,
                        enableKeyboard: false,
                        allowRotationOnUserZoom: true
                    });
                });
            })
        })


        // url参数，用户ID
        $scope.userId = $stateParams.userId;

        $scope.dis =
            {
                id: 1, name: '张小姐', time: '17:40', content: '地方公司空间的花费撕开对方会告诉你不过就是不爽', imgList: [
                {id: 1, url: '/wechat/web/images/test/1.jpg'},
                {id: 2, url: '/wechat/web/images/test/2.jpg'},
                {id: 3, url: '/wechat/web/images/test/3.jpg'}
            ], browseNumber: 2544, commentNumber: 525, likeNumber: 89
            }


        $scope.user = [];
        $scope.user.userLike = false;

        // 点赞
        $scope.clickLike = function (likeNumber) {
            if (!$scope.user.userLike) {
                $scope.user.userLike = true;
                likeNumber += 1;  // 点赞数 +1
            } else {
                $scope.user.userLike = false;
            }
        }

        $scope.commentList=[
            {id:1,headPic:'/wechat/web/images/test/8.jpg',name:'谢先生',time:'15-05-11 17:15',content:'照片很漂亮！'},
            {id:2,headPic:'/wechat/web/images/test/7.jpg',name:'李先生',time:'15-05-11 15:05',content:'顶！'},
            {id:3,headPic:'/wechat/web/images/test/6.jpg',name:'张先生',time:'15-05-11 13:38',content:'支持！'},
            {id:4,headPic:'/wechat/web/images/test/5.jpg',name:'刘女士',time:'15-05-11 17:15',content:'法规和儿童'},
            {id:5,headPic:'/wechat/web/images/test/4.jpg',name:'陈小姐',time:'15-05-11 17:15',content:'打过去喂喂喂'},
            {id:6,headPic:'/wechat/web/images/test/3.jpg',name:'郭先生',time:'15-05-11 17:15',content:'相册vdefgewrgewr！'},
            {id:7,headPic:'/wechat/web/images/test/2.jpg',name:'谭先生',time:'15-05-11 17:15',content:'但若全额威风威风'},
            {id:8,headPic:'/wechat/web/images/test/1.jpg',name:'张小姐',time:'15-05-11 17:15',content:'丰田和热火太'}
        ]

        $scope.user.private = false;
        $scope.checkPrivate = function(){
            $scope.user.private = !$scope.user.private;
        }


    }]);


    // 发现-发布动态
    module.controller("discovery.released", ['app.serviceApi', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$stateParams', function (api, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $stateParams) {


    }]);
})
