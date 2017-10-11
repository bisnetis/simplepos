var salesbot = {
    
    linkExtras : function () {
        if(debug == "yes"){ console.log("Linking extra sales information to sales table"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("sales:Linking extra sales information to sales table"); }
        
        var current_extras;
        
        databasebot.sales().each(function (record, recordNumber) {
            current_extras = databasebot.sales_extras({'quote' : Number(record["quote"])}).first();
            if (current_extras) {
                if(debug == "yes"){ console.log("Extra sales information found for quote " + record["quote"]); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("sales:Extra sales information found for quote " + record["quote"]); }
                
                databasebot.sales({'quote' : record["quote"]}).update({
                    'quote_title' : current_extras["quote_title"]
                });
            }
        });
    },
    
    load : function (data) {
        
        if(debug == "init"){ console.log("Splitting invoice sale items from product sale items"); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("sales:Splitting invoice sale items from product sale items"); }
        
        data = JSON.parse(data);
        var row_count = data.length, i;
        databasebot.sale_items = TAFFY();
        for (i = 0; i < row_count; i++) {
            if (data[i].items.length > 0) {
                databasebot.sale_items.insert(data[i].items);
                delete data[i].items;
                if(debug == "init"){ console.log('Adding product sale items to database'); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('sales:Adding product sale items to database'); }
            }
        }
        
        databasebot.sales = TAFFY(data);
        
        //link sales extra information
        salesbot.linkExtras();
        
        if(debug == "init"){ console.log('Sales loaded'); }
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("sales:Sales loaded"); }
    },
    
    list : function () {
        var $sales = $('#tab_view');
        var html;
        
        $sales.html('');
        $sales.append("<h4>Open Tabs:</h4>");
        databasebot.sales().each(function (record, recordNumber) {
            html = $('#invoice_item_template').html();
            
            html = html.replace('_QUOTE_', record["quote"]);
            html = html.replace('_QUOTETITLE_', (typeof record["quote_title"] !== 'undefined' && record["quote_title"]) ? record["quote_title"] : "No title set");
            html = html.replace('_QID_', record["quote"]);
            html = html.replace('_TOTAL_', record["total"]);
            html = html.replace('_PAID_', record["paid"]);
            html = html.replace('_METHOD_', record["method"]);
            html = html.replace('_CHANGE_', record["change"]);
            //$sales.append("<div class='form-group pos-sale-summary' onclick='quotebot.loadFromSale(" + record["quote"] + ");'><div class='container-fluid'><div class='row'><div class='col-xs-6'><label>Quote</label></div></div></div></div>");
            $sales.append(html);
        });
        
        productbot.list();
    },
    
    new : function () {
        productbot.list();
        $('#tab-details').html('');
        var $pos_screen = $('#pos_screen').clone();
        
        if (quotebot.current_quote_id === null) {
            quotebot.current_quote_id = Date.now();
        }
        
        $pos_screen.find(".fix-id").each(function () {
            $(this).attr('id', $(this).data('id'));
        });
        
        //console.log($pos_screen.html());
        $('#sales_view').html($pos_screen.html());
        //console.log($('#sales_view').html());
        
        quotebot.populateCurrentItems();
        
        //check if quote title set
        if (databasebot.sales !== null) {
            databasebot.sales().each(function (record, recordNumber) {
                if (Number(record['quote']) === quotebot.current_quote_id) {
                    if (typeof record['quote_title'] !== 'undefined' && record['quote_title'] != '') {
                        $('#quote_title').val(record['quote_title']);
                        $('#tab-details').html("<div class='bg-primary'>Tab: " + record['quote_title'] + " <button class='btn btn-success pull-right quickSave'>Save Tab</button><div style='clear: both;'></div></div>");
						$('.quickSave').click(function () {
							quotebot.quickSave();
						});
                    }
                }
            });
        }
        
        //select first products tab for convenience
        $('#product_group_tabs li:first').click();
        //salesbot.initSummaryAffix();
        //console.log('#product_group_tabs li:first click');
    },
    
    clear : function (force) {
        var confirm_clear;
        
        if (typeof force === 'undefined') {
            confirm_clear = window.confirm('Are you sure?');
        }
        
        if (typeof force !== 'undefined' || confirm_clear) {
            quotebot.current_items = [];
            quotebot.current_quote_id = Date.now();
            
            if(debug == "yes"){ console.log("Deleted current quote items"); }
            if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("sales:Deleted current quote items"); }
            
            salesbot.new();
        }
    },
    
    pay : function () {
        var $pay_screen = $('#pay_screen').clone(), paid, is_found = false, tmp, selected_method, pay_count_result;
        
        //$pay_screen.attr('id', 'pos_summary_screen');
        
        $pay_screen.find(".fix-id").each(function () {
            $(this).attr('id', $(this).data('id'));
        });
        //check which payment methods need to be hidden
        if (databasebot.pay_methods.cash == "no") {
            $pay_screen.find('.pay-method[data-value=cash]').parent().addClass('hide');
        }
        if (databasebot.pay_methods.eft == "no") {
            $pay_screen.find('.pay-method[data-value=eft]').parent().addClass('hide');
        }
        if (databasebot.pay_methods.credit == "no") {
            $pay_screen.find('.pay-method[data-value="credit card"]').parent().addClass('hide');
        }
        
        $('#large_modal_content').html($pay_screen.html());
        
        $('#pay_due').html($('#pos_pay_amount').html());
        
        $('#large_modal').modal({
            backdrop : false,
            show: true
        });
        //$('.modal-backdrop').remove();
        
        
        //bind pay and pay-close button functions
        $('#quote_save_only').click(function () {
            quotebot.save();
        });
        $('#quote_save_close').click(function () {
            quotebot.save(1);
        });
        
        //get main sales item information
        databasebot.sales().each(function (record, recordNumber) {
            if (Number(record['quote']) === quotebot.current_quote_id) {
                if(debug == "yes"){ console.log('salesbot.pay : Main sales item found DATA:' + JSON.stringify(record)); }
                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('sales:salesbot.pay : Main sales item found DATA:' + JSON.stringify(record)); }
                
                paid = record['paid'].toString();
                $('#pay_amount').val(paid.replace(',', '.'));
                $("button[data-value='" + record['method'] + "']").addClass('active');
                salesbot.calculateChange($('#pay_amount').val());
                is_found = true;
                selected_method = record['method'];
				if (typeof record['quote_title'] !== 'undefined' && record['quote_title'] != '') {
					$('#quote_title').val(record['quote_title']);

				}
            }
        });
        
        //check if main sales item found - perform specific tasks
        if (!is_found) {
            //set default pay method
            tmp = $("button[data-value='" + databasebot.pay_default + "']");
            //check if default pay method  
            if (!tmp.parent().hasClass('hide')) {
                tmp.addClass('active');
            }
        }
        
        //check if only one payment method allowed (hide all payment methods and set active payment method as 'active')
        pay_count_result = databasebot.countActivePayMethods();
        if (pay_count_result.count === 1) {
            tmp = $("button[data-value='" + pay_count_result.active + "']");
            tmp.parent().addClass('hide');
            tmp.parent().parent().find('.pay-method').removeClass('active');
            tmp.addClass('active');
        }
        
        //build quick pay screen
        salesbot.buildQuickPay($('#pos_pay_amount').html());
        
        //bind value change events
        $("#pay_amount").on("change paste keyup", function () {
            salesbot.calculateChange($(this).val());
        });
    },
    
    calculateChange : function (value) {
        var total = Number($('#pay_due').html());
        value = Number(value);
        value = value - total;
        var $pay_button = $('#pay_amount');
        var amt = Number($pay_button.val());
        $pay_button.val(amt.toFixed(2));
        $('#pay_change').html(value.toFixed(2));
    },
    
    setMethod : function ($context) {
        $('.pay-method').removeClass('active');
        
        $context.addClass('active');
    },
    
    buildQuickPay : function (total) {
        var notes = [0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50, 100, 200], x = 0, nearest_note = 200, button_count = 8, buttons = [], amt;
        total = Number(total);
        
        //get nearest note (start button)
        /*for (x; x < notes.length; x++) {
            if (total <= notes[x]) {
                nearest_note = notes[x];
                break;
            }
        }*/
        
        //build buttons
        buttons.push("<div class='col-xs-4'><button type='button' class='btn btn-default btn-block qp-btn' onclick='salesbot.setQuickPay($(this))' data-value='" + total + "'>" + total + "</button></div>");
        buttons.push("<div class='col-xs-4'><button type='button' class='btn btn-default btn-block qp-btn' onclick='return false;'></button></div>");
        buttons.push("<div class='col-xs-4'><button type='button' class='btn btn-default btn-block qp-btn' onclick='salesbot.clearQuickPay($(this))'>Clear</button></div>");
        /*for (x = 0; x < button_count; x++) {
            amt = (nearest_note + (x * 10));
            buttons.push("<div class='col-xs-4'><button type='button' class='btn btn-default btn-block qp-btn' onclick='salesbot.setQuickPay($(this))' data-value='" + amt + ".00'>" + amt + "</button></div>");
        }*/
        for (var i = 0, len = notes.length; i < len; i++) {
		  	amt = notes[i];
            buttons.push("<div class='col-xs-4'><button type='button' class='btn btn-default btn-block qp-btn' onclick='salesbot.addQuickPay($(this))' data-value='" + amt + "'>" + amt + "</button></div>");
		}
        
        //add buttons to container
        $("#quick_pay_container > div > div").html(buttons.join(''));
    },
    
    setQuickPay : function ($context) {
        var $pay_button = $('#pay_amount');
        $pay_button.val($context.data('value'));
        salesbot.calculateChange($pay_button.val());
    },
    addQuickPay : function ($context) {
        var $pay_button = $('#pay_amount');
        amt = ($pay_button.val() * 1) + ($context.data('value') * 1);
        $pay_button.val(amt);
        salesbot.calculateChange($pay_button.val());
    },
    
    clearQuickPay : function ($context) {
        var $pay_button = $('#pay_amount');
        $pay_button.val(0.00);
        salesbot.calculateChange($pay_button.val());
    },
    
    initSummaryAffix : function () {
        $('#pos_summary_table').affix({
            offset : {
                top : 100,
                bottom : function () {
                    //console.log($('footer').outerHeight(true));
                    return (this.bottom = $('footer').outerHeight(true));
                }
            }
        });
    }
};