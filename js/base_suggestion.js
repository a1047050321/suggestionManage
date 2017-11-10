/**!
 * @description：与业务无关，避免浏览器的兼容性问题
 * @author：张伦
 */
var BASE_UTIL = top.BASE_UTIL || {
    /**
     * [I18N 国际化的相关变量]
     * @type {Object}
     */
    I18N : {
        //数字变汉字
        num2word: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
    },
    /**
     * [EVENT 事件相关的工具方法]
     * @type {Object}
     */
    EVENT : {
        /**
         * [getEventTarget 获取事件的对象]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        getEventTarget: function(e) {
            var ee = e || window.event;
            return ee.target || ee.srcElement;
        },
        /**
         * [stopEventPropagation 阻止冒泡事件]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        stopEventPropagation: function(e) {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        /**
         * [getPostion 获取事件的鼠标位置]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        getPostion: function(e){
            var ee = e || window.event;
            var postion = {};
            postion.x = ee.x || ee.pageX;
            postion.y = ee.y || ee.pageY;
            return postion;
        },
        /**
         * [preventDefaultAction 阻止默认事件]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        preventDefaultAction: function(e){
            if(e&&e.preventDefault){
                e.preventDefault();
            }else{
                e.returnValue = false;
            }
        },
        /**
         * [获得按键码，比如按下0，得到的是48]
         * @param  {[type]} event [description]
         * @return {[type]}       [description]
         */
        getCharCode: function(event){
            if (typeof event.charCode == "number") {
                return event.charCode;
            } else {
                return event.keyCode;
            }
        }
    },

    /**
     * [UI dom元素相关的工具方法]
     * @type {Object}
     */
    UI : {
        /**
         * [autoResizeImage 根据图片的打下进行等比例的缩放]
         * @param  {number} _maxwidth  [容器最大的长度]
         * @param  {number} _maxheight [容器最大的宽度]
         * @param  {number} _imgwidth  [图片的实际尺寸]
         * @param  {number} _imgheight [图片的实际尺寸]
         * @return {json}              [显示时图片的尺寸]
         */
        autoResizeImage: function(_maxwidth,_maxheight,_imgwidth,_imgheight){
            var obj = {
                w: 0,
                h: 0
            };
            var maxWidth = _maxwidth;
            var maxHeight = _maxheight;
            var hRatio;
            var wRatio;
            var Ratio = 1;
            var w = _imgwidth;
            var h = _imgheight;
            wRatio = maxWidth / w;
            hRatio = maxHeight / h;
            if (maxWidth == 0 && maxHeight == 0) {
                Ratio = 1;
            } else if (maxWidth == 0) { //
                if (hRatio < 1) Ratio = hRatio;
            } else if (maxHeight == 0) {
                if (wRatio < 1) Ratio = wRatio;
            } else if (wRatio < 1 || hRatio < 1) {
                Ratio = (wRatio <= hRatio ? wRatio : hRatio);
            }
            if (Ratio < 1) {
                w = w * Ratio;
                h = h * Ratio;
            }

            obj.w = w;
            obj.h = h;
            return obj;
        },
        /**
         * [isScroll 判断某个容器是否出现了滚动条]
         * @param  {[type]}  el [dom对象]
         * @return {Boolean}    [description]
         */
        isScroll: function(el) {
            // test targets
            var elems = el ? [el] : [document.documentElement, document.body];
            var scrollX = false,
            scrollY = false;
            for (var i = 0,len = elems.length; i < len; i++) {
                var o = elems[i];
                // test horizontal
                var sl = o.scrollLeft;
                o.scrollLeft += (sl > 0) ? -1 : 1;
                o.scrollLeft !== sl && (scrollX = scrollX || true);
                o.scrollLeft = sl;
                // test vertical
                var st = o.scrollTop;
                o.scrollTop += (st > 0) ? -1 : 1;
                o.scrollTop !== st && (scrollY = scrollY || true);
                o.scrollTop = st;
            }
            // ret
            return {
                scrollX: scrollX,
                scrollY: scrollY
            };
        }
    },

    /**
     * [BASIC js基本方法，与js引擎相关]
     * @type {Object}
     */
    BASIC : {
        /**
         * [getArgs 取出url参数字符串中对应key的参数]
         * @param  {[type]} argsStr  [具体的url]
         * @param  {[type]} argsAame [参数名称]
         * @return {[string]}        [不存在指定参数则返回空字符串]
         */
        getArgs: function(argsStr,argsAame){
            if (argsStr == null) {
                return "";
            }

            var pattern = new RegExp("(?:[&?])" + argsAame + "=([^&]*)(?:&|$)", "ig");
            var result = pattern.exec(argsStr);
            if (result != null && result[1] != null) {
                return result[1];
            }
            return "";
        },
        /**
         * [getDateStrFrmt   根据pattern格式化日期]
         * @param  {[type]} utcString [description]
         * @param  {[type]} pattern   [例如yyyy-MM-dd hh:mm:ss]
         * @return {[type]}           [description]
         */
        getDateStrFrmt: function(utcString, pattern) {
            if (!utcString) return "";
            var res = pattern;
            var d = null;
            if (utcString instanceof Date) {
                d = utcString;

            } else {
                var timeLength = (utcString + "").length;

                //使用的是毫秒数
                if (timeLength == 13 && !/\D/.test(utcString + "")) { 
                    utcString = Math.floor(utcString - 0);

                //使用的秒数
                } else if (timeLength == 10 && !/\D/.test(utcString + "")) { 
                    utcString = Math.floor(utcString - 0) * 1000;
                }

                //时间字符串
                if (typeof utcString == "string") {
                    //火狐浏览器不支持new Date("2014-12-12 12:12:12")的形式，只能使用
                    //                new Date("2014/12/12 12:12:12")
                    utcString = utcString.replace(/-/gi, "/");
                }
                d = new Date(utcString);
            }

            //不合法的日期
            if (isNaN(d.getTime())) { 
                return "";
            }

            var month = d.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }

            var date = d.getDate();
            if (date < 10) {
                date = "0" + date;
            }

            var year = d.getFullYear();
            var hour = d.getHours();
            if (hour < 10) {
                hour = "0" + hour;
            }

            var minute = d.getMinutes();
            if (minute < 10) {
                minute = "0" + minute;
            }

            var secomnd = d.getSeconds();
            if (secomnd < 10) {
                secomnd = "0" + secomnd;
            }

            var millsecond = d.getMilliseconds();
            res = res.replace("yyyy", year);
            res = res.replace("MM", month);
            res = res.replace("dd", date);
            res = res.replace("hh", hour);
            res = res.replace("mm", minute);
            res = res.replace("ss", secomnd);
            return res;
        },
        /**
         * [sumBigIntStrings 加大整数相加，入参必须以字符串的形式上]
         * @param  {string} a [description]
         * @param  {string} b [description]
         * @return {[type]}   [description]
         */
        sumBigIntStrings: function(a,b){
            var res='', c=0;
            a = a.split('');
            b = b.split('');
            while (a.length || b.length || c){
                c += ~~a.pop() + ~~b.pop();
                res = c % 10 + res;
                c = c>9;
            }
            return res.replace(/^0+/,'');
        }
    },
    /**
     * [FIlE 文件相关的操作类]
     * @type {Object}
     */
    FILE:{
        /**
         * [getFileName 给定文件的路径，获取]
         * @param  {[type]} filePath [description]
         * @return {[type]}          [description]
         */
        getFileName: function(filePath){
            
            if(typeof filePath != "string" || filePath == ""){
                return {
                    fileName:"",
                    name:"",
                    suffix:""
                };
            }

            var index = filePath.lastIndexOf("/") ;
                index == -1 ? index = 0 : "";
            var fileName = filePath.substr(index);
            return {
                fileName:fileName,
                name:fileName.split(".")[0],
                suffix:fileName.split(".")[1]
            };
        }
    }
    
    
};

//对数组进行扩展
$.extend(Array.prototype,{
    /**
     * [deleteItem 删除数组中的某项,如果存在多项，则循环删除]
     * @return {[type]} [description]
     */
    deleteItem: function(){
        var index = $.inArray(value, this);
        if (index > -1) {
            this.splice(index, 1);
            arguments.callee.call(this, value);
        } else {
            return this;
        }
    },
});


//对字符串进行扩展
$.extend(String.prototype,{
   
    /**
     * 计算字符串所占的内存字节数，默认使用UTF-8的编码方式计算，也可制定为UTF-16
     * UTF-8 是一种可变长度的 Unicode 编码格式，使用一至四个字节为每个字符编码
     *
     * 000000 - 00007F(128个代码)      0zzzzzzz(00-7F)                             一个字节
     * 000080 - 0007FF(1920个代码)     110yyyyy(C0-DF) 10zzzzzz(80-BF)             两个字节
     * 000800 - 00D7FF
       00E000 - 00FFFF(61440个代码)    1110xxxx(E0-EF) 10yyyyyy 10zzzzzz           三个字节
     * 010000 - 10FFFF(1048576个代码)  11110www(F0-F7) 10xxxxxx 10yyyyyy 10zzzzzz  四个字节
     *
     * 注: Unicode在范围 D800-DFFF 中不存在任何字符
     *
     {@link <a 
    onclick="javascript:pageTracker._trackPageview('/outgoing/zh.wikipedia.org/wiki/UTF-8');"
      
    href="http://zh.wikipedia.org/wiki/UTF-8">http://zh.wikipedia.org/wiki/UTF-8</a>}
     *
     * UTF-16 大部分使用两个字节编码，编码超出 65535 的使用四个字节
     * 000000 - 00FFFF  两个字节
     * 010000 - 10FFFF  四个字节
     *
     *
     {@link <a 
    onclick="javascript:pageTracker._trackPageview('/outgoing/zh.wikipedia.org/wiki/UTF-16');"
      
    href="http://zh.wikipedia.org/wiki/UTF-16">http://zh.wikipedia.org/wiki/UTF-16</a>}
     * @param  {String} str
     * @param  {String} charset utf-8, utf-16
     * @return {Number}
     */
    byteLength: function(charset){
        var str = this.valueOf();
        var total = 0,
            charCode,
            i,
            len;

        charset = charset ? charset.toLowerCase() : '';

        if (charset === 'utf-16' || charset === 'utf16') {
            for (i = 0, len = str.length; i < len; i++) {
                charCode = str.charCodeAt(i);
                if (charCode <= 0xffff) {
                    total += 2;
                } else {
                    total += 4;
                }
            }
        } else {
            for (i = 0, len = str.length; i < len; i++) {
                charCode = str.charCodeAt(i);
                if (charCode <= 0x007f) {
                    total += 1;
                } else if (charCode <= 0x07ff) {
                    total += 2;
                } else if (charCode <= 0xffff) {
                    total += 3;
                } else {
                    total += 4;
                }
            }
        }

        return total;
    }
});

$(function(){
    //解决跨域问题
    if(jQuery){
		jQuery.support.cors = true;
	}

    //解决IE9及以下版本IE不支持placeerhoder的问题
	placeHoder();
});

/**
 * [placeHoder 解决IE9及以下版本IE不支持placeerhoder的问题]
 * @tips: placeholder类为placeholder的样式
 * @return {[type]} [description]
 */
function placeHoder(){
    if (!('placeholder' in document.createElement('input'))) {
        $('input[placeholder],textarea[placeholder]').each(function() {
            var that = $(this),
                text = that.attr('placeholder');
            if (that.val() === "") {
                that.val(text).addClass('placeholder');
            }
            that.focus(function() {
                if (that.val() === text) {
                    that.val("").removeClass('placeholder');
                }
            })
            .blur(function() {
                if (that.val() === "") {
                    that.val(text).addClass('placeholder');
                }
            })
            .closest('form').submit(function() {
                if (that.val() === text) {
                    that.val('');
                }
            });
        });
    }
}
