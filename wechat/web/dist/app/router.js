define(["app/module","app/service/serviceApi"],function(module){return module.run(["$rootScope","$state","$timeout","app.serviceApi","$ionicLoading",function(e,s,t,r,o){}]),module.config(["$stateProvider","$urlRouterProvider","$ionicConfigProvider","$controllerProvider",function(e,s,t){t.templates.maxPrefetch(0),e.state("index",{url:"/index",templateUrl:"/wechat/views/site/index.html",controller:"site.index"}).state("index_discovery",{url:"/index_discovery",templateUrl:"/wechat/views/site/discovery.html",controller:"site.discovery",resolve:{dataFilter:function(e){return e({method:"POST",url:"/wap/user/index-is-show-data",params:{}})}}}).state("error",{url:"/error",templateUrl:"/wechat/views/site/error.html",controller:"site.error"}).state("member",{cache:!1,url:"/member",templateUrl:"/wechat/views/member/index.html",controller:"member.index"}).state("member_children",{cache:!1,url:"/member/:tempName",templateUrl:function(e){return"/wechat/views/member/"+e.tempName+".html"},controllerProvider:function(e){return"member."+e.tempName}}).state("message",{cache:!0,url:"/message",templateUrl:"/wechat/views/message/index.html",controller:"message.index"}).state("userInfo",{cache:!1,url:"/userInfo",templateUrl:"/wechat/views/site/user_info.html",controller:"member.user_info",resolve:{dataFilter:function(e){return e({method:"POST",url:"/wap/user/index-is-show-data",params:{}})}}}).state("adminInfo",{cache:!1,url:"/admin_info",templateUrl:"/wechat/views/site/admin_info.html",controller:"member.admin_info",resolve:{dataFilter:function(e){return e({method:"POST",url:"/wap/user/index-is-show-data",params:{}})}}}).state("chat",{cache:!0,url:"/chat1/:id",templateUrl:"/wechat/views/message/chat1.html",controller:"message.chat1",onExit:function(e){if(void 0!=e.receiveUserInfo){var s=ar.getStorage("messageList-"+ar.getCookie("bhy_user_id"));null==s&&(s=[]);var t=!0;if(void 0!=s&&""!=s)for(var r in s)if(s[r].receive_user_id==e.receiveUserInfo.id||s[r].send_user_id==e.receiveUserInfo.id){void 0!=e.historyListHide&&e.historyListHide.length>0&&(s[r].message!=e.historyListHide[e.historyListHide.length-1].message&&(s[r].order_time=ar.timeStamp()),s[r].message=e.historyListHide[e.historyListHide.length-1].message),s[r].sumSend=0,s[r].status=1,t=!1;break}t&&e.historyListHide.length>0&&(e.receiveUserInfo.info=JSON.parse(e.receiveUserInfo.info),e.receiveUserInfo.receive_user_id=ar.getCookie("bhy_user_id"),e.receiveUserInfo.other=e.receiveUserInfo.id,e.receiveUserInfo.order_time=ar.timeStamp(),e.receiveUserInfo.send_user_id=e.receiveUserInfo.id,void 0!=e.historyListHide&&e.historyListHide.length>0&&(e.receiveUserInfo.message=e.historyListHide[e.historyListHide.length-1].message),s.push(e.receiveUserInfo)),e.messageList=s,ar.setStorage("messageList-"+ar.getCookie("bhy_user_id"),s)}}}).state("discovery",{url:"/discovery",templateUrl:"/wechat/views/discovery/index.html",controller:"discovery.index"}).state("discovery_message",{url:"/discovery_message",templateUrl:"/wechat/views/discovery/message.html",controller:"discovery.message"}).state("discovery_single",{cache:!1,url:"/discovery_single",templateUrl:"/wechat/views/discovery/single.html",controller:"discovery.single"}).state("rendezvous",{url:"/rendezvous",templateUrl:"/wechat/views/rendezvous/index.html",controller:"rendezvous.index"}).state("rendezvous_add",{url:"/rendezvous_add",templateUrl:"/wechat/views/member/rendezvous_add.html",controller:"member.rendezvous_add"}).state("rendezvous_ask",{url:"/rendezvous_ask",templateUrl:"/wechat/views/rendezvous/ask.html",controller:"rendezvous.ask"}).state("charge_order",{cache:!1,url:"/charge_order",templateUrl:"/wechat/views/charge/order.html",controller:"charge.order"}).state("charge",{cache:!1,url:"/charge_index",templateUrl:"/wechat/views/charge/index.html",controller:"charge.index"}),s.otherwise("/error")}]).controller("main",["$scope","$location","app.serviceApi","$ionicLoading","$ionicPopup","$timeout","$state","$rootScope",function($scope,$location,api,$ionicLoading,$ionicPopup,$timeout,$state,$rootScope){$scope.upUserStorage=function(name,value,type){"wu"==type?eval("$scope.userInfo."+name+" = "+value):eval("$scope.userInfo."+type+"."+name+" = "+value)},$scope.userInfo={};var getUserStorage=function(){$scope.userInfo&&($scope.userInfo.info=JSON.parse($scope.userInfo.info))},setUserInfoStorage=function(){ar.setStorage("userInfo",$scope.userInfo),getUserStorage()};$scope.setUserStorage=function(){setUserInfoStorage(),window.location.hash="#/member/information"},$scope.getUserPrivacyStorage=function(e){setUserInfoStorage(),""!=e&&void 0!=typeof e&&(window.location.hash=e)},ar.getCookie("bhy_user_id")?(api.list("/wap/member/honesty-photo",[]).success(function(e){$scope.sfzCheck=e.sfz,$scope.marrCheck=e.marr,$scope.eduCheck=e.edu,$scope.housingCheck=e.housing}),api.list("/wap/user/get-user-info",{}).success(function(e){$scope.userInfo=e.data,setUserInfoStorage()})):("out"==ar.getCookie("wx_login")&&(ar.saveDataAlert($ionicPopup,"您的账号异常，已经被限制登录！如有疑问请致电：023-68800997。"),ar.delCookie("wx_login")),ar.setStorage("userInfo",null),$location.url("/index")),$scope.getTravel=function(name,serId){if(null!=serId){var arrSer=serId.split(",");eval("$scope."+name+"_count = "+arrSer.length),api.list("/wap/member/get-travel-list",{area_id:serId}).success(function(res){eval("$scope."+name+" = "+JSON.stringify(res.data))})}else eval("$scope."+name+"_count = 0")},$scope.getConfig=function(name,serId){if(null!=serId){var arrSer=serId.split(",");eval("$scope."+name+"_count = "+arrSer.length),api.list("/wap/member/get-config-list",{config_id:serId}).success(function(res){eval("$scope."+name+" = "+JSON.stringify(res.data))})}else eval("$scope."+name+"_count = 0")},$scope.showLoading=function(e){$ionicLoading.show({template:'<p class="tac">上传中...</p><p class="tac">'+e+"%</p>"})},$scope.hideLoading=function(){$ionicLoading.hide()},$scope.uploaderImage=function(e,s){var t=document.getElementById(s),r=document.createEvent("MouseEvents");r.initEvent("click",!0,!0),t.dispatchEvent(r),e.filters.push({name:"file-type-Res",fn:function(e){return ar.msg_file_res_img(e)?!0:(ar.saveDataAlert($ionicPopup,"只能上传图片类型的文件！"),!1)}}),e.filters.push({name:"file-size-Res",fn:function(e){return e.size>8388608?(ar.saveDataAlert($ionicPopup,"请选择小于8MB的图片！"),!1):!0}}),e.onAfterAddingFile=function(e){e.upload()},e.onProgressItem=function(e,s){$scope.showLoading(s)},e.onSuccessItem=function(e,t,r,o){t.status>0?$scope.$broadcast("thumb_path",s,t):ar.saveDataAlert($ionicPopup,t.info)},e.onErrorItem=function(e,s,t,r){ar.saveDataAlert($ionicPopup,"上传图片出错！"),$scope.hideLoading()},e.onCompleteItem=function(e,s,t,r){$scope.hideLoading()}},$scope.honesty=function(e){return 1&e};var userId=ar.getCookie("bhy_user_id");$scope.dataFilter=JSON.parse(ar.getCookie("indexIsShowData")),userId>0&&requirejs(["plugin/socket/socket.io.1.4.0"],function(e){var s={messageList:function(){api.list("/wap/message/message-list",[]).success(function(e){var s=ar.getStorage("messageList-"+userId)?ar.getStorage("messageList-"+userId):[],t=e.data;for(var r in t){t[r].info=JSON.parse(t[r].info),t[r].order_time=parseInt(t[r].create_time);var o=!0;for(var i in s)if(s[i].send_user_id==t[r].send_user_id){s[i]=t[r],o=!1;break}o&&s.push(t[r])}$rootScope.messageList=s,ar.setStorage("messageList-"+userId,s)})},indexIsShowData:function(){api.list("/wap/user/index-is-show-data",{}).success(function(e){$scope.dataFilter=e})},mainIntercept:function(){$scope.newFollow=!1,$scope.newFollowNumber=0,api.get("/wap/follow/is-new-follow",{user_id:userId}).success(function(e){$scope.newFollow=e.status,$scope.newFollowNumber=e.data})},commentNum:function(){$scope.newDiscovery=0,api.get("/wap/member/comment-num",{}).success(function(e){var s=ar.getStorage("discoverySum");e.data>s&&($scope.newDiscovery=e.data-s)})}};for(var t in s)s[t]();$rootScope.$watch("messageList",function(){$scope.messageList=$rootScope.messageList;var e=0;for(var s in $scope.messageList)parseInt($scope.messageList[s].sumSend)>0&&(e+=parseInt($scope.messageList[s].sumSend));$scope.msgNumber=e}),$scope.skt=e.connect("http://120.76.84.162:8088"),$scope.skt.on(userId,function(e){("/chat1/:id"!=$state.current.url||$state.params.id!=e.send_user_id)&&s.messageList(),void 0!=e.method&&s[e.method]()})}),$scope.$on("$stateChangeStart",function(e,s){if("/index"!=s.url&&"/error"!=s.url)if($ionicLoading.show(),void 0===sessionStorage.loginStatus)api.getLoginStatus().success(function(e){return sessionStorage.loginStatus=e.status,e.status?void 0:(location.href="/wap/user/login",!1)});else if(0==sessionStorage.loginStatus)return location.href="/wap/user/login",!1}),$scope.$on("$stateChangeSuccess",function(){$ionicLoading.hide()})}])});