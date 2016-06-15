/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP SE or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
jQuery.sap.declare("sap.m.BusyIndicator");jQuery.sap.require("sap.m.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.m.BusyIndicator",{metadata:{library:"sap.m",properties:{"text":{type:"string",group:"Data",defaultValue:null},"textDirection":{type:"sap.ui.core.TextDirection",group:"Appearance",defaultValue:sap.ui.core.TextDirection.Inherit},"visible":{type:"boolean",group:"Appearance",defaultValue:true},"customIcon":{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},"customIconRotationSpeed":{type:"int",group:"Appearance",defaultValue:1000},"customIconDensityAware":{type:"boolean",group:"",defaultValue:true},"customIconWidth":{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"44px"},"customIconHeight":{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"44px"},"size":{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:null},"design":{type:"string",group:"Appearance",defaultValue:'auto'}},aggregations:{"_iconImage":{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},"_busyLabel":{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}}}});jQuery.sap.require("sap.ui.core.theming.Parameters");
sap.m.BusyIndicator.prototype.init=function(){if(sap.ui.Device.browser.chrome||sap.ui.Device.os.blackberry||sap.ui.Device.os.android&&sap.ui.Device.os.version>4.1){this._bUseSvg=true}else{this._bUseCanvas=true}this._bIosStyle=sap.ui.Device.os.ios;this._sBColor=sap.ui.core.theming.Parameters.get("sapUiPageBG")||"rgba(0, 0, 0, 0)"};
sap.m.BusyIndicator.prototype.exit=function(){this._cancelAnimation()};
if(window.requestAnimationFrame){sap.m.BusyIndicator.prototype._requestAnimation=function(c){return window.requestAnimationFrame(c)}}else if(window.webkitRequestAnimationFrame){sap.m.BusyIndicator.prototype._requestAnimation=function(c,d){return window.webkitRequestAnimationFrame(c,d)}}else if(window.mozRequestAnimationFrame){sap.m.BusyIndicator.prototype._requestAnimation=function(c){return window.mozRequestAnimationFrame(c)}}else{sap.m.BusyIndicator.prototype._requestAnimation=function(c){return window.setTimeout(c,1000/60)}};
sap.m.BusyIndicator.prototype._cancelAnimation=function(){if(!this._animationId){return}if(window.cancelAnimationFrame){window.cancelAnimationFrame(this._animationId)}else if(window.webkitCancelAnimationFrame){window.webkitCancelAnimationFrame(this._animationId)}else if(window.mozCancelAnimationFrame){window.mozCancelAnimationFrame(this._animationId)}else{window.clearTimeout(this._animationId)};this._animationId=undefined};
sap.m.BusyIndicator.prototype._animateCanvas=function(){if(!this.oCanvas){return}var c=this.oCanvas.clientWidth,a=this.oCanvas.clientHeight;if(!this.getVisible()||!c||!a){this._animationId=undefined;return}if(c!=this.oCanvas.width){this.oCanvas.setAttribute("width",c)}if(a!=this.oCanvas.height){this.oCanvas.setAttribute("height",a)}var b=this.oCanvas.getContext("2d"),w=this.oCanvas.width,h=this.oCanvas.height,x=Math.round(w/2),y=Math.round(h/2),r=Math.round(x*0.7),t=new Date(),s=0.9*(t.getSeconds()+t.getMilliseconds()/1000)*2*Math.PI,e=s+1.25*Math.PI,d=false,f=window.getComputedStyle(this.oCanvas).color,l=Math.round(w/10)*2;b.clearRect(0,0,w,h);if(sap.ui.Device.os.android&&sap.ui.Device.os.version==4.1&&!sap.ui.Device.browser.chrome){b.strokeStyle=this._sBColor;b.lineWidth=l+2;b.beginPath();b.arc(x,y,r,0,2*Math.PI);b.stroke()}b.strokeStyle=f;b.lineWidth=l;b.beginPath();b.arc(x,y,r,s,e,d);b.stroke();this._animationId=this._requestAnimation(this._fAnimateCallback,this.oCanvas)};
sap.m.BusyIndicator.prototype._doCanvas=function(){this.oCanvas=this.getDomRef("canvas");this._fAnimateCallback=jQuery.proxy(this._animateCanvas,this);this._animationId=this._requestAnimation(this._fAnimateCallback,this.oCanvas)};
sap.m.BusyIndicator.prototype._createCustomIcon=function(n,v){var s=this;if(!this._iconImage){this._iconImage=new sap.m.Image(this.getId()+"-icon",{width:"44px",height:"44px"}).addStyleClass('sapMBsyIndIcon');this._iconImage.addDelegate({onAfterRendering:function(){s._setRotationSpeed()}});this.setAggregation("_iconImage",this._iconImage,true)}this._iconImage[n](v);this._setRotationSpeed()};
sap.m.BusyIndicator.prototype._createLabel=function(n,v){if(!this._oLabel){this._oLabel=new sap.m.Label(this.getId()+"-label",{}).addStyleClass("sapMBsyIndLabel");this.setAggregation("_busyLabel",this._oLabel)}this._oLabel[n](v)};
sap.m.BusyIndicator.prototype._doPlatformDependent=function(){var $=this.$();var p=this.getParent()?this.getParent()._context:'';if(!this._bIosStyle){if(!this.getCustomIcon()&&this.$().parent('.sapMBusyDialog').length===0&&p!=='header'){var f=true;while($.css('background-color')==="rgba(0, 0, 0, 0)"){$=$.parent();if($.parent().length==0){f=false;break}}var b=f?$.css('background-color'):this._sBColor;this.$().children().children('.sapMSpinBar3').children('.sapMSpinBar4').css('background-color',b)}}};
sap.m.BusyIndicator.prototype._setRotationSpeed=function(){if(!this._iconImage)return;if(jQuery.support.cssAnimations){var $=this._iconImage.$();var r=this.getCustomIconRotationSpeed()+"ms";$.css("-webkit-animation-duration",r).css("animation-duration",r);$.css("display","none");setTimeout(function(){$.css("display","inline")},0)}else{this._rotateCustomIcon()}};
sap.m.BusyIndicator.prototype._rotateCustomIcon=function(){if(!this._iconImage){return}var $=this._iconImage.$();if(!$[0]||!$[0].offsetWidth){return}var r=this.getCustomIconRotationSpeed();if(!r)return;if(!this._fnRotateCustomIcon){this._fnRotateCustomIcon=jQuery.proxy(this._rotateCustomIcon,this)}var R=this._fnRotateCustomIcon;if(!this._$CustomRotator){this._$CustomRotator=jQuery({deg:0})}var a=this._$CustomRotator;if(a.running){return}a[0].deg=0;a.animate({deg:360},{duration:r,easing:"linear",step:function(n){a.running=true;$.css("-ms-transform",'rotate('+n+'deg)')},complete:function(){a.running=false;window.setTimeout(R,10)}})};
sap.m.BusyIndicator.prototype.onBeforeRendering=function(){this._cancelAnimation()};
sap.m.BusyIndicator.prototype.onAfterRendering=function(){if(this._bUseSvg){return}else if(this._bUseCanvas){this._doCanvas()}else{this._doPlatformDependent()}};
sap.m.BusyIndicator.prototype.setText=function(t){this.setProperty("text",t,true);this._createLabel("setText",t);return this};
sap.m.BusyIndicator.prototype.setTextDirection=function(d){this.setProperty("textDirection",d,true);this._createLabel("setTextDirection",d);return this};
sap.m.BusyIndicator.prototype.setCustomIcon=function(s){this.setProperty("customIcon",s,false);this._createCustomIcon("setSrc",s);return this};
sap.m.BusyIndicator.prototype.setCustomIconRotationSpeed=function(s){if(isNaN(s)||s<0){s=0}if(s!==this.getCustomIconRotationSpeed()){this.setProperty("customIconRotationSpeed",s,true);this._setRotationSpeed()}return this};
sap.m.BusyIndicator.prototype.setCustomIconDensityAware=function(a){this.setProperty("customIconDensityAware",a,true);this._createCustomIcon("setDensityAware",a);return this};
sap.m.BusyIndicator.prototype.setCustomIconWidth=function(w){this.setProperty("customIconWidth",w,true);this._createCustomIcon("setWidth",w);return this};
sap.m.BusyIndicator.prototype.setCustomIconHeight=function(h){this.setProperty("customIconHeight",h,true);this._createCustomIcon("setHeight",h);return this};
sap.m.BusyIndicator.prototype.setDesign=function(d){this.setProperty("design",d,true);this.$().toggleClass("sapMBusyIndicatorLight",(this.getDesign()==="light"));this.$().toggleClass("sapMBusyIndicatorDark",(this.getDesign()==="dark"));return this};
sap.m.BusyIndicator.prototype.setVisible=function(v){var d=this.getDomRef();this.setProperty("visible",v,!!d);if(d){this.getDomRef().style.visibility=v?"visible":"hidden";if(v&&!this._animationId){this._animateCanvas()}}return this};
