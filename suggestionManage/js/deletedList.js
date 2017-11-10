window.apiConfig = top.apiConfig;
window.COMMON_FN = top.COMMON_FN;
window.COMMON_GLOBAL = top.COMMON_GLOBAL;
window.TABLETOOL = top.TABLETOOL;
window.BASE_UTIL = top.BASE_UTIL;
window.MESSAGE = COMMON_GLOBAL.MESSAGE;
var userid = top.userid,
    accesstoken = top.accesstoken;
console.log("accesstoken is" + accesstoken);

var $tableList = null,
    $listtitle = null,
    $allSelect = null,
    $tools = null,
    $replayBtn = null,
    $delBtn = null,
    $reSendBtn = null,
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
    //0：全部【默认】，1：未受理，2：受理完成；4：回收站
    status: 4
};


$(function() {

    $tableList = $("div.tableList");
    $listtitle = $("div.listtitle");

    TABLETOOL.initTableHead(tableIndex, $listtitle);

    $allSelect = $("#allSelect");
    $tools = $("div.tools.toppart");
    $replayBtn = $tools.find(".updateBtn");
    $delBtn = $tools.find(".delBtn");
    $reSendBtn = $tools.find(".reSendBtn");
    $bar = $(".mainContent .slideBar .bar");

    $suggestionContent = $(".suggestionContent");
    $suggestionTools = $suggestionContent.find(".tools");
    $suggestionUsername = $(".suggestionContent").find(".username");
    $suggestionTime = $(".suggestionContent").find(".time");
    $suggestionArticel = $(".suggestionContent").find(".article");
    $suggestionImg = $(".suggestionContent").find(".imageContainer");

    $textareaInput = $(".textareaInput"),
        $replyQuickly = $(".replyQuickly");

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
            console.log($(this));
            if ($(this).hasClass('reSendBtn')) {
                var $select = $tableList.find("input:checkbox:checked");
                console.log($select.length);
                tableUtil.reSendSuggestion([id], 1);
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


    //工具栏重新提交
    $tools.on({
        click: function() {
            var $select = $tableList.find("input:checkbox:checked"),
                selectList = [],
                count = $select.length;
            $.each($select, function(index, val) {
                selectList.push($(this).attr("id").replace("id", ""));
            });

            if (selectList.length > 0) {
                tableUtil.reSendSuggestion(selectList, count);
            }
        }
    }, ".reSendBtn.btnActive");

    function getData(data, dataList) {
        data.suggesttion_list = data.suggesttion_list || [];
        for (var i = 0, length = data.suggesttion_list.length; i < length; i++) {
            item = data.suggesttion_list[i];

            //组装格式化后的数据
            var dataFormat = {
                no: item.suggesttion_id,
                username: item.user_name || "---",
                content: item.content,
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
                "<a " +
                " id='" + item.suggesttion_id +
                "' index='" + i +
                "' class='reSendBtn btnActive' href='javascript:void(0);" +
                "' title='重新提交'><span></span>" +
                "</a>" +
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

        //单独通过接口获取content然后再放入表格，这是接口定义时的缺陷
        // tableUtil.insertContent();

        tableUtil.dealDifference(searchPara.status, res);

        if (tempStorage.length > 0) {
            setTimeout(function() {
                tableUtil.showsuggesstion(0);
            }, 300);

            $tableList.find("ul:eq(0)").addClass('ulFocus');
        }

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
                // initToolBar();
            }
        });
    },
    reSendSuggestion: function(list, count) {

        top.$.confirm({
            context: top.document,
            zIndex: 300,
            content: {
                height: '150px;',
                html: "确定要将所选" + count + "条意见移入至待处理吗？",
                icon: "plugins/tlayer/icon.png"
            },
            footer: {
                buttons: [{
                    callback: function(layerID) {
                        // var fn = function() {
                        //     var i = 0;
                        //     var status = 1;
                        //     suggestionUtil.reSendSuggestion(list, status, function(res) {
                        //         COMMON_FN.showMessage(MESSAGE.RESEND_SUCCESS, null, function() {
                        //             if (i < list.length) {
                        //                 console.log("i is" + i);
                        //                 i++;
                        //                 fn();
                        //                 top.$.tLayer("close", layerID);
                        //                 tableUtil.initPageBar();
                        //             }

                        //         });
                        //     });
                        // }
                        // fn();
                        for (var i = 0; i < list.length; i++) {
                            var status = 1;
                            suggestionUtil.reSendSuggestion(list[i], status, function(res) {
                                console.log(res);
                                if (res.ret == 0) {
                                    $(".ulFocus").remove();
                                }
                                COMMON_FN.showMessage(MESSAGE.RESEND_SUCCESS, null, function() {
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
     * [showsuggesstion 获取某个意见反馈，在侧边栏展开的时候填入侧边栏]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    showsuggesstion: function(index) {

        var item = tempStorage[index - 0],
            itemFormat = formatData[index - 0];

        //激活按钮
        $suggestionContent.attr("suggestionid", item.suggesttion_id);
        $suggestionContent.find(".reSendBtn").addClass("btnActive").attr({
            "id": item.suggesttion_id,
            "index": index,
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
        $reSendBtn.removeClass("btnActive");



    } else if (checkedlength >= 1) {
        $reSendBtn.addClass("btnActive");

    }
}