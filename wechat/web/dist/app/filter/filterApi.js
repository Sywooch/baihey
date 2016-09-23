define(["app/module"],function(n){function r(n){return Math.floor((ar.timeStamp()-n)/365/24/3600)}var t=function(n,r){if(0==r)return"不限";for(var t in n)if(n[t].id==r)return n[t].name},e=function(n,r){if(!n)return"不限";n+="";var e=n.split(","),i="";for(var f in e)i+=t(r,parseInt(e[f]))+" ";return i};n.filter("timeToAge",function(){return function(n,t,e){return n?r(n)+"岁":""}}),n.filter("sex",function(){return function(n,t,e,i){return n?i&&i>9999?(e=r(e),1==t?n.substr(0,1)+"先生":e>=35?n.substr(0,1)+"女士":n.substr(0,1)+"小姐"):n:void 0}}),n.filter("realName",function(){return function(n,r){return n?n.substr(0,1)+"**":""}}),n.filter("marriage",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){var t=config_infoData.marriage;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("education",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){var t=config_infoData.education;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("child",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){var t=config_infoData.children;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("yearIncome",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){var t=config_infoData.salary;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("purchase",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){if(0==n)return"不限";var t=config_infoData.house;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("car",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){if(0==n)return"不限";var t=config_infoData.car;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("occupation",function(){return function(n,r){var t="";if(n){var e=config_infoData.occupation;for(var i in e)if(e[i].id==n){t=e[i].name;break}if(r){var f=config_infoData.children_occupation;for(var i in f)if(f[i].id==r){t+=" "+f[i].name;break}}return t}return""}}),n.filter("address",function(){return function(n,r,t){var e="";return n&&"0"!=n&&(e+=i(provines,n),r&&"0"!=r&&(e+="-",e+=i(citys,r),t&&"0"!=t&&(e+="-",e+=i(area,t)))),e}});var i=function(n,r){for(var t in n)if(n[t].id==r)return n[t].name};n.filter("zodiac",function(){return function(n,r){if(!n)return"";var t=config_infoData.zodiac;for(var e in t)if(t[e].id==parseInt(n))return"属"+t[e].name}}),n.filter("constellation",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){var t=config_infoData.constellation;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("nation",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){var t=config_infoData.nation;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("blood",function(){return function(n,r){if("undefined"!=typeof n&&""!=n){var t=config_infoData.blood;for(var e in t)if(t[e].id==parseInt(n))return t[e].name}}}),n.filter("zo_age",function(){return function(n){if(n){var r=n.split("-");return"0"==r[1]?r[0]+"岁以上":n+"岁"}return""}}),n.filter("zo_height",function(){return function(n){if(n){var r=n.split("-");return"0"==r[1]?r[0]+"厘米以上":n+"厘米"}return""}}),n.filter("zo_marriage",function(){return function(n,r){return"undefined"!=typeof n?e(n,config_infoData.marriage):void 0}}),n.filter("zo_children",function(){return function(n,r){return"undefined"!=typeof n?e(n,config_infoData.children):void 0}}),n.filter("zo_zodiac",function(){return function(n,r){return"undefined"!=typeof n&&""!=n?e(n,config_infoData.zodiac):void 0}}),n.filter("zo_constellation",function(){return function(n,r){return"undefined"!=typeof n&&""!=n?e(n,config_infoData.constellation):void 0}}),n.filter("privacy",function(){return function(n,r){switch(n){case"1":return"全部可见";case"2":return"我关注的人可见";case"3":return"VIP会员可见";case"4":return"不公开"}}}),n.filter("rend_status",function(){return function(n){switch(n){case"0":return"已删除";case"1":return"显示中";case"2":return"已结束";case"3":return"已关闭";default:return"状态错误"}}}),n.filter("cut",function(){return function(n,r,t,e){if(!n)return"";if(t=parseInt(t,10),!t)return n;if(n.length<=t)return n;if(n=n.substr(0,t),r){var i=n.lastIndexOf(" ");-1!=i&&(n=n.substr(0,i))}return n+(e||" …")}}),n.filter("briMessage",function(){return function(n){if("undefined"!=typeof n&&""!=n){n=n.replace(/&quot;/g,'"');var r=JSON.parse(n);return r.bri_message}}}),n.filter("sexDisplay",function(){return function(n){return 0==n?"女生":1==n?"男生":"不限"}}),n.filter("themeDisplay",function(){return function(n){switch(n){case 1:return"娱乐";case 2:return"美食";case 3:return"旅游";case 4:return"运动健身";default:return"其他"}}}),n.filter("feeDisplay",function(){return function(n){return 1==n?"免费":3==n?"你请客":2==n?"我请客":4==n?"AA制":void 0}}),n.filter("unix",function(){return function(n){}}),n.filter("picture",function(){return function(n){return n?n.replace("thumb","picture"):" "}}),n.filter("height",function(){return function(n){return parseInt(n)?n+"cm":""}}),n.filter("bank",["$sce",function(n){return function(r,t){return r?"name"==t?r.split("-")[0]:"type"==t?r.split("-")[1]:"card"==t?r.substring(r.length-4,r.length):r:n.trustAsHtml('<img src="/wechat/web/images/loading.gif">')}}]),n.filter("withdrawStatusTitle",function(){return function(n){return n?1==n?"已打款":2==n?"处理中":"失败":"失败"}}),n.filter("amount",function(){return function(n){var r=0;if(n){for(var t in n)r+=parseInt(n[t].money);return r/100}return r}}),n.filter("isNull",function(){return function(n){return n?n:" "}}),n.filter("recordName",function(){return function(n,r){if("提现"==r){var t=n.split("-");return t[0]+"("+t[1]+" "+t[2].substr(t[2].length-4)+")"}return"嘉瑞红包"==r?ar.cleanQuotes(n):n}}),n.filter("recordStatus",function(){return function(n,r){return"提现"==r?"已打款":"嘉瑞红包"==r?"对方已领取":n}}),n.filter("cut",function(){return function(n,r,t,e){if(!n)return"";if(t=parseInt(t,10),!t)return n;if(n.length<=t)return n;if(n=n.substr(0,t),r){var i=n.lastIndexOf(" ");-1!=i&&(n=n.substr(0,i))}return n+(e||" …")}}),n.filter("messageFilter",function(){return function(n){return n&&-1!=n.indexOf("/images/upload")?"[图片]":n}}),n.filter("level",function(){return function(n){return 1==n?"VIP":2==n?"贵宾":3==n?"钻石":n}}),n.filter("qqwx",function(){return function(n){return n.substr(0,3)+"******"}}),n.filter("emoji",function(n){return function(r){if(r){for(var t,e,i=r,f=/\[\W+:\d+\]/g,u=75;t=f.exec(r);)e=t[0].slice(t[0].split(":")[0].length+1,-1),i=e>u?i.replace(t[0],"[X]"):i.replace(t[0],'<img class="emoji" src="/wechat/web/images/emoji/'+e+'.gif" />');return n.trustAsHtml(i)}}})});