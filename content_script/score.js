var score_map = {
	"A+": 95,
	"A": 90,
	"A-": 85,
	"B+": 80,
	"B": 75,
	"B-": 70,
	"C+": 67,
	"C": 65,
	"C-": 62,
	"D": 60,
	"F": 0,
	"P": 85,
	"缓": "N/A",
};

var unit_column;
var score_column;
var gpa_column;
var tr_match;

function has_result_table() {
	var lblTitle = jQuery("span#lblTitle");
	if (lblTitle.text().length > 1)
		return true;
	else
		return false;
}


function optimize_score_query() {
	if (!inUrl("/edu/StudentScore/B_StudentScoreQuery.aspx") && !inUrl("/edu/StudentScore/StudentScoreQuery.aspx"))
		return 0;
	if (!has_result_table())
		return;
	jQuery("#Table4").find("tr").after(jQuery('<tr><td height="26"></td><td class="tdline1" align="left" style="font-size:12px;">选中课程GPA：<span id="avg_gpa" >0</span>分</td><td class="tdline1" align="left" style="font-size:12px;">选中课程平均分：<span id="avg_score" >0</span>分</td><td class="tdline1" align="left" style="font-size:12px;"><a id="select_all_lessons" href="#" all="0" style="margin-left:2em;">全选</a></td></tr>'));

	if (inUrl("/edu/StudentScore/B_StudentScoreQuery.aspx"))
		init_score_query();
	else
		init_gpa_query();
	//算学积分
	var score_tr_list = jQuery(tr_match);
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


function init_gpa_query() {
	jQuery("#dgScore").find("tr").each(function() {
		var score = getScoreInNumber(jQuery(this).find("td:nth-child(3)").html());
		var gpa = score2gpa(score);
		jQuery(this).append("<td>" + score + "</td>" + "<td>" + gpa + "</td>");
	});
	jQuery("table#dgScore").find("tr").slice(1).css("height", "25px");
	unit_column = 4;
	score_column = 6;
	gpa_column = 7;
	tr_match = "tr[style$=height\\:\\ 25px\\;]";
}

function init_score_query() {
	jQuery("#dgScore").find("tr").each(function() {
		var score = getScoreInNumber(jQuery(this).find("td:nth-child(4)").html());
		var gpa = score2gpa(score);
		jQuery(this).append("<td>" + score + "</td>" + "<td>" + gpa + "</td>");
	});
	unit_column = 2;
	score_column = 7;
	gpa_column = 8;
	tr_match = "tr[style$=height\\:25px\\;]";
}



function calculate_and_display() {
	//算选中的gpa
	score_and_gpa = calculate_avg();
	//显示出来
	jQuery("span#avg_score").text(score_and_gpa[0].toFixed(2));
	jQuery("span#avg_gpa").text(score_and_gpa[1].toFixed(2));
}

function calculate_avg() {
	//算选中的学积分
	var score_tr_list_valid = jQuery("tr[clicked=1]");
	var lsn_score = [];
	for (var x = 0; x < score_tr_list_valid.length; x++) {
		var tr = score_tr_list_valid.slice(x, x + 1);
		var unit = Number(tr.children().slice(unit_column, unit_column + 1).text());
		var score = Number(tr.children().slice(score_column, score_column + 1).text());
		var gpa = Number(tr.children().slice(gpa_column, gpa_column + 1).text());
		if (isNaN(score)) {
			unit = score = gpa = 0;
		}
		lsn_score.push({
			"unit": unit,
			"score": score,
			"gpa": gpa,
		});
	}
	var unit_sum = 0;
	var score_sum = 0;
	var gpa_sum = 0;
	var avg_score;
	var avg_gpa;
	for (var x = 0; x < lsn_score.length; x++) {
		unit_sum += lsn_score[x]["unit"];
		score_sum += lsn_score[x]["score"] * lsn_score[x]["unit"];
		gpa_sum += lsn_score[x]["gpa"] * lsn_score[x]["unit"];
	}
	if (unit_sum == 0)
		avg_score = avg_gpa = 0;
	else {
		avg_score = score_sum / unit_sum;
		avg_gpa = gpa_sum / unit_sum;
	}
	return [avg_score, avg_gpa];
}

function getScoreInNumber(score) {
	if (!isNaN(score)) {
		return parseInt(score);
	}
	if (score == "成绩" || score == "考试成绩")
		return "百分制成绩";
	var result = score_map[score];
	if (result != null)
		return result;
	return score;
}

function score2gpa(score) {
	// title of table
	if (score == "百分制成绩") {
		return "GPA";
	}

	if (score == "N/A") {
		return "N/A";
	}

	if (score >= 95) {
		return 4.3;
	} else if (score >= 90) {
		return 4.0;
	} else if (score >= 85) {
		return 3.7;
	} else if (score >= 80) {
		return 3.3;
	} else if (score >= 75) {
		return 3.0;
	} else if (score >= 70) {
		return 2.7;
	} else if (score >= 67) {
		return 2.3;
	} else if (score >= 65) {
		return 2.0;
	} else if (score >= 62) {
		return 1.7;
	} else if (score >= 60) {
		return 1.0;
	} else {
		return 0.00;
	}
	return "";
}
