/*配置接口的信息*/

top.accessAddr = top.globalDnsConfigVar.accessAddr;
top.dtvAddr = top.globalDnsConfigVar.dtvAddr;
top.slaveAddr = top.globalDnsConfigVar.slaveAddr;
top.homedsAddr = top.globalDnsConfigVar.homedsAddr;
top.domainDNS = top.globalDnsConfigVar.uCookieDomain;
top.homePageUrl = top.globalDnsConfigVar.homePageAddr;

var access = top.accessAddr + "/";
var dtv = top.dtvAddr + "/";
var slave = top.slaveAddr + "/";
var homeds = top.homedsAddr + "/";

var apiConfig = {
    loginUrl: top.homePageUrl + "/login.html",
    getUserRight: access + "usermanager/user/get_right_list", //获取用户权限
    getUserInfo: access + "usermanager/user/get_info", //获取用户信息
    userLogout: access + "usermanager/logout", //退出

    deleteSuggestion: access + "system/suggestion/set_status", //删除意见至回收站
    replaySuggestion: access + "system/suggestion/reply", //回复意见,
    getSuggestionInfo: access + "system/suggestion/get_info", //查看反馈意见详情。（修改状态为处理完成）
    getSuggestionList: access + "system/suggestion/get_list", //获取意见列表
};