/*
 ng-sortable v1.3.5
 The MIT License (MIT)

 Copyright (c) 2014 Muhammed Ashik

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

!function(){"use strict";angular.module("as.sortable",[]).constant("sortableConfig",{itemClass:"as-sortable-item",handleClass:"as-sortable-item-handle",placeHolderClass:"as-sortable-placeholder",dragClass:"as-sortable-drag",hiddenClass:"as-sortable-hidden",dragging:"as-sortable-dragging"})}(),function(){"use strict";var e=angular.module("as.sortable");e.factory("$helper",["$document","$window",function(e,t){return{height:function(e){return e[0].getBoundingClientRect().height},width:function(e){return e[0].getBoundingClientRect().width},offset:function(n,o){var a=n[0].getBoundingClientRect();return o||(o=e[0].documentElement),{width:a.width||n.prop("offsetWidth"),height:a.height||n.prop("offsetHeight"),top:a.top+(t.pageYOffset||o.scrollTop-o.offsetTop),left:a.left+(t.pageXOffset||o.scrollLeft-o.offsetLeft)}},eventObj:function(e){var t=e;return void 0!==e.targetTouches?t=e.targetTouches.item(0):void 0!==e.originalEvent&&void 0!==e.originalEvent.targetTouches&&(t=e.originalEvent.targetTouches.item(0)),t},isTouchInvalid:function(e){var t=!1;return void 0!==e.touches&&e.touches.length>1?t=!0:void 0!==e.originalEvent&&void 0!==e.originalEvent.touches&&e.originalEvent.touches.length>1&&(t=!0),t},positionStarted:function(e,t,n){var o={};return o.offsetX=e.pageX-this.offset(t,n).left,o.offsetY=e.pageY-this.offset(t,n).top,o.startX=o.lastX=e.pageX,o.startY=o.lastY=e.pageY,o.nowX=o.nowY=o.distX=o.distY=o.dirAx=0,o.dirX=o.dirY=o.lastDirX=o.lastDirY=o.distAxX=o.distAxY=0,o},calculatePosition:function(e,t){e.lastX=e.nowX,e.lastY=e.nowY,e.nowX=t.pageX,e.nowY=t.pageY,e.distX=e.nowX-e.lastX,e.distY=e.nowY-e.lastY,e.lastDirX=e.dirX,e.lastDirY=e.dirY,e.dirX=0===e.distX?0:e.distX>0?1:-1,e.dirY=0===e.distY?0:e.distY>0?1:-1;var n=Math.abs(e.distX)>Math.abs(e.distY)?1:0;e.dirAx!==n?(e.distAxX=0,e.distAxY=0):(e.distAxX+=Math.abs(e.distX),0!==e.dirX&&e.dirX!==e.lastDirX&&(e.distAxX=0),e.distAxY+=Math.abs(e.distY),0!==e.dirY&&e.dirY!==e.lastDirY&&(e.distAxY=0)),e.dirAx=n},movePosition:function(e,t,n,o,a,l){var r,s="relative"===a;t.x=e.pageX-n.offsetX,t.y=e.pageY-n.offsetY,o&&(r=this.offset(o,l),s&&(t.x-=r.left,t.y-=r.top,r.left=0,r.top=0),t.x<r.left?t.x=r.left:t.x>=r.width+r.left-this.offset(t).width&&(t.x=r.width+r.left-this.offset(t).width),t.y<r.top?t.y=r.top:t.y>=r.height+r.top-this.offset(t).height&&(t.y=r.height+r.top-this.offset(t).height)),t.css({left:t.x+"px",top:t.y+"px"}),this.calculatePosition(n,e)},dragItem:function(e){return{index:e.index(),parent:e.sortableScope,source:e,targetElement:null,targetElementOffset:null,sourceInfo:{index:e.index(),itemScope:e.itemScope,sortableScope:e.sortableScope},canMove:function(e,t,n){return this.targetElement!==t?(this.targetElement=t,this.targetElementOffset=n,!0):e.dirX*(n.left-this.targetElementOffset.left)>0||e.dirY*(n.top-this.targetElementOffset.top)>0?(this.targetElementOffset=n,!0):!1},moveTo:function(e,t){this.parent=e,this.isSameParent()&&this.source.index()<t&&!this.sourceInfo.sortableScope.cloning&&(t-=1),this.index=t},isSameParent:function(){return this.parent.element===this.sourceInfo.sortableScope.element},isOrderChanged:function(){return this.index!==this.sourceInfo.index},eventArgs:function(){return{source:this.sourceInfo,dest:{index:this.index,sortableScope:this.parent}}},apply:function(){this.sourceInfo.sortableScope.cloning?this.parent.options.clone||this.parent.insertItem(this.index,angular.copy(this.source.modelValue)):(this.sourceInfo.sortableScope.removeItem(this.sourceInfo.index),(this.parent.options.allowDuplicates||this.parent.modelValue.indexOf(this.source.modelValue)<0)&&this.parent.insertItem(this.index,this.source.modelValue))}}},noDrag:function(e){return void 0!==e.attr("no-drag")||void 0!==e.attr("data-no-drag")},findAncestor:function(e,t){e=e[0];for(var n=Element.matches||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector||Element.prototype.webkitMatchesSelector;(e=e.parentElement)&&!n.call(e,t););return e?angular.element(e):angular.element(document.body)}}}])}(),function(){"use strict";var e=angular.module("as.sortable");e.controller("as.sortable.sortableController",["$scope",function(e){this.scope=e,e.modelValue=null,e.callbacks=null,e.type="sortable",e.options={longTouch:!1},e.isDisabled=!1,e.insertItem=function(t,n){e.options.allowDuplicates?e.modelValue.splice(t,0,angular.copy(n)):e.modelValue.splice(t,0,n)},e.removeItem=function(t){var n=null;return t>-1&&(n=e.modelValue.splice(t,1)[0]),n},e.isEmpty=function(){return e.modelValue&&0===e.modelValue.length},e.accept=function(t,n,o){return e.callbacks.accept(t,n,o)}}]),e.directive("asSortable",function(){return{require:"ngModel",restrict:"A",scope:!0,controller:"as.sortable.sortableController",link:function(e,t,n,o){var a,l;a=o,a&&(a.$render=function(){e.modelValue=a.$modelValue},e.element=t,t.data("_scope",e),l={accept:null,orderChanged:null,itemMoved:null,dragStart:null,dragMove:null,dragCancel:null,dragEnd:null},l.accept=function(e,t,n){return!0},l.orderChanged=function(e){},l.itemMoved=function(e){},l.dragStart=function(e){},l.dragMove=angular.noop,l.dragCancel=function(e){},l.dragEnd=function(e){},e.$watch(n.asSortable,function(t,n){angular.forEach(t,function(t,n){l[n]?"function"==typeof t&&(l[n]=t):e.options[n]=t}),e.callbacks=l},!0),angular.isDefined(n.isDisabled)&&e.$watch(n.isDisabled,function(t,n){angular.isUndefined(t)||(e.isDisabled=t)},!0))}}})}(),function(){"use strict";function e(t,n){return n&&"HTML"!==n.nodeName?n.parentNode===t?!0:e(t,n.parentNode):!1}var t=angular.module("as.sortable");t.controller("as.sortable.sortableItemHandleController",["$scope",function(e){this.scope=e,e.itemScope=null,e.type="handle"}]),t.directive("asSortableItemHandle",["sortableConfig","$helper","$window","$document","$timeout",function(t,n,o,a,l){return{require:"^asSortableItem",scope:!0,restrict:"A",controller:"as.sortable.sortableItemHandleController",link:function(r,s,i,c){function u(e,t){"table-row"!==h.css("display")&&h.css("display","block"),t.sortableScope.options.clone||(e[0].parentNode.insertBefore(h[0],e[0]),v.moveTo(t.sortableScope,t.index()))}function d(e,t){"table-row"!==h.css("display")&&h.css("display","block"),t.sortableScope.options.clone||(e.after(h),v.moveTo(t.sortableScope,t.index()+1))}function p(e){for(var t;!t&&e.length;)t=e.data("_scope"),t||(e=e.parent());return t}function m(){r.itemScope.sortableScope.cloning||b.replaceWith(r.itemScope.element),h.remove(),f.remove(),f=null,N=!1,S.css("cursor",""),S.removeClass("as-sortable-un-selectable")}var f,h,b,g,v,S,C,y,x,Y,X,w,E,$,I,k,A,M,D,V,T,O,P,H,N,q,j,B,L=!1,_=!1;V="ontouchstart"in o,T=/iPad|iPhone|iPod/.test(o.navigator.userAgent)&&!o.MSStream,t.handleClass&&s.addClass(t.handleClass),r.itemScope=c.scope,s.data("_scope",r),r.$watchGroup(["sortableScope.isDisabled","sortableScope.options.longTouch"],function(e){L!==e[0]?(L=e[0],L?A():k()):_!==e[1]?(_=e[1],A(),k()):k()}),r.$on("$destroy",function(){angular.element(a[0].body).unbind("keydown",B)}),q=function(e){return"function"==typeof r.sortableScope.options.placeholder?angular.element(r.sortableScope.options.placeholder(e)):"string"==typeof r.sortableScope.options.placeholder?angular.element(r.sortableScope.options.placeholder):angular.element(a[0].createElement(e.element.prop("tagName")))},y=function(e){var t,o=function(){angular.element(a).unbind("mousemove",l),angular.element(a).unbind("touchmove",l),s.unbind("mouseup",o),s.unbind("touchend",o),s.unbind("touchcancel",o)},l=function(a){a.preventDefault();var l=n.eventObj(a);t||(t={clientX:l.clientX,clientY:l.clientY}),Math.abs(l.clientX-t.clientX)+Math.abs(l.clientY-t.clientY)>10&&(o(),Y(e))};angular.element(a).bind("mousemove",l),angular.element(a).bind("touchmove",l),s.bind("mouseup",o),s.bind("touchend",o),s.bind("touchcancel",o),e.stopPropagation()},Y=function(e){var o,l;(V||2!==e.button&&3!==e.which)&&(V&&n.isTouchInvalid(e)||!N&&$(e)&&(N=!0,e.preventDefault(),o=n.eventObj(e),r.sortableScope=r.sortableScope||r.itemScope.sortableScope,r.callbacks=r.callbacks||r.itemScope.callbacks,r.itemScope.sortableScope.options.clone||r.itemScope.sortableScope.options.ctrlClone&&e.ctrlKey?r.itemScope.sortableScope.cloning=!0:r.itemScope.sortableScope.cloning=!1,x=angular.element(a[0].querySelector(r.sortableScope.options.scrollableContainer)).length>0?a[0].querySelector(r.sortableScope.options.scrollableContainer):a[0].documentElement,S=r.sortableScope.options.containment?n.findAncestor(s,r.sortableScope.options.containment):angular.element(a[0].body),S.css("cursor","move"),S.css("cursor","-webkit-grabbing"),S.css("cursor","-moz-grabbing"),S.addClass("as-sortable-un-selectable"),C=r.sortableScope.options.containerPositioning||"absolute",v=n.dragItem(r),l=r.itemScope.element.prop("tagName"),f=angular.element(a[0].createElement(r.sortableScope.element.prop("tagName"))).addClass(r.sortableScope.element.attr("class")).addClass(t.dragClass),f.css("width",n.width(r.itemScope.element)+"px"),f.css("height",n.height(r.itemScope.element)+"px"),h=q(r.itemScope).addClass(t.placeHolderClass).addClass(r.sortableScope.options.additionalPlaceholderClass),h.css("width",n.width(r.itemScope.element)+"px"),h.css("height",n.height(r.itemScope.element)+"px"),b=angular.element(a[0].createElement(l)),t.hiddenClass&&b.addClass(t.hiddenClass),g=n.positionStarted(o,r.itemScope.element,x),r.itemScope.sortableScope.options.clone||r.itemScope.element.after(h),r.itemScope.sortableScope.cloning?f.append(r.itemScope.element.clone()):(r.itemScope.element.after(b),f.append(r.itemScope.element)),S.append(f),n.movePosition(o,f,g,S,C,x),r.sortableScope.$apply(function(){r.callbacks.dragStart(v.eventArgs())}),M()))},$=function(e){var t,o,a;for(t=angular.element(e.target),o=p(t),a=o&&"handle"===o.type;a&&t[0]!==s[0];)n.noDrag(t)&&(a=!1),t=t.parent();return a},X=function(l){var s,i,c,m,b;if((!V||!n.isTouchInvalid(l))&&N&&f){if(l.preventDefault(),s=n.eventObj(l),r.callbacks.dragMove!==angular.noop&&r.sortableScope.$apply(function(){r.callbacks.dragMove(g,S,s)}),i=s.pageX-a[0].documentElement.scrollLeft,c=s.pageY-(o.pageYOffset||a[0].documentElement.scrollTop),f.addClass(t.hiddenClass),b=angular.element(a[0].elementFromPoint(i,c)),f.removeClass(t.hiddenClass),n.movePosition(s,f,g,S,C,x),f.addClass(t.dragging),m=p(b),!m||!m.type)return;if("handle"===m.type&&(m=m.itemScope),"item"!==m.type&&"sortable"!==m.type)return;if("item"===m.type&&m.accept(r,m.sortableScope,m)){b=m.element;var y=n.offset(b,x);if(!v.canMove(g,b,y))return;var Y=I(m.sortableScope.element);0>Y?u(b,m):Y<=m.index()?d(b,m):u(b,m)}"sortable"===m.type&&m.accept(r,m)&&!e(m.element[0],b[0])&&(j(b)||m.options.clone||(b[0].appendChild(h[0]),v.moveTo(m,m.modelValue.length)))}},I=function(e){var n,o;if(e.hasClass(t.placeHolderClass))return 0;for(n=e.children(),o=0;o<n.length;o+=1)if(angular.element(n[o]).hasClass(t.placeHolderClass))return o;return-1},j=function(e){return I(e)>=0},w=function(e){N&&(e.preventDefault(),f&&(m(),v.apply(),r.sortableScope.$apply(function(){v.isSameParent()?v.isOrderChanged()&&r.callbacks.orderChanged(v.eventArgs()):r.callbacks.itemMoved(v.eventArgs())}),r.sortableScope.$apply(function(){r.callbacks.dragEnd(v.eventArgs())}),v=null),D())},E=function(e){N&&(e.preventDefault(),f&&(m(),r.sortableScope.$apply(function(){r.callbacks.dragCancel(v.eventArgs())}),v=null),D())},k=function(){V&&(_?T?(s.bind("touchstart",O),s.bind("touchend",P),s.bind("touchmove",P)):s.bind("contextmenu",y):s.bind("touchstart",y)),s.bind("mousedown",y)},A=function(){s.unbind("touchstart",O),s.unbind("touchend",P),s.unbind("touchmove",P),s.unbind("contextmenu",y),s.unbind("touchstart",y),s.unbind("mousedown",y)},O=function(e){H=l(function(){y(e)},500)},P=function(){l.cancel(H)},B=function(e){27===e.keyCode&&E(e)},angular.element(a[0].body).bind("keydown",B),M=function(){angular.element(a).bind("touchmove",X),angular.element(a).bind("touchend",w),angular.element(a).bind("touchcancel",E),angular.element(a).bind("mousemove",X),angular.element(a).bind("mouseup",w)},D=function(){angular.element(a).unbind("touchend",w),angular.element(a).unbind("touchcancel",E),angular.element(a).unbind("touchmove",X),angular.element(a).unbind("mouseup",w),angular.element(a).unbind("mousemove",X)}}}}])}(),function(){"use strict";var e=angular.module("as.sortable");e.controller("as.sortable.sortableItemController",["$scope",function(e){this.scope=e,e.sortableScope=null,e.modelValue=null,e.type="item",e.index=function(){return e.$index},e.itemData=function(){return e.sortableScope.modelValue[e.$index]}}]),e.directive("asSortableItem",["sortableConfig",function(e){return{require:["^asSortable","?ngModel"],restrict:"A",controller:"as.sortable.sortableItemController",link:function(t,n,o,a){var l=a[0],r=a[1];e.itemClass&&n.addClass(e.itemClass),t.sortableScope=l.scope,r?r.$render=function(){t.modelValue=r.$modelValue}:t.modelValue=l.scope.modelValue[t.$index],t.element=n,n.data("_scope",t)}}}])}();