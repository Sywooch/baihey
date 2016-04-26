/**
 * Created by Administrator on 2016/3/29.
 */
require.config({
    urlArgs: "bust=v3"+Math.random(), // 清除缓存
    baseUrl: '/wechat/web/js/',
    paths: {
        jquery: 'plugin/jquery/jquery',
        jquery_1_8_3: 'plugin/jquery/jquery_1.8.3.min',
        //angular: '//cdn.bootcss.com/ionic/1.2.4/js/ionic.bundle.min',
        angular: 'plugin/angular/angular.min',
        angular_animate: 'plugin/angular/angular-animate.min',
        angular_sanitize: 'plugin/angular/angular-sanitize.min',
        angular_ui_router: 'plugin/angular/angular-ui-router.min',
        angular_upload: 'plugin/angular/angular-file-upload.min',
        ionic:'plugin/ionic/ionic.min',
        ionic_angular:'plugin/ionic/ionic-angular.min',
        bootstrap:'plugin/bootstrap/bootstrap.min',
        amezeui: 'plugin/amezeui/amazeui.min',
        comm: 'comm',
        config:'config',
        photoswipe:'plugin/photoswipe/code.photoswipe-3.0.5.min',
        klass:'plugin/photoswipe/klass.min'
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

require(['angular','ionic'] , function (angular) {
    require(['angular_animate','ionic_angular','angular_sanitize','angular_ui_router','comm',"app/controller/listController",'angular_upload'],function(comm){
        'use strict';

        angular.bootstrap(document,['webApp']);
    });

});

