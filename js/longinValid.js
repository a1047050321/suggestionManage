(function() {

    top.accesstoken = accesstoken = $.cookie("accesstoken") || "TOKEN4002";
    $.cookie("userid", '3090');
    $.cookie("role", "2");
    $.cookie("accesstoken", "TOKEN3090");
    if ($.cookie("userid") == null) {

        top.location.href = top.apiConfig.loginUrl;
        return;


    } else {
        userid = $.cookie("userid");
        top.accesstoken = accesstoken = $.cookie("accesstoken");

    }
})();

/**
 * 立即执行，判断是否登录
 */
(function() {
    if (!CONFIG.dev && $.cookie("userid") == null) {
        iHomed("logout");

    } else {

        // 保存用户ID userid
        iHomed.data("userid", $.cookie("userid") || CONFIG.userid);

        // 保存用户令牌 accesstoken
        iHomed.data("token", $.cookie("accesstoken") || CONFIG.token);

        // 尝试获取用户角色 role
        var role = $.cookie("role");

        if (role) {

            // 转整型
            role = +role;

            //兼容后台数据异常
            if (role > 3 || role < 1) { role = CONFIG.role; }

        }

        // 保存用户角色 role
        iHomed.data("role", role || CONFIG.role);

        // 回收变量
        role = null;

    }

}());