var productbot = {
    tabs : null,
    tabsContainer : 'div[data-id=product_tab_container]',
    productsContainer : 'div[data-id=products_container]',
    
    list : function () {
        var $products = $(productbot.productsContainer);
        
        $products.html('');
        
        productbot.buildTabs();
    },
    
    reorderTabs : function () {
        var $tab_container = $(productbot.tabsContainer);
        
        $tab_container.html('');
        
        $tab_container.append("<ul class='nav nav-tabs' id='product_group_tabs' role='tablist'></ul>");
        
        //add featured products tab if any featured products exist
        featured_products = productbot.getFeaturedProducts();
        if (featured_products.length > 0) {
            $tab_container.children('ul').append("<li role='presentation' onclick='productbot.listByTab($(this));' data-value='Featured'><a>FEATURED</a></li>");
        }
        
        databasebot.producttabs().each(function (record, recordNumber) {
            $tab_container.children('ul').append("<li role='presentation' onclick='productbot.listByTab($(this));' data-value='" + record["title"] + "'><a>" + record["title"] + "</a></li>");
        });
        
        $tab_container.find("li").first().click();
    },
    
    buildTabs : function () {
        productbot.tabs = [];
        var $tab_container = $(productbot.tabsContainer);
        var featured_products;
        
        $tab_container.html('');
        
        //$tab_container.append("<div class='list-group'></div>");
        $tab_container.append("<ul class='nav nav-tabs' id='product_group_tabs' role='tablist'></ul>");
        
        //add featured products tab if any featured products exist
        featured_products = productbot.getFeaturedProducts();
        if (featured_products.length > 0) {
            $tab_container.children('ul').append("<li role='presentation' onclick='productbot.listByTab($(this));' data-value='Featured'><a>FEATURED</a></li>");
        }
        
        databasebot.products().each(function (record, recordNumber) {
            if (productbot.tabs.indexOf(record["prod_group"]) === -1) {
                productbot.tabs.push(String(record["prod_group"]));
                //$tab_container.children('div').append("<a class='list-group-item' onclick='productbot.listByTab($(this));'>" + record["prod_group"] + "</a>");
                $tab_container.children('ul').append("<li role='presentation' onclick='productbot.listByTab($(this));' data-value='" + record["prod_group"] + "'><a>" + record["prod_group"] + "</a></li>");
                //console.log(JSON.stringify(record));
            }
        });
        
        if (databasebot.producttabs !== null) {
            productbot.reorderTabs();
        }
    },
    
    listByTab : function ($context) {
        var $products = $(productbot.productsContainer);
        var tab = $context.data('value');
        var dir = "";
        var max_height = 0;
        var current_height = 0;
        
        if (databasebot.device_type === "mobile") {
            dir = cordova.file.dataDirectory + "products/";
        } else {
            dir = siteURL + "/imageload.php?width=100&height=100&quality=50&img=";
        }
        
        $products.html('');
        
        if (tab === "Featured") {
            var featured_products = productbot.getFeaturedProducts();
            
            for (var x = 0; x < featured_products.length; x++) {
                $products.append("<div class='col-xs-6 col-sm-4 col-md-2 quote-list-item'><div class='thumbnail' onclick='quotebot.addItem($(this));' data-code='" + featured_products[x]['code'] + "' data-title='" + featured_products[x]["title"] + "' data-price='" + featured_products[x]["price"] + "'><img src='" + dir + featured_products[x]['image'] + "'>" + featured_products[x]["title"].substring(0, 25) + "</div></div>");
            }
        } else {
            databasebot.products().each(function (record, recordNumber) {
                if (tab === record["prod_group"]) {
                    $products.append("<div class='col-xs-6 col-sm-4 col-md-2 quote-list-item'><div class='thumbnail' onclick='quotebot.addItem($(this));' data-code='" + record['code'] + "' data-title='" + record["title"] + "' data-price='" + record["price"] + "'><img src='" + dir + record['image'] + "'>" + record["title"].substring(0, 25) + "</div></div>");
                }
            });
        }
        
        //fix card heights
        $('.quote-list-item').each(function () {
            current_height = $(this).height();
            
            if (current_height > max_height) {
                max_height = current_height;
            }
        });
        $('.quote-list-item').height(max_height);
        
        $context.parent().find('a').removeClass('active');
        $context.children('a').addClass('active');
    },
    
    getFeaturedProducts : function () {
        var products = [];

        databasebot.products().each(function (record, recordNumber) {
            if (Number(record['is_featured']) === 1) {
                products.push({
                    'id' : record['id'],
                    'title' : record['title'],
                    'image' : record['image'],
                    'price' : record['price'],
                    'code' : record['code'],
                    'prod_group' : record['prod_group']
                });
            }
        });
        
        return products;
    }
};