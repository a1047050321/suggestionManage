;
(function($) {
    var defaultOptions = {
		numberSize: 5,							//显示几个页码数
		pageSize: 15,							//一页信息条数
        showSelectPageSize: false,              //显示一页有多少条数据的select
        storePageSize: true,                    //设置分页条后是否记住保存至cookie中.依赖jQuery.cookie.js
		url: "",								//请求的url
		pagesIndex: 'pageidx',
		pagesNumber: 'pagenum',
		currentPage: 1,							//当前页
		inputVale: "",
		total: 'total',							//ajax返回的请求中保存
        success: function(data, pagsIndex) {},
        error: function(pagsIndex) {}
	};
    var options = {};
    var $pageBar = {};
    var method = {
		/**
		 * [modifyPara 修改请求url中的参数]
		 * @param  {{key:value}} string  [参数以及其值]
		 * @param  {boolean} execute [是否逻辑执行,true修改后立即执行，否则下次翻页时执行]
		 * @return {[type]}         [description]
		 */
        modifyPara: function(para, execute, callback) {
            var url_ = this.options.url;
            for (var key in para) {
                if (url_.indexOf(key) > -1) {
                    url_ = url_.replace(key + "=" + util.getArgs(url_, key), key + "=" + para[key]);
                }
            }
            this.options.url = url_;
            options = this.options;
            if (execute) {
                options.currentPage = 1;
                pagesUtil.drawPage("page");
                pagesUtil.requestData.call(this, options.currentPage, callback);
            }
        },
		/**
		 * [init 初始化分页插件]
		 * @param  {[type]} setting [description]
		 * @return {[type]}         [description]
		 */
        init: function(setting) {
            $(this).html("");
            $pageBar = $(this);
            //初始化参数并进行容错
            options = pagesUtil.initOptions.call(this, setting);
            var self = this;
            this.options = options;
            //第一次请求数据，请求成功再次设置参数
            pagesUtil.requestData.call(self, 1, function() {
                //生成分页菜单
                var $pages = pagesUtil.executePages.call(self, options);
                //添加事件响应
                pagesUtil.addFun.call(self, options);
            });
        }
	};
	var pagesUtil={
		/**
		 * [initOptions 初始化参数并进行容错]
		 * @param  {object} opt [用户设置的参数]
		 * @return {object}     [合并的参数]
		 */
        initOptions: function(opt) {
            var temp = {};
            temp = $.extend({}, defaultOptions, opt); 	//合并参数

            //如果设置了记住每页的条数，
            //首先判断cookie中是否存在一页条数，如果存在，则需要已cookie中的值为一页条数
            if (temp.showSelectPageSize && temp.storePageSize) {
                var pageSize = util.getCookieByName("pagesize_pages_js");
                if (pageSize != "" && !!pageSize) {
                    temp.pageSize = pageSize;
                }
            }

            temp.totalPage = 1; 						//总共的页数
            temp.pageNumber = 1; 						//总共的数据条数
            return temp;
        },
		executePages:function(opt){
            var before = "";
            var after = "";
            if (opt.currentPage == 1) {
                before = "<span class='pageBar-index pageBar-pageDisable' >首页</span>"+
                		 "<span class='pageBar-prePage pageBar-pageDisable'>上一页</span>";
            } else {
                before = "<span class='pageBar-index' >首页</span>"+
                		 "<span class='pageBar-prePage'>上一页</span>";
            }
            if (opt.currentPage == opt.totalPage) {
                after = "<span class='pageBar-nextPage pageBar-pageDisable'>下一页</span>"+
                		"<span class='pageBar-lastPage pageBar-pageDisable'>末页</span>";
            } else {
                after = "<span class='pageBar-nextPage'>下一页</span>"+
                		"<span class='pageBar-lastPage'>末页</span>";
            }
            var input = "<input class='pageBar-gotoPage' type='text'/>"+
            			"<label class='pageBar-allPage'>/" + opt.totalPage + "页</label>";
            var pagesStr = "<div class='pageBar-pages'>";

            for (var i = 0; i < opt.numberSize && i < opt.totalPage; i++) {
                if (0 == i) {
                    pagesStr = pagesStr + "<span  class='pageBar-page pageBar-pageNumFocus' value='" + (opt.currentPage + i) + "'>" + (opt.currentPage + i) + "</span>";
                } else {
                    pagesStr = pagesStr + "<span  class='pageBar-page' value='" + (opt.currentPage + i) + "'>" + (opt.currentPage + i) + "</span>";
                }
            }
            pagesStr += "</div>";

            var pageSizeSelect = opt.showSelectPageSize ?  
                                "<select class='pageSizeSelect'>"+
                                    "<option value='20'>20个/页</option>"+
                                    "<option value='30'>30个/页</option>"+
                                    "<option value='50'>50个/页</option>"+
                                    "<option value='100'>100个/页</option>"+
                                 "</select>" : 
                                 "";

            $pageBar.html(before + pagesStr + after + input +pageSizeSelect);

            $pageBar.find(".pageSizeSelect option[value="+opt.pageSize+"]").prop("selected",true);
			return $pageBar;
		},
		/**
		 * [addFun 为页码元素添加事件]
		 * @param {options} opt [options]
		 */
		addFun:function(opt){
            var self = $(this);
            $(self).on({
                selectstart: function() {
                    return false;
                }
            });
			var that=this;

			//首页
            self.find(".pageBar-index").unbind("click.pages").bind("click.pages", function() {
                if (options.currentPage == 1 || $(this).hasClass('pageBar-pageDisable')) return;
                options.currentPage = 1;
                pagesUtil.drawPage("index");
                pagesUtil.requestData.call(that, 1, function() {
                	//pagesUtil.drawPage("index");
                });
            });

			//上一页
            self.find(".pageBar-prePage").unbind("click.pages").bind("click.pages", function() {
                if (options.currentPage == 1 || $(this).hasClass('pageBar-pageDisable')) return;
                var number = options.currentPage = options.currentPage - 1;
                pagesUtil.drawPage("prePage");
                pagesUtil.requestData.call(that, number, function() {
                    //pagesUtil.drawPage("prePage");
                });
            });

			//最后一页
            self.find(".pageBar-lastPage").unbind("click.pages").bind("click.pages", function() {
                if (options.currentPage == options.totalPage || $(this).hasClass('pageBar-pageDisable')) return;
                options.currentPage = options.totalPage;
                pagesUtil.drawPage("lastPage");
                pagesUtil.requestData.call(that, options.totalPage, function() {
                	//pagesUtil.drawPage("lastPage");
                });
            });

			// 下一页
            self.find(".pageBar-nextPage").unbind("click.pages").bind("click.pages", function() {
                if (options.currentPage == options.totalPage || $(this).hasClass('pageBar-pageDisable')) return;
                var number = options.currentPage = options.currentPage + 1;
                pagesUtil.drawPage("nextPage");
                pagesUtil.requestData.call(that, number, function() {
                    //pagesUtil.drawPage("nextPage");
                });
            });

            //设置一页的条数
            self.on({
                change:function(e){
                    var pageSize = $(this).find(":selected").attr("value");
                    console.log(pageSize);
                    opt.pageSize = pageSize-0;
                    if(opt.storePageSize){
                        //如果需要让每一个分页条都记住一页的条数，则需要保存在cookie中，
                        //需要加载jquery.cookie.js
                        util.storeInfoInCookie("pagesize_pages_js",opt.pageSize);
                    }
                    method.init.call(that,opt);
                }
            },".pageSizeSelect");

			// 数字元素
			self.on({
                click: function(e) {
                    if ($(this).hasClass('pageBar-pageNumFocus') || $(this).hasClass('pageBar-pageDisable')) return;
                    else {
                        var number = options.currentPage = parseInt($(this).text());
                        console.log(options == opt);
                        
                        pagesUtil.drawPage("page");
                        pagesUtil.requestData.call(that, number, function() {
                            //pagesUtil.drawPage("gotoPage");
                        });
                    }
                }
			},"span.pageBar-page");

			//输入页数跳转
			self.on({
                keyup: function() {
                    var value = $(this).val().toString().replace(/\D/g, "");
                    $(this).val(value);
                },
                keydown: function(event) {
                    var pageValue = $(this).val();
                    var eve = window.event || event;
                    var keycode = eve.keyCode || eve.which;
                    if (keycode == 13) { //回车
                        if (pageValue == '' || pageValue < 0 || pageValue > options.totalPage) {
                            alert("该页码不存在！");
                            return;
                        } else {
                        	options.currentPage = pageValue - 0;
                        	pagesUtil.drawPage("gotoPage");
                            pagesUtil.requestData.call(that, pageValue, function() {
                                //pagesUtil.drawPage("gotoPage");
                            });
                        }
                    }
                }
			},"input.pageBar-gotoPage");

		},
		/**
		 * [requestData 请求数据]
		 * @param  {integer}   number[要查询的页数]
		 * @param  {function} fn     [请求数据成功需要做的操作]
		 * @return {null}            [null]
		 */
        requestData: function(number, fn) {
            var self = this;
            var url_ = options.url;
            if (url_.indexOf("?") == -1) url_ += "?";
            else url_ += "&";
            url_ += options.pagesIndex + "=" + number + "&" + options.pagesNumber + "=" + options.pageSize;
            util.ajax.call(this, url_, function(data) {
               
                options.pageNumber = data["" + options.total] || 1;
                options.totalPage = Math.floor((options.pageNumber - 1) / options.pageSize) + 1;
                self.options = options;
                if (fn) {
                    fn.call(self);
                }
                options.success(data, number);
            }, function(xmlhttp, error) {
                options.error(xmlhttp, error, number);
            });
		},
		/**
		 * [drawPage 请求数据成功后，在刷新页码]
		 * @param  {string} action [表示进行操作后刷新页码]
		 * @return {[type]}        [description]
		 */
		drawPage:function(action){
			options.pages = options.pages || $("span.pageBar-page");
			switch(action){
                case 'page':
                    break;
                case 'index':
                    options.pages.each(function(index) {
                        $(this).attr("value", options.currentPage + index).text(options.currentPage + index);
                    });
                    break;
                case 'prePage':
                    if ($("span[value='" + options.currentPage + "']").length == 0) {
                        options.pages.each(function(index) {
                            var page_ = options.currentPage + index;
                            console.log(page_);
                            $(this).attr("value", page_).text(page_);
                        });
                        break;
                    }
                case 'nextPage':
				case 'lastPage':
	                if ($("span[value='" + options.currentPage + "']").length == 0) {
	                    var length = options.pages.length;
	                    var start = options.currentPage - length + 1;
	                    options.pages.each(function(index) {
	                        $(this).attr("value", start + index).text(start + index);
	                    });
	                }
					break;
				case 'gotoPage':
					var high=$(".pageBar-page:last").text()-0;
					var low=$(".pageBar-page:first").text()-0;
                	if (low > options.currentPage || options.currentPage > high) { //选取currentpage附近的5个数
						var arr=[];arr.push(options.currentPage);
	                    for (var i = 1; arr.length < options.numberSize; i++) {
	                        var temp = options.currentPage - 0 + i;
	                        if (temp <= options.totalPage && temp > 0) arr.push(temp);
	                        temp = options.currentPage - 0 - i;
	                        if (arr.length < options.pageSize && temp <= options.totalPage && temp > 0) arr.push(temp);
	                    }
	                    arr.sort(function(a, b) {
	                        return a - b;
	                    });

                        console.log(arr);

	                    options.pages.each(function(index, val) {
	                        $(this).text(arr[index]);
	                        $(this).attr("value", arr[index]);
	                    });
					}
					break;
			}
            if (options.currentPage == 1) {
                $pageBar.find(".pageBar-index").addClass("pageBar-pageDisable");
                $pageBar.find(".pageBar-prePage").addClass("pageBar-pageDisable");
            } else {
                $pageBar.find(".pageBar-index").removeClass("pageBar-pageDisable");
                $pageBar.find(".pageBar-prePage").removeClass("pageBar-pageDisable");
            }
            console.log(options.currentPage + "----" + options.totalPage);
            if (options.currentPage == options.totalPage) {
                $pageBar.find(".pageBar-lastPage").addClass("pageBar-pageDisable");
                $pageBar.find(".pageBar-nextPage").addClass("pageBar-pageDisable");
            } else {
                $pageBar.find(".pageBar-lastPage").removeClass("pageBar-pageDisable");
                $pageBar.find(".pageBar-nextPage").removeClass("pageBar-pageDisable");
            }
            $pageBar.find(".pageBar-pageNumFocus").removeClass('pageBar-pageNumFocus');
            $pageBar.find("span[value='" + options.currentPage + "']").addClass('pageBar-pageNumFocus');
		}
	};
	var util={
		ajax:function(_url,_success,_error){
			var self=this;
			if(!!self.xhr &&!!self.xhr.abort){
				self.xhr.abort();
			}
			jQuery.support.cors = true;//解决跨域问题
            self.xhr = $.ajax({
                type: 'get',
                url: _url,
                cache: false,
                timeout: 30000,
                global: true,
                dataType: "json",
                success: function(r) {
                    _success.call(self, r);
                },
                error: function(XmlHttp, msg) {
                    _error(XmlHttp, msg);
                }
            });
		},
		/*取出url参数字符串中对应key的参数*/
        getArgs: function(argsStr, argsAame) {
            if (argsStr == null) return null;
            var pattern = new RegExp("(?:[&?])" + argsAame + "=([^&]*)(?:&|$)", "ig");
            var result = pattern.exec(argsStr);
            if (result != null && result[1] != null) {
                return result[1];
            }
            return null;
        },
        storeInfoInCookie:function(argname,argValue){
            var $cookie_ = $.cookie || top.$.cookie;
            if( typeof($cookie_ ) == "function"){
                $cookie_(argname,argValue,{expiress:3});
                return true;
            }else{
                alert("分页插件需要使用jquery.cookie.js文件，请加载！");
                return false;
            }
        },
        getCookieByName:function(argname){
            var $cookie_ = $.cookie || top.$.cookie;
            if( typeof($cookie_ ) == "function"){
                return $cookie_(argname);
            }else{
                alert("分页插件需要使用jquery.cookie.js文件，请加载！");
                return "";
            }
        }
	};
    var pages = {
        showPages: function(options) {
            method.init.call(this, options);
            this.options = options;
            this.modifyPara = method.modifyPara;
            return this;
        }
    };
	$.extend($.fn,pages);
})(jQuery);