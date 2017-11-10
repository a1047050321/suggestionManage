window.apiConfig = top.apiConfig;
window.COMMON_FN = top.COMMON_FN;
window.COMMON_GLOBAL = top.COMMON_GLOBAL;
window.TABLETOOL = top.TABLETOOL;
window.BASE_UTIL = top.BASE_UTIL;
window.MESSAGE = COMMON_GLOBAL.MESSAGE;
var userid = top.userid,
    accesstoken = top.accesstoken;

var $tableList = null,
    $listtitle = null,
    $allSelect = null,
    $tools = null,
    $replayBtn = null,
    $delBtn = null,
    $pages = null,
    $bar = null,

    $textareaInput = null,
    $replyQuickly = null,

    //侧边栏中的元素
    $suggestionContent = null,
    $suggestionUsername = null,
    $suggestionTime = null,
    $suggestionArticel = null,
    $suggestionImg = null;


var tempStorage = [], //存储接口返回过来的原始数据
    suggestionUtil = getsuggestionUtil(),
    formatData = [], //存储格式化后的数据
    tableIndex = 0, //在定义表格表头的数组中的位置
    searchStr = window.location.search,
    viewAble = BASE_UTIL.BASIC.getArgs(searchStr, "viewAble") == "true",
    deleteAble = BASE_UTIL.BASIC.getArgs(searchStr, "deleteAble") == "true",
    replyAble = BASE_UTIL.BASIC.getArgs(searchStr, "replyAble") == "true";

var searchPara = { //查询条件
    //0：全部【默认】，1：未受理，2：受理完成,4：回收站
    status: 1
};


$(function() {

    $tableList = $("div.tableList");
    $listtitle = $("div.listtitle");

    TABLETOOL.initTableHead(tableIndex, $listtitle);

    $allSelect = $("#allSelect");
    $tools = $("div.tools.toppart");
    $replayBtn = $tools.find(".updateBtn");
    $delBtn = $tools.find(".delBtn");
    $bar = $(".mainContent .slideBar .bar");

    $suggestionContent = $(".suggestionContent");
    $suggestionTools = $suggestionContent.find(".tools");
    $suggestionUsername = $(".suggestionContent").find(".username");
    $suggestionTime = $(".suggestionContent").find(".time");
    $suggestionArticel = $(".suggestionContent").find(".article");
    $suggestionImg = $(".suggestionContent").find(".imageContainer");

    $textareaInput = $(".textareaInput"),
        $replyQuickly = $(".replyQuickly");

    //如果没有权限，则删除操作按钮
    if (!replyAble) {
        $replayBtn.remove(0);
        $suggestionTools.find(".updateBtn").remove(0);
        $textareaInput.remnove(0);
        $replyQuickly.remnove(0);
    }

    if (searchPara.status == 2) {
        $textareaInput.remnove(0);
        $replyQuickly.remnove(0);
    }

    if (!deleteAble) {
        $delBtn.remove(0);
        $suggestionTools.find(".delBtn").remove(0);
    }


    $tools.show(0);
    $suggestionTools.show(0);

    tableUtil.initPageBar();

    //右边侧边栏的打开与合并
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
                var $select = $tableList.find("input:checkbox:checked");
                console.log($select.length);
                tableUtil.deleteSuggestion([id], 1);
            } else if ($(this).hasClass('updateBtn')) {
                tableUtil.suggestionReplay(index);
            }
        }
    }, "a.btnActive");

    //单击某一行
    $tableList.on({
        click: function() {

            $bar.parent().removeClass('closeBar');

            $(".ulFocus").removeClass('ulFocus');
            $(this).parents("ul").addClass('ulFocus');

            tableUtil.showsuggesstion($(this).parent().index());

        }
    }, "li:not('.nopop')");

    //工具栏回复
    $tools.on({
        click: function() {

            var $select = $tableList.find("input:checkbox:checked:eq(0)");

            tableUtil.suggestionReplay($select.attr("index") - 0);
        }
    }, ".updateBtn.btnActive");

    //工具栏删除
    $tools.on({
        click: function() {
            var $select = $tableList.find("input:checkbox:checked"),
                selectList = [],
                count = $select.length;

            $.each($select, function(index, val) {
                selectList.push($(this).attr("id").replace("id", ""));
            });

            if (selectList.length > 0) {
                tableUtil.deleteSuggestion(selectList, count);
            }
        }
    }, ".delBtn.btnActive");

    //如果意见附带图片，点击图片图标的时候预览
    $suggestionImg.on({
        click: function() {
            var item = tempStorage[$(this).attr("index") - 0];

            if ("pic_url" in item && item.pic_url.length > 0) {
                COMMON_FN.openPicturePreview(item.pic_url);
            }
        }
    }, "div.picIcon");

    // 快速回复
    $replyQuickly.on({
        click: function() {
            $(".replyBar").toggleClass('openBar');
        }
    });

    $textareaInput.on({
        keydown: function(e) {
            var ee = e || window.event,
                keycode = ee.keyCode || ee.which;

            if (ee.ctrlKey && keycode == 13) {
                tableUtil.replyQuickly();
            }
        }
    });

    //回复
    $(".btn.save").on({
        click: function() {
            tableUtil.replyQuickly();
        }
    });
    //导出excel数据
    $(".importBtn").click(function() {
        var dataList = [];
        var $loading = null;
        COMMON_FN.confirmMsg("确定要导出所有数据?<br>时间较长请耐心等待!", function(layerID) {
            top.tLayer("close", layerID);
            // COMMON_FN.alertMsg("导出数据期间请不要关闭浏览器窗口!","400px",function(layerID){
            // top.tLayer("close", layerID);
            $loading = COMMON_FN.loadingMsg("excel表格下载中...<br>请不要关闭浏览器窗口!");
            setTimeout(function() {
                suggestionUtil.getAllSuggestion(function(res, dataList) {


                    var dataHeader = COMMON_GLOBAL.DATAHEADER;


                    //单独通过接口获取content然后再放入表格，这是接口定义时的缺陷
                    var suggesttionid = "";

                    for (var i = 0, length = dataList.length; i < length; i++) {

                        suggesttionid = dataList[i].no;

                        (function(suggesttionid, index) {

                            suggestionUtil.getSuggestionInfo(suggesttionid, function(data) {
                                dataList[index].content = data.content || "---";

                                var replyTime = BASE_UTIL.BASIC.getDateStrFrmt(data.reply.time, "yyyy-MM-dd hh:mm");
                                dataList[index].replycontent = data.reply.content || "---";
                                dataList[index].replytime = replyTime;
                            }, false);

                        })(suggesttionid, i);
                    }

                    top.tLayer("close", $loading);
                    $('.conconent').tableExport({ type: 'excel', escape: 'false', dataList: dataList, dataHeader: dataHeader });

                }, 1, dataList, getData);
            }, 600);

            // });

        });

        function getData(data, dataList) {
            data.suggesttion_list = data.suggesttion_list || [];
            for (var i = 0, length = data.suggesttion_list.length; i < length; i++) {
                item = data.suggesttion_list[i];

                //组装格式化后的数据
                var dataFormat = {
                    no: item.suggesttion_id,
                    username: item.user_name || "---",
                    content: "",
                    time: BASE_UTIL.BASIC.getDateStrFrmt(item.time, "yyyy/MM/dd hh:mm"),
                    replycontent: "",
                    replytime: "",
                    useremail: item.user_email || "---",
                    devicetype: COMMON_GLOBAL.DEVICETYPE[item.devicetype + ""] || "---",
                    osversion: item.osversion || "---",
                    model: item.model || "---",
                    app_version: item.app_version || "---"
                };
                dataList.push(dataFormat);
            }
        }


    });
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
                useremail: item.user_email,
                devicetype: COMMON_GLOBAL.DEVICETYPE[item.devicetype + ""] || "",
                osversion: item.osversion,
                model: item.model,
                app_version: item.app_version,
                time: BASE_UTIL.BASIC.getDateStrFrmt(item.time, "yyyy/MM/dd hh:mm"),
                status: COMMON_GLOBAL.SUGGESSTION_STATUS[item.status + ""] || ""
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
                (replyAble ?
                    ("<a " +
                        " id='" + item.suggesttion_id +
                        "' index='" + i +
                        "' class='updateBtn " + (item.status - 0 != 3 ? "btnActive" : "") + "' href='javascript:void(0);' " +
                        " title='回复'><span></span>" +
                        "</a>") :
                    "") +
                (deleteAble ?
                    ("<a " +
                        " id='" + item.suggesttion_id +
                        "' index='" + i +
                        "' class='delBtn btnActive' href='javascript:void(0);" +
                        "' title='删除'><span></span>" +
                        "</a>") :
                    "") +
                "</li>" +
                "</ul>";

            //保存临时数据
            formatData.push(dataFormat);
        }

        if (res.total > 0) {
            $tableList.html(str);

            //如果一条记录都没有则关闭侧边栏
        } else {
            $bar.parent().addClass('closeBar');
        }

        // //单独通过接口获取content然后再放入表格，这是接口定义时的缺陷
        // tableUtil.insertContent();

        tableUtil.dealDifference(searchPara.status, res);

        if (tempStorage.length > 0) {
            setTimeout(function() {
                tableUtil.showsuggesstion(0);
            }, 300);

            $tableList.find("ul:eq(0)").addClass('ulFocus');
        }

    },
    deleteSuggestion: function(list, count) {
        top.$.confirm({
            context: top.document,
            zIndex: 300,
            content: {
                height: '150px;',
                html: "确定要将所选" + count + "条意见添加至回收站吗？",
                icon: "plugins/tlayer/icon.png"
            },
            footer: {
                buttons: [{
                    callback: function(layerID) {
                        for (var i = 0; i < list.length; i++) {
                            var status = 4;
                            suggestionUtil.deleteSuggestion(list[i], status, function(res) {
                                console.log(res);
                                if (res.ret == 0) {
                                    $(".ulFocus").remove();
                                }
                                COMMON_FN.showMessage(MESSAGE.DELETE_SUCCESS, null, function() {
                                    top.$.tLayer("close", layerID);
                                    tableUtil.initPageBar();
                                });
                            });
                        }
                    }
                }, {
                    callback: function(layerID) {
                        top.$.tLayer("close", layerID);
                    }
                }]
            }
        });
    },
    /**
     * [suggestionReplay 回复]
     * @return {[type]} [description]
     */
    suggestionReplay: function(index) {
        var item = tempStorage[index];

        var locationUrl = "suggestionReplay.html?suggesttionid=" + item.suggesttion_id;

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
     * [insertContent 获取内容以及回复内容需要单独的接口去获取]
     * @return {[type]} [description]
     */
    //     insertContent: function() {

    //         var suggesttionid = "";

    //         for (var i = 0, length = tempStorage.length; i < length; i++) {

    //             suggesttionid = tempStorage[i].suggesttion_id;

    //             (function(suggesttionid, index) {

    //                 suggestionUtil.getSuggestionInfo(suggesttionid, function(res) {

    //                     //第4行表示是内容
    //                     $("ul[id=" + suggesttionid + "]").find("li:eq(3)")
    //                         .text(res.content)
    //                         .attr("title", res.content);
    //                     tempStorage[index].content = res.content;
    //                     tempStorage[index].pic_url = res.pic_url;
    //             });

    //         })(suggesttionid, i);
    // }

    // },
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
                // initToolBar();
            }
        });
    },
    /**
     * [showsuggesstion 获取某个意见反馈，在侧边栏展开的时候填入侧边栏]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    showsuggesstion: function(index) {

        var item = tempStorage[index - 0],
            itemFormat = formatData[index - 0];

        //激活按钮
        $suggestionContent.attr("suggestionid", item.suggesttion_id);
        $suggestionContent.find(".delBtn,.updateBtn").addClass("btnActive").attr({
            "id": item.suggesttion_id,
            "index": index
        });

        //载入内容
        $suggestionUsername.text(item.user_name);
        $suggestionTime.text(itemFormat.time)
        $suggestionArticel.text(item.content);


        if ("pic_url" in item && item.pic_url.length > 0) {
            $suggestionImg.find("div.picIcon").attr("index", index);
            $suggestionImg.show(0).find(".picNum").text(item.pic_url.length);
        } else {
            $suggestionImg.find("div.picIcon").removeAttr("index");
            $suggestionImg.hide(0);
        }
    },

    /**
     * [dealDifference 所有未读，意见列表的不同]
     * @param  {[type]} status [description]
     * @return {[type]}        [description]
     */
    dealDifference: function(status, res) {
        //设计图中，所有未读需要显示出条数，详见设计图
        if (status - 0 == 1) {

            var str = "<font class='countTips'>(" + res.total + ")</font>",
                $countTips = $("#treeList .dealing .countTips", window.parent.document);

            if ($countTips.length == 0) {
                $("#treeList", window.parent.document).find(".dealing").append(str);
            } else {
                $countTips.html("(" + res.total + ")");
            }
        }
    },
    /**
     * [replyQuickly 快速回复]
     * @return {[type]} [description]
     */
    replyQuickly: function() {
        var data = {
            suggestionid: $suggestionContent.attr("suggestionid"),
            content: $.trim($textareaInput.val())
        };
        if (data.content.length == 0) {
            $textareaInput.get(0).focus();
        } else {
            suggestionUtil.replaySuggestion(data, function() {
                COMMON_FN.showMessage(COMMON_GLOBAL.MESSAGE.SEND_SUCCESS, null, function() {

                    //删除此意见的草稿
                    suggestionUtil.deleteDraft([data.suggestionid]);

                    window.parent.$coniframe.show(0).get(0).contentWindow.tableUtil.initPageBar();

                });
            });
        }
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
        $replayBtn.removeClass("btnActive");
        $delBtn.removeClass("btnActive");

    } else if (checkedlength == 1) {
        $replayBtn.addClass("btnActive");
        $delBtn.addClass("btnActive");

    } else if (checkedlength > 1) {
        $replayBtn.removeClass("btnActive");
        $delBtn.addClass("btnActive");
    }
}