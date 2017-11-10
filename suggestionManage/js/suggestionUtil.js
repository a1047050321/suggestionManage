//意见的相关工具类

window.COMMON_FN = top.COMMON_FN;
window.apiConfig = top.apiConfig;

var userid = top.userid,
    accesstoken = top.accesstoken;
console.log(userid);
//初始化草稿箱存储空间
top.draftStorage = top.draftStorage || {
    total: 0,
    suggesttion_list: []
};

function getsuggestionUtil() {
    var suggestionUtil = {
        /**
         * [deleteSuggestion 删除意见]
         * @return {[type]} [description]
         */
        deleteSuggestion: function(suggestionid, status, fn) {
            COMMON_FN.miniAjax({
                url: apiConfig.deleteSuggestion,
                type: "post",
                data: {
                    "accesstoken": accesstoken,
                    "suggestionid": suggestionid,
                    "status": status
                },
                fn: fn
            });
        },
        /**
         * [replaySuggestion 回复意见]
         * @return {[type]} [description]
         */
        replaySuggestion: function(data, fn) {
            // accesstoken 数值型 访问令牌，登录时服务器返回给终端。
            // suggestionid 字符串 必选 意见id。
            // content 字符串 必选 回复内容。
            // language 字符串 可选 
            COMMON_FN.miniAjax({
                url: apiConfig.replaySuggestion,
                type: "post",
                data: data,
                fn: fn
            });
        },
        /**
         * [getAllSuggestion  获取所有意见]
         * @return {[type]} [description]
         */
        getAllSuggestion: function(callbackFn, pageidx, dataList, getDataFn) {
            // COMMON_FN.miniAjax({
            // 	url: apiConfig.getSuggestionList + "?accesstoken="+accesstoken+"&pageidx=1&pagenum=100000",
            // 	type:"get",
            // 	fn:fn,
            // 	isasync:false 
            // });

            var callee = arguments.callee,
                dataJson = {
                    accesstoken: accesstoken,
                    pageidx: pageidx,
                    pagenum: 50 //这个接口貌似一次最多能请求160条，所以分多次请求,地方请求数据崩溃，改成50
                };

            $.ajax({
                url: apiConfig.getSuggestionList,
                dataType: "json",
                type: 'get',
                data: dataJson,
                async: false,
                success: function(data) {
                    // 删除成功或者查询失败都做删除成功操作
                    if (data.ret == 0) {

                        getDataFn(data, dataList);

                        if (data.total > 50 && pageidx < Math.ceil(data.total / 50)) {
                            pageidx++;
                            callee(callbackFn, pageidx, dataList, getDataFn);
                        } else {
                            if (callbackFn) {
                                callbackFn(data, dataList);
                            }
                        }
                    } else {
                        COMMON_FN.alertMsg(data.ret_msg);
                    }
                },
                error: function() {
                    COMMON_FN.alertMsg("服务器异常！");
                }
            });
        },

        /**
         * [getSuggestionInfo  获取意见]
         * @return {[type]} [description]
         */
        getSuggestionInfo: function(suggestionid, fn, isasync) {
            COMMON_FN.miniAjax({
                url: apiConfig.getSuggestionInfo + "?accesstoken=" + accesstoken + "&suggestionid=" + suggestionid,
                type: "get",
                fn: fn,
                isasync: isasync
            });
        },
        /**
         * [saveToDraft 对于未发送的信息，保证至本地，刷新页面及丢失]
         * @param  {[type]}   data [description]
         * @param  {Function} fn   [description]
         * @return {[type]}        [description]
         */
        saveToDraft: function(data, fn) {
            var that = this;

            //判断是否存在对应意见的草稿，如果存在，则覆盖
            this.getDraftListById(data.suggesttion_id, function(item, index) {

                if (index > -1) {
                    item.reply = data.reply;
                } else {
                    top.draftStorage.suggesttion_list.push(data);
                    top.draftStorage.total = top.draftStorage.suggesttion_list.length;

                }
                that.setDraftCount();
            });

            if (typeof fn == "function") {
                fn();
            }

        },
        /**
         * [getDraftList 获取所有的草稿]
         * @return {[type]} [description]
         */
        getDraftList: function(fn) {
            if (typeof fn == "function") {
                top.draftStorage = top.draftStorage || {
                    total: 0,
                    suggesttion_list: []
                };

                fn(top.draftStorage);
            }
        },
        /**
         * [deleteDraft 删除指定id的草稿内容]
         * @param  {[type]}   list [description]
         * @param  {Function} fn   [description]
         * @return {[type]}        [description]
         */
        deleteDraft: function(list, fn) {
            var that = this;

            for (var i = 0, length = (list || []).length; i < length; i++) {

                this.getDraftListById(list[i], function(item, index) {
                    if (index > -1) {
                        top.draftStorage.suggesttion_list.splice(index, 1);
                    }
                });
            }
            top.draftStorage.total = top.draftStorage.suggesttion_list.length;

            //设置草稿的数量
            that.setDraftCount();

            if (typeof fn == "function") {
                fn();
            }
        },
        /**
         * [getDraftListById 根据suggustion_id获得草稿]
         * @param  {[type]}   id [description]
         * @param  {Function} fn [description]
         * @return {[type]}      [description]
         */
        getDraftListById: function(id, fn) {
            var suggesttion_list = top.draftStorage.suggesttion_list || [];
            var item = null,
                index = -1;
            for (var i = 0, length = suggesttion_list.length; i < length; i++) {
                item = suggesttion_list[i];
                if (item.suggesttion_id - 0 == id - 0) {
                    index = i;
                    break;
                }
            }

            if (typeof fn == "function") {
                fn(item, index);
            }
        },
        /**
         * [setDraftCount 如果存在草稿内容，则需要显示有多少条草稿]
         */
        setDraftCount: function() {
            var count = top.draftStorage.suggesttion_list.length,
                $draftMenu = $("#treeList .draftMenu", window.parent.document);

            if ($draftMenu.length == 1) {

                var $countTips = $draftMenu.find(".countTips");

                //如果草稿数为0，则不进行提示
                if (count == 0) {

                    $countTips.length == 1 ? $countTips.html("") : "";

                } else {

                    //判断提示条是否存在
                    if ($countTips.length == 0) {
                        var str = "<font class='countTips'>(" + count + ")</font>";
                        $draftMenu.append(str);
                    } else {
                        $countTips.html("(" + count + ")");
                    }

                }

            }

        },
        /**
         * [reSendSuggestion]重新提交意见到待处理
         * @param  {[type]}   suggestionid [description]
         * @param  {Function} fn [description]
         * @return {[type]}      [description]
         */
        reSendSuggestion: function(suggestionid, status, fn) {
            COMMON_FN.miniAjax({
                url: apiConfig.deleteSuggestion,
                type: "post",
                data: {
                    "accesstoken": accesstoken,
                    "suggestionid": suggestionid,
                    "status": status
                },
                fn: fn
            });
        }
    };
    return suggestionUtil;
}