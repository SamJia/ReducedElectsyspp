gpa_global = {
    "bixiu": 0,
    "xianxuan": 0,
    "tongshi": 0,
    "gexinghua": 0,
    "tiyu": 0,
    "liangke": 0,
    "units": 0,
    "grades": 0,
    "scores": 0
};

function optimize_myEductionList() {
    if (!inUrl("/edu/GradAudit/MyGradList"))
        return 0;
    gpa_global["units"] = 0;
    gpa_global["grades"] = 0;
    gpa_global["scores"] = 0;
    gpa_global["bixiu"] = gpa_colomn("#dgBX1", "#lbBxxf2", [6, 5, 7]); //必修
    gpa_global["tiyu"] = gpa_colomn("#dgPE", "#lbPE1", [6, 5, 7]); //体育
    gpa_global["liangke"] = gpa_colomn("#dgTH", "#lbTH1", [6, 5, 7]); //两课
    gpa_global["xianxuan"] = gpa_colomn("#dgXX2", "#lbXxxf1", [7, 6, 8]); //限选
    gpa_global["tongshi"] = gpa_colomn("#dgTsk2", "#lbTSK1", [7, 6, 9]); //通识
    gpa_global["gexinghua"] = gpa_colomn("#dgGxh2", "#lbGxxf1", [6, 5, 7]); //任选

    // 将统计结果显示在最上方的总表格中
    var p = "共修" + gpa_global["units"] + "学分, 平均分为" + (gpa_global["scores"] / gpa_global["units"]).toFixed(2) + "，平均GPA为" + (gpa_global["grades"] / gpa_global["units"]).toFixed(2);
    jQuery("#form1 > table > tbody > tr:nth-child(6)").after("<tr><td><fieldset style='width:900px'><legend>所有课程分数情况（由electsys++提供）</legend><table width='100%'><p>" + p + "</p></table></fieldset></td></tr>");
}

function gpa_colomn(table, title, colomn) {
    /**
        @table: 成绩表格的id
        @title: 标题
        @colomn: 代表“成绩”，“学分”，“备注”所在列
    */
    var gpa_all = 0;
    var unit_all = 0;
    var score_all = 0;
    jQuery(table).find("tr").each(function() {
        var score = getScoreInNumber(jQuery(this).find("td:nth-child(" + colomn[0] + ")").html());
        var unit = parseInt(jQuery(this).find("td:nth-child(" + colomn[1] + ")").html());
        var comment = jQuery(this).find("td:nth-child(" + colomn[2] + ")").html();
        var gpa = score2gpa(score);
        if (typeof(gpa) == "number" && comment != "无需关注" && comment != "尚未修读" && comment != "正在修读") {
            gpa_all += gpa * unit;
            unit_all += unit;
            score_all += score * unit;
            gpa_global["scores"] += score * unit;
            gpa_global["units"] += unit;
            gpa_global["grades"] += gpa * unit;
        }
        if (comment == "无需关注" || comment == "尚未修读" || comment == "正在修读") {
            gpa = comment;
        }
        jQuery(this).append("<td>" + gpa + "</td>");
    });
    var gpa_avg = gpa_all / unit_all;
    var score_avg = score_all / unit_all;
    jQuery(title).parent().append("本部分课程总GPA为：" + gpa_avg.toFixed(2) + "，平均分为：" + score_avg.toFixed(2));
}

function optimize_coreList() {
    if (!inUrl("/edu/student/CoreCourses.aspx"))
        return 0;
    jQuery("span#lbSS").after(jQuery('<tr><td height="26"></td><td class="tdline1" align="left" style="font-size:12px;">选中课程GPA：<span id="avg_gpa" >0.00</span>分，选中课程平均分：<span id="avg_score" >0.00</span>分<a id="select_all_lessons" href="#" all="0" style="margin-left:2em;">全选</a></td></tr>'));
    
    jQuery("table#dgSet").find("tr").each(function() {
        var score = getScoreInNumber(jQuery(this).find("td:nth-child(8)").html());
        var gpa = score2gpa(score);
        jQuery(this).append("<td>" + score + "</td>" + "<td>" + gpa + "</td>");
    });
    unit_column = 8;
    score_column = 9;
    gpa_column = 10;
    tr_match = "tr[style$=height\\:\\ 25px\\;]";

    jQuery("table#dgSet").find("tr").slice(1).attr("lecture", "1");
    jQuery("table#dgSet").find("tr").slice(1).css("background-color", "");
    //算学积分  
    var score_tr_list = jQuery("tr[lecture]");
    //改颜色
    score_tr_list.mouseover(function() {
        jQuery(this).css("background-color", "#CFC");
    });
    score_tr_list.mouseout(function() {
        if (jQuery(this).attr("clicked") == "1")
            jQuery(this).css("background-color", "#FC9");
        else
            jQuery(this).css("background-color", "");
    });

    jQuery("#select_all_lessons").click(function() {
        if (jQuery(this).attr("all") == 1) {
            jQuery(this).text("全选");
            jQuery(this).attr("all", "-1");
            score_tr_list.attr("clicked", "0");
            score_tr_list.css("background-color", "");
        } else {
            jQuery(this).text("全不选");
            jQuery(this).attr("all", "1");
            score_tr_list.attr("clicked", "1");
            score_tr_list.css("background-color", "#FC9");

        }
        calculate_and_display();
    });

    score_tr_list.click(function() {
        if (jQuery(this).attr("clicked") == "1") {
            jQuery("#select_all_lessons").text("全选");
            jQuery("#select_all_lessons").attr("all", "0")
            jQuery(this).css("background-color", "");
            jQuery(this).attr("clicked", "0");
        } else {
            jQuery(this).attr("clicked", "1");
            jQuery(this).css("background-color", "#FC9");
        }
        calculate_and_display();
    });
}