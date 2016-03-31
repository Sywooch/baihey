/**
 * Created by Administrator on 2016/3/22.
 */
define(['angular','uiRoute'], function (angular) {

    var app = angular.module('webApp',['ui.router']);

    app.config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.when("", "/index");

        $stateProvider.state("index", {
            url: "/index",
            templateUrl: "../user/login.html"
        })
    });

    return app;
});