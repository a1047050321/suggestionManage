
;(function ($) {
    $.fn.extend({
        tableExport: function (options) {
            var defaults = {
                consoleLog: false,
                csvEnclosure: '"',
                csvSeparator: ',',
                csvUseBOM: true,
                displayTableName: false,
                escape: false,
                excelstyles: ['border-bottom', 'border-top', 'border-left', 'border-right'],
                fileName: '意见反馈数据',
                htmlContent: false,
                ignoreColumn: [0,10,11],
                ignoreRow: [],
                jspdf: {
                    orientation: 'p',
                    unit: 'pt',
                    format: 'a4',
                    margins: { left: 20, right: 10, top: 10, bottom: 10 },
                    autotable: {
                        padding: 2,
                        lineHeight: 12,
                        fontSize: 8,
                        tableExport: {
                            onAfterAutotable: null,
                            onBeforeAutotable: null,
                            onTable: null
                        }
                    }
                },
                numbers: {
                    html: {
                        decimalMark: '.',
                        thousandsSeparator: ','
                    },
                    output: {
                        decimalMark: '.',
                        thousandsSeparator: ','
                    }
                },
                onCellData: null,
                outputMode: 'file', // file|string|base64
                tbodySelector: 'ul',
                theadSelector: 'ul',
                tableName: 'myTableName',
                type: 'csv',
                worksheetName: 'xlsWorksheetName'
            };


            var el = this;
            var DownloadEvt = null;
            var rowIndex = 0;
            var rowspans = [];
            var trData = '';


            $.extend(true, defaults, options);

			if (defaults.type == 'excel' || defaults.type == 'doc') {
                //console.log($(this).html());


                rowIndex = 0;
                var excelData = "<table>";
                // Header
                var dataHeader = defaults.dataHeader;
                 trData = "";
                for(var i = 0,len = dataHeader.length; i < len; i++){
                    trData += "<td style='";
                    trData += "'>" + String(dataHeader[i]).replace(/\u00AD/g, "") + "</td>";
                }
                if (trData.length > 0)
                    excelData += "<tr>" + trData + '</tr>';
                rowIndex++;

                // Row Vs Column
                var dataList =  defaults.dataList;
                for(var i = 0,len = dataList.length; i < len;i++ ){
                     trData = "";
                	var dataJson = dataList[i];
                	for(var attr in dataJson){
                		trData += "<td style='";
                		trData += "'>" + String(dataJson[attr]).replace(/\u00AD/g, "") + "</td>";
                	}
                	if (trData.length > 0)
                        excelData += "<tr>" + trData + '</tr>';
                    rowIndex++;
                }


                excelData += '</table>';


                if (defaults.consoleLog === true)
                    console.log(excelData);


                var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:" + defaults.type + "' xmlns='http://www.w3.org/TR/REC-html40'>";
                excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-' + defaults.type + '; charset=UTF-8">';
                excelFile += '<meta http-equiv="content-type" content="application/';
                excelFile += (defaults.type === 'excel') ? 'vnd.ms-excel' : 'msword';
                excelFile += '; charset=UTF-8">';
                excelFile += "<head>";
                if (defaults.type === 'excel') {
                    excelFile += "<!--[if gte mso 9]>";
                    excelFile += "<xml>";
                    excelFile += "<x:ExcelWorkbook>";
                    excelFile += "<x:ExcelWorksheets>";
                    excelFile += "<x:ExcelWorksheet>";
                    excelFile += "<x:Name>";
                    excelFile += defaults.worksheetName;
                    excelFile += "</x:Name>";
                    excelFile += "<x:WorksheetOptions>";
                    excelFile += "<x:DisplayGridlines/>";
                    excelFile += "</x:WorksheetOptions>";
                    excelFile += "</x:ExcelWorksheet>";
                    excelFile += "</x:ExcelWorksheets>";
                    excelFile += "</x:ExcelWorkbook>";
                    excelFile += "</xml>";
                    excelFile += "<![endif]-->";
                }
                excelFile += "</head>";
                excelFile += "<body>";
                excelFile += excelData;
                excelFile += "</body>";
                excelFile += "</html>";


                if (defaults.outputMode == 'string')
                    return excelFile;


                var base64data = base64encode(excelFile);

                if (defaults.outputMode === 'base64')
                    return base64data;


                var extension = (defaults.type === 'excel') ? 'xls' : 'doc';
                try {
                    var blob = new Blob([excelFile], { type: 'application/vnd.ms-' + defaults.type });
                    saveAs(blob, defaults.fileName + '.' + extension);
                }
                catch (e) {
                    downloadFile(defaults.fileName + '.' + extension, 'data:application/vnd.ms-' + defaults.type + ';base64,' + base64data);
                }
                excelFile = "";
                // layer.closeAll('loading');
                
            } 
     		

            function downloadFile(filename, data) {
                var DownloadLink = document.createElement('a');


                if (DownloadLink) {
                    document.body.appendChild(DownloadLink);
                    DownloadLink.style = 'display: none';
                    DownloadLink.download = filename;
                    DownloadLink.href = data;


                    if (document.createEvent) {
                        if (DownloadEvt == null)
                            DownloadEvt = document.createEvent('MouseEvents');


                        DownloadEvt.initEvent('click', true, false);
                        DownloadLink.dispatchEvent(DownloadEvt);
                    }
                    else if (document.createEventObject)
                        DownloadLink.fireEvent('onclick');
                    else if (typeof DownloadLink.onclick == 'function')
                        DownloadLink.onclick();


                    document.body.removeChild(DownloadLink);
                }
            }


            function utf8Encode(string) {
                string = string.replace(/\x0d\x0a/g, "\x0a");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    }
                    else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            }


            function base64encode(input) {
                var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = utf8Encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                            keyStr.charAt(enc3) + keyStr.charAt(enc4);
                }
                return output;
            }


            return this;
        }
    });
})(jQuery);
        
