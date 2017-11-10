// 获得模块权限

window.BASE_UTIL = top.BASE_UTIL;

var rightsIndex = BASE_UTIL.BASIC.getArgs(window.location.search, "index");
var rights = top.menuData[rightsIndex].secondNav;
var topNav = top.menuData[rightsIndex].name;

var $treeList = $("#treeList"),
    $position = $(".currInfo"),
    $coniframe = null,
    $coniframe_eidt = null;

$(function() {
    var menuStr = "",
        secondNavData = [

            { name: "待受理", url: "suggestionList.html", cssName: "dealing" },
            { name: "回复列表", url: "replayList.html", cssName: "" },
            { name: "草稿箱", url: "draftList.html", cssName: "draftMenu" },
            { name: "回收站", url: "deletedList.html", cssName: "" }

        ];

    /*---------------对secondNavData进行权限分析---------*/
    var viewAble = $.inArray(24001, rights) > -1,

        deleteAble = false,

        //回复必须要有查看权限
        replyAble = viewAble && $.inArray(24002, rights) > -1;

    if (!viewAble) {
        secondNavData.splice(2, 1);
    } else {
        secondNavData[2].url += "?viewAble=" + viewAble + "&replyAble=" + replyAble + "&deleteAble=" + deleteAble;
    }

    if (!viewAble) {
        secondNavData.splice(1, 1);
    } else {
        secondNavData[1].url += "?viewAble=" + viewAble + "&replyAble=" + replyAble + "&deleteAble=" + deleteAble;
    }

    if (!viewAble) {
        secondNavData.splice(0, 1);
    } else {
        secondNavData[0].url += "?viewAble=" + viewAble + "&replyAble=" + replyAble + "&deleteAble=" + deleteAble;
    }

    /*---------------对secondNavData进行权限分析---------*/

    //动态生成二级导航菜单
    for (var i = 0, len = secondNavData.length; i < len; i++) {

        menuStr = menuStr +
            "<li>" +
            " <a href='" + secondNavData[i].url + "' target='coniframe' class='" + secondNavData[i].cssName + "'>" +
            secondNavData[i].name +
            "</a>" +
            " </li>";

    }
    $treeList.html("<ul>" + menuStr + "</ul>");

    $coniframe = $("#coniframe", window.document),
        $coniframe_eidt = $("#coniframe_edit", window.document);

    //事件监听
    $treeList.on({
        click: function() {
            $treeList.find(".secondMenuFocus:first").removeClass("secondMenuFocus");
            $(this).addClass("secondMenuFocus");

            $coniframe.show(0);
            $coniframe_eidt.hide(0);

            var text = $(this).find("a").text().replace(" ", "");
            $position.text("当前位置：" + topNav + "/" + text);
        }
    }, "li");

    $treeList.find("li:eq(0)").addClass("secondMenuFocus");
    $treeList.find("li a:eq(0)").get(0).click();
});