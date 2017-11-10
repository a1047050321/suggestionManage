window.apiConfig     = top.apiConfig;
window.COMMON_FN     = top.COMMON_FN;
window.COMMON_GLOBAL = top.COMMON_GLOBAL;
window.TABLETOOL     = top.TABLETOOL;
window.BASE_UTIL     = top.BASE_UTIL;

var userid      = top.userid,
    accesstoken = top.accesstoken;

var $tableList = null,
    $listtitle = null,
    $allSelect = null,
    $tools     = null,
    $replayBtn = null,
    $delBtn    = null,
    $pages     = null,
    $bar       = null,

    $textareaInput = null,
    $replyQuickly  = null,

    //侧边栏中的元素
    $suggestionContent  = null,
    $suggestionUsername = null,
    $suggestionTime     = null,
    $suggestionArticel  = null,
    $suggestionImg      = null;

var tempStorage    = [],                                 //存储接口返回过来的原始数据
    suggestionUtil = getsuggestionUtil(),
    formatData     = [],                                 //存储格式化后的数据
    tableIndex     = 2,                                  //在定义表格表头的数组中的位置
    searchStr      = window.location.search,
    viewAble       = BASE_UTIL.BASIC.getArgs(searchStr, "viewAble") == "true",
    replyAble      = BASE_UTIL.BASIC.getArgs(searchStr, "replyAble") == "true";

$(function() {

    $tableList = $("div.tableList");
    $listtitle = $("div.listtitle");
    
    TABLETOOL.initTableHead(tableIndex,$listtitle);

    $allSelect = $("#allSelect");
    $tools     = $("div.tools.toppart");
    $replayBtn = $tools.find(".updateBtn");
    $delBtn    = $tools.find(".delBtn");
    $bar       = $(".mainContent .slideBar .bar");

    $suggestionContent  = $(".suggestionContent");
    $suggestionTools    = $suggestionContent.find(".tools");
    $suggestionUsername = $(".suggestionContent").find(".username");
    $suggestionTime     = $(".suggestionContent").find(".time");
    $suggestionArticel  = $(".suggestionContent").find(".article");
    $suggestionImg      = $(".suggestionContent").find(".imageContainer");

    $textareaInput = $(".textareaInput"),
    $replyQuickly  = $(".replyQuickly");

    //如果没有权限，则删除操作按钮
    if(!replyAble){
        $replayBtn.remove(0);
        $suggestionTools.find(".updateBtn").remove(0);
        $textareaInput.remove(0);
        $replyQuickly.remove(0);
    }

    $tools.show(0);
    $suggestionTools.show(0);

    tableUtil.initPageBar();

    $bar.on({
        click:function(){
            if(tempStorage.length > 0){
                $(this).parent().toggleClass('closeBar');
            }
        }
    });

    //全选与全不选
    $allSelect.on({                                                 
        click: function (e) {
            var self       = $(this),
                checked    = self.prop('checked'),
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
            }else{
                $ul.addClass('ulHover');
            }
        }
    },"input:checkbox");

    // 监听表格中的按钮，以及侧边栏按钮
    $tableList.add($suggestionTools).on({                                           
        click: function (){
            var id    = $(this).attr("id"),
                index = $(this).attr("index")-0;

            //删除单个意见
            if($(this).hasClass('delBtn')){

                tableUtil.deleteSuggestion([id]);

            //回复单个意见
            }else if($(this).hasClass('updateBtn')){

                tableUtil.suggestionReplay(index);

            }
        }
    },"a.btnActive");

    //单击某一行
    $tableList.on({
        click:function(){

            $bar.parent().removeClass('closeBar');

            $(".ulFocus").removeClass('ulFocus');
            $(this).parents("ul").addClass('ulFocus');

            tableUtil.showsuggesstion($(this).parent().index());
            
        }
    },"li:not('.nopop')");

    //工具栏回复
    $tools.on({                                                 
        click: function (){

            var $select = $tableList.find("input:checkbox:checked:eq(0)");

            tableUtil.suggestionReplay($select.attr("index")-0);
        }
    },".updateBtn.btnActive");

    //工具栏删除
    $tools.on({                                                 
        click: function (){
            var $select    = $tableList.find("input:checkbox:checked"),
                selectList = [];

            $.each($select, function(index, val) {
                selectList.push($(this).attr("id").replace("id", ""));
            });

            if (selectList.length > 0) {
                tableUtil.deleteSuggestion(selectList);
            }
        }
    },".delBtn.btnActive");

    //如果意见附带图片，点击图片图标的时候预览
    $suggestionImg.on({
        click:function(){
            var item = tempStorage[$(this).attr("index") - 0];
            
            if("pic_url" in item && item.pic_url.length > 0){
                COMMON_FN.openPicturePreview(item.pic_url);
            }
        }
    },"div.picIcon");

    // 快速回复
    $replyQuickly.on({
        click:function(){
            $(".replyBar").toggleClass('openBar');
        }
    });

    $textareaInput.on({
        keydown:function(e){
            var ee = e || window.event,
                keycode = ee.keyCode || ee.which;

            if (ee.ctrlKey && keycode == 13) {
                tableUtil.replyQuickly();
            }
        }
    }); 

    //回复
    $(".btn.save").on({
        click:function(){
            tableUtil.replyQuickly();
        }
    });
});

var tableUtil = {
    showList :  function (res) {
        var str    = "",
            column = TABLETOOL.columns[tableIndex],
            item   = null;
            
        $tableList.html("<div class='nodatatips'>暂无数据</div>");

        //兼容 接口对于空数组返回null的情况
        res.suggesttion_list = res.suggesttion_list || [];

        tempStorage = res.suggesttion_list;
        formatData  = [];

        for (var i = 0, length = res.suggesttion_list.length; i < length; i++) {
            item = res.suggesttion_list[i];

            //组装格式化后的数据
            var dataFormat = {                                      
                no: item.suggesttion_id,
                username : item.user_name,
                content: item.content,
                time: BASE_UTIL.BASIC.getDateStrFrmt(item.time,"yyyy/MM/dd hh:mm"),
                replay: item.reply.content,
                replayTime: BASE_UTIL.BASIC.getDateStrFrmt(item.reply.time,"yyyy/MM/dd hh:mm"),
            };

            //组装html代码
            var liLsit = TABLETOOL.generateHtml(dataFormat,column.slice(1));  

            str = str + "<ul class='clearfix' id='"+item.suggesttion_id+"'>" +  
                            "<li style='width:"+column[0].width+"' onselectstart='return false;' class='nameEllipsis nopop'>"+
                                "<input type='checkbox' index='" + i + "' id='id" + item.suggesttion_id + "'/>" + 
                                "<label  for='id" + item.suggesttion_id + "'></label>"+
                            "</li>"+
                            liLsit.join('') + 
                            "<li style='width:"+column[column.length-1].width+"' class='nameEllipsis nopop'>" +
                               (replyAble ? 
                                           ("<a "+
                                                " id='"+item.suggesttion_id + 
                                                "' index='" + i + 
                                                "' class='updateBtn "+(item.status-0 != 3 ? "btnActive" : "") +"' href='javascript:void(0);' "+
                                                " title='回复'><span></span>"+
                                            "</a>")
                                           :"") +
                                           ("<a "+
                                                " id='"+item.suggesttion_id + 
                                                "' index='" + i + 
                                                "' class='delBtn btnActive' href='javascript:void(0);"+
                                                "' title='删除草稿'><span></span>"+
                                            "</a>")+

                            "</li>"+
                        "</ul>";
            
            //保存临时数据
            formatData.push(dataFormat);                           
        }

        if(res.total > 0){
            $tableList.html(str);

        //如果一条记录都没有则关闭侧边栏
        }else{
            $bar.parent().addClass('closeBar');
        }

        if(tempStorage.length > 0){
            setTimeout(function(){
                tableUtil.showsuggesstion(0);
            },300);

            $tableList.find("ul:eq(0)").addClass('ulFocus');
        }

    },
    deleteSuggestion: function (list) {

        top.$.confirm({
            context: top.document,
            zIndex: 300,
            content: {
                height:'150px;',
                html: "确定要删除所选草稿内容吗？",
                icon:"plugins/tlayer/icon.png"
            },
            footer: {
                buttons: [{
                    callback: function (layerID) {

                        suggestionUtil.deleteDraft(list,function(res){
                            COMMON_FN.showMessage(COMMON_GLOBAL.MESSAGE.DELETE_SUCCESS, null, function(){
                                top.$.tLayer("close", layerID);
                                tableUtil.initPageBar();
                            });
                        });
                    }
                }, {
                    callback: function (layerID) {
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
    suggestionReplay :function(index){
        var item = tempStorage[index];

        var locationUrl = "suggestionReplay.html?suggesttionid="+item.suggesttion_id+"&fromDraftFlag=true";

        window.parent.framesUtil.openFrameAsWindow(locationUrl);

    },

    /**
     * 动态改title的宽
     * @return {[type]} [description]
     */
    dynamicChnageTitleWidth: function(){
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
    initPageBar:  function() {
        
        suggestionUtil.getDraftList(function(data){
            tableUtil.showList(data);
            tableUtil.dynamicChnageTitleWidth();
            initToolBar();
        });
    },
    /**
     * [showsuggesstion 获取某个意见反馈，在侧边栏展开的时候填入侧边栏]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    showsuggesstion: function(index){

        var item       = tempStorage[index - 0],
            itemFormat = formatData[index - 0];

        //激活按钮
        $suggestionContent.attr("suggestionid",item.suggesttion_id);
        $suggestionContent.find(".delBtn,.updateBtn").addClass("btnActive").attr({
            "id": item.suggesttion_id,
            "index": index
        });

        //载入内容
        $suggestionUsername.text(item.user_name); 
        $suggestionTime.text(itemFormat.time)     
        $suggestionArticel.text(item.content); 
        
        if("pic_url" in item && item.pic_url.length > 0){
            $suggestionImg.find("div.picIcon").attr("index",index);
            $suggestionImg.show(0).find(".picNum").text(item.pic_url.length);
        }else{
            $suggestionImg.find("div.picIcon").removeAttr("index");
            $suggestionImg.hide(0);
        } 
    },
    /**
     * [replyQuickly 快速回复]
     * @return {[type]} [description]
     */
    replyQuickly: function(){
        var data = {
            suggestionid: $suggestionContent.attr("suggestionid"),
            content: $.trim($textareaInput.val())
        };
        if(data.content.length == 0){
            $textareaInput.get(0).focus();
        }else{
            suggestionUtil.replaySuggestion(data,function(){
                COMMON_FN.showMessage(COMMON_GLOBAL.MESSAGE.SEND_SUCCESS,null,function(){

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
function initToolBar(){
    var $checkboxs    = $tableList.find("input:checkbox:checked"),
        checkedlength = $checkboxs.length;

    if ($tableList.find("input:checkbox").length == checkedlength 
        && checkedlength !=0) {
        
        $allSelect.prop("checked",true);

    }else{
        $allSelect.prop("checked",false);
    }

    if (checkedlength == 0) {
        $replayBtn.removeClass("btnActive");
        $delBtn.removeClass("btnActive");

    }else if (checkedlength == 1) {
        $replayBtn.addClass("btnActive");
        $delBtn.addClass("btnActive");

    }else if (checkedlength > 1) {
        $replayBtn.removeClass("btnActive");
        $delBtn.addClass("btnActive");

    }
}