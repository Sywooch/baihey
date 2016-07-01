/**
 * Created by Administrator on 2016/3/29.
 */
({
    appDir:'./',
    baseUrl:"./",
    dir:"../dist",
    removeCombined:true,
    paths: {
        jquery: 'plugin/jquery/jquery',
        //jquery_1_8_3: 'plugin/jquery/jquery_1.8.3.min',
        //angular: '//cdn.bootcss.com/ionic/1.2.4/js/ionic.bundle.min',
        angular: 'plugin/angular/angular.min',
        angular_animate: 'plugin/angular/angular-animate.min',
        angular_sanitize: 'plugin/angular/angular-sanitize.min',
        angular_ui_router: 'plugin/angular/angular-ui-router.min',
        angular_upload: 'plugin/angular/angular-file-upload.min',
        ionic:'plugin/ionic/ionic.min',
        ionic_angular:'plugin/ionic/ionic-angular.min',
        bootstrap:'plugin/bootstrap/bootstrap.min',
        amezeui: 'plugin/amezeui/js/amazeui.min',
        amezeui_ie8: 'plugin/amezeui/js/amazeui.ie8polyfill.min',
        comm: 'comm',
        mobiscroll: 'plugin/mobiscroll/mobiscroll.custom-3.0.0-beta.min',
        photoswipe:'plugin/photoswipe/photoswipe.min',
        photoswipe_ui:'plugin/photoswipe/photoswipe-ui-default.min',
        klass:'plugin/photoswipe/klass.min',
        info_data: 'config/infoData',
        ionic_gallery:'plugin/ionic/ion-gallery.min',
        ng_cordova:'plugin/cordova/ng-cordova.min',
        cordova:'plugin/cordova/cordova'
    },

    modules: [
        {
            name: 'app',
            exclude: [
                'angular',
                'ionic',
                'jquery',
                'angular_animate',
                //'angular_sanitize',
                'angular_ui_router',
                'angular_upload',
                'ionic_angular',
                'bootstrap',
                'amezeui',
                'amezeui_ie8',
                'mobiscroll',
                'photoswipe',
                'photoswipe_ui',
                'info_data',
                'ionic_gallery',


                'config/city',
                'config/occupation',
                'config/area',
                'comm',
                'app/router',

            ]
        },
    ],

    fileExclusionRegExp: /^(r|build)\.js$/,

    shim: {
        angular:{
            exports:"angular"
        },
        "angular-route":{
            deps:['angular'],
            exports:"angular-route"
        },
        jquery : {
            exports:"jquery"
        }
    },
    //name: "app.js",
})