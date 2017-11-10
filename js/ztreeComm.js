//重写ztree事件

// 显示当前值那个一级栏目下
var headTitle = "";

//显示当前位置
var $currInfo = $(".currInfo");

/*ztree  settings*/
var ztreeSetting = {
    view: {
        showLine: false,
        showIcon: false,
        selectedMulti: false,
        dblClickExpand: false,
        addDiyDom: addDiyDom
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        beforeClick: beforeClick,
        onClick: function(event, treeId, treeNode) {
            if (treeNode.url_ != "") {
                var title = treeNode.name;

                //获取父节点的name
                var parentNode = treeNode.getParentNode();
                var parentTitle = "";
                if (typeof parentNode == "object" && parentNode != null) {
                    parentTitle = "/" + treeNode.getParentNode().name;
                }

                //设置当前位置
                var titelStr = "当前位置：" + headTitle + parentTitle + "/" + title;
                $currInfo.text(titelStr);

                framesUtil.$coniframe_eidt.hide(0);
                framesUtil.$coniframe.attr("src",treeNode.url_);

            }
        }
    }
};

function addDiyDom(treeId, treeNode) {
    var spaceWidth = 5;
    var switchObj = $("#" + treeNode.tId + "_switch"),
        icoObj = $("#" + treeNode.tId + "_ico");

    //在审核中的菜单项中加入样式，用于找到相应的菜单项，显示审核中的条数
    if (!!treeNode.class_ && treeNode.class_ !== "") {
        $("#" + treeNode.tId + "_span").addClass(treeNode.class_);
    }

    switchObj.remove();
    icoObj.before(switchObj);
    if (treeNode.level < 2) {
        switchObj.addClass("noline_close");
        switchObj.removeClass("noline_docu");
    }
    if (treeNode.level > 1) {
        var spaceStr = "<span style='display:inline-block; width:" + (spaceWidth * treeNode.level) + "px'></span>";
        switchObj.before(spaceStr);
    }
}

function beforeClick(treeId, treeNode) {
    var zTree = $.fn.zTree.getZTreeObj("treeList");
    zTree.expandNode(treeNode);
    if (typeof treeNode.children != "undefined" && treeNode.children.length > 0) return true;
    
    clickTreeShowIcon(treeNode);
    return true;
}


//激活选中树，显示图片
function clickTreeShowIcon(treeNode) {
    $(".ztree li span").removeClass("ztreeSelectLevel");
}

function initTree() {
    //初始化左侧列表树
    $.fn.zTree.init($("#treeList"), ztreeSetting, zNodes);
    var treeObj = $.fn.zTree.getZTreeObj("treeList");
    treeJsonList = treeObj.getNodes();
    var nodes = treeJsonList[0];
    var selectNodes = null;
   
    if (nodes.children.length > 0) {
        treeObj.selectNode(nodes.children[0]);
        selectNodes = treeObj.getSelectedNodes()[0];
    } else {
        treeObj.selectNode(nodes);
        selectNodes = treeObj.getSelectedNodes()[0];
    }

    clickTreeShowIcon(selectNodes);
    
    for (var i = 0; i < treeJsonList.length; i++) {
        $("#" + treeJsonList[i].tId + "_switch").addClass("hideicon");
        if (treeJsonList[i].children.length > 0) {
            $("#" + treeJsonList[i].children[0].tId).addClass("lline");
            $("#" + treeJsonList[i].tId + "_switch").removeClass("hideicon");
        }
        $("#" + treeJsonList[i].tId).addClass("lline");
    }
}

var treeJsonList = [];
var treeLevel = 0;
var treeFPos = 0;

/**
 * [framesUtil 用于切换显示的iframe，
 * 在mainFrame文档中，存在2个子iframe 内容默认显示在coniframe中，coniframe_edit默认不显示，
 * coniframe用于显示查询页面，coniframe_edit用于显示编辑页面]
 * @type {Object}
 */
var framesUtil = {
    $coniframe: $("#coniframe", top.frames["mainFrame"].window.document),
    $coniframe_eidt: $("#coniframe_edit", top.frames["mainFrame"].window.document),
    openFrameAsWindow: function(url) {
        this.$coniframe.hide(0);
        this.$coniframe_eidt.attr("src", url);
    },
    clsoeFrame: function(fn) {
        this.$coniframe_eidt.hide(0).attr("src","");
        this.$coniframe.show(0);
        if (typeof fn == "function") {
            fn(this.$coniframe.get(0).contentWindow);
        }
    }
};
//做动画效果，避免页面变化太明显
framesUtil.$coniframe.add(framesUtil.$coniframe_eidt).on({
    load: function() {
        var url__ = this.contentWindow.location.href;
        
        if (typeof url__ != "undefined" && url__ != "" && url__ != "about:blank") {
            $(this).stop(true, true).fadeIn(250);
        } else {
            return;
        }
    }
});
