/*统一的头部和尾部，王志斌开发*/

// 请先配置以下各项，很重要
var CONFIG = {
    // Homed 后台登录地址
    loginurl: "http://boss.homed.me/login.html",
    // 系统 id
    systemid: 24,
    // 系统名称
    systemname: "意见反馈管理系统",
    // 是否为开发模式，默认为 true ; true 为不用登录即可进入系统，否则必须登录
    dev: true,
    // 开发模式下的默认账户 ID
    userid: "3090",
    // 开发模式下的默认令牌 
    username: "张伦",

    token: "TOKEN3090",
    // 开发模式下的默认用户角色: 1.超级管理员，2.系统管理员，3.普通用户
    role: 1,
    // 页面初始定位
    nav: null,
    // 默认版权适用设备，取值参见下面的版权适用设备列表
    defaultdevice: "1",
};

// 保存 CONFIG 信息到 kernel 中
iHomed("config", CONFIG);

var loginUrl = "http://boss.homed.me/login.html";
var ajaxReqUrl = top.dtvAddr;
var rightReqUrl = top.accessAddr;
var userid = $.cookie("userid");　 //"4002";//"admin";//"1000002";
var role = $.cookie("role");　 //2;//1:超级管理员  2：系统管理员  3：普通用户
var system_id = COMMON_GLOBAL.SYSTEM_ID;　 //当前子系统id
var system_name = COMMON_GLOBAL.SYSTEM_NAME;

//显示当前位置信息
function showLocationTitle(_str) {
    if (_str) {
        $(".location span").html("当前位置：" + _str);
    } else {
        $(".location span").html("当前位置：" + menuData[menuPos].name);
    }
}

function initHeadImage() {
    if (usrInfoVal.icon_url && usrInfoVal.icon_url["100x100"]) {
        $("#headImg").attr("src", usrInfoVal.icon_url["100x100"]);
    } else {
        if (usrInfoVal.gender == 2) $("#headImg").attr("src", "http://boss.homed.me/pubFile/img/avatar0.jpg");
        else $("#headImg").attr("src", "http://boss.homed.me/pubFile/img/avatar1.jpg");
    }
}
//打开弹出框页面
function openPopupWindow(_url) {
    $("#popupFrame").attr("src", _url);
    $("#popupWin").fadeIn(100);
}

//关闭弹出框页面
function closePopupWindow() {
    $("#popupWin").fadeOut(100);
}

//回调主框架中rightFrame操作方法
function popupCallback(_obj) {
    $("#mainFrame")[0].contentWindow.mainFrameCallback(_obj);
}

//回调主框架中mainFrame操作方法
function mainCallback(_obj) {
    $("#mainFrame")[0].contentWindow.mainCallback(_obj);
}

//获取rightFrame中的数据
function getRightFrameData(_str) {
    return $("#mainFrame")[0].contentWindow.getRightFrameData(_str);
}

//获取mainFrame中的数据
function getMainFrameData(_str) {
    return $("#mainFrame")[0].contentWindow.getMainFrameData(_str);
}

function mainFrameReload() {
    window.frames["mainFrame"].location.reload();
}

function gotoLogin() { //注销
    $.cookie("userid", null, { path: "/", domain: top.domainDNS });
    $.cookie("accesstoken", null, { path: "/", domain: top.domainDNS });
    $.cookie("role", null, { path: "/", domain: top.domainDNS });
    window.location.href = loginUrl;
}
/*统一ajax请求入口
 **data：传递json对象格式
 */
function ajaxReqAction(successCallback, failCallback, reqUrl, data, type, dataType, ajaxUrl) {
    jQuery.support.cors = true;
    $.ajax({
        url: (ajaxUrl ? ajaxUrl : ajaxReqUrl) + reqUrl, //ajax request url
        type: type ? type : "get", //get or post(default get)
        data: (type && type.toLowerCase() == "post") ? JSON.stringify(data) : data, //post方式，采用字符串数据类型传递
        cache: false,
        dataType: dataType ? dataType : "JSON", //(default JSON)
        error: function(e) {
            if (console) console.debug("服务器请求异常！");
            failCallback(e); //服务器异常回调
        },
        success: function(data) {
            successCallback(data); //服务器请求完成回调
        }
    });
}

function getUrlParams(_key, _url) {
    if (typeof(_url) == "object") {
        _url = _url.location.href;
    } else {
        _url = (typeof(_url) == "undefined" || _url == null || _url == "") ? window.location.href : _url;
    }
    if (_url.indexOf("?") == -1) {
        return "";
    }
    var params = [];
    _url = _url.split("?")[1].split("&");
    for (var i = 0, len = _url.length; i < len; i++) {
        params = _url[i].split("=");
        if (params[0] == _key) {
            return params[1];
        }
    }
    return "";
}

function errorCodeTips(_code, _tips) {
    switch (_code) {
        case 7182:
            return "已有提交记录，不能编辑！";
            break;
        case 7186:
            return "此分类已发布！";
            break;
        case 7151:
            return "当前栏目下已有此分类！";
            break;
        case 7159:
            return "重复隐藏或还原操作！";
            break;
        case 7160:
            return "父类已隐藏，子分类不能隐藏和还原操作！";
            break;
        case 10523:
            return "新建权限包和已存在的重复！";
            break;
        default:
            if (_tips) return _tips;
            else return "未知错误！";
            break;
    }
}
var tipsInfo = "";

function getTipsInfo() {
    return tipsInfo;
}

function openPopupTips(_tips, _type) {
    if (_type) { //错误码
        tipsInfo = errorCodeTips(_tips);
    } else {
        tipsInfo = _tips;
    }
    $("#popupTipsFrame").attr("src", "alert.html");
    $("#popupTips").fadeIn(100);
}

//关闭弹出框页面
function closePopupTips() {
    $("#popupTips").fadeOut(100);
}
//将秒转成日期格式
function secondsToDataTime(_str) {
    var d = new Date(_str * 1000);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = d.getDate();
    if (day < 10) day = "0" + day;
    var hour = d.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = d.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = d.getSeconds();
    if (second < 10) second = "0" + second;
    return year + "年" + month + "月" + day + "日 " + hour + ":" + minute;

}
//将秒转成定时时间格式
function secondsToDataTiming(_str) {
    var d = new Date(_str * 1000);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = d.getDate();
    if (day < 10) day = "0" + day;
    var hour = d.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = d.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = d.getSeconds();
    if (second < 10) second = "0" + second;
    return day + "日" + hour + "时" + minute + "分" + second + "秒";
}