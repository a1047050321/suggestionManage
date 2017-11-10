var mainTimer = -1;
//用户id
var USERID = iHomed.data( "userid" ),
    //身份令牌
    TOKEN = iHomed.data( "token");

// 普通用户系统导航菜单列表
 var userMenus = [];
 var adminMenus = [];

//获取生成的导航
var $iNav = null;
var _index = 0;

var userDaoUtil = {
    /**
     * [getUserRight 获取用户权限信息]
     * @param  {Function} fn [description]
     * @return {[type]}      [description]
     */
    getUserRight: function(fn) {
        COMMON_FN.miniAjax({
            url: apiConfig.getUserRight + "?accesstoken=" + accesstoken + "&systemid=" + system_id,
            type: "get",
            fn: fn
        });
    },
    
    /**
     * [getUserInfos 获取登陆用户的权限个人信息]
     * @return {[type]} [description]
     */
    getUserInfos: function(fn){
        COMMON_FN.miniAjax({
            url: apiConfig.getUserInfo + "?accesstoken=" + accesstoken + "&systemid=" + system_id,
            type: "get",
            fn: fn
        });
    }
    
};

//权限相关处理类
var rightUitl = {
    rightListMap: [],
    /**
     * [initMenu 初始化顶部导航]
     * @return {[type]} [description]
     */
    initMenu: function() {

        //获取用户信息
        userDaoUtil.getUserInfos(function(data) {

            //获取用户权限
            userDaoUtil.getUserRight(function(rightRes) {

                var role = "3";

                //获取当前系统权限的角色
                for (var i = 0; data.role_list && i < data.role_list.length; i++) {
                    if (data.role_list[i].systemid == top.system_id) {
                        role = data.role_list[i].role;
                        $.cookie("role", top.role, {path: '/', domain: top.domainDNS });
                        break;
                    }
                }
                top.usrInfoVal = data;
                //组装权限
                var menuData = top.menuData = rightUitl.analyseRight(rightRes.right_list || [], role);
                //组装顶部导航
                // rightUitl.generateNav(menuData);
                 var _mainFrame = window.frames[ "mainFrame" ];


                 // 获取用户信息，并初始化系统菜单
                 iHomed( "userinfo", {
                     data: {
                         accesstoken: TOKEN,
                         userid: USERID,
                         systemid: CONFIG.systemid
                     },
                     success: function ( data ) {

                         if( data.ret !== 0 ){
                              top.openPopupTips("服务器异常",false);
                         }
                        
                         
                         // 获取用户角色
                         var role = iHomed.data( "role" );
                         
                         menuData[0].current = true;
                         

                         // 生成顶部导航栏和底部信息栏
                         $( "#header" ).iNav( {
                             // 系统ID
                             systemID: CONFIG.systemid,
                             // 接口返回的用户信息
                             userInfo: data,
                             // 系统模块
                             module:{
                                 /// 用户可操作的模块列表
                                 userlist: menuData,
                                 // 仅管理员可操作的模块列表
                                 adminlist: adminMenus,
                                 // 显示模块的iframe
                                 frame: _mainFrame,
                                 // 切换后的回调函数,可不设置
                                 callback: function( menu ) {
                                     // 刷新权限列表
                                      $iNav = $(".inav-module").find("span.current");
                                        _index = $iNav.index();
                                     iHomed( "access", {
                                         data: {
                                             accesstoken: TOKEN,
                                             systemid: CONFIG.systemid
                                         }
                                     } );
                                 },
                             },
                             // 首页底部标签ID
                             footerID: "footer",
                         } );
                     }
                 });
                // 设置系统 index.html 的 title 标签的内容
                $( "title" ).html( CONFIG.systemname );

            });
        });
    },
   
    /**
     * [analyseRight 分析组装用户权限]
     * @param  {[type]} right_list  [description]
     * @return {[type]}             [description]
     */
    analyseRight: function(right_list,role) {

        var menuData = [];

        //保存在顶层对象中，在系统设置中会用到
        top.right_list   = right_list;
        top.rightidList  = [];
        
        menuData = [
            {
                name:"意见管理",
                url:"suggestionManage/suggestion.html",
                secondNav:[],
                rights:[24001,24002]
            },
            {
                name:"权限管理",
                url:"access.html",
                secondNav:[],
                rights:[]
            },
            {
                name:"系统设置",
                url:"systemSetting/setup.html",
                secondNav:[],
                rights:[]
            }
            
        ];

        if (right_list.length > 0) {

            //根据用户的权限初始化权限信息及入口
            for (var i = 0; i < right_list.length; i++) {
                var rightid = right_list[i].right_id;

                top.rightidList.push(rightid);

                for(var menui = 0,len = menuData.length; menui < len;menui++){

                    if($.inArray(rightid,menuData[menui].rights) > -1){
                        menuData[menui].secondNav.push(rightid);
                    }
                }

            }

        }

        //判断是否有系统设置权限
        if (menuData[2].secondNav.length == 0) {
            menuData.splice(2,1);
        }

        //判断是否有权限管理权限
        if (role-0 != 2 && role-0 != 1) {
            menuData.splice(1,1);
        }

        //测试用
        // menuData[0].secondNav = [24001,24002];

        //判断是否有意见编辑权限
        //如果没有查看权限，也认为是没有意见处理的权限
        if (menuData[0].secondNav.length == 0 || $.inArray(24001,menuData[0].secondNav) == -1) {
            menuData.splice(0,1);
        }
        menuData[menuData.length] = {
                name:"操作记录",
                url:"operateLog/index.html?systemid=24&token="+TOKEN,
                rights:[]
            };
        return menuData;

    },
    /**
     * [openMainFrame 根据url打开某个具体的模块]
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    openMainFrame: function(url) {
        var objframe = window.frames["mainFrame"];
        
        //防止上一个请求提示出错，但是页面已经跳转到其他的iframe了，所以要在页面跳转之前去掉弹出框
        $("div.layer-alert-box",top.document).remove();

        objframe.location.replace(url);
        $("#mainFrame").stop(true).css({
            opacity: 0
        });
        $("#mainFrame").load(function() {
            var self = this;
            clearTimeout(mainTimer);
            mainTimer = setTimeout(function() {
                $(self).stop(true).animate({
                    opacity: 1
                }, 300,function(){                
                    
                });
            }, 300);
        });
    }
};

var rightTool =  {
    userDaoUtil: userDaoUtil,
    rightUitl: rightUitl
};

$(function(){
    rightTool.rightUitl.initMenu();
});

//使内部div的宽度与body相同，由于body设置了最小宽度，而ifrcontainer设置成了absolute，
//所以必须手动设置其宽度，而不能使用自适应
window.onresize = window.onload = function() {
    var bodyW = $("body").width();
    $(".ifrcontainer").width(bodyW);
    $(".foot").width(bodyW);
};

