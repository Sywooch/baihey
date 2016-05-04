/**
 * Created by Administrator on 2016/4/14.
 */
define(['app/module'], function (module) {

    // 有时间戳计算年龄
    function getAge(time) {
        return Math.floor((time - ar.timeStamp() / 1000) / 365 / 24 / 3600);
    }

    // 由时间戳计算年龄
    module.filter('timeToAge', function () {
        return function (input, args1, args2) {
            return getAge(input);
        };
    });

    // 由姓名，性别，年龄返回尊称
    module.filter('sex', function () {
        return function (input, sex, age) {

            age = getAge(age);
            if (sex == 1) {
                return input.substr(0, 1) + '先生';
            } else if (age >= 35) {
                return input.substr(0, 1) + '女士';
            } else {
                return input.substr(0, 1) + '小姐';
            }
        }
    });

    // 返回婚姻状况
    module.filter('marriage', function () {
        return function (input, arr) {
            var infoData = config_infoData.marriage;
            for(var i in infoData) {
                if(infoData[i].id == parseInt(input)) {
                    return infoData[i].name;
                }
            }
        }
    });

    // 返回学历
    module.filter('education', function () {
        return function (input, arr) {
            var infoData = config_infoData.education;
            for(var i in infoData) {
                if(infoData[i].id == parseInt(input)) {
                    return infoData[i].name;
                }
            }
        }
    });

    // 返回子女状态
    module.filter('child', function () {
        return function (input, arr) {
            var infoData = config_infoData.child;
            for(var i in infoData) {
                if(infoData[i].id == parseInt(input)) {
                    return infoData[i].name;
                }
            }
        }
    });

    // 返回年薪
    module.filter('yearIncome', function () {
        return function (input, arr) {
            switch(parseInt(input)) {
                case 1:
                    return '1万以下';break;
                case 2:
                    return '1万-3万';break;
                case 3:
                    return '3万-5万';break;
                case 4:
                    return '5万-7万';break;
                case 5:
                    return '7万-10万';break;
                case 6:
                    return '10万-15万';break;
                case 7:
                    return '15万-20万';break;
                case 8:
                    return '20万-25万';break;
                case 9:
                    return '25万-50万';break;
                case 10:
                    return '50万-100万';break;
                case 11:
                    return '100万以上';break;
                default :
                    return '未知';
            }
        }
    });

    // 返回购房状态
    module.filter('purchase', function () {
        return function (input, arr) {
            switch(parseInt(input)) {
                case 1:
                    return '有房';break;
                case 2:
                    return '无房';break;
                default :
                    return '未知';
            }
        }
    });

    // 返回购车状态
    module.filter('car', function () {
        return function (input, arr) {
            switch(parseInt(input)) {
                case 1:
                    return '有车';break;
                case 2:
                    return '无车';break;
                case 3:
                    return '有豪车';break;
                default :
                    return '未知';
            }
        }
    });

    // 返回职业
    module.filter('occupation', function () {
        return function (input, arr) {
            switch(parseInt(input)) {
                case 1:
                    return '学生';break;
                case 2:
                    return '计算机/互联网';break;
                case 3:
                    return '通信/电子';break;
                case 4:
                    return '生产/制造';break;
                case 5:
                    return '销售';break;
                case 6:
                    return '广告/市场';break;
                case 7:
                    return '传媒/艺术';break;
                case 8:
                    return '商贸/采购';break;
                case 9:
                    return '客户服务';break;
                case 10:
                    return '人事/行政';break;
                case 11:
                    return '100万以上';break;
                default :
                    return '未知';
            }
        }
    });

    module.filter('briMessage',function () {
        return function (input) {
            input = input.replace(/&quot;/g , "\"");
            var json =  JSON.parse(input);
            console.log(json)
            return json.bri_message;
        }
    })
})
