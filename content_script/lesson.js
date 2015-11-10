
function post(url,data,lid)
{	
/*	if (localStorage["lesson_enable"] == undefined || localStorage["lesson_enable"] == 0) {
		return 0;
	};
*/
    setTimeout(function(){
		jQuery.ajax({
		  type: 'POST',
		  url: url,
		  data: data,
		  async:false,
		  success: function(data){
					processArrangement(data,lid);

			},
			error: function(data){
				console.log("error");

			},
		  dataType: "html"
		});}
	,0);
	
	return 0;

}

	
//颜色对照表
color = [];
color[0] = ["#84C1FF","#84C1FF","#84C1FF","#84C1FF","#84C1FF","#84C1FF","#84C1FF"]
color[1] = ["#ff7575","#ff7575","#ff7575","#ff7575","#ff7575","#ff7575","#ff7575"]
border_color = [];
border_color[0] = "blue";
border_color[1] = "red";


function lesson_enable_check () {
	
    // enable the function
	var timestamp = Date.parse(new Date())/1000;
	if (!(localStorage["lesson_enable_timestamp"] > 10))
		localStorage["lesson_enable_timestamp"] = 100;
	if(timestamp - localStorage["lesson_enable_timestamp"] > 60 * 5){
		jQuery.ajax({
		  type: 'GET',
		  url: "http://1.laohyxwebauth.sinaapp.com/electsys_lesson_enable.php",
		  data: {},
		  async:true,
		  success: function(data){
					localStorage["lesson_enable"] = data["enable"];
					console.log( data["enable"]);
				},
			error: function(data){
			console.log("error");

			},
		  dataType: "json"
		});
		localStorage["lesson_enable_timestamp"] = timestamp;
	}

}

function optimize_elect()
{
	    
    document = document;
    //在课程安排中获取老师评教
    show_teacher_eval();
	if(!inUrl("/edu/student/elect"))
	{
		return 0;
	}
   // var black_list = ["http://electsys.sjtu.edu.cn/edu/student/elect/viewLessonTbl.aspx","http://electsys.sjtu.edu.cn/edu/student/elect/electResultOuter.aspx"]
    if(inUrl("/edu/student/elect/viewLessonTbl.aspx") || inUrl("/edu/student/elect/electResultOuter.aspx"))
    {
        //优化黑名单
        return 0;
    }

	title = jQuery(".tit",document);
	title.removeAttr("width");
/*
	if (localStorage["lesson_enable"] == undefined || localStorage["lesson_enable"] == 0) {
		jQuery("table").slice(2,3).before('<div style="color:red;">为减少服务器压力，抢选高峰暂时关闭部分功能。请使用<a href="http://electsys.net/" target="_blank">electsys.net</a>查询课程：）</div>')

	};
*/
	//插入小课表
	prepend_smalltable();
	title[0].innerHTML += " Electsys++  " + localStorage['extension_version'];
	
	type = "tongshi";
	
	if(inUrl("/edu/student/elect/speltyRequiredCourse.aspx"))
		type = "bixiu";
	if(inUrl("/edu/student/elect/speltyCommonCourse.aspx"))
		type = "tongshi";
	if(inUrl("/edu/student/elect/outSpeltyEP.aspx"))
		type = "renxuan";
	
    radiogroup = jQuery("[name=myradiogroup]",document);
	for(radio_index = 0; radio_index < radiogroup.length ; radio_index++){
		jQuery(radiogroup[radio_index]).click(function(){
			setTimeout(function(){jQuery("input[value=课程安排]").trigger("click");}, 400);
		})
		var lid = radiogroup[radio_index].value;
		//console.log(radio_index + "~~" + lid);
		radio = radiogroup[radio_index];
		lesson_name = radio.parentElement.parentElement.parentElement.children[1].innerHTML.toString().trim();
		GE_table = ["other","人文学科","社会科学","自然科学与工程技术","数学或逻辑学"];
		var GE_type = jQuery.inJSON(GE_list,lesson_name);
		if(type == "renxuan" && GE_type.length > 0){
			radio.parentElement.parentElement.parentElement.children[1].innerHTML = "<font class='chongdi_font' color=\"red\">" + lesson_name + "（冲抵通识：" + GE_table[GE_type[0]] + "）</font>";
		}
		else{
			//radio.parentElement.parentElement.parentElement.children[1].innerHTML = "<font color=\"blue\">" + lesson_name + "</font>";
		}
		//console.log(lesson_name);
		
	}
    
    var html = jQuery("[name=myradiogroup]",document).slice(0,1).parent().parent().parent().prev().children().slice(0,1).html();
    jQuery("[name=myradiogroup]",document).slice(0,1).parent().parent().parent().prev().children().slice(0,1).css({"background-color":"#83A9C9", "background-image":"none"});
    jQuery("[name=myradiogroup]",document).slice(0,1).parent().parent().parent().prev().children().slice(0,1).html("<a href='#' class='refresh_list' style='font-weight:400;'>【刷新信息】</a>");

	document.processInterval = 600;
    init_query_list();

    jQuery('.refresh_list').click(function(){
    	clearAllInterval();
	    jQuery(".fullspan,.attrtag").remove();
	    var radiogroup = jQuery("[name=myradiogroup]",document).get().reverse();
   		document.lids = [];
		for(radio_index = 0; radio_index < radiogroup.length ; radio_index++){
			//在列表上添加是否空的span - fullspan
			var lid = radiogroup[radio_index].value;
			document.lids[radio_index] = [lid,type];
			jQuery(radiogroup[radio_index]).parent().after('<span class="fullspan">&nbsp;&nbsp;</span>');
		}

		setInterval("processLidQueue();", document.processInterval);
    });
	
}
function init_query_list(){
    jQuery(".fullspan,.attrtag").remove();
    var radiogroup = jQuery("[name=myradiogroup]",document).get().reverse();
	document.lids = [];
	for(radio_index = 0; radio_index < radiogroup.length ; radio_index++){
		var lid = radiogroup[radio_index].value;
		jQuery(radiogroup[radio_index]).parent().after('<span class="fullspan">&nbsp;&nbsp;</span>');
		jQuery(radiogroup[radio_index]).parent().before('<span style="cursor:pointer;color:" class="lesson_query" lid="'+lid.toString()+'">查</span>');
	}
	jQuery('.lesson_query').click(function(event){
		event.stopPropagation();
		jQuery(this).parent().find('.fullspan').html('<span class="fullspan">&nbsp;&nbsp;</span>');
		var lid = jQuery(this).attr('lid');
		document.lids[document.lids.length] = [lid,type];
		clearAllInterval();
		setInterval("processLidQueue();", document.processInterval);
	});
}

function prepend_smalltable()
{
    
	st_fixed_div = jQuery('  <div id="st_fixed_div" style="margin:0px;width:60%;z-index: 999;position: fixed;top:5px;right:0px;border:1px solid gray;text-align: center;"><div class="smalltable_title" style="height:25px;font-size: 12px;line-height:25px;cursor:pointer;background-image:url(http://electsys.sjtu.edu.cn/edu/imgs/subbg2.gif);">课程表(展开/收起)</div><div id="smalltable_handle" style="cursor:move;"><div id="smalltable_container"><span id="LessonTbl1_spanContent_small"></span></div><div class="smalltable_under" style="height:25px;font-size: 12px;line-height:25px;background:#B5C7DE;">electsys++(' + localStorage['extension_version'] + ') by laohyx(拖动)</div></div></div>');
	jQuery("body").prepend(st_fixed_div);
	jQuery("#st_fixed_div").draggable({handle:"#smalltable_handle"});
	if(inUrl("/edu/student/elect/ShortSession.aspx"))
		jQuery("#LessonTbl1_spanContent_small").append(jQuery(".alltab",document)[jQuery(".alltab",document).length - 2].outerHTML);
	else
		jQuery("#LessonTbl1_spanContent_small").append(jQuery(".alltab",document)[jQuery(".alltab",document).length - 1].outerHTML);
		
		
	if (localStorage["malltable_slide"] < 0)
		jQuery("#smalltable_container").slideToggle(0);
	else
		localStorage["malltable_slide"] = 1;
	
	jQuery(".smalltable_title").click(function(){
	    jQuery("#smalltable_container").slideToggle("slow");
		localStorage["malltable_slide"] *= -1;
	  });
	


}




function processLidQueue()
{
	if (document.lids.length == 0) {
		clearAllInterval();
		return;
	};
	// 取栈顶
	var args = document.lids[document.lids.length - 1];
	document.lids = document.lids.slice(0, document.lids.length - 1);
	var lid = args[0];
	var type = args[1];
	// console.log(lid, type);
	var data = {};
	data = {"__VIEWSTATE":jQuery('#__VIEWSTATE',document).val(),"__EVENTVALIDATION":jQuery('#__EVENTVALIDATION',document).val()}
	if(type == "renxuan")
	{
		data["OutSpeltyEP1$dpYx"]=jQuery("#OutSpeltyEP1_dpYx",document).val();
		data["OutSpeltyEP1$dpNj"]=jQuery("#OutSpeltyEP1_dpNj",document).val();
	}
	
	data["myradiogroup"] = lid;
	sub_button = jQuery('[value=课程安排]',document)
	data[sub_button.attr("name")] = sub_button.val();
	input_elements = jQuery("[type=hidden]",document);
	
	form = jQuery("form",document);
	url = base_url + "/edu/student/elect/" + form.attr("action");
	post(url,data,lid);
	return 0;

}
function clearAllInterval(){
	var highestIntervalId = setInterval(";", 100000);
	for (var i = 0 ; i <= highestIntervalId ; i++) {
	    clearInterval(i); 
	}

}
function getArrangement(lid,type)
{
	data = {};
	data = {"__VIEWSTATE":jQuery('#__VIEWSTATE',document).val(),"__EVENTVALIDATION":jQuery('#__EVENTVALIDATION',document).val()}
	if(type == "renxuan")
	{
		data["OutSpeltyEP1jQuerydpYx"]=jQuery("#OutSpeltyEP1_dpYx",document).val();
		data["OutSpeltyEP1jQuerydpNj"]=jQuery("#OutSpeltyEP1_dpNj",document).val();
	}
	data["myradiogroup"] = lid;
	sub_button = jQuery('[value=课程安排]',document)
	data[sub_button.attr("name")] = sub_button.val();
	input_elements = jQuery("[type=hidden]",document);
	
	form = jQuery("form",document);
	url = base_url + "/edu/student/elect/" + form.attr("action");

	post(url,data,lid);
	return 0;

}

function processArrangement(html,lid)
{
	//判断是否有错误提示
	var error_pattern = new RegExp("<span id=\"lblMessage\" .*?>(.*?)</span>");
	var error_match = error_pattern.exec(html);
	if(error_match != null)
	{
		var error_message = error_match[1];
		console.log(error_message);

		if(error_message.indexOf("不能继续增加通识课") > -1){
			error_message = "通识达上限";
			document.lids = [];
			//在列表上添加是否空的提示
			lessontr = jQuery("input[value=" + lid + "]",document).parent().parent().parent();
			fullspan = lessontr.find(".fullspan")[0];
			fullspan.setAttribute("style","color:gray");
			fullspan.innerHTML = error_message;
			return;
		}

		// 其他情况（比如提示查询频繁）
		// 把该lid加回去
		document.lids[document.lids.length] = [lid, type];
		document.processInterval += 200;
		clearAllInterval();
		setInterval("processLidQueue();", document.processInterval);

		return;
	}
    


// 开始处理html，并绘制至课表中
// 这段代码是我大二写的，已经是2011年的事了。。。相信它会运行很久
	
	var lessons = [];
	tablelsn = jQuery("#LessonTime1_gridMain",html)[0];
	

	trs = jQuery("tr",tablelsn).slice(1);
//		console.log(lid);
	for(x = 0; x < trs.length; x++){
		var l = {"lid" : lid, "now" : Number(trs.slice(x,x+1).children().slice(8,9).text()), "max" : Number(trs.slice(x,x+1).children().slice(5,6).text()) };
        l.arrange = Trim(trs.slice(x,x+1).children().slice(9,10).text(),"g")
		l.times = []
		pattern = new RegExp("星期(.*?)第(.*?)节--第(.*?)节","ig");
		matches = l.arrange.match(pattern);
        
				
        matches = matches.distinct();
		for (i = 0 ; i < matches.length;i++) 
		{
			pattern = new RegExp("星期(.*?)第(.*?)节--第(.*?)节","ig");
			txt = matches[i];
			//console.log(txt);
			match = pattern.exec(txt);
			//console.log(match);
			switch(match[1]){
			case "一":
				day = 1;				break;
			case "二":
				day = 2;				break;
			case "三":
				day = 3;				break;
			case "四":
				day = 4;				break;
			case "五":
				day = 5;				break;
			case "六":
				day = 6;				break;
			case "日":
				day = 7;				break;
			default:
				day = 7;			}
			if(l.max - l.now > 0)
				full = 0;
			else
				full = 1;
			//console.log(l.lid);
			time = {"day":day,"from":Number(match[2]),"to":Number(match[3]),"full":full}
			l.times.push(time);
		}
		//n个老师
		lessons.push(l);
	}
	
	
	//保存lessons信息到tr中,用隐藏的div存储
	lessontr = jQuery("input[value=" + lid + "]",document).parent().parent().parent();
	// console.log(lessons);

	lessontr.attr("lid",lid);
	var full_identifier = 1;
	for(x=0; x < lessons.length; x++){
		times = lessons[x].times;
		//console.log(time);
		for(y=0; y < times.length;y++)
		{
			time = times[y];
			if(time.full == 0)
				full_identifier = 0;
			attrtag = document.createElement("div");
			attrtag.setAttribute("class","attrtag");
			attrtag.setAttribute("day",time.day);
			attrtag.setAttribute("from",time.from);
			attrtag.setAttribute("to",time.to);
			attrtag.setAttribute("full",time.full);
			attrtag.setAttribute("hidden","true");
			attrtag.setAttribute("teacher_order",x);
			lessontr.slice(0,1).append(attrtag);
		}
	}

	//在列表上修改是否空的提示
	fullspan = lessontr.find(".fullspan")[0];
	// console.log(lessons);
	if(lessons.length == 0){
		fullspan.setAttribute("style","color:gray");
		fullspan.innerHTML = "无";
		return;
	}

	if(full_identifier == 1)
	{
		fullspan.setAttribute("style","color:gray");
		fullspan.innerHTML = "满";
	}
	else
	{
		fullspan.setAttribute("style","color:blue");
		fullspan.innerHTML = "未满";
	}
	if(jQuery("tr",tablelsn).length < 2 )
	{
		jQuery("#loadimg_"+lid,document).remove();
		return 0;
	}
	
	//lessontr.slice(0,1).children().slice(0,1).append(fullspan);

	
	
	
	lessontr.mouseover(function(){
		if(jQuery(this).attr("clicked") != "1"){
			jQuery(this).css("background-color","#CFC");
			draw_lesson(jQuery(this).attr("lid"),0);	
		}
	});
	
	lessontr.click(function(){
		jQuery(this).css("background-color","#FC9");
		if(jQuery(this).attr("clicked") == "1"){
			jQuery(this).attr("clicked","0");
			clearDraw_lid(jQuery(this).attr("lid"));
		}else{
			clearDraw_lid(jQuery(this).attr("lid"));
			draw_lesson(jQuery(this).attr("lid"),1);
			jQuery(this).attr("clicked","1");
		}
			
	});
	jQuery("input[value=" + lid + "]",document).parent().parent().parent().mouseout(function(){
		if(jQuery(this).attr("clicked") != "1"){
			jQuery(this).attr("style","");
			clearDraw_lid(jQuery(this).attr("lid"));
		}
			
	})
	return 0;
}




//获取元素的纵坐标
function getTop(e){
var offset=e.offsetTop;
if(e.offsetParent!=null) offset+=getTop(e.offsetParent);
return offset;
}
//获取元素的横坐标
function getLeft(e){
var offset=e.offsetLeft;
if(e.offsetParent!=null) offset+=getLeft(e.offsetParent);
return offset;
}

function draw_lesson(lid,clicked)
{
	lessontr = jQuery("tr[lid=" + lid + "]",document);
	lessons = jQuery("div[hidden=true]",lessontr);
	for(x=0; x < lessons.length; x++){
		lesson = lessons[x];
		day = lesson.getAttribute("day");
		from = lesson.getAttribute("from");
		to = lesson.getAttribute("to");
		full= lesson.getAttribute("full");
		teacher_order = Number(lesson.getAttribute("teacher_order")) + 1;
		draw(day,from,to,full,lid,clicked,teacher_order);
	}
	
	

}


function draw(weekday,hour_from,hour_to,isFull,lid,clicked,t_order)
{
	//动态处理表格宽度
	//document = parent.window.frames[2];
	document = document;

		//课表的处理

	//Summer session
	if(inUrl("/edu/student/elect/ShortSession.aspx")){
		//table_span = jQuery("#LessonTbl1_span1",document);
		table = jQuery(".alltab",document)[jQuery(".alltab",document).length - 2];
	}	
	else{
		table_span = jQuery("#LessonTbl1_spanContent,#lessonTbl_spanContent",document);
		table = jQuery(".alltab",table_span)[0];
	}
		
	
	
	tbody = table.children[0];
	tablex = getTop(table);
	tabley = getLeft(table);

	//trlist,0是表头,1~15是14节课
	trlist = tbody.children;

	//每行高度,0为表头
	cellheight = new Array();
	for(var n = 0;n < 15;n++){
		cellheight[n] = trlist[n].clientHeight;
	}

	//每格宽度,0为序号单元
	cellwidth = new Array();
	for(var n=0;n<8;n++)
	{
		cellwidth[n]=trlist[0].children[n].clientWidth+2;
	}
	//动态处理表格宽度 over
	

	posx=cellwidth[0];
	posy=0;
	
	weekday = Number(weekday);
	hour_from = Number(hour_from);
	hour_to = Number(hour_to);
	isFull = Number(isFull);
	clicked = Number(clicked);
	
	
	for(var n=1;n < weekday;n++)
		posx += cellwidth[n];
	for ( var n = 0; n < hour_from; n++) {
		posy += cellheight[n];
	}
	draw_height = 0;
	for ( var n = hour_from; n <= hour_to ; n++){
		draw_height += cellheight[n];
		
	}
	draw_width = cellwidth[weekday];
	
	if(t_order > 5)
	{
		draw_color = color[isFull][6 - 1];
	}
	else
	{
		draw_color = color[isFull][t_order - 1];
	}
	
	draw_obj = document.createElement("div");
	draw_id = "draw"+weekday+hour_from+hour_to+isFull;
	draw_obj.setAttribute("class","lsntable_draw");
	draw_obj.setAttribute("class",draw_id);
	draw_obj.setAttribute("lid",lid);
	draw_obj.setAttribute("clicked",clicked);
	draw_obj.innerHTML = lid + "_" + t_order;
	if(isFull == 0)
		draw_obj.innerHTML += "<br />未满";
	else
		draw_obj.innerHTML += "<br />满";
	
	jQuery("#LessonTbl1_spanContent,#lessonTbl_spanContent").append(draw_obj);
	//jQuery("#"+draw_id).css({"width":draw_width-border_width,"height":draw_height-border_width,"position":"absolute","top":posy+getTop(table),"left":posx+getLeft(table)+border_width,"border":border_width+"px solid "+draw_color})
	jQuery("."+draw_id,document).css({"width":draw_width - 3,"height":draw_height - 3 ,"position":"absolute","top":posy+getTop(table)+2,"left":posx+getLeft(table)+2,"background":draw_color,"font-size":"12px","opacity":"0.8","text-align":"center","border":"1px solid "+border_color[isFull]});

	
	
	
	
	
	/****************************************************
	 * 
	 * 
	 * 画小课表
	 * 
	 * 
	 * 
	 */

	//动态处理表格宽度
	document = document;
	smalltable_span = jQuery("#LessonTbl1_spanContent_small",document);
	//课表的处理
	table = jQuery(".alltab",smalltable_span)[0];

	
	tbody = table.children[0];
	tablex = getTop(table);
	tabley = getLeft(table);


	//trlist,0是表头,1~15是14节课
	trlist = tbody.children;

	//每行高度,0为表头
	cellheight = new Array();
	for(var n = 0;n < 15;n++){
		cellheight[n] = trlist[n].clientHeight;
	}

	//每格宽度,0为序号单元
	cellwidth = new Array();
	for(var n=0;n<8;n++)
	{
		cellwidth[n]=trlist[0].children[n].clientWidth+2;
	}
	//动态处理表格宽度 over
	

	posx=cellwidth[0];
	posy=0;
	
	weekday = Number(weekday);
	hour_from = Number(hour_from);
	hour_to = Number(hour_to);
	isFull = Number(isFull);
	clicked = Number(clicked);
	
	
	for(var n=1;n < weekday;n++)
		posx += cellwidth[n];
	for ( var n = 0; n < hour_from; n++) {
		posy += cellheight[n];
	}
	draw_height = 0;
	for ( var n = hour_from; n <= hour_to ; n++){
		draw_height += cellheight[n];
		
	}
	draw_width = cellwidth[weekday];
	if(t_order > 5)
	{
		draw_color = color[isFull][6 - 1];
	}
	else
	{
		draw_color = color[isFull][t_order - 1];
	}
	
	draw_obj = document.createElement("div");
	draw_id = "draw"+weekday+hour_from+hour_to+isFull;
	draw_obj.setAttribute("class","lsntable_draw");
	draw_obj.setAttribute("class",draw_id+"_small");
	draw_obj.setAttribute("lid",lid);
	draw_obj.setAttribute("clicked",clicked);
	draw_obj.innerHTML = lid + "_" + t_order;
	if(isFull == 0)
		draw_obj.innerHTML += "<br />未满";
	else
		draw_obj.innerHTML += "<br />满";
	tbody.appendChild(draw_obj);
	//这里与画大课表上的div不同，它已经有相对位置，因此只要加25的title高就ok
	jQuery("."+draw_id+"_small",document).css({"width":draw_width -3 ,"height":draw_height - 3,"position":"absolute","top":posy + 25 + 2,"left":posx + 2,"background":draw_color,"font-size":"12px","opacity":"0.8","text-align":"center","border":"1px solid "+border_color[isFull]});

}




function clearDraw_lid(lid)
{
	tables = jQuery("#LessonTbl1_spanContent,#LessonTbl_spanContent,#LessonTbl1_spanContent_small",document);
	jQuery("div[lid=" + lid + "]",tables).remove();

	//jQuery(".lsntable_draw").remove();
}

function clearDraw(clicked)
{
	tables = jQuery("#LessonTbl1_spanContent,#LessonTbl_spanContent,#LessonTbl1_spanContent_small",document);
	if(clicked == 0)
		jQuery("div[clicked=0]",tables).remove();
	else
		jQuery("div[clicked=1]",tables).remove();
	//jQuery(".lsntable_draw").remove();
}
function Trim(str,is_global) 
{ 
	var result; 
		result = str.replace(/(^\s+)|(\s+jQuery)/g,""); 
	if(is_global.toLowerCase()=="g") 
		result = result.replace(/\s/g,""); 
	return result; 
} 

function show_teacher_eval () {
	if(!inUrl("/edu/lesson/viewLessonArrange.aspx"))
		return;
	var lesson_tr = jQuery("#LessonTime1_gridMain").children().children().slice(1);
	for (var i = 0; i < lesson_tr.length; i++) {
			var name = lesson_tr.slice(i,i+1).children().slice(1,2).text();
			var app_str = name + " (";
			if (eval_list[name] == undefined) {
				app_str += "N/A)";
			}else{
				app_str += eval_list[name].slice(0,5) + ")";
			}
		lesson_tr.slice(i,i+1).children().slice(1,2).text(app_str);
	}

}


//通识课列表

GE_list = { '交响音乐鉴赏':1, '现代心理学':1, '民俗与中国文化':1, '中西方建筑文化':1, '精神分析与文学':1, '《论语》导读':1, '中国古典小说名著解读':1, '宋词经典赏析':1, '小说与人生':1, '红楼梦研究':1, '中国古典小说名著欣赏':1, '唐宋诗词鉴赏':1, '书法艺术':1, '篆刻艺术':1, '影视艺术理论及鉴赏':1, '动画导论':1, '与风景的对话——中外园林艺术欣赏':1, '德国社会史':1, '西方音乐文化史':1, '中国现代史重大问题研究':1, '通俗明史':1, '当代中国外交史':1, '影像与历史':1, '中西文化交流':1, '中国儒学史':1, '佛教与中国传统文化':1, '中西方医学哲学思想之比较':1, '美学':1, '西方哲学史':1, '欧洲文明史':1, '20世纪西方思想文化潮流':1, '士人与中国社会':1, '中国现代诗歌导读':1, '文字中国':1, '古典诗文名篇选读':1, '西方宗教文化概论':1, '外国人眼里的中国与百年来的中外交流':1, '韩国道德教育文化漫谈':1, '电影美学导论':1, '影视文化与艺术':1, '日本近现代史':1, '美国简史':1, '宇宙论的历史与哲学':1, '中国历史地理':1, '创新与创业':1, '创新与创业(2)':1, '艺术哲学':1, '中国美术史':1, '中医药与中华传统文化':1, '认知科学与语言':1, '清代文祸与文化':1, '中国传统经典的阅读与翻译':1, '唐诗讲读':1, '中国现代文学与文化':1, '中国古诗词':1, '古典诗文选读':1, '古典诗文选读':1, '中国的世界文化与自然遗产':1, '中国艺术史':1, '中国古代文学史':1, '当代西方人文艺术思潮':1, '文学与文化':1, '文学人类学':1, '英语写作':1, '美国电影文化专题':1, '海外华语电影鉴赏':1, '清史演义':1, '外国美术史':1, '晚期帝制中国：1279‐1911':1, '世界历史名人评传':1, '古罗马文明':1, '世界文明中的科学技术':1, '欧洲文明史概论':1, '日本现代史':1, '回忆录、口述史与二十世纪中国':1, '城市文明史':1, '欧洲中世纪城市研究':1, '科学技术史':1, '认识自己':1, '20世纪哲学':1, '国花、市花鉴赏':1, '非洲文明':1, '中国民俗':1, '中国文化通论':1, '现代中国传媒与知识分子':1, '全球化时代的英语学习与跨文化研究':1, '美学概论':1, '由李约瑟难题看中国传统科技文明':1, '建国以来重大历史问题研究':1, '伦理范畴的演绎及现代应用伦理的发展':1, '本科生精神境况研究':1, '欧美文化史':1, '表演艺术欣赏与批评':1, '英语视听说':1, '英语写作能力的自我培养与提高':1, '大学生传媒素养研究(B)':1, '影视艺术':1, '艺术设计':1, '交响音乐的内涵与外延发展研讨':1, '大学生传媒素养':1, '体育锻炼与生活方式':1, '国花、市花鉴赏':1, '现代西方哲学':1, '我和“大师”面对面——追寻科学大家的成功轨迹':1, '传播心理学':1, '中国现代史':1, '科学史上的竞争学说个案研讨':1, '如何思考和解答李约瑟难题':1, '交响音乐的内涵与外延发展研讨':1, '西方美术与创新思维':1, '管理基础':2, '项目管理':2, '中国医疗保险制度转型（B类）':2, '风险管理':2, '微观经济学（B类）':2, '金融学（A类）':2, '国际金融（A类）':2, '上海社会史专题':2, '网络传播学':2, '大国战略':2, '民族主义与族群政治':2, '西方福利国家研究':2, '现代城市发展论':2, '当代美国外交决策实例':2, '现代日本政治':2, '社会心理学':2, '孙子兵法':2, '微观经济学':2, '管理经济学（A类）':2, '消费者行为学':2, '技术经济学(B类)':2, '管理学':2, '宏观经济学（B类）':2, '工程经济学(F类)':2, '发展经济学专题':2, '一周财经评论':2, '经济学':2, '生态安全与生态文明':2, '证券投资学':2, '证券投资分析':2, '危机与公共关系':2, '发展的政治经济学分析':2, '国际关系理论导读':2, '美国现代城市规划':2, '当代中国的政治经济学':2, '战后政府角色的变更':2, '社会运动概论':2, '宗教与社会':2, '博弈论初基':2, '社会观察与探索':2, '政治社会学导论':2, '领导力学习与实践':2, '比较政治学导论':2, '日本社会与近代化':2, '社会学':2, '电子商务基础':2, '网络环境下的文科信息检索':2, '工程技术管理':2, '国学与领导力发展':2, '城市管理概论':2, '当代中国外交经典案例分析':2, '社会保障:理论基础与热点解读':2, '中俄关系：过去、现在与未来':2, '当代国际社会热点问题透视':2, '当代美国公共经济':2, '政府与市场':2, '中国政治思想史':2, '全球化的政治经济学':2, '国际安全':2, '国际关系学导论':2, '当代中国政治发展':2, '社会学与生活':2, '日本社会与现代化':2, '管理哲学':2, '遗传与社会':2, '性与健康':2, '市场营销学（A类）':2, '管理心理学（B类）':2, '市场调查与分析':2, '企业伦理学':2, '当代消费文化':2, '网络经济与管理':2, '环境经济与管理（B类）':2, '西方经济学（B类）':2, '英文经济指标与指数阅读':2, '证券投资分析(B类）':2, '新闻与传播概论':2, '大众传播与社会问题':2, 'WTO法律文件选读':2, '知识管理理论与实务':2, '中国管理智慧':2, '领导学':2, '领导学(A类）':2, '消费者行为学（A）':2, '管理理论与实践':2, '国际关系与全球化问题刍议':2, '台湾政治变化与两岸关系的前景(B)':2, '环境热点专题':2, '英美报刊时事评介':2, '高跟鞋踩碎小猫脑袋：多学科的法律分析':2, '知识产权的多维视角':2, '国际金融法':2, '多元化纠纷解决机制':2, '台湾政治变化与两岸关系的前景':2, '公共管理艺术探究':2, '国际传播与对外报道(研讨)':2, '政府治理危机与改革分析':2, '叶利钦、普京与俄罗斯':2, '中国崛起进程中的战争与战略问题':2, '医药创新在国民经济中的角色':2, '叶利钦、普京与俄罗斯(A)':2, '活动策划组织艺术':2, '现代农业与生态文明':2, '现代中日关系':2, '管理哲学研讨':2, '政府治理转型与公民社会成长':2, '经济学的思维方式':2, '不确定情况下的决策问题':2, '中国汽车制造业如何从大国走向强国':2, '社会精神医学':3, '科学前沿与哲学':3, '信息素养':3, '工程实践与科技创新2A':3, '工程实践与科技创新2B':3, '工程技术拓展':3, '宇宙科学导论':3, '旅游地理学':3, '传统医学与人类健康':3, '诺贝尔医学奖':3, '现代医学导论':3, '航空航天概论':3, '生命科学发展史':3, '生物信息学概论':3, '环境工程导论（A类）':3, '环境与健康':3, '企业信息化与知识工程':3, '系统建模方法与应用':3, '汽车文化':3, '地球科学':3, '中药学通论':3, '能源与可持续发展':3, '创新方法':3, '生物技术概论':3, '从脑到行为':3, '生物工程导论':3, '地球生命':3, '现代制造中的质量管理与统计方法':3, '自然界中的混沌与分岔':3, '可再生能源的高效转换与利用':3, '核能与环境':3, '先进核能系统':3, '人与室内环境':3, '奇妙的低温世界':3, '从细胞到分子':3, '植物生物技术——过去、现在和未来':3, '植物嫁接理论与技术':3, '原子核的内部结构':3, '功能氧化物材料制备及晶体生长科学':3, '探索复杂网络':3, '普适数字学习':3, '从环境监测谈科学研究':3, '生态问题与研究':3, '纳米世界的科学与艺术':3, '动物运动和生长中的力学奥秘':3, '生命科学热点':3, '生物信息学、计算生物学前沿研讨':3, '社会发展对生物工程的挑战':3, '体验化学的魅力':3, '能源化学工程':3, '电化学能量储存与转化':3, '研究者的乐趣和资质－以船、海工程为例':3, '镁合金及其成形技术':3, '21世纪工程人才的能力建设':3, '植物病害诊断技术':3, '材料科学的基本研究方法':3, '多彩的纳米世界':3, '走进纳米世界':3, '神经科学前沿问题及信息学方法':3, '遗传毒理与疾病':3, '生命的奥秘－生物信息学前沿研讨':3, '生物智能与生物计算机':3, '走近生命科学技术领域':3, '数学在水资源和环境科学研究中的价值':3, '光子学与信息技术':3, '核能发展与展望':3, '全球气候变暖与二氧化碳减排':3, '航空航天技术历史与展望':3, '服务计算研讨':3, '量子信息与移动通信':3, '竞技运动中的科学技术':3, '智能维护系统中的若干关键问题探讨':3, '光纤通信与全光网技术的发展':3, '在你身边的系统科学':3, '人工心脏辅助系统初探':3, '化学产品设计与实践':3, '绝对零度的奇迹：超流与超导':3, '智能材料、结构、系统与应用':3, '生物智能与生物信息学':3, '能源与环境':3, '神奇的催化剂—新能源开发和环境净化中的催化技术':3, '全球天然气发展与展望':3, '健康与植物':3, '吃出美丽和健康——食物营养与健康研讨':3, '低温科学和技术':3, '核能与环境(A)':3, '科学与自然中的研究思想和方法探讨':3, '体验介孔材料':3, '心血管力学生物学导论':3, '中枢神经系统高级功能研究的最新进展':3, '体验虚拟现实':3, '超导体及其应用':3, '基因追踪':3, '高等植物中的信号转导':3, '创新思维与现代设计':3, '宇宙、自然与人类':3, '系统生物学前沿研讨':3, '生物医学制造与人工器官':3, '新概念热学及其在过程优化中的应用':3, '从手工创意到数字模型：技术与实践':3, '未来工厂数字化运作管理系统':3, '工业与环境微生物技探讨':3, '药学、化学山海经':3, '探测微观世界的手段和方法':3, '农业有害生物防控的基因设计':3, '汽车文化与设计哲学':3, '元素揭秘':3, '人造器官与再生医学':3, '生命科学中的化学反应:分子生物信息学前沿研讨':3, '宇宙、自然与人类(A)':3, '医工交叉学科前沿系列讲座':3, '生命科学研究艺术':3, '遗传发育与精神神经疾病':3, '计算生物学与人体健康研究':3, '“酶”的进化历程与未来':3, '生物技术与我们的生活':3, '微生物海洋学与极端生命':3, '工业与环境微生物技术':3, '分子生物信息学前沿研讨':3, '功能氧化物材料制备及晶体生长科学(A)':3, '介孔材料':3, '元素揭秘':3, '组合优化入门':3, '基因与人':3, '21世纪企业制造模式‐精益生产':3, '汽车文化与设计哲学':3, '工程科学研究方法':3, '摇橹船的力学':3, '科学与自然中的研究思想与方法探讨':3, '超临界流体的奇妙世界':3, '多彩的纳米世界':3, '核燃料循环导论':3, '纳米科技与未来世界':3, '奇妙的低温世界（A）':3, '汽车安全的技术与法律基础':3, '汽车节能环保与清洁能源':3, '体验虚拟现实（A）':3, '生命科学中的计算化学：分子生物信息学前沿研讨':3, '微生物基因组学与抗菌素耐药性':3, '生命科学史':3, '学习记忆及神经精神疾病的神经生物学':3, '海洋科学':3, '纳米生物材料':3, '心血管疾病生物学':3, '随机性、复杂性初探':3, '新船型研究与探索':3, '交通运输工程前沿':3, '数学史(A类)':4, '符号动力系统与编码(A)':4, '模糊数学的应用':4, 'Mathematical Discovery':4, '代数学及其在信息科学中的应用':4, '数学赏析与唐诗格律':4, '关于无穷性的数学考察':4, '区间图，弦图以及其它':4, '二元域上的算术':4, '从区间谈起':4, '':0};

eval_list = {}

