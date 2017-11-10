// 获得模块权限

window.BASE_UTIL = top.BASE_UTIL;

var zNodes = [{
    id: "custom1",
    name: "待受理",
    fileName: "",
    open: false,
    url_: "suggestionList.html",
    children: [],
    class_: "dealing"
}, {
    id: "custom3",
    name: "回复列表",
    fileName: "",
    open: false,
    children: [],
    url_: "replayList.html",
    class_: ""
}, {
    id: "custom4",
    name: "草稿箱",
    fileName: "",
    open: false,
    children: [],
    url_: "draftList.html",
    class_: "draftMenu"
}, {
    id: "custom5",
    name: "回收站",
    fileName: "",
    open: false,
    children: [],
    url_: "deletedList.html",
    class_: ""
}];

$(function() {

    $coniframe = $("#coniframe", window.document),
        $coniframe_eidt = $("#coniframe_edit", window.document);

    // var rightsIndex = BASE_UTIL.BASIC.getArgs(window.location.search, "index")-0,
    var rightsIndex = top._index;
    topNav = top.menuData[rightsIndex].name,
        rights = top.menuData[rightsIndex].secondNav;
    /*---------------对secondNavData进行权限分析---------*/
    var viewAble = $.inArray(24001, rights) > -1,

        deleteAble = false,

        //回复必须要有查看权限
        replyAble = viewAble && $.inArray(24002, rights) > -1;

    if (!viewAble) {
        zNodes.splice(3, 1);
    } else {
        zNodes[3].url_ += "?viewAble=" + viewAble + "&replyAble=" + replyAble + "&deleteAble=" + deleteAble;

    }
    if (!viewAble) {
        zNodes.splice(2, 1);
    } else {
        zNodes[2].url_ += "?viewAble=" + viewAble + "&replyAble=" + replyAble + "&deleteAble=" + deleteAble;
    }

    if (!viewAble) {
        zNodes.splice(1, 1);
    } else {
        zNodes[1].url_ += "?viewAble=" + viewAble + "&replyAble=" + replyAble + "&deleteAble=" + deleteAble;
    }

    if (!viewAble) {
        zNodes.splice(0, 1);
    } else {
        zNodes[0].url_ += "?viewAble=" + viewAble + "&replyAble=" + replyAble + "&deleteAble=" + !deleteAble;
    }


    /*---------------对secondNavData进行权限分析---------*/

    headTitle = topNav;
    initTree();

    $("a.curSelectedNode").get(0).click();
});