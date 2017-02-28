
var $inputStockCode = $('#inputStockCode');
var $todoList = $('#todoList');
var timelineType = '';

/* 
* 股票代码（全局变量）
*/
var stockCode = "";
var stockCodeArray = ""; // 股票数字，保存到cookie中

/*
* onload方法
*/
window.onload = function(){
	// $.cookie('stockCode', 300073);
	// stockCodeArray = $.cookie('stockCode');
	// alert(stockCodeArray);

	setInterval(reflush, 2000); // 循环定时2s执行函数

}


$inputStockCode.keydown(function(event){

	if(event.which == 13){
		stockCode = $("#inputStockCode").val();
		console.log("添加的股票代码是："+stockCode);
		if(stockCode == null || stockCode.length == 0){
	        alert("股票代码不能为空！");
	        return;
	    }
	    getStockListData(stockCode, false);
	    $("#timelineValue").html("");
		$("#avglineValue").html("");
	}
	
});


/**
* 添加股票
*/
$("#addStockBtn").on("click", function(){
	stockCode = $("#inputStockCode").val();
	console.log("添加的股票代码是："+stockCode);
	if(stockCode == null || stockCode.length == 0){
        alert("股票代码不能为空！");
        return;
    }
    getStockListData(stockCode, false);
    $("#timelineValue").html("");
	$("#avglineValue").html("");
});



/**
* 删除股票
*/
$todoList.on('click', '.todoDelete', function(e){
    $(this).parent().remove();
});




/**
* 点击条目，显示股票详情（股票基本信息+分数线）
*/
function showStockDetail(stockcode){
	// alert(stockcode);
        stockCode = stockcode;
        getShowDetail("c=p\ns="+stockcode);
        getTimeLine("c=t,60\nc=a,60,5,10,20,62,310\ns="+stockcode);
        // getStockVa("c=va,20\nc=ta,20\nc=wa,20\ns="+stockcode);
        timelineType = "1分钟";
        tab(60);
        $("ul.nav-tabs").find("li").attr("class", "");
        $("ul.nav-tabs li").first().attr("class", "active");

        $("ul#todoList ul").css("color", "#777");
        $("ul#todoList ul#"+stockcode).css("color", "#000");
};




/**
* 分时单位切换事件
*/
$("ul.nav-tabs li").on('click', function(e){

    $(this).parent().find("li").attr("class", "");

    $(this).attr("class", "active");

    timelineType = $(this).children().html();

    switch(timelineType){
        case "1分钟": 
            tab(60);
            break;
        case "5分钟": 
            tab(300);
            break;
        case "15分钟": 
            tab(900);
            break;
        case "60分钟": 
            tab(3720);
            break;
        case "1日": 
            tab(18600);
            break;
        case "1周": 
            tab(55800);
            break;
        case "策略":
        	getStockTradehis("c=tradehis\ns="+stockCode);
        	$(".tradehislayout").show();
        	$(".timelinelayout").hide();
        	$(".otherlayout").hide();
            break;
        case "其他":
        	getStockVa("c=va,20\nc=ta,20\nc=wa,20\ns="+stockCode);
        	$(".tradehislayout").hide();
        	$(".timelinelayout").hide();
        	$(".otherlayout").show();
            break;
    }
});





/**
* ajax获取股票数据（股票名称+最新价+涨跌幅）
*/
function getStockListData(stockcode, isReflush) {
    var uri = "c=p\ns="+stockcode;//new String("c=p\ns=300073");
    $.ajax({
        type: "POST",
        async: false,
        url: UConfig.server+"QTHttp/GetData.php",//?value="+encodeURIComponent(uri),//?value='c=p&s=300073'
        data: uri,
        // dataType: "application/text",

        success: function(result){
            // alert(result.toString());
            console.log(result.toString());

            if(result.length == 0){
                alert("查无结果");
                return;
            }


            // content panel | title
            var resultArr = result.split("\n");
            


			if(stockcode.indexOf(",") == -1 && isReflush != true){
				var resultArr2 = resultArr[1].split(",");
	            $("#title").html(resultArr2[0]);
	            var tempHtml = '<span>当前价格：'+resultArr2[1]+'</span>';
	            // tempHtml += '<span>'+resultArr2[2]+'</span>';
	            tempHtml += '<span>振幅：'+resultArr2[3]+'</span>';
	            tempHtml += '<span>总成交量：'+resultArr2[4]+'</span>';
	            tempHtml += '<span>总成交价格：'+resultArr2[5]+'</span>';
	            $("#param").html(tempHtml)

				$todoList.append('<ul id='+stockcode+' onclick="showStockDetail(\''+stockcode+'\')" style="margin:0 10px;"><li >'+resultArr2[0]+'</li><li>'+resultArr2[1]+'</li><li>'+resultArr2[3]+'</li><a class="todoDelete">x</a></ul>');
            	$inputStockCode.val('');
			}else{





				var htmlTemp = "";
				for(var i=0; i<resultArr.length; i+=2){
					if(resultArr[i].indexOf("stockprice=") >= 0){
						var code = resultArr[i].substring(11);
						var stockInfo = resultArr[i+1].split(",");

						$("ul#todoList").find("ul").each(function(){
				            // console.log($(this).attr("id"));
				             if(code == $(this).attr("id")){
				             	$(this).html('<li >'+stockInfo[0]+'</li><li>'+stockInfo[1]+'</li><li>'+stockInfo[3]+'</li><a class="todoDelete">x</a>');
				             
								var tempHtml = '<span>当前价格：'+stockInfo[1]+'</span>';
					            // tempHtml += '<span>'+resultArr2[2]+'</span>';
					            tempHtml += '<span>振幅：'+stockInfo[3]+'</span>';
					            tempHtml += '<span>总成交量：'+stockInfo[4]+'</span>';
					            tempHtml += '<span>总成交价格：'+stockInfo[5]+'</span>';
					            $("#param").html(tempHtml)

				             }
				        });

						
						// htmlTemp += '<ul id='+code+' style="margin:0 10px;"><li >'+stockInfo[0]+'</li><li>'+stockInfo[1]+'</li><li>'+stockInfo[3]+'</li><a class="todoDelete">x</a></ul>';
					}
				}

				// $todoList.html(htmlTemp);
            	// $inputStockCode.val('');
			}

            

            
        },
        error: function(errmsg) {
            // console.log(errmsg);
            // alert("Ajax获取服务器数据出错了！"+ errmsg);
        }
    });
}



//调用ajax来实现异步的加载数据
function getShowDetail(requestParam) {
    var uri = requestParam;//new String("c=p\ns=300073");
    $.ajax({
        type: "GET",
        async: false,
        url: UConfig.server+"QTHttp/GetData.php?value="+encodeURIComponent(uri),//?value='c=p&s=300073'
        data: {},
        // dataType: "json",
        success: function(result){
            // alert(result.toString());
            console.log(result.toString());

            if(result.length == 0){
                alert("查无结果");
                return;
            }


            // content panel | title
            var resultArr = result.split("\n");
            var resultArr2 = resultArr[1].split(",");
            $("#title").html(resultArr2[0]);
            var tempHtml = '<span>当前价格：'+resultArr2[1]+'</span>';
            // tempHtml += '<span>'+resultArr2[2]+'</span>';
            tempHtml += '<span>振幅：'+resultArr2[3]+'</span>';
            tempHtml += '<span>总成交量：'+resultArr2[4]+'</span>';
            tempHtml += '<span>总成交价格：'+resultArr2[5]+'</span>';
            $("#param").html(tempHtml)


            // $todoList.append('<li id="'+requestParam+'" onclick="showDetail(\''+requestParam.split("c=p\ns=")[1]+'\')">'+resultArr2[0]+'&nbsp;'+resultArr2[1]+'&nbsp;'+resultArr2[3]+'<a class="todoDelete">x</a></li>');
            // $todoInput.val('');


            // alert('--->'+resultArr2[0]);
            // return resultArr2[0];

            // if(result){
            //     for(var i = 0 ; i < result.length; i++){
            //         names.push(result[i].name);
            //         ages.push(result[i].age);
            //     }
            // }
        },
        error: function(errmsg) {
            alert("Ajax获取服务器数据出错了！"+ errmsg);
            return '';
        }
    });
// return names, ages;
}



/**
* ajax获取分时线数据（分数线+移动平均线）点击事件
*/
function getTimeLine(requestParam){
    var uri = requestParam;//new String("c=p\ns=300073");
    $.ajax({
        type: "GET",
        async: false,
        url: UConfig.server+"QTHttp/GetData.php?value="+encodeURIComponent(uri),//?value='c=p&s=300073'
        data: {},
        // dataType: "json",
        success: function(result){
            // alert(result.toString());
            console.log(result.toString());

            if(result.length == 0){
                alert("查无结果");
                return;
            }



            var resultArr = result.split("\n");
            // var len = resultArr.length-2;
            // var array = new Array([len]);//arr.length
            // for (var j = 2; j < resultArr.length-2; j++) {
            //     console.log(resultArr[j]);

            //     var arr = resultArr[j].split(',');


            //     var arr1 = new Array((new Date(arr[0]*1000)).Format("yyyy-MM-dd hh:mm:ss"),
            //                          parseFloat(arr[4]),
            //                          parseFloat(arr[1]),
            //                          parseFloat(arr[3]),
            //                          parseFloat(arr[2]));
            //     array.push(arr1);
            // }


            var timelineHtml = "";
            var avglineHtml = "";
            var flag = false;
            for(var i=0; i<resultArr.length; i++){
                var arr = resultArr[i].split(',');
                if(resultArr[i].indexOf("timelineType=") >= 0 && resultArr[i+1].indexOf("stockave=") == -1){
                    flag = true;
                }
                if(resultArr[i].indexOf("stockave=") >= 0){
                    flag = false;
                }
                if(resultArr[i].indexOf("avetypeLine=5") >= 0){
                    avglineHtml += "<h3>MA5:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(resultArr[i].indexOf("avetypeLine=10") >= 0){
                    avglineHtml += "<h3>MA10:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(resultArr[i].indexOf("avetypeLine=20") >= 0){
                    avglineHtml += "<h3>MA20:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(resultArr[i].indexOf("avetypeLine=62") >= 0){
                    avglineHtml += "<h3>MA62:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(resultArr[i].indexOf("avetypeLine=310") >= 0){
                    avglineHtml += "<h3>MA310:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(flag)
                    timelineHtml = "<h3>time:<span style='color:#00f'>"+(new Date(arr[0]*1000)).Format("hh:mm:ss")+"</span>,"+
                                  "close:<span style='color:#00f'>"+parseFloat(arr[1])+"</span>,"+
                                  "open:<span style='color:#00f'>"+parseFloat(arr[4])+"</span>,"+
                                  "low:<span style='color:#00f'>"+parseFloat(arr[3])+"</span>,"+
                                  "high:<span style='color:#00f'>"+parseFloat(arr[2])+"</span></h3>";
            }


            // var arr = resultArr[resultArr.length-10].split(',');
            // var timelineStr = "分时线<br/>&nbsp;&nbsp;"+
            // 				  "time:"+(new Date(arr[0]*1000)).Format("hh:mm:ss")+","+
            //                   "close:"+parseFloat(arr[1])+","+
            //                   "open:"+parseFloat(arr[4])+","+
            //                   "low:"+parseFloat(arr[3])+","+
            //                   "high:"+parseFloat(arr[2]);

            $("#timelineValue").html("<h3>分时线</h3>"+timelineHtml);

            $("#avglineValue").html("<h3>移动平均线</h3>"+avglineHtml);

            
        },
        error: function(errmsg) {
            alert("Ajax获取服务器数据出错了！"+ errmsg);
            return '';
        }
    });
}



/**
* 切换事件
*/
function tab(key){
    if(stockCode != ""){
        console.log($(this));
        getTimeLine("c=t,"+key+"\nc=a,"+key+",5,10,20,62,310\ns="+stockCode);
        $(".tradehislayout").hide();
        $(".timelinelayout").show();
        $(".otherlayout").hide();
    }
}




/**
* 定时刷新
*/
function reflush(){
	// 列表数据
    if($("ul#todoList ul").attr("id") != undefined){
        var p = "";
        $("ul#todoList").find("ul").each(function(){
            // console.log($(this).attr("id"));
            p += $(this).attr("id")+",";
        });
        // p = p.substring(0, p.length-1)
        var pTemp = "";
        var pArr = p.split(",");
        for(var i=pArr.length-1; i>=0; i--){
        	pTemp += pArr[i] + ",";
        }
        p = pTemp;
        p = p.substring(1, p.length-1)
        console.log("p="+p);
        getStockListData(p, true);

        // alert(p);
		// $.cookie('stockCode', p);

    }
    if(stockCodeArray != ''){
        getStockListData(stockCodeArray, true);
    }

    // 分时线
	if($("#timelineValue").html().length != 0){
	    var t=0;
	    console.log("stockCode="+stockCode+",timelineType="+timelineType);
	    switch(timelineType){
	        case "1分钟": 
	            t = 60;
	            break;
	        case "5分钟": 
	            t = 300;
	            break;
	        case "15分钟": 
	            t = 900;
	            break;
	        case "60分钟": 
	            t = 3720;
	            break;
	        case "1日": 
	            t = 18600;
	            break;
	        case "1周": 
	            t = 55800;
	            break;
	        case "策略":
	        	t = 0;
        		getStockTradehis("c=tradehis\ns="+stockCode);
	        	// $(".tradehislayout").show();
	        	// $(".timelinelayout").hide();
            	break;
            case "其他":
				// 成交量、换手率、振幅
				getStockVa("c=va,20\nc=ta,20\nc=wa,20\ns="+stockCode);
            	break;
	    }
	    // var p = $("li#todoList li").attr("id");
	    // p = p.split("p")[0]+"t,"+t+"\nc=a,"+t+",5,10,20"+p.split("p")[1];
	    // console.log("p="+p);
	    if(t != 0)
	    	getTimeLine2("c=t,"+t+"\nc=a,"+t+",5,10,20,62,310\ns="+stockCode);

	    
	}


	


	// 交易记录
	// getStockTradehis
}




/**
* ajax获取分时线数据（分数线+移动平均线）定时刷新
*/
function getTimeLine2(requestParam){
    var uri = requestParam;//new String("c=p\ns=300073");
    console.log("uri="+uri);
    $.ajax({
        type: "GET",
        async: false,
        url: UConfig.server+"QTHttp/GetData.php?value="+encodeURIComponent(uri),//?value='c=p&s=300073'
        data: {},
        // dataType: "json",
        success: function(result){
            // alert(result.toString());
            console.log(result.toString());

            if(result.length == 0){
                // alert("查无结果");
                return;
            }



            var resultArr = result.split("\n");
            // var len = resultArr.length-2;
            // var array = new Array([len]);//arr.length
            // for (var j = 2; j < resultArr.length-2; j++) {
            //     console.log(resultArr[j]);

            //     var arr = resultArr[j].split(',');


            //     var arr1 = new Array((new Date(arr[0]*1000)).Format("yyyy-MM-dd hh:mm:ss"),
            //                          parseFloat(arr[4]),
            //                          parseFloat(arr[1]),
            //                          parseFloat(arr[3]),
            //                          parseFloat(arr[2]));
            //     array.push(arr1);
            // }
            
            var timelineHtml = "";
            var avglineHtml = "";
            var flag = false;
            for(var i=0; i<resultArr.length; i++){
                var arr = resultArr[i].split(',');
                if(resultArr[i].indexOf("timelineType=") >= 0 && resultArr[i+1].indexOf("stockave=") == -1){
                    flag = true;
                }
                if(resultArr[i].indexOf("stockave=") >= 0){
                    flag = false;
                }
                if(resultArr[i].indexOf("avetypeLine=5") >= 0){
                    avglineHtml += "<h3>MA5:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(resultArr[i].indexOf("avetypeLine=10") >= 0){
                    avglineHtml += "<h3>MA10:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(resultArr[i].indexOf("avetypeLine=20") >= 0){
                    avglineHtml += "<h3>MA20:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(resultArr[i].indexOf("avetypeLine=62") >= 0){
                    avglineHtml += "<h3>MA62:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(resultArr[i].indexOf("avetypeLine=310") >= 0){
                    avglineHtml += "<h3>MA310:<span style='color:#00f'>"+resultArr[i+1].split(',')[resultArr[i+1].split(',').length-1]+"</span></h3>";
                }
                if(flag)
                    timelineHtml = "<h3>time:<span style='color:#00f'>"+(new Date(arr[0]*1000)).Format("hh:mm:ss")+"</span>,"+
                                  "close:<span style='color:#00f'>"+parseFloat(arr[1])+"</span>,"+
                                  "open:<span style='color:#00f'>"+parseFloat(arr[4])+"</span>,"+
                                  "low:<span style='color:#00f'>"+parseFloat(arr[3])+"</span>,"+
                                  "high:<span style='color:#00f'>"+parseFloat(arr[2])+"</span></h3>";
            }

            $("#timelineValue").html("<h3>分时线</h3>"+timelineHtml);

            $("#avglineValue").html("<h3>移动平均线</h3>"+avglineHtml);

            
        },
        error: function(errmsg) {
            alert("Ajax获取服务器数据出错了！"+ errmsg);
            return '';
        }
    });
}




function getStockVa(requestParam){
	var uri = requestParam;//new String("c=p\ns=300073");
    console.log("uri="+uri);
    $.ajax({
        type: "GET",
        async: false,
        url: UConfig.server+"QTHttp/GetData.php?value="+encodeURIComponent(uri),//?value='c=p&s=300073'
        data: {},
        // dataType: "json",
        success: function(result){
            // alert(result.toString());
            console.log(result.toString());

            if(result.length == 0){
                // alert("查无结果");
                return;
            }


            var resultArr = result.split('\n');
            var vaBegin = 0;
            var vaEnd = 0;
            var taBegin = 0;
            var taEnd = 0;
            var waBegin = 0;
            var waEnd = 0;

			// 分时线
			for(var i=0; i<resultArr.length; i++){
				if(resultArr[i].indexOf('stockva') >= 0){
					if(resultArr[i+2] != ''){
                        


						// $("#vaValue").html("成交量MA20<br/>&nbsp;&nbsp;"+resultArr[i+2]);
						i+=2;
					}
				}
				if(resultArr[i].indexOf('stockta') >= 0){
					if(resultArr[i+2] != ''){
                        vaBegin = i-1-5;
                        vaEnd = i-1;
                        


						// $("#taValue").html("换手率MA20<br/>&nbsp;&nbsp;"+resultArr[i+2]);
						i+=2;
					}
				}
				if(resultArr[i].indexOf('stockwa') >= 0){
					if(resultArr[i+2] != ''){
                        taBegin = i-1-5;
                        taEnd = i-1;




						// $("#waValue").html("振幅MA20<br/>&nbsp;&nbsp;"+resultArr[i+2]);
						i+=2;
					}
				}
			}

            waBegin = resultArr.length-1-5;
            waEnd = resultArr.length-1;


            var vaHtml = "<h3>成交量MA20</h3>";
            for(var i=vaBegin; i<vaEnd; i++){
                vaHtml += "<div><span style='color:#00f'>日期:"+resultArr[i].split(',')[0]+"</span>";
                vaHtml += "<span style='color:#00f'>量比:"+Math.floor(resultArr[i].split(',')[1]/resultArr[vaBegin].split(',')[1]*100)/100+"</span>";
                vaHtml += "<span style='color:#00f'>成交量:"+resultArr[i].split(',')[1]+"</span>";
                vaHtml += "<span style='color:#00f'>最高成交量:"+resultArr[i].split(',')[2]+"</span>";
                vaHtml += "<span style='color:#00f'>最低成交量:"+resultArr[i].split(',')[3]+"</span></div>";
            }
            $("#vaValue").html(vaHtml);

            var taHtml = "<h3>换手率MA20</h3>";
            for(var i=taBegin; i<taEnd; i++){
                taHtml += "<div><span style='color:#00f'>日期:"+resultArr[i].split(',')[0]+"</span>";
                taHtml += "<span style='color:#00f'>量比:"+Math.floor(resultArr[i].split(',')[1]/resultArr[taBegin].split(',')[1]*100)/100+"</span>";
                taHtml += "<span style='color:#00f'>成交量:"+resultArr[i].split(',')[1]+"</span>";
                taHtml += "<span style='color:#00f'>最高成交量:"+resultArr[i].split(',')[2]+"</span>";
                taHtml += "<span style='color:#00f'>最低成交量:"+resultArr[i].split(',')[3]+"</span></div>";
            }
            $("#taValue").html(taHtml);

            var waHtml = "<h3>振幅MA20</h3>";
            for(var i=waBegin; i<waEnd; i++){
                waHtml += "<div><span style='color:#00f'>日期:"+resultArr[i].split(',')[0]+"</span>";
                waHtml += "<span style='color:#00f'>量比:"+Math.floor(resultArr[i].split(',')[1]/resultArr[waBegin].split(',')[1]*100)/100+"</span>";
                waHtml += "<span style='color:#00f'>成交量:"+resultArr[i].split(',')[1]+"</span>";
                waHtml += "<span style='color:#00f'>最高成交量:"+resultArr[i].split(',')[2]+"</span>";
                waHtml += "<span style='color:#00f'>最低成交量:"+resultArr[i].split(',')[3]+"</span></div>";
            }
            $("#waValue").html(waHtml);

            
        },
        error: function(errmsg) {
            alert("Ajax获取服务器数据出错了！"+ errmsg);
            return '';
        }
    });
}





function getStockTradehis(requestParam){
	var uri = requestParam;//new String("c=p\ns=300073");
    console.log("uri="+uri);
    $.ajax({
        type: "GET",
        async: false,
        url: UConfig.server+"QTHttp/GetData.php?value="+encodeURIComponent(uri),//?value='c=p&s=300073'
        data: {},
        // dataType: "json",
        success: function(result){
            // alert(result.toString());
            console.log(result.toString());

            if(result.length == 0){
                // alert("查无结果");
                return;
            }

            var resultArr = result.split('\n');
            if(resultArr[0].indexOf("stocktradehis=") >= 0){
            	var json = "";
            	for(var i=1; i<resultArr.length; i++){
            		json+=resultArr[i];
            	}
				var objectArray = JSON.parse(json);
				var html = "";
				for(var i=0; i<objectArray.length; i++){
					var iWinning = '';
					if(objectArray[i].iWinning == 0){
						iWinning = '平';
					}
					if(objectArray[i].iWinning == 1){
						iWinning = '<span style="color:red">胜</span>';
					}
					if(objectArray[i].iWinning == -1){
						iWinning = '<span style="color:green">负</span>';
					}
					html += '<div class="col-md-2">'+
                            '</div>'+
                            '<div class="col-md-10">'+
                                '策略：'+objectArray[i].szTactics+
                            '</div>'+

                            '<div class="col-md-2">'+
                            '</div>'+
                            '<div class="col-md-10">'+
                                '策略成败：'+iWinning+
                            '</div>'+

                            '<div class="col-md-2">'+
                            '</div>'+
                            '<div class="col-md-10">'+
                                '盈利：'+objectArray[i].fProfit+"元"+
                            '</div>'+

                            '<div class="col-md-2">'+
                            '</div>'+
                            '<div class="col-md-10">'+
                                '交易创建时间：'+(new Date(objectArray[i].iCreateTime*1000)).Format("yyyy-MM-dd hh:mm:ss")+
                            '</div>'+

                            '<div class="col-md-2">'+
                            '</div>'+
                            '<div class="col-md-10">'+
                                '交易结束时间：'+(new Date(objectArray[i].iCloseTime*1000)).Format("yyyy-MM-dd hh:mm:ss")+
                            '</div>';

                            for(var j=0; j<objectArray[i].aTrace.length; j++){
                            	var iTraceType = '';
                            	if(objectArray[i].aTrace[j].iTraceType == 0){
                            		iTraceType = '买多';
                            	}
                            	if(objectArray[i].aTrace[j].iTraceType == 1){
                            		iTraceType = '卖多';
                            	}
                            	if(objectArray[i].aTrace[j].iTraceType == 2){
                            		iTraceType = '买空';
                            	}
                            	if(objectArray[i].aTrace[j].iTraceType == 3){
                            		iTraceType = '卖空';
                            	}
                            	html += '<div class="col-md-4">'+
			                            '</div>'+
			                            '<div class="col-md-8">'+
			                                '交易类型：'+iTraceType+
			                            '</div>'+

			                            '<div class="col-md-4">'+
			                            '</div>'+
			                            '<div class="col-md-8">'+
			                                '成交量：'+objectArray[i].aTrace[j].fVolume+"股"+
			                            '</div>'+

			                            '<div class="col-md-4">'+
			                            '</div>'+
			                            '<div class="col-md-8">'+
			                                '价格：'+objectArray[i].aTrace[j].fPrice+"元"+
			                            '</div>'+

			                            '<div class="col-md-4">'+
			                            '</div>'+
			                            '<div class="col-md-8">'+
			                                '交易时间：'+(new Date(objectArray[i].aTrace[j].iTime*1000)).Format("hh:mm:ss")+
			                            '</div>';
			                    // html += '<HR style="FILTER: alpha(opacity=100,finishopacity=0,style=3)" width="80%" color=#987cb9 SIZE=3>';
                            }
			        html += '<HR align=center width=95% color=#987cb9 SIZE=1 style="margin-left:20px;">';
					
				}
				$(".tradehislayout").html(html);
            }
   

            
        },
        error: function(errmsg) {
            alert("Ajax获取服务器数据出错了！"+ errmsg);
            return '';
        }
    });
}



// stocktradehis=300073
// [{
// 	"iCreateTime": "1483618341", 
// 	"id": "359c8598d34011e6995d9cb6d016fb8e", 
// 	"bState": false, 
// 	"aTrace": 
// 	[{
// 		"fPrice": 20, 
// 		"iTime": "1483618341", 
// 		"iTraceType": 0, 
// 		"fVolume": 100
// 	}, {
// 		"fPrice": 25, 
// 		"iTime": "1483618341", 
// 		"iTraceType": 1, 
// 		"fVolume": 100
// 	}], 
// 	"fVolume": 0, 
// 	"iWinning": 1, 
// 	"iCloseTime": "1483618341", 
// 	"szTactics": "\u7b56\u7565\u4e00", 
// 	"szStockCode": "300073", 
// 	"fProfit": 500.0
// }]




/**
* 解析数据
*/
// function parsedData(String date){
// 	var line = date.split('\n');
// 	// 分时线
// 	for(var i=0; i<line.length; i++){
// 		if(line.indexOf('stocktimeline=') >= 0){
// 			var 
// 		}
// 	}

// }





