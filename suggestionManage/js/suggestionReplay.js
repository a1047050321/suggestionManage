window.apiConfig = top.apiConfig;
window.COMMON_FN = top.COMMON_FN;
window.COMMON_GLOBAL = top.COMMON_GLOBAL;
window.TABLETOOL = top.TABLETOOL;
window.BASE_UTIL = top.BASE_UTIL;

var searchStr = window.location.search,
    suggesttionid = BASE_UTIL.BASIC.getArgs(searchStr, "suggesttionid"),

    //是否是对草稿进行回复
    fromDraftFlag = BASE_UTIL.BASIC.getArgs(searchStr, "fromDraftFlag") == "true",

    //如果已经是回复过的，则信息是只读的
    readonlyFlag = BASE_UTIL.BASIC.getArgs(searchStr, "readonlyFlag") == "true",
    suggestionUtil = getsuggestionUtil();

var $backBtn = null,
    $saveBtn = null,
    $tools = null,
    $sendBtn = null,

    $replyer = null,
    $replyTime = null,
    $suggestionUsername = null,
    $suggestionTime = null,
    $suggestionArticel = null,
    $replyContent = null,
    $suggestionImg = null;

var suggesttionItem = {};

// 回复意见的工具类
var replayUtil = {
    showSuggestion: function(id) {
        $replyer.text(top.usrInfoVal.user_name);
        suggestionUtil.getSuggestionInfo(id, function(res) {

            suggesttionItem = res;

            //回复内容取自草稿
            if (fromDraftFlag) {
                suggestionUtil.getDraftListById(id, function(item, index) {
                    res.reply = item.reply;
                })
            }

            if (readonlyFlag) {
                $replyTime.text(BASE_UTIL.BASIC.getDateStrFrmt(res.reply.time, "yyyy/MM/dd hh:mm"));
            }

            $suggestionUsername.text(res.user_name);
            $suggestionTime.text(BASE_UTIL.BASIC.getDateStrFrmt(res.time, "yyyy/MM/dd hh:mm"));
            $suggestionArticel.text(res.content);
            $replyContent.text(res.reply.content.replace(/\n/g, "<br/>") || "");

            if ("pic_url" in res && res.pic_url.length > 0) {
                $suggestionImg.find("div.picIcon");
                $suggestionImg.show(0).find(".picNum").text(res.pic_url.length);
            } else {
                $suggestionImg.find("div.picIcon");
                $suggestionImg.hide(0);
            }
        });
    },
    /**
     * [replay 回复意见]
     * @return {[type]} [description]
     */
    replay: function(data) {

        //数据格式不满足则返回
        if (data == false) {
            return;
        }

        suggestionUtil.replaySuggestion(data, function() {
            COMMON_FN.showMessage(COMMON_GLOBAL.MESSAGE.SEND_SUCCESS, null, function() {

                //删除此意见的草稿
                suggestionUtil.deleteDraft([suggesttionid]);

                window.parent.framesUtil.clsoeFrame(function(opener) {
                    opener.tableUtil.initPageBar();
                });

            });
        });
    },

    /**
     * [getData 获取需要发送的数据]
     * @return {[type]} [description]
     */
    getData: function() {
        var re_content = $replyContent.val().replace(/\n/g, "<br/>");
        console.log(re_content);
        var data = {
            suggestionid: suggesttionid,
            content: $.trim(re_content)
        };

        if (data.content == "") {
            COMMON_FN.showMessage("请先填写回复内容", null, function() {
                $replyContent.get(0).focus();

            });

            return false;
        } else {
            return data;
        }

    },
    /**
     * [bindHotKey 按ctrl和enter键发送]
     * @return {[type]} [description]
     */
    bindHotKey: function() {
        $replyContent.on({
            keydown: function(e) {
                var ee = e || window.event,
                    keycode = ee.keyCode || ee.which;

                if (ee.ctrlKey && keycode == 13 && !readonlyFlag) {
                    var data = replayUtil.getData();
                    replayUtil.replay(data);
                }
            }
        });
    }
};

$(function() {
    $tools = $("div.tools");
    $backBtn = $tools.find(".backBtn"),
        $saveBtn = $tools.find(".saveBtn"),
        $sendBtn = $(".save");

    $replyer = $(".mainContent p.replyer span"),
        $replyTime = $(".mainContent p.replyTime span"),
        $suggestionUsername = $(".mainContent p.username span"),
        $suggestionTime = $(".mainContent p.time span"),
        $suggestionArticel = $(".mainContent div.article"),
        $replyContent = $(".mainContent .replyInput"),
        $suggestionImg = $(".mainContent div.imageContainer");

    //显示意见反馈
    replayUtil.showSuggestion(suggesttionid);

    //按ctrl+enter 发送
    replayUtil.bindHotKey();

    // 发送反馈
    $sendBtn.on({
        click: function() {
            var data = replayUtil.getData();
            replayUtil.replay(data);
        }
    });

    //保存草稿至本地
    $saveBtn.on({
        click: function() {
            var data = replayUtil.getData();

            if (data == false) {
                return;
            }

            suggesttionItem.reply = {
                time: new Date().getTime(),
                content: data.content
            };

            //表示未填写回复内容，则不保存至草稿箱
            if (data == false) {
                return;
            } else {
                top.$.confirm({
                    context: top.document,
                    zIndex: 300,
                    content: {
                        height: '150px;',
                        html: "确定要保存内容至草稿箱吗?",
                        icon: "plugins/tlayer/icon.png"
                    },
                    footer: {
                        buttons: [{
                            callback: function(layerID) {
                                suggestionUtil.saveToDraft(suggesttionItem, function() {

                                    window.parent.framesUtil.clsoeFrame(function(opener) {});
                                });
                            }
                        }, {
                            callback: function(layerID) {
                                top.$.tLayer("close", layerID);
                            }
                        }]
                    }
                });
            }
        }
    });

    //返回
    $backBtn.on({
        click: function() {
            window.parent.$coniframe_eidt.hide(0);
            window.parent.$coniframe.fadeIn();
        }
    });

    //如果意见附带图片，点击图片图标的时候预览
    $suggestionImg.on({
        click: function() {

            if ("pic_url" in suggesttionItem && suggesttionItem.pic_url.length > 0) {
                COMMON_FN.openPicturePreview(suggesttionItem.pic_url);
            }
        }
    }, "div.picIcon");


    //如果已经回复过，再进入回复页时则为只读
    if (readonlyFlag) {
        $saveBtn.add($(".toolsBottom")).hide(0);
        $replyContent.prop({
            "readonly": true
        });

        $(".mainContent").css({
            "bottom": "0px",
            "border-width": "0"
        });

        $replyer.parent().hide(0);
        $replyTime.parent().show(0);
    } else {
        $saveBtn.add($(".toolsBottom")).show(0);
        $replyContent.prop({
            "readonly": false
        });

        $(".mainContent").css({
            "bottom": "38px",
            "border-width": "1px"
        });

        $replyer.parent().show(0);
        $replyTime.parent().hide(0);
    }
});