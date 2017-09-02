var reportbot = {
    loadDaily : function () {
        if (databasebot.network_status === 1) {
            if (databasebot.device_type === "mobile") {
                if(debug == "report"){ console.log('Fetching daily report information from server'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("report:Fetching daily report information from server"); }
                
                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "get_daily_report", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        if(debug == "report"){ console.log(result); }
                        if (result) {
                            reportbot.showDaily(result);
                        }
                    },
                    error : function (req, txtStatus, err) {
                        if(debug == "report"){ console.log('[NOTICE] Error fetching daily report information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('report:[NOTICE] Error fetching daily report information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                    }
                }); 
            } else {
                if(debug == "report"){ console.log('Fetching daily report information from server JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('report:Fetching daily report information from server JSONP'); }
                
                $.getJSON(
                    ajxURL + "?callback=?", 
                    {
                        'do': "get_daily_report", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
                        if(debug == "report"){ console.log("Callback for fetching day information from server JSONP [result:" + result + "] [typeof:" + typeof result + "]"); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("report:Callback for fetching day information from server JSONP [result:" + result + "] [typeof:" + typeof result + "]"); }
                        
                        if (result.trim() != '' && result.trim() != '[]') {
                            reportbot.showDaily(result);
                        }
                    }
                );
            }
        }
		else{
			toastr.warning("Report not available offline");
		}
    },
	
	loadSummary : function () {
		var report_summary = "<h5>Loading ...</h5>";
        if (databasebot.network_status === 1) {
            if (databasebot.device_type === "mobile") {
                if(debug == "report"){ console.log('Fetching daily summary report information from server'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('report:Fetching daily summary report information from server'); }
                
                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "get_daily_summary_report", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        if(debug == "report"){ console.log("summary: " + result); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("report:summary: " + result); }
                        if (result) {
                            reportbot.showSummary(result);
                        }
                    },
                    error : function (req, txtStatus, err) {
						if(debug == "report"){ console.log('[NOTICE] Error fetching daily summary report information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
						if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('report:[NOTICE] Error fetching daily summary report information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                    }
                }); 
            } else {
                if(debug == "report"){ console.log('Fetching daily report summary information from server JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('report:Fetching daily report summary information from server JSONP'); }
                
                $.getJSON(
                    ajxURL + "?callback=?", 
                    {
                        'do': "get_daily_summary_report", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
                        if(debug == "report"){ console.log("Callback for fetching day summary information from server JSONP [result:" + result + "] [typeof:" + typeof result + "]"); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("report:Callback for fetching day summary information from server JSONP [result:" + result + "] [typeof:" + typeof result + "]"); }
                        if (result.trim() != '' && result.trim() != '[]') {
                            reportbot.showSummary(result);
                        }
                    }
                );
            }
        }
		else{
			report_summary = "<h5>Summary not available offline</h5>";
		}
		$('.summary_report').html(report_summary);
    },
    
	showSummary : function (data) {
        var $report = $('.summary_report');
        var html;
        data = JSON.parse(data);
		rows=data.rows;
		if(debug == "report"){ console.log("SummaryData: " + JSON.stringify(rows)); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("report:SummaryData: " + JSON.stringify(rows)); }
		
        $report.html('');
        $report.append("<h4>Sales Summary:</h4>");
        $.each(rows, function (key, val) {
            html = $('#report_summary_template').html();
            
            html = html.replace('_TITLE_', val['title']);
            html = html.replace('_QTY_', val['qty']);
            html = html.replace('_TOTAL_', "R " + val['total'].toFixed(2));
            
            $report.append(html);
        });
		total=data.totals.toFixed(2);
		html = "<div class='row'><div class='col-xs-10 text-right'><b>Total Sales</b></div><div class='col-xs-2'><b>R " + total + "</b></div></div>";
		$report.append(html);
    },
	
    showDaily : function (data) {
        var $container = $("#day_report_template").html(), total = 0;
        data = JSON.parse(data);
		
        if(debug == "report"){ console.log("ReportData: " + JSON.stringify(daybot)); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("report:ReportData: " + JSON.stringify(daybot)); }
        
        //replace date identifier
		var report_title = daybot.current_day.date_start + " (" + daybot.current_day.time_start + ") - ";
		if(daybot.current_day.date_close !== null){
			report_title = report_title + daybot.current_day.date_close + " (" + daybot.current_day.time_close + ")";
		}
		else{
			report_title = report_title + "Current";
		}
        $container = $container.replace('_DATE_', daybot.current_date);
        
        //replace opening and closing day balances
        $container = $container.replace('_OPENINGBALANCE_', data.day.balance_open);
        $container = $container.replace('_CLOSINGBALANCE_', data.day.balance_close);
        
        //replace 'total' identifiers with information from server
        if (typeof data.totals['cash'] !== 'undefined') {
            $container = $container.replace('_CASHTOTAL_', data.totals['cash']);
            total += Number(data.totals['cash']);
        } else {
            $container = $container.replace('_CASHHIDE_', "hide");
        }
        if (typeof data.totals['eft'] !== 'undefined') {
            $container = $container.replace('_EFTTOTAL_', data.totals['eft']);
            total += Number(data.totals['eft']);
        } else {
            $container = $container.replace('_EFTHIDE_', "hide");
        }
        if (typeof data.totals['credit card'] !== 'undefined') {
            $container = $container.replace('_CREDITCARDTOTAL_', data.totals['credit card']);
            total += Number(data.totals['credit card']);
        } else {
            $container = $container.replace('_CREDITHIDE_', "hide");
        }
        
        //add opening balance to total
        total += Number(data.day.balance_open);
        
        //replace final total identifier
        $container = $container.replace('_TOTAL_', total);
        
		reportbot.loadSummary();
		
        $("#report_display").html($container);
    }
};