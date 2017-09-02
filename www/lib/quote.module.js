var quotebot = {
    schema : null,
    current_items : [],
    current_quote_id : null,
    payButton : '#pos_pay_amount',
    posTable : '#pos_table',
    table : null,
    queue : [],
    close_queue : [],
    lock : 0,
    
    fixSchema : function () {
        
        if(debug == "yes"){ console.log('Fixing quotes table schema (converting to array)'); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('quote:Fixing quotes table schema (converting to array)'); }
        
        var schema_length = quotebot.schema.length, i, data = [];
        
        for (i = 0; i < schema_length; i++) {
            data.push(quotebot.schema[i].Field);
        }
        
        quotebot.schema = data;
        
        if(debug == "yes"){ console.log("quotebot.schema elements = " + quotebot.schema.join(', ')); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:quotebot.schema elements = " + quotebot.schema.join(', ')); }
    },
    
    addItem : function ($context) {
        //check if day instance has been started
        if ($('#day_opening_balance').val() === null || $('#day_opening_balance').val() == '') {
            $('#reports_tab_button').click();
            return false;
        }
        
        var uid = Date.now();
        
        if (quotebot.current_items === null) {
            quotebot.current_items = [];
        }
        
        quotebot.current_items.push({
            'id' : uid,
            'quote_id' : quotebot.current_quote_id,
            'productid' : $context.data('code'),
            'title' : $context.data('title'),
            'qty' : 1,
            'price' : $context.data('price')
        });
        
        var $pos_table = $(quotebot.posTable);
        var $row = $("<div class='row' data-id='" + uid + "'>");
        
        $row.append("<div class='col-xs-7'>" + $context.data('title') + "</div>");
        //$row.append("<div class='col-xs-1'>1</div>");
        $row.append("<div class='col-xs-3'>" + $context.data('price') + "</div>");
        //$row.append("<div class='col-xs-1'>0</div>");
        //$row.append("<div class='col-xs-2'>" + $context.data('price') + "</div>");
        $row.append("<div class='col-xs-2'><button class='btn btn-danger btn-sm' onclick='quotebot.removeItem(" + uid + ");'><span class='glyphicon glyphicon-trash'></span></button></div>");
        $row.append("</div>");
        $pos_table.append($row);
        
        quotebot.calculateCurrentTotal();
        
        if(debug == "yes"){ console.log("Item " + $context.data('title') + " [product code:" + $context.data('code') + "] added to current quote [item instance ID: " + uid + "]"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Item " + $context.data('title') + " [product code:" + $context.data('code') + "] added to current quote [item instance ID: " + uid + "]"); }
    },
    
    populateCurrentItems : function () {
        var item_length = quotebot.current_items.length, i, total = 0;
        var $pos_table = $(quotebot.posTable), $row;
        
        if (item_length > 0) {
            for (i = 0; i < item_length; i++) {
                $row = $("<div class='row' data-id='" + quotebot.current_items[i].id + "'>");
                $row.append("<div class='col-xs-7'><h5>" + quotebot.current_items[i].title + "</h5></div>");
                //$row.append("<div class='col-xs-1'>1</div>");
                $row.append("<div class='col-xs-3'><h5>" + quotebot.current_items[i].price + "</h5></div>");
                //$row.append("<div class='col-xs-1'>0</div>");
                //$row.append("<div class='col-xs-2'>" + quotebot.current_items[i].price + "</div>");
                $row.append("<div class='col-xs-2'><button class='btn btn-danger btn-sm' onclick='quotebot.removeItem(" + quotebot.current_items[i].id + ");'><span class='glyphicon glyphicon-trash'></span></button></div>");
                
                $pos_table.append($row);
            }
            
            quotebot.calculateCurrentTotal();
        }
    },
    
    calculateCurrentTotal : function () {
        var item_length = quotebot.current_items.length, i, total = 0;
        
        if (item_length > 0) {
            for (i = 0; i < item_length; i++) {
                total += Number(quotebot.current_items[i].price);
            }
        }
        
        $(quotebot.payButton).html(total);
    },
    
    removeItem : function (id) {
        
        if(debug == "yes"){ console.log("Attempting to remove sales item [ID:" + id + "]"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Attempting to remove sales item [ID:" + id + "]"); }
        
        var item_length = quotebot.current_items.length, i, index = -1, qid;
        id = Number(id);
        
        if (item_length > 0) {
            for (i = 0; i < item_length; i++) {
                if (Number(quotebot.current_items[i].id) === id) {
                    qid = (typeof quotebot.current_items[i].quote_id !== 'undefined') ? quotebot.current_items[i].quote_id:quotebot.current_items[i].quote ;
                    if(debug == "yes"){ console.log("Found sales item [ID:" + id + "] [QUOTE:" + quotebot.current_items[i].quote_id + "]"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Found sales item [ID:" + id + "] [QUOTE:" + quotebot.current_items[i].quote_id + "]"); }
                    
                    index = i;
                    break;
                }
            }
            
            if (index !== -1) {
                quotebot.current_items.splice(index, 1);
                if(debug == "yes"){ console.log("Removed sales item [ID:" + id + "] from quotebot.current_items"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Removed sales item [ID:" + id + "] from quotebot.current_items"); }
                
                databasebot.sale_items({id : id}).remove();
                $("div[data-id=" + id + "]").slideUp('fast', function () {
                    $(this).remove();
                });
                quotebot.calculateCurrentTotal();
            }
        }
    },
    
    loadFromSale : function (quote_id) {
        
        //check if day instance has been started
        if (daybot.current_day === null) {
            $('#reports_tab_button').click();
            return false;
        }
        
        if(debug == "yes"){ console.log("Loading sale information from " + quote_id); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Loading sale information from " + quote_id); }
        
        var i = 0;
        quote_id = Number(quote_id);
        quotebot.current_items = [];
        quotebot.current_quote_id = quote_id;
        
        databasebot.sale_items().each(function (record, recordNumber) {
            if(debug == "yes"){ console.log("Inspecting quote item [id:" + record['id'] + "] [quote:" + record['quote'] + "]"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Inspecting quote item [id:" + record['id'] + "] [quote:" + record['quote'] + "]"); }
            
            if (Number(record['quote']) === quote_id) {
                quotebot.current_items.push({
                    'id' : record['id'],
                    'productid' : record['productid'],
                    'title' : record['product_title'],
                    'qty' : record['qty'],
                    'price' : record['price']
                });
            }
        });
        
        salesbot.new();

    },
    
	quickSave : function () {
		salesbot.pay();
		quotebot.save();
	},
	
    save : function (close) {
        /*if (quotebot.lock === 1) {
            console.log("Cannot save quote item - locked");
            return false;
        }
        
        quotebot.lock = 1;
        */
		var $nw = $('#network_status');
        $nw.addClass("pending_queue");
        if(debug == "yes"){ console.log("Saving current sales quote: " + quotebot.queue.length); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Saving current sales quote: " + quotebot.queue.length); }
        
        
        var total_paid = Number($('#pay_amount').val()); //total amount paid by customer
        var total = Number($('#pay_due').html()); //total amount on 'invoice'
        var change = total_paid - total; //total change owing to customer
        var method = $('.pay-method.active').data('value'); //payment method of customer
        var errors = []; //array to hold any errors that prevent sale from being saved
        var queue_length = quotebot.queue.length, i, index = -1, sales_row = {}, sales_date, sales_id;
        var close_queue_length = quotebot.close_queue.length;
        close = (typeof close !== 'undefined') ? "yes" : "no";
        quotebot.current_quote_id = Number(quotebot.current_quote_id);
        var quote_title = ($('#quote_title').length > 0) ? $('#quote_title').val() : "";
        var tmp_remove_count = 0;
        
        //validate quote information
        if (total_paid == "") {
            errors.push("Total paid cannot be blank");
        }
        
        if (total_paid < total) {
            errors.push("Total paid cannot be less than total due");
        }
        
        if (method === null || method === undefined) {
            errors.push("Please select a payment method");
        }
        
        if (errors.length > 0) {
            $('#pay_errors').html(errors.join('<br>'));
            if(debug == "yes"){ console.log("[NOTICE] Saving current sales quote FAILED - Errors : [" + errors.join('; ') + "]"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:[NOTICE] Saving current sales quote FAILED - Errors : [" + errors.join('; ') + "]"); }
            return false;
        } else {
           
            if (close === "yes") {
                //remove previous instance of close quote
                if (close_queue_length > 0) {
                    if(debug == "yes"){ console.log("Looking for previous instance of quote [ID:" + quotebot.current_quote_id + "] in close queue"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Looking for previous instance of quote [ID:" + quotebot.current_quote_id + "] in close queue"); }
                    
                    for (i = 0; i < close_queue_length; i++) {
                        if (quotebot.current_quote_id === Number(quotebot.close_queue[i].quote_id)) {
                            index = i;
                            break;
                        }
                    }

                    if (index !== -1) {
                        quotebot.close_queue.splice(index, 1);
                        if(debug == "yes"){ console.log("Previous instance of quote [ID:" + quotebot.current_quote_id + "] found and removed"); }
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Previous instance of quote [ID:" + quotebot.current_quote_id + "] found and removed"); }
                    }
                }
            }
            
            //remove previous instance of quote (run even if closing - user may have saved then saved to close at a later stage)
            if (queue_length > 0) {
                if(debug == "yes"){ console.log("Looking for previous instance of quote [ID:" + quotebot.current_quote_id + "] in queue"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Looking for previous instance of quote [ID:" + quotebot.current_quote_id + "] in queue"); }
                for (i = 0; i < queue_length; i++) {
                    if (quotebot.current_quote_id === Number(quotebot.queue[i].quote_id)) {
                        index = i;
                        break;
                    }
                }

                if (index !== -1) {
                    quotebot.queue.splice(index, 1);
                    if(debug == "yes"){ console.log("Previous instance of quote [ID:" + quotebot.current_quote_id + "] found and removed"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Previous instance of quote [ID:" + quotebot.current_quote_id + "] found and removed"); }
                }
            }
            
            //check which queue quote should go to
            if (close === "yes") {
                //push quote to close queue
                quotebot.close_queue.push({
                    'quote_id' : Number(quotebot.current_quote_id),
                    'quote_title' : ($('#quote_title').length > 0) ? $('#quote_title').val() : "",
                    'items' : JSON.stringify(quotebot.current_items),
                    'date' : Date.now(),
                    'clientid' : $('#userid').val(),
                    'total_paid' : total_paid,
                    'total_due' : total,
                    'change' : change,
                    'method' : method
                });
                window.localStorage.setItem("simplepos_quote_close_queue", JSON.stringify(quotebot.close_queue));
                //========= [ remove extra sales information from sales extra table START ] =========
                tmp_remove_count = databasebot.sales_extras({'quote' : quotebot.current_quote_id}).remove();
                if (tmp_remove_count > 0) {
                    if(debug == "yes"){ console.log("Extra information removed for quote [ID:" + quotebot.current_quote_id + "]"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Extra information removed for quote [ID:" + quotebot.current_quote_id + "]"); }
                }
                //========= [ remove extra sales information from sales extra table END ] =========
                
                databasebot.saveSalesExtras();
                if(debug == "yes"){ console.log("Quote [ID:" + quotebot.current_quote_id + "] added to close queue"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Quote [ID:" + quotebot.current_quote_id + "] added to close queue"); }
            } else {
                
                //push quote to queue
                quotebot.queue.push({
                    'quote_id' : Number(quotebot.current_quote_id),
                    'quote_title' : quote_title,
                    'items' : JSON.stringify(quotebot.current_items),
                    'date' : Date.now(),
                    'clientid' : $('#userid').val(),
                    'total_paid' : total_paid,
                    'total_due' : total,
                    'change' : change,
                    'method' : method
                });
                window.localStorage.setItem("simplepos_quote_queue", JSON.stringify(quotebot.queue));
                //========= [ push extra sales information to sales extra table START ] =========
                    //check if extra sales info already exists
                var current_sales_extra = databasebot.sales_extras({'quote' : quotebot.current_quote_id}).first();
                if (current_sales_extra) {
                    databasebot.sales_extras({'quote' : quotebot.current_quote_id}).update({
                        'quote_title' : quote_title
                    });
                    
                    if(debug == "yes"){ console.log("Extra information updated for quote [ID:" + quotebot.current_quote_id + "]"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Extra information updated for quote [ID:" + quotebot.current_quote_id + "]"); }
                    
                } else {
                    databasebot.sales_extras.insert({
                        'quote' : quotebot.current_quote_id,
                        'quote_title' : quote_title
                    });
                    
                    if(debug == "yes"){ console.log("Extra information inserted for quote [ID:" + quotebot.current_quote_id + "]"); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Extra information inserted for quote [ID:" + quotebot.current_quote_id + "]"); }
                    
                }
                
                databasebot.saveSalesExtras();
                
                //========= [ push extra sales information to sales extra table END ] =========
                
                if(debug == "yes"){ console.log("Quote [ID:" + quotebot.current_quote_id + "] added to queue"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Quote [ID:" + quotebot.current_quote_id + "] added to queue"); }
                
            }
            
            //add current quote sales items to sale items table
            for (i = 0; i < quotebot.current_items.length; i++) {
                //remove previous instance of sales item
                databasebot.sale_items({id : quotebot.current_items[i].id}).remove();
                
                if (close === "no") {
                    //add new instance of sales item
                    databasebot.sale_items.insert({
                        'id' : quotebot.current_items[i].id,
                        'productid' : quotebot.current_items[i].productid,
                        'quote' : quotebot.current_quote_id,
                        'product_title' : quotebot.current_items[i].title,
                        'qty' : quotebot.current_items[i].qty,
                        'price' : quotebot.current_items[i].price
                    });
					databasebot.saveSalesInfoDB();
                }
            }
            
            //add / replace sales item
            //sales_row = databasebot.sales({quote : quotebot.current_quote_id});
            databasebot.sales().each(function (record, recordNumber) {
				if(debug == "yes"){ console.log('[SALES TABLE: ' + Number(record["quote"]) + ' :: ' + quotebot.current_quote_id + '] [' + record["id"] + ' :: ' + record["date"] + ']'); }
				if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('quote:[SALES TABLE: ' + Number(record["quote"]) + ' :: ' + quotebot.current_quote_id + '] [' + record["id"] + ' :: ' + record["date"] + ']'); }
				
                if (Number(record["quote"]) === quotebot.current_quote_id) {
                    sales_row.id = record["id"];
                    sales_row.date = record["date"];
                    if(debug == "yes"){ console.log('Found current quote in sales table [QUOTE:' + quotebot.current_quote_id + ']'); }
                    if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('quote:Found current quote in sales table [QUOTE:' + quotebot.current_quote_id + ']'); }
                }
            });
            if(debug == "yes"){ console.log("[ID:" + sales_row.id + "]"); }
            if (typeof sales_row.id !== 'undefined' && sales_row.id !== null) {
                if(debug == "yes"){ console.log("Main sales item found [ID:" + sales_row.id + "]"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Main sales item found [ID:" + sales_row.id + "]"); }
            } else {
                if(debug == "yes"){ console.log("[NOTICE] Main sales item NOT found [QUOTE:" + quotebot.current_quote_id + "]"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:[NOTICE] Main sales item NOT found [QUOTE:" + quotebot.current_quote_id + "]"); }
            }
            sales_id = (typeof sales_row.id !== 'undefined' && sales_row.id !== null) ? Number(sales_row.id) : Date.now();
            sales_date = (typeof sales_row.date !== 'undefined' && sales_row.date !== null) ? String(sales_row.date) : Date.now();
            databasebot.sales({id : sales_id}).remove();
            databasebot.sales({id : String(sales_id)}).remove();
            databasebot.sales({quote : quotebot.current_quote_id}).remove();
            databasebot.sales({quote : String(quotebot.current_quote_id)}).remove();
            if (close === "no") {
				if(debug == "offline"){ console.log("Main sales item found [ID:" + sales_row.id + "]"); }
				if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Main sales item found [ID:" + sales_row.id + "]"); }
                databasebot.sales.insert({
                    'id' : sales_id,
                    'clientid' : $('#userid').val(),
                    'type' : 'Invoice',
                    'quote' : quotebot.current_quote_id,
                    'quote_title' : ($('#quote_title').length > 0) ? $('#quote_title').val() : "",
                    'total' : total,
                    'paid' : total_paid,
                    'change' : change,
                    'date' : sales_date,
                    'method' : method
                });
            }
			databasebot.saveSalesDB();
        }
        
        $('#pay_screen_close').click();
        $('#large_modal_content').html('');
        //quotebot.lock = 0;
        salesbot.clear(true);
		$('#tab-details').html("<div class='alert alert-success alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button><h4>Previous Sale</h4><br><b>Total Due:</b> R" + total + ", <b>Paid:</b> R" + total_paid + ", <b>Change:</b> R" + change + "</div>");
    },
    
    updateFromServer : function (data) {
        
        if(debug == "offline"){ console.log("Updating sales information from server"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Updating sales information from server"); }
        
        data = JSON.parse(data);
        var i, tmp_ids = [], tmp_ids2 = [], index, x, current_sales_extras;
        //var quote_id = Number(data.quote_id);
        
        for (x = 0; x < data.length; x++) {
            //update sales row ID
            databasebot.sales({quote : data[x].quote_id}).update({id : data[x].id});
            
            //update sale items row ID
            for (i = 0; i < data[x].items.length; i++) {
                databasebot.sale_items({id : data[x].items[i].temp_id}).update({id : data[x].items[i].id});
                tmp_ids.push(Number(data[x].items[i].temp_id));
                tmp_ids2.push(Number(data[x].items[i].id));
            }
            
            //update extra sales information row
            current_sales_extras = databasebot.sales_extras({'quote' : data[x].quote_id}).update({'quote' : data[x].id});
        }
        
        //update current items if necessary
        for (i = 0; i < quotebot.current_items.length; i++) {
            index = tmp_ids.indexOf(Number(quotebot.current_items[i].id));
            if (index !== -1) {
                quotebot.current_items[i].id = tmp_ids2[index];
                if(debug == "yes"){ console.log("[NOTICE] Updating current sale item ID from '" + tmp_ids[index] + "' to '" + tmp_ids2[index] + "'"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:[NOTICE] Updating current sale item ID from '" + tmp_ids[index] + "' to '" + tmp_ids2[index] + "'"); }
            }
        }
        //clear sales queue
        quotebot.queue = [];
		var $nw = $('#network_status');
        $nw.removeClass("pending_queue");
		var $nw = $('#network_status');
        $nw.removeClass("pending_queue");
        window.localStorage.setItem("simplepos_quote_close_queue", JSON.stringify(quotebot.close_queue));
        window.localStorage.setItem("simplepos_quote_queue", JSON.stringify(quotebot.queue));
		databasebot.saveSalesDB();
		databasebot.saveSalesInfoDB();
    },
    
    clearClosedQueue : function (data) {
        
        if(debug == "offline"){ console.log("Clearing sales items closed queue (updated data returned from server)"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Clearing sales items closed queue (updated data returned from server)"); }
        
        data = JSON.parse(data);
        var data_length = data.length;
        var closed_queue_length;
        var current_qid, index, i, x;
        
        //loop quote information returned by server
        for (i = 0; i < data_length; i++) {
            current_qid = Number(data[i].quote_id);
            closed_queue_length = quotebot.close_queue.length; //re-calculate array length in case splice happened on last iteration
            index = -1; //reset for next search
            
            //loop current closed queue items to find current quote item to be removed
            for (x = 0; x < closed_queue_length; x++) {
                if (current_qid === Number(quotebot.close_queue[x].quote_id)) {
                    index = x;
                }
            }
            
            //remove item from close queue if found
            if (index !== -1) {
                if(debug == "yes"){ console.log("Quote [QUOTE-ID:" + current_qid + "] found in closed quote queue and is being removed"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Quote [QUOTE-ID:" + current_qid + "] found in closed quote queue and is being removed"); }
                
                quotebot.close_queue.splice(index, 1);
            } else {
                if(debug == "yes"){ console.log("Quote [QUOTE-ID:" + current_qid + "] was NOT found in closed quote queue"); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("quote:Quote [QUOTE-ID:" + current_qid + "] was NOT found in closed quote queue"); }
            }
        }
		var $nw = $('#network_status');
        $nw.removeClass("pending_queue");
        window.localStorage.setItem("simplepos_quote_close_queue", JSON.stringify(quotebot.close_queue));
        window.localStorage.setItem("simplepos_quote_queue", JSON.stringify(quotebot.queue));
		databasebot.saveSalesDB();
		databasebot.saveSalesInfoDB();
    }
};