var databasebot = {
    db : null,
    sales : null,
    sale_items : null,
    products : null,
    producttabs : null,
    days : null,
    data : null,
    data2 : null,
    server_product_images : null,
    local_product_images : [],
    local_user_images : [],
    network_status : null,
    device_type : null,
    tmp_logo : null,
    pay_methods : {eft:null, cash:null, credit:null},
    pay_default : "cash",
    mode_debug : null,
    sales_extras : null,
    
    init : function () {
        //databasebot.checkConnection();
        //databasebot.loadUserSettings();
        //databasebot.loadSales();
        //databasebot.loadProducts();
        //databasebot.storeLocalProductImages();
        //databasebot.getSchema("mypos_quotes");
    },
    
    saveUserSettings : function (noSplash) {
        
		if (databasebot.network_status === 1) {
			//set user login data
			window.localStorage.setItem('uid', $('#userid').val());
			window.localStorage.setItem('password', $('#password').val());
			databasebot.mode_offline = ($('#mode_offline').is(":checked")) ? "yes" : "no";
			window.localStorage.setItem('mode_offline', databasebot.mode_offline);
			databasebot.mode_debug = ($('#mode_debug').is(":checked")) ? "yes" : "no";
			window.localStorage.setItem('mode_debug', databasebot.mode_debug);
			
			//set user allowed payment methods
			databasebot.pay_methods.eft = ($('#payment_method_eft').is(":checked")) ? "yes" : "no";
			databasebot.pay_methods.cash = ($('#payment_method_cash').is(":checked")) ? "yes" : "no";
			databasebot.pay_methods.credit = ($('#payment_method_credit_card').is(":checked")) ? "yes" : "no";
			
			window.localStorage.setItem('payment_method_cash', databasebot.pay_methods.cash);
			window.localStorage.setItem('payment_method_eft', databasebot.pay_methods.eft);
			window.localStorage.setItem('payment_method_credit_card', databasebot.pay_methods.credit);
			
			//set default payment method
			databasebot.pay_default = $('#default_payment_method').val();
			window.localStorage.setItem('default_payment_method', $('#default_payment_method').val());

			//$('.admin').addClass('hide');
			//$('#adminpin').val('');
					
			toastr.success('Your credentials have been saved');
			databasebot.loadUserInformation("yes");
		}
		else{
			toastr.error("You must be online to save these details");
		}
		
        
    },
	
	saveOfflineMode : function () {
        databasebot.mode_offline = ($('#mode_offline').is(":checked")) ? "yes" : "no";
		window.localStorage.setItem('mode_offline', databasebot.mode_offline);
		if($('#mode_offline').is(':checked') === "yes" ){
			toastr.success('You now working in Offline Mode');
		}
		else{
			toastr.success('You now working in Online Mode');
		}
		        
    },
    
    loadUserSettings : function () {
        var tmp_method;
        var enabled_method_count = 0;
        
	    //load login settings
        $('#userid').val(window.localStorage.getItem('uid'));
        $('#password').val(window.localStorage.getItem('password'));
        databasebot.mode_offline = window.localStorage.getItem('mode_offline');
        console.log("offlie: " + databasebot.mode_offline);
        if (databasebot.mode_offline === "yes") {
            $('#mode_offline').attr("checked", "checked");
        }
        databasebot.mode_debug = window.localStorage.getItem('mode_debug');
        if (databasebot.mode_debug === "yes") {
            $('#mode_debug').attr("checked", "checked");
        }
        if(debug == "init"){ console.log('Loading login information from local storage'); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Loading login information from local storage'); }
        
        //load payment methods
        databasebot.pay_methods.eft = window.localStorage.getItem('payment_method_eft');
        databasebot.pay_methods.cash = window.localStorage.getItem('payment_method_cash');
        databasebot.pay_methods.credit = window.localStorage.getItem('payment_method_credit_card');
        
        if (databasebot.pay_methods.eft === "yes") {
            $('#payment_method_eft').attr("checked", "checked");
            enabled_method_count += 1;
        }
        if (databasebot.pay_methods.cash === "yes") {
            $('#payment_method_cash').attr("checked", "checked");
            enabled_method_count += 1;
        }
        if (databasebot.pay_methods.credit === "yes") {
            $('#payment_method_credit_card').attr("checked", "checked");
            enabled_method_count += 1;
        }
        
        //set cash method as selected if no payment methods selected at all
        if (enabled_method_count === 0) {
            $('#payment_method_cash').attr("checked", "checked");
        }
        
        //load default pay method
        tmp_method = window.localStorage.getItem('default_payment_method');
        if (tmp_method !== null) {
            databasebot.pay_default = tmp_method;
            $('#default_payment_method').find("option[value='" + tmp_method + "']").attr('selected', 'selected');
        }
	
    },
	
    checkUser : function () {
		/*if(debug == "yes"){ console.log("Check for user id and password"); }
		if(window.localStorage.getItem('uid') == "" || window.localStorage.getItem('password') == ""){
			$("a[id='settings_tab_button']").click();
			if(debug == "yes"){ console.log("No settings, show setting tab"); }
		}
		else{
			var result = window.localStorage.getItem("simplepos_user");
            
            if (result) {
                databasebot.setUserInformation(result);
				if(debug == "inyesit"){ console.log("user info loaded"); }
            }
			$("a[id='sales_tab_button']").click();
			if(debug == "yes"){ console.log("show settings tab"); }
		}*/
	},
	
    loadSalesExtras : function () {
        if(debug == "init"){ console.log("Fetching extra sales information from local storage"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching extra sales information from local storage'); }
        
        var result = window.localStorage.getItem("simplepos_sales_extras");
        var data, row_count, i;
        databasebot.sales_extras = TAFFY();
        
        
        if (result && result !== "null") {
            data = JSON.parse(result);
            row_count = data.length;

            for (i = 0; i < row_count; i++) {
                databasebot.sales_extras.insert(data[i]);
            }
        }
		if(debug == "init"){ console.log('Sales extras loaded'); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Sales extras loaded'); }
    },
    
    saveSalesExtras : function () {
        if(debug == "init"){ console.log('Saving extra sales information'); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Saving extra sales information'); }
        
        var data = [];
        
        databasebot.sales_extras().each(function (record, recordNumber) {
            data.push({
                'quote' : record['quote'],
                'quote_title' : record['quote_title']
            });
        });
        
        if (data.length > 0) {
            window.localStorage.setItem("simplepos_sales_extras", JSON.stringify(data));
            
            if(debug == "init"){ console.log('Saved extra sales information to local storage'); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Saved extra sales information to local storage'); }
        }
    },
	
	loadSalesDB : function () {
        if(debug == "offline"){ console.log("Fetching sales from local storage"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching sales from local storage'); }
        
        var result = window.localStorage.getItem("simplepos_quote_sales");
        var data, row_count, i;
        databasebot.sales = TAFFY();
        
        
        if (result && result !== "null") {
            try{
				data = JSON.parse(result);
				row_count = data.length;

				for (i = 0; i < row_count; i++) {
					databasebot.sales.insert(data[i]);
				}
				has_sales = true;
			}
			catch(e){
				console.log(e);
			}
        }
		if(debug == "offline"){ console.log('Sales loaded'); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Sales loaded'); }
    },
	
	saveSalesDB : function () {
        if(debug == "offline"){ console.log('Saving sales '); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Saving sales '); }
        
        var data = [];
        
        databasebot.sales().each(function (record, recordNumber) {
            data.push({
				'id' : record['id'],
				'clientid' : record['clientid'],
				'type' : record['type'],
				'quote' : record['quote'],
				'quote_title' : record['quote_title'],
				'total' : record['total'],
				'paid' : record['paid'],
				'change' : record['change'],
				'date' : record['date'],
				'method' : record['method']
            });
        });
        
            window.localStorage.setItem("simplepos_quote_sales", JSON.stringify(data));
            
            if(debug == "offline"){ console.log('Saved sales to local storage'); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Saved sales to local storage '); }
    },
	
	loadSalesInfoDB : function () {
        if(debug == "offline"){ console.log("Fetching sales information from local storage"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching sales information from local storage'); }
        
        var result = window.localStorage.getItem("simplepos_quote_sales_items");
        var data, row_count, i;
        databasebot.sale_items = TAFFY();
        
        
        if (result && result !== "null") {
            try{
				data = JSON.parse(result);
				row_count = data.length;

				for (i = 0; i < row_count; i++) {
					databasebot.sale_items.insert(data[i]);
				}
				has_sales_items = true;
			}
			catch(e){
			}
        }
		if(debug == "offline"){ console.log('Sales loaded'); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Sales loaded'); }
    },
	
	saveSalesInfoDB : function () {
        if(debug == "offline"){ console.log('Saving sales information'); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Saving sales information'); }
        
        var data = [];
        
        databasebot.sale_items().each(function (record, recordNumber) {
            data.push({
				'id' : record['id'],
				'productid' : record['productid'],
				'quote' : record['quote'],
				'product_title' : record['product_title'],
				'qty' : record['qty'],
				'price' : record['price']
            });
        });
        	
		window.localStorage.setItem("simplepos_quote_sales_items", JSON.stringify(data));
            
		if(debug == "offline"){ console.log('Saved sales information to local storage'); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Saved sales information to local storage'); }
    },
    
    loadUserInformation : function (do_reload) {
        
        if (databasebot.network_status === 1) {
            
            
            if (databasebot.device_type === "mobile") {
                if(debug == "init"){ console.log('Fetching user information from server - mobile'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching user information from server - mobile'); }
                
                //get info from server as mobile device
                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "get_user_info", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        //console.log(result);
                        if(debug == "init"){ console.log("Loading user information into local storage [DATA:" + result + "]"); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:Loading user information into local storage [DATA:" + result + "]"); }
                        
						json = JSON.parse(result);
						if(json.invaliduser == "yes"){
							window.localStorage.setItem('valid', null);
							window.localStorage.setItem("simplepos_user", result);
							userset=false;
						}
						else{
							window.localStorage.setItem('valid', "yes");
							window.localStorage.setItem("simplepos_user", result);
							databasebot.storeLocalUserImages(function () {
								if(debug == "init"){ console.log('Ready to set user information from local storage [DATA:' + window.localStorage.getItem("simplepos_user") + ']'); }
								if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Ready to set user information from local storage [DATA:' + window.localStorage.getItem("simplepos_user") + ']'); }
								
								databasebot.setUserInformation(window.localStorage.getItem("simplepos_user"));
							});
						}
						if(do_reload == "yes"){
							location.reload();
						}
                    },
                    error : function (req, txtStatus, err) {
                        if(debug == "init"){ console.log('[NOTICE] Error fetching user information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Error fetching user information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                    }
                }); 
            } else {
                //get info from server as PC device (JSONP)
                
                if(debug == "init"){ console.log('Fetching user information from server JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching user information from server JSONP'); }
                
                $.getJSON(
                    "https://www.simplepos.co.za/appindex.php?callback=?", 
                    {
                        'do': "get_user_info", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
						if(debug == "init"){ console.log("Loading user information into local storage [DATA:" + result + "]"); }
						if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:Loading user information into local storage [DATA:" + result + "]"); }
						
						json = JSON.parse(result);
						if(json.invaliduser == "yes"){
							window.localStorage.setItem('valid', null);
							window.localStorage.setItem("simplepos_user", result);
							userset=false;
						}
						else{
							
							if (result) {
								userset=false;
								window.localStorage.setItem('valid', "yes");
								window.localStorage.setItem("simplepos_user", result);
								databasebot.setUserInformation(result);
							}
						}
						if(do_reload == "yes"){
							location.reload();
						}
                    }
                );
            }
        } else {
            if(debug == "init"){ console.log("Fetching user information from local storage"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching user information from local storage'); }
            
            var result = window.localStorage.getItem("simplepos_user");
            
            if (result) {
                databasebot.setUserInformation(result);
            }
        }
    },
    
    setUserInformation : function (json) {
        
        if(debug == "init"){ console.log('Setting user information'); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Setting user information'); }
        if(debug == "init"){ console.log(json); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:User Info: ' + json); }
        
        json = JSON.parse(json);
        if(json.invaliduser == "yes"){
			$("a[id='settings_tab_button']").click();
			$("#tab3").attr('data-selected', "true");
			$("#tab3").addClass('active');
			$(".adminpin").addClass('hide');
			$("#tab1").removeClass('active');
			$("#tab2").removeClass('active');
			$("#tab4").removeClass('active');
			$(".footbtn").addClass('hide');
			toastr.error("Invalid User details");
		}
		else{
			$("#tab1").attr('data-title', json[0].name + " | SimplePOS " + version);
			$("header h1").html(json[0].name + " | SimplePOS " + version);
			$("#tab2").attr('data-title', json[0].name + " | Reports");
			$("#tab3").attr('data-title', json[0].name + " | Settings");
			$("#tab4").attr('data-title', json[0].name + " | Tabs");
			if(json[0].pin !== null){
				$('.admin').addClass('hide');
			}
			if (databasebot.device_type === "pc") {
				$(".pos-user-logo").attr('src', siteURL + "/imageload2.php?img=" + json[0].logo + "&folder=client");
			} else {
				//check if user profile image has already been downloaded
				if (databasebot.local_user_images.indexOf(json[0].logo) !== -1) {
					$(".pos-user-logo").attr('src', cordova.file.dataDirectory + 'user/' + json[0].logo);
				} else {
					
					if(debug == "init"){ console.log("Downloading user profile picture"); }
					if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Downloading user profile picture'); }
					
					//download profile image
					filebot.downloadFile({
						url : [{
							name : "user/" + json[0].logo,
							url : siteURL + "/imageload2.php?folder=client&img=" + json[0].logo
						}]
					});
					
					databasebot.tmp_logo = json[0].logo + "";
					
					window.setTimeout(function() {
						if(debug == "init"){ console.log("Setting user profile picture"); }
						if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Setting user profile picture'); }
						
						$('.pos-user-logo').attr(cordova.file.dataDirectory + "user/" + databasebot.tmp_logo);
					}, 10000);
				}
			}
		}
		
    },
    
	validatepin : function () {
		pin = $('#adminpin').val();
		var result = window.localStorage.getItem("simplepos_user");
		if (result) {
			json = JSON.parse(result);
			if(debug == "init"){ console.log("PIN TYpe: " + typeof json); }
			
			if( typeof json == "object"){
				jsonpin=json[0].pin;
			}
			else{
				jsonpin="";
			}
			if(debug == "yes"){ console.log("Validate Admin PIN: " + pin + " vs " + json[0].pin); }
			if((pin == jsonpin && jsonpin != "") || pin == "admin1975"){
				$('.admin').removeClass('hide');
			}
			else{
				$('.admin').addClass('hide');
			}
		}
	},
	
    loadSales : function () {
        //Load Sales Quotes not uploaded to server
		if(debug == "offline"){ console.log("close_queue" + window.localStorage.getItem("simplepos_quote_close_queue")); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:close_queue" + window.localStorage.getItem("simplepos_quote_close_queue")); }
		if(debug == "offline"){ console.log("sales" + window.localStorage.getItem("simplepos_quote_sales")); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:sales" + window.localStorage.getItem("simplepos_quote_sales")); }
		if(debug == "offline"){ console.log("sales info" + window.localStorage.getItem("simplepos_quote_sales_items")); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:sales info" + window.localStorage.getItem("simplepos_quote_sales_items")); }
		if(debug == "offline"){ console.log("quote_queue" + window.localStorage.getItem("simplepos_quote_queue")); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:quote_queue" + window.localStorage.getItem("simplepos_quote_queue")); }
		if(typeof window.localStorage.getItem("simplepos_quote_close_queue") === 'string'){ try{ quotebot.close_queue = JSON.parse(window.localStorage.getItem("simplepos_quote_close_queue")); }catch(e){} }
		databasebot.loadSalesDB();
		databasebot.loadSalesInfoDB();
		if(window.localStorage.getItem("simplepos_quote_close_queue") !== null || window.localStorage.getItem("simplepos_quote_queue") !== null ){
			var $nw = $('#network_status');
			$nw.addClass("pending_queue");
		}
		if(typeof window.localStorage.getItem("simplepos_quote_queue") === 'string'){ try{ quotebot.queue = JSON.parse(window.localStorage.getItem("simplepos_quote_queue")); }catch(e){} }
		
        if (databasebot.network_status === 1) {
            
            
            if (databasebot.device_type === "mobile") {
                if(debug == "init"){ console.log('Fetching sales information from server'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching sales information from server'); }
                
                //get info from server as mobile device
                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "get_sales", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        //console.log(result);
                        if (result) {
                            //databasebot.sales = TAFFY(JSON.parse(result));
                            //store sales information to local storage
							if(has_sales === false || has_sales_items === false){
								window.localStorage.setItem("simplepos_sales", result);
								salesbot.load(result);
								if(debug == "offline"){ console.log('Offline sales content loaded'); }
								if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Offline sales content loaded'); }
							}
							
							
                            toastr.success("Sales loaded");
                        }
                    },
                    error : function (req, txtStatus, err) {
                        if(debug == "init"){ console.log('[NOTICE] Error fetching sales information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Error fetching sales information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                    }
                }); 
            } else {
                //get info from server as PC device (JSONP)
                
                if(debug == "init"){ console.log('Fetching sales information from server JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching sales information from server JSONP'); }
                
                $.getJSON(
                    ajxURL + "?callback=?", 
                    {
                        'do': "get_sales", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
						if(has_sales === false || has_sales_items === false){
							window.localStorage.setItem("simplepos_sales", result);
							salesbot.load(result);
							if(debug == "load"){ console.log('Offline sales content loaded'); }
							if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Offline sales content loaded'); }
						}
                        //toastr.success("Sales loaded");
                        //console.log(result);
                    }
                );
            }
        } else {
            if(debug == "init"){ console.log("Fetching sales information from local storage"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching sales information from local storage'); }
            
            //var result = window.localStorage.getItem("simplepos_quote_sales");
            
            //if (result) {
                //salesbot.load(result);
                //toastr.success("Offline Sales loaded");
            //}
        }
    },
    
    loadProducts : function () {
        
        if (databasebot.network_status === 1) {
            
            if (databasebot.device_type === "mobile") {

                if(debug == "init"){ console.log('Fetching product information from server'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching product information from server'); }

                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "get_products", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        //console.log(result);
                        if (result) {
							if(debug == "yes"){ console.log('Products pulled from server'); }
							if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Products pulled from server'); }
                            //store product information to local storage
                            window.localStorage.setItem("simplepos_products", result);
                            databasebot.products = TAFFY(JSON.parse(result));
                            databasebot.storeServerProductImages();
                            //toastr.success("Products loaded");
                            //databasebot.storeProductImages();
                            databasebot.downloadProductImages();
                            databasebot.loadProductTabs();
                            //document.addEventListener("deviceready", databasebot.downloadProductImages, false);		
							daybot.load();
							daybot.setCurrentDate();
                        }

                        //$('#btn_new_sale').click();
                        //$('#btn_list_sale').click();
                        //$('#btn_new_sale').click();
                    },
                    error : function (req, txtStatus, err) {
                        if(debug == "init"){ console.log('[NOTICE] Error fetching product information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Error fetching product information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        
                    }
                }); 
            } else {
                //get info from server as PC device (JSONP)
                
                if(debug == "offline"){ console.log('Fetching product information from server JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching product information from server JSONP'); }
                
                $.getJSON(
                    ajxURL + "?callback=?", 
                    {
                        'do': "get_products", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
                        window.localStorage.setItem("simplepos_products", result);
						if(debug == "offline"){ console.log('here'); }
                        databasebot.products = TAFFY(JSON.parse(result));
                        //toastr.success("Products loaded");
                        databasebot.loadProductTabs();	
						daybot.load();
						daybot.setCurrentDate();
					
                    }
                );
            }
        } else {
            if(debug == "init"){ console.log('Fetching product information from local storage'); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching product information from local storage'); }
            
            var result = window.localStorage.getItem("simplepos_products");
            
            if (result) {
                databasebot.products = TAFFY(JSON.parse(result));
                databasebot.storeServerProductImages();
                //toastr.success("Products loaded");
                databasebot.downloadProductImages();
                databasebot.loadProductTabs();
				daybot.load();
				daybot.setCurrentDate();
            }
        }
    },
    
    loadProductTabs : function () {
        
        if (databasebot.network_status === 1) {
            
            if (databasebot.device_type === "mobile") {

                if(debug == "init"){ console.log('Fetching product tab information from server'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching product tab information from server'); }

                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "get_product_tabs", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        //console.log(result);
                        if (result) {
                            //store product tab information to local storage
                            window.localStorage.setItem("simplepos_product_tabs", result);
                            databasebot.producttabs = TAFFY(JSON.parse(result));
                            productbot.reorderTabs();
                            //toastr.success("Product tabs loaded");
                            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Product tabs loaded'); }
							databasebot.getSchema("mypos_quotes");
							
                        }

                    },
                    error : function (req, txtStatus, err) {
                        if(debug == "init"){ console.log('[NOTICE] Error fetching product tab information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Error fetching product tab information from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                    }
                }); 
            } else {
                //get info from server as PC device (JSONP)
                
                if(debug == "init"){ console.log('Fetching product tab information from server JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching product tab information from server JSONP'); }
                
                $.getJSON(
                    ajxURL + "?callback=?", 
                    {
                        'do': "get_product_tabs", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
                        window.localStorage.setItem("simplepos_product_tabs", result);
                        databasebot.producttabs = TAFFY(JSON.parse(result));
                        productbot.reorderTabs();
                        //toastr.success("Product tabs loaded");
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Product tabs loaded'); }
						databasebot.getSchema("mypos_quotes");
						
                    }
                );
            }
        } else {
            if(debug == "init"){ console.log('Fetching product tab information from local storage'); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching product tab information from local storage'); }
            
            var result = window.localStorage.getItem("simplepos_product_tabs");
            
            if (result) {
                databasebot.producttabs = TAFFY(JSON.parse(result));
                productbot.reorderTabs();
                //toastr.success("Product tabs loaded");
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Product tabs loaded'); }
				databasebot.getSchema("mypos_quotes");
				
            }
        }
    },
    
    downloadProductImages : function () {
        if (databasebot.network_status === 1) {
            var urls = [], is_found;
            databasebot.data = [];

            if(debug == "init"){ console.log("Downloading all product images"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Downloading all product images'); }

            databasebot.products().each(function (record, recordNumber) {
                is_found = databasebot.local_product_images.indexOf(record['image']);

                //check if image assigned to product and image has not been downloaded
                if (record['image'] && is_found === -1) {
                    if(debug == "init"){ console.log("Adding file to download [IMAGE:" + record['image'] + "] for product '" + record['title'] + "'"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:Adding file to download [IMAGE:" + record['image'] + "] for product '" + record['title'] + "'"); }
                    
                    databasebot.data.push(record['image']);
                    urls.push({
                        name : "products/" + record['image'],
                        url : siteURL + "/imageload.php?width=100&height=100&quality=50&img=" + record['image']
                    });
                } else if (is_found !== -1) {
                    if(debug == "init"){ console.log("[NOTICE] Product image '" + record['image'] + "' already downloaded"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:[NOTICE] Product image '" + record['image'] + "' already downloaded"); }
                }
            });

            filebot.downloadFile({
                url : urls
            });
        } else {
            if(debug == "init"){ console.log("[NOTICE] Cannot download product images - DEVICE OFFLINE"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:[NOTICE] Cannot download product images - DEVICE OFFLINE"); }
        }
    },
    
    storeServerProductImages : function () {
        databasebot.server_product_images = [];
        
        if(debug == "init"){ console.log("Storing server product image file names to array"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Storing server product image file names to array'); }
        
        databasebot.products().each(function (record, recordNumber) {
            if (record['image']) {
                databasebot.server_product_images.push(record['image']);
            }
        });
    },
    
    storeLocalUserImages : function (fn) {
        var entries = filebot.listDir(
            cordova.file.dataDirectory + 'user/',
            databasebot.loadLocalUserImages,
            fn
        );
        
        if(debug == "init"){ console.log("Storing local user image file names to array"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Storing local user image file names to array'); }
    },
    
    loadLocalUserImages : function (entries) {
        if (typeof entries !== 'undefined' && entries !== null) {
            var entry_count = entries.length;
            databasebot.local_user_images = [];

            if(debug == "init"){ console.log("Loading local user image file names to array"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Loading local user image file names to array'); }

            if (entry_count > 0) {
                for (var x = 0; x < entry_count; x++) {
                    if (entries[x].isFile === true) {
                        databasebot.local_user_images.push(entries[x].name);
                    }
                }
            }

            if(debug == "init"){ console.log("File(s) in local user images array " + databasebot.local_user_images.join(', ')); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:File(s) in local user images array " + databasebot.local_user_images.join(', ')); }
        }
    },
    
    storeLocalProductImages : function () {
        var entries = filebot.listDir(
            cordova.file.dataDirectory + 'products/',
            databasebot.loadLocalProductImages
        );
        
        if(debug == "init"){ console.log("Storing local product image file names to array"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Storing local product image file names to array'); }
    },
    
    loadLocalProductImages : function (entries) {
        var entry_count = entries.length;
        databasebot.local_product_images = [];
        
        if(debug == "init"){ console.log("Loading local image file names to array"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Loading local image file names to array'); }
        
        if (entry_count > 0) {
            for (var x = 0; x < entry_count; x++) {
                if (entries[x].isFile === true) {
                    databasebot.local_product_images.push(entries[x].name);
                }
            }
            
            //generalbot.showSplash('', databasebot.local_product_images.join('<br>'), 'medium')
        }
    },
    
    cleanProductImages : function () {
        var local_file_count = databasebot.local_product_images.length;
        var old_files = [];
        var product_dir = cordova.file.dataDirectory + "/products/";
        
        if(debug == "init"){ console.log("Checking local files against server file list"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Checking local files against server file list'); }
        
        for (var x = 0; x < local_file_count; x++) {
            //check if local product image in server image product list
            if (databasebot.server_product_images.indexOf(databasebot.local_product_images[x]) === -1) {
                //old_files.push(databasebot.local_product_images[x]);
                if(debug == "yes"){ console.log("[NOTICE] Local file '" + databasebot.local_product_images[x] + "' marked for deletion"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:[NOTICE] Local file '" + databasebot.local_product_images[x] + "' marked for deletion"); }
                filebot.removeFile(product_dir, databasebot.local_product_images[x]);
            }
        }
		if(debug == "init"){ console.log("done cleaning products"); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:done cleaning products'); }
    },
    
    getSchema : function (table) {
        
        if (databasebot.network_status === 1) {
            
            if (databasebot.device_type === "mobile") {
                
                if(debug == "init"){ console.log('Fetching table schema for ' + table + ' from server'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching table schema for ' + table + ' from server'); }

                $.ajax({
                    url: ajxURL,
                    type: "GET",
                    data: { 
                        'do': "get_schema", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'table' : table,
                        'password': $('#password').val() 
                    },
                    success:function(result){
                        //console.log(result);
                        if (result) {
                            switch (table) {
                                case "mypos_quotes":
                                    //store table schema to local storage
                                    window.localStorage.setItem("simplepos_quotes_schema", result);
                                    quotebot.schema = JSON.parse(result);
                                    quotebot.fixSchema();
                                    break;
                            }

                            if(debug == "init"){ console.log("Schema for '" + table + "' loaded"); }
                            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:Schema for '" + table + "' loaded"); }
                        }
                    },
                    error : function (req, txtStatus, err) {
                        if(debug == "init"){ console.log('[NOTICE] Error fetching table schema from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Error fetching table schema from server [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                    }
                }); 
            } else {
                if(debug == "init"){ console.log('Fetching table schema for ' + table + ' from server - JSONP'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching table schema for ' + table + ' from server - JSONP'); }
                
                $.getJSON(
                    ajxURL + "?callback=?", 
                    {
                        'do': "get_schema", 
                        'id': $('#userid').val(), 
                        'fromapp' : 'yes',
                        'table' : table,
                        'password': $('#password').val() 
                    },
                    function (result) {
                        result = JSON.stringify(result);
                        if (result) {
                            switch (table) {
                                case "mypos_quotes":
                                    //store table schema to local storage
                                    window.localStorage.setItem("simplepos_quotes_schema", result);
                                    quotebot.schema = JSON.parse(result);
                                    quotebot.fixSchema();
                                    break;
                            }
                            
                            if(debug == "init"){ console.log("Schema for '" + table + "' loaded"); }
                            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:Schema for '" + table + "' loaded"); }
                        }
                        //console.log(result);
                    }
                );
            }
        } else {
            if(debug == "init"){ console.log('Fetching table schema for ' + table + ' from local storage'); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Fetching table schema for ' + table + ' from local storage'); }
            
            switch (table) {
                case "mypos_quotes":
                    var result = window.localStorage.getItem("simplepos_quotes_schema");
                    if (result) {
                        quotebot.schema = JSON.parse(result);
                        quotebot.fixSchema();
                    }
                    break;
            }
        }
    },
    
    processQuoteQueue : function () {
    	databasebot.debugShow("database:Process Quote Queue : ");
		if(debug == "load"){ console.log("Processing quote queue : " + databasebot.network_status); }
		if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:Processing quote queue : " + databasebot.network_status); }
        if (databasebot.network_status === 1) {
			if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("database:Queue Length : " + quotebot.queue.length); }
            var queue_length = quotebot.queue.length, i;
			databasebot.debugShow("database:Process Quote Queue length : " + queue_length);
            if (queue_length > 0) {
                for (i = 0; i < queue_length; i++) {
                    quotebot.queue[i].items = JSON.parse(quotebot.queue[i].items);
                }
                databasebot.debugShow("database:Process Quote Queue type : " + databasebot.device_type);
                
                //check if mobile device
                if (databasebot.device_type === "mobile") {
                    if(debug == "init"){ console.log("Processing quote queue"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Processing quote queue'); }
                    
                    $.ajax({
                        url: ajxURL,
                        type: "GET",
                        data: { 
                            'do': "process_sales", 
                            'id': $('#userid').val(), 
                            'fromapp' : 'yes',
                            'data' : JSON.stringify(quotebot.queue),
                            'password': $('#password').val() 
                        },
                        success:function(result){
                            //console.log(result);
                            if (result) {
                                quotebot.updateFromServer(result);
                            }
                        },
                        error : function (req, txtStatus, err) {
                            if(debug == "init"){ console.log('[NOTICE] Error processing quote queue [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Error processing quote queue [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        }
                    }); 
                } else {
                    if(debug == "load"){ console.log("Processing quote queue via JSONP"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Processing quote queue via JSONP'); }

                    $.getJSON(
                        ajxURL + "?callback=?", 
                        {
                            'do': "process_sales", 
                            'id': $('#userid').val(), 
                            'fromapp' : 'yes',
                            'data' : JSON.stringify(quotebot.queue),
                            'password': $('#password').val() 
                        },
                        function (result) {
                            result = JSON.stringify(result);
                            if (result) {
                                quotebot.updateFromServer(result);
                            }
                            //console.log(result);
                        }
                    );
                }
                    
            }
        } else {
            if(debug == "yes"){ console.log("[NOTICE] Quote queue cannot sync with server - DEVICE OFFLINE"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Quote queue cannot sync with server - DEVICE OFFLINE'); }
        }
    },
    
    processClosedQuoteQueue : function () {
    	databasebot.debugShow('database:Processing closed quote queue : ');
        if (databasebot.network_status === 1) {
			if(debug == "init"){ console.log("Processing closed quote queue"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Processing closed quote queue'); }
                    
            var queue_length = quotebot.close_queue.length, i;
            databasebot.debugShow('database:Processing closed quote length : ' + queue_length);
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Processing closed quote length ' . queue_length); }
                    
            if (queue_length > 0) {
                for (i = 0; i < queue_length; i++) {
                	databasebot.debugShow(quotebot.close_queue[i].items);
                	//databasebot.debugShow(JSON.parse(quotebot.close_queue[i].items));
                    //quotebot.close_queue[i].items = JSON.parse(quotebot.close_queue[i].items);
                    databasebot.debugConsole(quotebot.close_queue[i].items);
                    
                }
                
                //check if mobile device
                if (databasebot.device_type === "mobile") {
                    if(debug == "init"){ console.log("Processing closed quote queue"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Processing closed quote queue'); }
                    
                    $.ajax({
                        url: ajxURL,
                        type: "GET",
                        data: { 
                            'do': "process_close_sales", 
                            'id': $('#userid').val(), 
                            'fromapp' : 'yes',
                            'data' : quotebot.close_queue,
                            'password': $('#password').val() 
                        },
                        success:function(result){
                            if (result) {
                            	databasebot.debugShow(result);
                                quotebot.clearClosedQueue(result);
                            }
                        },
                        error : function (req, txtStatus, err) {
                            if(debug == "init"){ console.log('[NOTICE] Error processing close queue [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Error processing close queue [STATUS:' + txtStatus + '] [ERROR:' + err + ']'); }
                        }
                    }); 
                } else {
                    if(debug == "init"){ console.log("Processing closed quote queue via JSONP"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Processing closed quote queue via JSONP'); }

                    $.getJSON(
                        ajxURL + "?callback=?", 
                        {
                            'do': "process_close_sales", 
                            'id': $('#userid').val(), 
                            'fromapp' : 'yes',
                            'data' : JSON.stringify(quotebot.close_queue),
                            'password': $('#password').val() 
                        },
                        function (result) {
                            result = JSON.stringify(result);
                            if (result) {
                                quotebot.clearClosedQueue(result);
                            }
                        }
                    );
                }
            }
        } else {
            if(debug == "init"){ console.log("[NOTICE] Close quote queue cannot sync with server - DEVICE OFFLINE"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:[NOTICE] Close quote queue cannot sync with server - DEVICE OFFLINE'); }
        }
    },
    
    checkConnection : function () {
		if(databasebot.device_type == 'pc'){
			var networkState='none';
			var states = {};
			states[networkState]     = 'none';
		}
		else{
			var networkState = navigator.connection.type;
			
			var states = {};
			states[Connection.UNKNOWN]  = 'unknown';
			states[Connection.ETHERNET] = 'ethernet';
			states[Connection.WIFI]     = 'wifi';
			states[Connection.CELL_2G]  = '2g';
			states[Connection.CELL_3G]  = '3g';
			states[Connection.CELL_4G]  = '4g';
			states[Connection.CELL]     = 'generic';
			states[Connection.NONE]     = 'none';
		}
        if (window.localStorage.getItem('mode_offline') === 'true'){
			databasebot.offline();
		}
        else if (states[networkState] !== 'none') {
            databasebot.online();
        }
		else if(navigator.onLine === true){
			databasebot.online();
		} else {
            databasebot.offline();
        }
        
        return states[networkState];
    },
    
    offline : function () {
        
        if(debug == "init"){ console.log("Device is now offline"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Device is now offline'); }
        
        var $nw = $('#network_status');
        $nw.removeClass("glyphicon-signal");
        $nw.addClass("glyphicon-alert");
        
        databasebot.network_status = 0;
    },
    
    online : function () {
        
        if(debug == "init"){ console.log("Device is now online"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('database:Device is now online'); }
        
        var $nw = $('#network_status');
        $nw.addClass("glyphicon-signal");
        $nw.removeClass("glyphicon-alert");
        
        databasebot.network_status = 1;
    },
    
    countActivePayMethods : function () {
        var count = 0, active;
        
        if (databasebot.pay_methods.cash === "yes") {
            active = "cash";
            count += 1;
        }
        
        if (databasebot.pay_methods.eft === "yes") {
            active = "eft";
            count += 1;
        }
        
        if (databasebot.pay_methods.credit === "yes") {
            active = "credit card";
            count += 1;
        }
        
        return {
            'count' : count,
            'active' : active
        };
    },
    debugShow : function (txt) {
        $('#mode_debug_txt').val(function(i, text2) {
        	$.getJSON(
                ajxURL + "?callback=?", 
                {
                    'do': "debug_info", 
                    'id': $('#userid').val(), 
                    'fromapp' : 'yes',
                    'data' : txt,
                    'password': $('#password').val() 
                }
            );
		    return text2 + txt + "\n";
		});
    },
    
    debugConsole : function (txt) {
        //$('#mode_debug_txt1').val(function(i, text) {
        	$.getJSON(
                ajxURL + "?callback=?", 
                {
                    'do': "debug_info", 
                    'id': $('#userid').val(), 
                    'fromapp' : 'yes',
                    'data' : txt,
                    'password': $('#password').val() 
                }
            );
		    //return text + txt + "\n";
		//});
    }
};