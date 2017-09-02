var daybot = {
    current_day : null,
    current_date : null,
    closeQueue : [],
    
    setCurrentDate : function () {
        var d = new Date();
        var month = Number(d.getMonth());
        var day = Number(d.getDate());
        
        //fix month
        month += 1;
        if (month < 10) {
            month = "0" + month;
        }
        
        //fix day
        if (day < 10) {
            day = "0" + day;
        }
        
        daybot.current_date = d.getFullYear() + "-" + month + "-" + day;
        
        if(debug == "day"){ console.log("Current date set to " + daybot.current_date); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day:Current date set to " + daybot.current_date); }
    },
    
    getCurrentTime : function () {
        var d = new Date();
        var min = d.getMinutes();
        var hr = d.getHours();
        
        //fix hour
        if (hr < 10) {
            hr = "0" + hr;
        }
        
        //fix minute
        if (min < 10) {
            min = "0" + min;
        }
        
        return hr + ":" + min;
    },
    
    load : function () {
        
        if (databasebot.network_status === 1) {
            
            if (databasebot.device_type === "mobile") {

                if(debug == "day"){ console.log('Fetching day information from server'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Fetching day information from server'); }

                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "get_day", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        //console.log(result);
                        if (result.trim() != '' && result.trim() != '[]') {
                            //store day information to local storage
                            window.localStorage.setItem("simplepos_day", result);
                            databasebot.days = TAFFY(JSON.parse(result));
                            //toastr.success("Day(s) loaded");
                            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Day(s) loaded'); }
                        }
                        daybot.init();
                    },
                    error : function (req, txtStatus, err) {
                        if(debug == "day"){ console.log('[NOTICE] Error fetching day information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:[NOTICE] Error fetching day information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                    }
                }); 
            } else {
                //get info from server as PC device (JSONP)
                
                if(debug == "day"){ console.log('Fetching day information from server JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Fetching day information from server JSONP'); }
                
                $.getJSON(
                    ajxURL + "?callback=?", 
                    {
                        'do': "get_day", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
                        if(debug == "day"){ console.log("Callback for fetching day information from server JSONP [result:" + result + "] [typeof:" + typeof result + "]"); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day:Callback for fetching day information from server JSONP [result:" + result + "] [typeof:" + typeof result + "]"); }
                        //console.log(result);
                        if (typeof result !== 'undefined' && result.trim() != '' && result.trim() != '[]') {
                            window.localStorage.setItem("simplepos_day", result);
                            databasebot.days = TAFFY(JSON.parse(result));
                            //toastr.success("Day(s) loaded");
                            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Day(s) loaded'); }
                        }
                        daybot.init();
                    }
                );
            }
        } else {
            if(debug == "day"){ console.log('Fetching day information from local storage'); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Fetching day information from local storage'); }
            
            var result = window.localStorage.getItem("simplepos_day");
            if (result) {
                databasebot.days = TAFFY(JSON.parse(result));
                //toastr.success("Offline Day(s) loaded");
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Offline Day(s) loaded'); }
				daybot.init();
            }
        }
    },
    
    sync : function () {
        if (databasebot.network_status === 1 && daybot.current_day !== null) {
            if (typeof daybot.current_day.id === 'undefined') {
                
                if (databasebot.device_type === "mobile") {
                    if(debug == "day"){ console.log("Syncing day instance with server"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Syncing day instance with server'); }

                    $.ajax({
                        url: ajxURL,
                        type: "GET",
                        data: { 
                            'do': "process_day", 
                            'id': $('#userid').val(), 
                            'fromapp' : 'yes',
                            'data' : JSON.stringify(daybot.current_day),
                            'password': $('#password').val() 
                        },
                        success:function(result){
                            //console.log(result);
                            if (result) {
                                if(debug == "day"){ console.log("Day instance successfully synced with server"); }
                                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Day instance successfully synced with server'); }
                                daybot.updateFromServer(result);
                            }
                        },
                        error : function (req, txtStatus, err) {
                            if(debug == "day"){ console.log('[NOTICE] Error processing day instance [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:[NOTICE] Error processing day instance [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        }
                    }); 
                } else {
                    if(debug == "day"){ console.log('Syncing day instance with server JSONP - data: ' + JSON.stringify(daybot.current_day)); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Syncing day instance with server JSONP - data: ' + JSON.stringify(daybot.current_day)); }
                    
                    $.getJSON(
                        ajxURL + "?callback=?", 
                        {
                            'do': "process_day", 
                            'id': $('#userid').val(), 
                            'fromapp' : 'yes',
                            'data' : JSON.stringify(daybot.current_day),
                            'password': $('#password').val() 
                        },
                        function (result) {
                            result = JSON.stringify(result);
                            //console.log(result);
                            if (result.trim() != '' && result.trim() != '[]') {
                                if(debug == "day"){ console.log("Day instance successfully synced with server"); }
                                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Day instance successfully synced with server'); }
                                daybot.updateFromServer(result);
                            }
                        }
                    );
                }
            } else {
                if(debug == "day"){ console.log("Not necessary to sync day instance with server - sync has already been performed"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Not necessary to sync day instance with server - sync has already been performed'); }
            }
        } else {
			var result = window.localStorage.getItem("simplepos_day");
			daybot.updateFromServer(result);
            if(debug == "day"){ console.log("Cannot sync day instance with server - device is offline or current day instance not set"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Cannot sync day instance with server - device is offline or current day instance not set'); }
        }
    },
    
    updateFromServer : function (data) {
        if(debug == "day"){ console.log("Updating day instance data from server"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Updating day instance data from server'); }
        
        data = JSON.parse(data);
        
        daybot.current_day.id = data.id;
    },
    
    init : function () {
        if(debug == "day"){ console.log("Day instance initialisation"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day:Day instance initialisation"); }
        
        //check if day(s) loaded to databasebot table
        if (databasebot.days !== null) {
            var record = databasebot.days().first();
            
            if(debug == "day"){ console.log("Day instance received from server. Day instance information: " + JSON.stringify(record)); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day:Day instance received from server. Day instance information: " + JSON.stringify(record)); }
            
            daybot.current_day = {
                'id' : record.id,
                'balance_open' : record.balance_open,
                'balance_close' : record.balance_close,
                'date_start' : record.date_start,
                'date_close' : record.date_close,
                'time_start' : record.time_start,
                'time_close' : record.time_close
            };
        }
        
        //check if day instance started / exists
        if (daybot.current_day === null) {
            //$("#close_day_container").addClass('hide');
			$(".day-close").attr('disabled', 'disabled');
			$(".day-open").removeAttr('disabled');
			$("#start_day_container").addClass('bg-success');
			$("#close_day_container").removeClass('bg-success');
			$(".footbtn").addClass('hide');
			$('#day_opening_balance').val('');
        } else {
			$('#day_opening_balance').val(record.balance_open);
            //$("#start_day_container").addClass('hide');
			$(".day-open").attr('disabled', 'disabled');
			$(".day-close").removeAttr('disabled');
			$("#close_day_container").addClass('bg-success');
			$("#start_day_container").removeClass('bg-success');
			$("a[id='sales_tab_button']").click();
			$("#tab1").attr('data-selected', "true");
			$("#tab1").addClass('active');
			$("#tab2").attr('data-selected', "");
			$("#tab2").removeClass('active');
			//$tab_container.find("li").first().click();
        }
    },
    
    start : function () {
        var balance_open = $('#day_opening_balance').val();
        if(balance_open === 0 || balance_open > 0){
			if(debug == "day"){ console.log("Starting new 'Day' instance"); }
			if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day:Starting new 'Day' instance"); }
			
			daybot.current_day = {
				'date_start' : daybot.current_date,
				'time_start' : daybot.getCurrentTime(),
				'balance_open' : (balance_open === "") ? "0.00" : balance_open
			};
			
			$(".day-open").attr('disabled', 'disabled');
			$(".day-close").removeAttr('disabled');
			$("#close_day_container").addClass('bg-success');
			$("#start_day_container").removeClass('bg-success');
			$(".footbtn").removeClass('hide');
			$("a[id='sales_tab_button']").click();
			$("#tab1").attr('data-selected', "true");
			$("#tab1").addClass('active');
			$("#tab2").attr('data-selected', "");
			$("#tab2").removeClass('active');
			$tab_container.find("li").first().click();
        }
		else{
			toastr.warning("Please enter a valid amount!!!");
		}
        
    },
    
    close : function () {
        //check if any open sales exist
        if (quotebot.queue.length === 0 && databasebot.sales().first() === false) {

            var balance_close = $('#day_closing_balance').val();
			if(balance_close === 0 || balance_close > 0){
			if(debug == "day"){ console.log("Day Close value: " + balance_close); }
			if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day:Day Close value: " + balance_close); }

            if(debug == "day"){ console.log("Closing current 'Day' instance"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day:Closing current 'Day' instance"); }

            //update current date (current day might end after date started)
            daybot.setCurrentDate();

            //update current day variables for updating on server side
            daybot.current_day.balance_close = balance_close;
            daybot.current_day.date_close = daybot.current_date;
            daybot.current_day.time_close = daybot.getCurrentTime();

            //add day instance to close queue
            daybot.closeQueue.push({
                'id' : (typeof daybot.current_day.id !== 'undefined') ? daybot.current_day.id : "",
                'tmp_id' : Date.now(),
                'balance_open' : daybot.current_day.balance_open,
                'balance_close' : daybot.current_day.balance_close,
                'date_start' : daybot.current_day.date_start,
                'date_close' : daybot.current_day.date_close,
                'time_start' : daybot.current_day.time_start,
                'time_close' : daybot.current_day.time_close
            });

            //show/hide start/close day input fields
            $(".day-close").attr('disabled', 'disabled');
			$(".day-open").removeAttr('disabled');
			$("#start_day_container").addClass('bg-success');
			$("#close_day_container").removeClass('bg-success');
			$('#day_closing_balance').val('');
			$('#day_opening_balance').val('');

            

            //force sync
            daybot.sync();
            daybot.process();
			
			//reset current day variable
            //daybot.current_day = null;
			}
			else{
				toastr.warning("Please enter a valid amount!!!");
			}
        } else {
            generalbot.showSplash('Info', 'Please close all sales before ending the day', 'medium');
        }
    },
    
    process : function () {
        if (databasebot.network_status === 1 && daybot.closeQueue.length > 0) {
            
            if (databasebot.device_type === "mobile") {
                if(debug == "day"){ console.log("Processing day close queue"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Processing day close queue'); }
            
                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "process_days", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'data' : JSON.stringify(daybot.closeQueue),
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        //console.log(result);
                        if (result) {
                            daybot.updateFromProcessing(result);
                        }
                    },
                    error : function (req, txtStatus, err) {
                        if(debug == "day"){ console.log('[NOTICE] Error processing day close queue [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:[NOTICE] Error processing day close queue [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                    }
                }); 
            } else {
                if(debug == "day"){ console.log('Processing day close queue JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('day:Processing day close queue JSONP'); }

                $.getJSON(
                    ajxURL + "?callback=?", 
                    {
                        'do': "process_days", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'data' : JSON.stringify(daybot.closeQueue),
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
                        //console.log(result);
                        if (result.trim() != '' && result.trim() != '[]') {
                            daybot.updateFromProcessing(result);
                        }
                    }
                );
            }

        }
    },
    
    updateFromProcessing : function (data) {
        
        if(debug == "day"){ console.log("Updating day close queue from server - data received: " + data); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day:Updating day close queue from server - data received: " + data); }
        
        data = JSON.parse(data);
        var ids = data.ids.split(',');
        var queue_length = daybot.closeQueue.length;
        var splice_indexes = [], tmp_id;
        
        for (var x = 0; x < queue_length; x++) {
            tmp_id = String(daybot.closeQueue[x].tmp_id);
            
            if (ids.indexOf(tmp_id) !== -1) {
                splice_indexes.push(x + "");
            }
        }
        
        for (x = 0; x < splice_indexes.length; x++) {
            if(debug == "day"){ console.log("Removing day instance [ID:" + daybot.closeQueue[splice_indexes[x]].id + "] from day close queue"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("day: Removing day instance [ID:" + daybot.closeQueue[splice_indexes[x]].id + "] from day close queue"); }
            
            daybot.closeQueue.splice(splice_indexes[x], 1);
        }
    }
};