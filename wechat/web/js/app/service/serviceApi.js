/**
 * Created by Administrator on 2016/3/23.
 */
define(['app/module'], function (module, config) {
    module.factory('app.serviceApi', ['$http', '$q', function ($http, $q) {

        var api = {};

        //api.city = config.city;
        /**
         * 获取用户登录状态
         * @returns {*}
         */
        api.getLoginStatus = function () {
            return $http.get('/wap/user/get-login-status');
        }

        /**
         * 获取当前用户信息
         * @returns {HttpPromise}
         */
        api.getUserInfo = function (id) {
            return $http({
                method: 'get',
                url: '/wap/user/get-user-info',
                params: {id: id}
            });
        }

        /**
         * 删除消息列表item
         * @returns {*}qq
         */
        api.setMsgDisplay = function (msgId) {
            return $http.get('/wap/message/del', {params: {msgId: msgId}});
        }

        /**
         * 根据用户ID获取身份认证状态
         * @param receviceId
         * @returns {*}
         */
        api.getUserAuthStatus = function (receviceId) {
            return $http.get('url', {params: {recevice_user_id: receviceId}});
        }

        /**
         * 根据用户ID获取红娘评价
         * @param receviceId
         * @returns {*}
         */
        api.getUserMakerRated = function (receviceId) {
            return $http.get('url', {params: {recevice_user_id: receviceId}});
        }

        api.getMobileIsExist = function (_mobile) {
            return $http.get('/wap/user/mobile-is-exist', {params: {mobile: _mobile}});
        }
        /**
         * 发送短信验证码
         * @param _mobile
         * @returns {*}
         */
        api.sendCodeMsg = function (_mobile) {
            return $http.get('/wap/user/send-code-msg', {params: {mobile: _mobile}});

        }

        /**
         * 验证短信验证码
         * @param code
         * @returns {*}
         */
        api.validateCode = function (code) {
            return $http.get('/wap/user/validate-code', {params: {code: code}});
        }

        /**
         * 提交数据
         * @param formData
         * @returns {*}
         */
        api.save = function (url, formData) {
            for (var i in formData) {
                if (angular.isString(formData[i])) {
                    formData[i] = ar.utf16toEntities(formData[i]);
                }
            }
            return $http({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                    //'X-CSRF-Token':'bzFrQUtlbHU3AS8SGAweRyt1CAInMkElCXMRCzIoH0AGS1MSJjwFPg=='
                },
                params: formData
            });
        }

        /**
         * 通用Get方法
         * @param url
         * @param paramsObject // 参数 对象
         * @returns {*}
         */
        api.get = function (url, paramsObject) {
            return $http.get(url, {params: paramsObject});
        }

        /**
         * 获取状态
         * @param url
         * @returns {HttpPromise}
         */
        api.getStatus = function (url, formData) {
            return $http({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                    //'X-CSRF-Token':'bzFrQUtlbHU3AS8SGAweRyt1CAInMkElCXMRCzIoH0AGS1MSJjwFPg=='
                },
                params: formData
            });
        }

        /**
         * 获取微信配置
         * @param wx
         * @returns {*}
         */
        api.wxConfig = function () {
            var signUrl = "http://wechat.baihey.com/wap/site/main";
            return $http({
                method: 'POST',
                url: '../chat/config',
                params: {url: signUrl}
            });
        }

        /**
         * 获取列表
         * @param url
         * @param params
         * @returns {*}
         */
        api.list = function (url, params) {
            return $http({
                method: 'POST',
                url: url,
                params: params
            });
        }

        // 获取未读消息总数
        api.getMessageNumber = function () {
            return $http.get('/wap/message/get-message-sum');
        }

        /**
         * 获取关注我的总数
         */
        api.getSumFollow = function () {
            return $http.get('/wap/follow/get-sum-follow');
        }

        var dataURItoBlob = function (dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        };

        api.resizeFile = function (file) {
            var deferred = $q.defer();
            var img = document.createElement("img");
            try {
                var reader = new FileReader();
                reader.onload = function (e) {
                    img.src = e.target.result;

                    //resize the image using canvas
                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var MAX_WIDTH = 800;
                    var MAX_HEIGHT = 800;
                    var width = img.width;
                    var height = img.height;
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    //change the dataUrl to blob data for uploading to server
                    var dataURL = canvas.toDataURL('image/jpeg');
                    var blob = dataURItoBlob(dataURL);

                    deferred.resolve(blob);
                };
                reader.readAsDataURL(file);
            } catch (e) {
                deferred.resolve(e);
            }
            return deferred.promise;

        };

        return api;
    }])
});

