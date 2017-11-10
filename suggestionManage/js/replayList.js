window.apiConfig = top.apiConfig;
window.COMMON_FN = top.COMMON_FN;
window.COMMON_GLOBAL = top.COMMON_GLOBAL;
window.TABLETOOL = top.TABLETOOL;
window.BASE_UTIL = top.BASE_UTIL;

var userid = top.userid,
    accesstoken = top.accesstoken;

var $tableList = null,
    $listtitle = null,
    $allSelect = null,
    $tools = null,
    $delBtn = null,
    $detailBtn = null,
    $pages = null,
    $bar = null,

    //侧边栏中的元素
    $suggestionContent = null,
    $suggestionUsername = null,
    $suggestionTime = null,
    $suggestionArticel = null,
    $suggestionImg = null,
    $replyContent = null;

var tempStorage = [], //存储接口返回过来的原始数据
    suggestionUtil = getsuggestionUtil(),
    formatData = [], //存储格式化后的数据
    tableIndex = 1, //在定义表格表头的数组中的位置
    searchStr = window.location.search,
    viewAble = BASE_UTIL.BASIC.getArgs(searchStr, "viewAble") == "true",
    deleteAble = BASE_UTIL.BASIC.getArgs(searchStr, "deleteAble") == "true";

var searchPara = { //查询条件
    status: 2
};

$(function() {

    $tableList = $("div.tableList");
    $listtitle = $("div.listtitle");

    TABLETOOL.initTableHead(tableIndex, $listtitle);

    $allSelect = $("#allSelect");
    $tools = $("div.tools.toppart");
    $delBtn = $tools.find(".delBtn");
    $detailBtn = $tools.find(".detailBtn");
    $bar = $(".mainContent .slideBar .bar");

    $suggestionContent = $(".suggestionContent");

    $replayContainer = $(".replayContainer");
    $replayContainerTime = $replayContainer.find(".time");
    $replayContainerArticel = $replayContainer.find(".article");

    $suggestionContainer = $(".suggesstionContainer");
    $suggestionTools = $suggestionContainer.find(".tools");
    $suggestionUsername = $suggestionContainer.find(".username");
    $suggestionTime = $suggestionContainer.find(".time");
    $suggestionArticel = $suggestionContainer.find(".article");
    $suggestionImg = $suggestionContainer.find(".imageContainer");

    if (!deleteAble) {
        $delBtn.remove(0);
        $suggestionTools.find(".delBtn").remove(0);
    }

    $tools.show(0);
    $suggestionTools.show(0);

    tableUtil.initPageBar();

    $bar.on({
        click: function() {
            if (tempStorage.length > 0) {
                $(this).parent().toggleClass('closeBar');
            }
        }
    });

    //全选与全不选
    $allSelect.on({
        click: function(e) {
            var self = $(this),
                checked = self.prop('checked'),
                $checkboxs = $tableList.find("input:checkbox");

            $checkboxs.each(function(index) {
                $(this).prop({
                    checked: checked
                });
                var $ul = $(this).parents("ul");
                if (checked == true) {
                    $ul.addClass('ulHover');
                } else {
                    $ul.removeClass('ulHover');
                }

            });

            initToolBar();
        }
    });

    //点击单个单选框
    $tableList.on({
        click: function() {
            initToolBar();
            var $ul = $(this).parents("ul");
            if ($ul.hasClass('ulHover')) {
                $ul.removeClass('ulHover');
            } else {
                $ul.addClass('ulHover');
            }
        }
    }, "input:checkbox");

    // 监听表格中的按钮，以及侧边栏按钮
    $tableList.add($suggestionTools).on({
        click: function() {
            var id = $(this).attr("id"),
                index = $(this).attr("index") - 0;

            //删除单个意见
            if ($(this).hasClass('delBtn')) {

                tableUtil.deleteSuggestion([id]);

                //回复详情
            } else if ($(this).hasClass('detailBtn')) {
                tableUtil.detail(index);
                // suggestionUtil.getSuggestionInfo(suggesttionid, function(res) {

                //     //第4行表示是内容
                //     $("ul[id=" + suggesttionid + "]").find("li:eq(3)")
                //         .text(res.content)
                //         .attr("title", res.content);
                //     tempStorage[index].content = res.content;
                //     tempStorage[index].pic_url = res.pic_url;
                // })
            }
        }
    }, "a.btnActive");

    //单击某一行
    $tableList.on({
        click: function() {

            $bar.parent().removeClass('closeBar');

            $(".ulFocus").removeClass('ulFocus');
            $(this).parents("ul").addClass('ulFocus');
            var id = $(this).parents("ul").attr("id");
            tableUtil.showsuggesstion(id, $(this).parents("ul").index());

        }
    }, "li:not('.nopop')");

    //工具栏删除
    $tools.on({
        click: function() {
            var $select = $tableList.find("input:checkbox:checked"),
                selectList = [];

            $.each($select, function(index, val) {
                selectList.push($(this).attr("id").replace("id", ""));
            });

            if (selectList.length > 0) {
                tableUtil.deleteSuggestion(selectList);
            }
        }
    }, ".delBtn.btnActive");

    //工具栏回复
    $tools.on({
        click: function() {

            var $select = $tableList.find("input:checkbox:checked:eq(0)");

            tableUtil.detail($select.attr("index") - 0);
            console.log($select.attr("id").replace("id", ""));

        }
    }, ".detailBtn.btnActive");

    //如果意见附带图片，点击图片图标的时候预览
    $suggestionImg.on({
        click: function() {
            var item = tempStorage[$(this).attr("index") - 0];

            if ("pic_url" in item && item.pic_url.length > 0) {
                COMMON_FN.openPicturePreview(item.pic_url);
            }
        }
    }, "div.picIcon");
});

var tableUtil = {
    showList: function(res) {
        var str = "",
            column = TABLETOOL.columns[tableIndex],
            item = null;

        $tableList.html("<div class='nodatatips'>暂无数据</div>");

        //兼容 接口对于空数组返回null的情况
        res.suggesttion_list = res.suggesttion_list || [];

        tempStorage = res.suggesttion_list;
        formatData = [];

        for (var i = 0, length = res.suggesttion_list.length; i < length; i++) {
            item = res.suggesttion_list[i];

            //组装格式化后的数据
            var dataFormat = {
                no: item.suggesttion_id,
                username: item.user_name,
                content: item.content,
                time: BASE_UTIL.BASIC.getDateStrFrmt(item.time, "yyyy/MM/dd hh:mm"),
                replay: item.reply.reply_content,
                replayTime: BASE_UTIL.BASIC.getDateStrFrmt(item.reply.reply_time, "yyyy/MM/dd hh:mm"),
                useremail: item.user_email,
                devicetype: COMMON_GLOBAL.DEVICETYPE[item.devicetype + ""] || "",
                osversion: item.osversion,
                model: item.model,
                app_version: item.app_version
            };

            //组装html代码
            var liLsit = TABLETOOL.generateHtml(dataFormat, column.slice(1));

            str = str + "<ul class='clearfix' status='" + item.status + "' id='" + item.suggesttion_id + "'>" +
                "<li style='width:" + column[0].width + "' onselectstart='return false;' class='nameEllipsis nopop'>" +
                "<input type='checkbox' index='" + i + "' id='id" + item.suggesttion_id + "'/>" +
                "<label  for='id" + item.suggesttion_id + "'></label>" +
                "</li>" +
                liLsit.join('') +
                "<li style='width:" + column[column.length - 1].width + "' class='nameEllipsis nopop'>" +
                (deleteAble ?
                    "<a id='" + item.suggesttion_id + "' index='" + i + "' class='delBtn btnActive' href='javascript:void(0);' title='删除'><span></span></a>" :
                    "") +
                ("<a id='" + item.suggesttion_id + "' index='" + i + "' class='detailBtn btnActive' href='javascript:void(0);' title='详情'><span></span></a>") +
                "</li>" +
                "</ul>";

            //保存临时数据
            formatData.push(dataFormat);
        }

        if (res.total > 0) {
            $tableList.html(str);
        }

        // /默认加载第一个意见的内容到侧边栏
        // if (tempStorage.length > 0) {
        //     setTimeout(function() {
        //         tableUtil.showsuggesstion(0);
        //     }, 300);
        // }
    },
    /**
     * [suggestionReplay 回复]
     * @return {[type]} [description]
     */
    detail: function(index) {
        var item = tempStorage[index];

        var locationUrl = "suggestionReplay.html?suggesttionid=" + item.suggesttion_id + "&readonlyFlag=true";

        window.parent.framesUtil.openFrameAsWindow(locationUrl);

    },
    /**
     * 动态改title的宽
     * @return {[type]} [description]
     */
    dynamicChnageTitleWidth: function() {
        var scroll = BASE_UTIL.UI.isScroll($(".list")[0]);

        if (scroll.scrollY) {
            $(".listtitle>ul").css("margin-right", 16);
        } else {
            $(".listtitle>ul").css("margin-right", 0);
        }
    },

    /**
     * [initPageBar 初始化分页插件]
     * @return {[type]} [description]
     */
    initPageBar: function() {
        var paraStr = "?accesstoken=" + accesstoken;

        for (var key in searchPara) {
            if (typeof searchPara[key] != "undefined" && searchPara[key] !== "") {
                paraStr += ("&" + key + "=" + searchPara[key]);
            }
        }

        $pages = TABLETOOL.initPageBarTool($("div.pages>div.pageBar"), {
            url: apiConfig.getSuggestionList + paraStr,
            success: function(data, pagsIndex) {
                tableUtil.showList(data);
                tableUtil.dynamicChnageTitleWidth();
                initToolBar();
            }
        });
    },
    /**
     * [showsuggesstion 获取某个意见反馈，在侧边栏展开的时候填入侧边栏]
     * @param  {[type]} id [description] suggestion_id
     * @return {[type]} index   [description] 序号
     */
    showsuggesstion: function(id, index) {

        //激活按钮
        $suggestionContent.find(".delBtn,.detailBtn").addClass("btnActive").attr({
            "id": id,
            "index": index
        });

        //载入内容

        //逐条显示在侧边栏
        (function(id, index) {

            suggestionUtil.getSuggestionInfo(id, function(res) {
                var $ul = $("ul[id=" + id + "]");

                var replyTime = BASE_UTIL.BASIC.getDateStrFrmt(res.reply.time, "yyyy-MM-dd hh:mm");

                $replayContainerTime.text(replyTime);
                $replayContainerArticel.text(res.reply.content);
                $suggestionUsername.text(res.user_name);
                $suggestionTime.text(BASE_UTIL.BASIC.getDateStrFrmt(res.time, "yyyy-MM-dd hh:mm"))
                $suggestionArticel.text(res.content);

                //显示附件
                if ("pic_url" in res && res.pic_url.length > 0) {
                    $suggestionImg.find("div.picIcon").attr("index", index);
                    $suggestionImg.show(0).find(".picNum").text(res.pic_url.length);
                } else {
                    $suggestionImg.find("div.picIcon").removeAttr("index");
                    $suggestionImg.hide(0);
                }
            });

        })(id, index);

    }
};

window.onresize = tableUtil.dynamicChnageTitleWidth;

/**
 * [initToolBar 初始化工具栏的按钮状态]
 * @return {[type]} [description]
 */
function initToolBar() {
    var $checkboxs = $tableList.find("input:checkbox:checked"),
        checkedlength = $checkboxs.length;

    if ($tableList.find("input:checkbox").length == checkedlength &&
        checkedlength != 0) {
        $allSelect.prop("checked", true);
    } else {
        $allSelect.prop("checked", false);
    }

    if (checkedlength == 0) {
        $delBtn.removeClass("btnActive");
        $detailBtn.removeClass("btnActive");
    } else if (checkedlength == 1) {
        $delBtn.addClass("btnActive");
        $detailBtn.addClass("btnActive");
    } else if (checkedlength > 1) {
        $delBtn.addClass("btnActive");
        $detailBtn.removeClass("btnActive");
    }
}