/**
 * Created by NSK. on 2016/4/5/0005.
 */
define(['app/module', 'app/directive/directiveApi'
    , 'app/service/serviceApi'
], function (module) {

    // 选择支付方式
    module.controller("charge.index", ['app.serviceApi', '$rootScope', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$location', function (api, $rootScope, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $location) {

        $scope.formData = [];

        $scope.orderId = $location.$$search.orderId;
        // 商品
        api.get('/wap/charge/get-order', {id: $scope.orderId}).success(function (res) {
            $scope.goods = res[0];
        })

        $scope.iswx = ar.isWeChat();
        if ($scope.iswx) {
            $scope.formData.payType = "5";
        } else {
            $scope.formData.payType = "4";
        }

        // 立即支付
        $scope.pay = function () {
            window.location.href = '/wap/charge/pay?orderId='+$scope.orderId;
        }

        // 跳转-返回
        $scope.jump = function () {
            $location.url($location.$$search.tempUrl);
        }


    }]);

    // 选择支付方式
    module.controller("charge.order", ['app.serviceApi', '$rootScope', '$scope', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$location', function (api, $rootScope, $scope, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $location) {

        api.save('/wap/charge/get-order', {orderId:$location.$$search.orderId}).success(function(res){
            $scope.orderInfo = res;
        })


    }]);

})
