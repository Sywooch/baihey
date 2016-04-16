/**
 * Created by Administrator on 2016/3/29.
 */
require.config({
    urlArgs: "bust=v3"+Math.random(), // 清除缓存
    baseUrl: '/wechat/web/js/',
    paths: {
        jquery: 'plugin/jquery/jquery',
        //angular: '//cdn.bootcss.com/ionic/1.2.4/js/ionic.bundle.min',
        angular: 'plugin/angular/angular.min',
        angular_animate: 'plugin/angular/angular-animate.min',
        angular_sanitize: 'plugin/angular/angular-sanitize.min',
        angular_ui_router: 'plugin/angular/angular-ui-router.min',
        ionic:'plugin/ionic/ionic.min',
        ionic_angular:'plugin/ionic/ionic-angular.min',
        bootstrap:'plugin/bootstrap/bootstrap.min',
        amezeui: 'plugin/amezeui/amazeui.min',
        comm: 'comm',
        config:'config'
    },
    shim:{
        angular:{
            exports:"angular"
        },
        jquery : {
            exports:"jquery"
        }
    }
});

require(['angular','angular_animate'] , function (angular) {
    require(['ionic','ionic_angular','angular_sanitize','angular_ui_router','comm',"app/controller/listController",'plugin/angular/angular-file-upload.min'],function(comm){
        'use strict';

        angular.bootstrap(document,['webApp']);

    });

})

