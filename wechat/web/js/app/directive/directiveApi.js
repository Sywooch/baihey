/**
 * Created by Administrator on 2016/3/23.
 */
define(['app/module'], function (module) {

    module.directive("modal", ['api', function (api) {
        return {
            restrict: "EA",
            template: '<div class="am-modal am-modal-no-btn" tabindex="-1" id="bhy-modal"><div class="am-modal-dialog"><div class="am-modal-hd">modal标题<a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a> </div> <div class="am-modal-bd">确定</div> </div> </div>'
        }
    }]);
    module.directive("alert", function () {
        return {
            restrict: "EA",
            replace: true,
            scope: {
                body: '@',
                num: '@'
            },
            transclude: true,
            template: '<div class="am-modal am-modal-alert" tabindex="-1" id="bhy-alert{{num}}"><div class="am-modal-dialog"><div class="am-modal-bd" >{{body}}</div><div class="am-modal-footer"><span class="am-modal-btn">确定</span></div></div></div>',

        }
    });
    module.directive("confirm", function () {
        return {
            restrict: "EA",
            scope: {
                body: '@'
            },
            template: '<div class="am-modal am-modal-confirm" tabindex="-1" id="my-confirm"> <div class="am-modal-dialog"> <div class="am-modal-bd">{{body}}</div> <div class="am-modal-footer"> <span class="am-modal-btn" data-am-modal-cancel>取消</span> <span class="am-modal-btn" data-am-modal-confirm>确定</span> </div> </div> </div>'
        }
    });

    module.directive("modalLoading", function () {
        return {
            restrict: "EA",
            scope: {
                body: '@'
            },
            template: '<div class="am-modal am-modal-loading am-modal-no-btn" tabindex="-1" id="my-modal-loading"> <iv class="am-modal-dialog"> <div class="am-modal-hd">{{body}}</div> <div class="am-modal-bd"> <span class="am-icon-spinner am-icon-spin"></span> </div> </div> </div'
        }
    });


})



