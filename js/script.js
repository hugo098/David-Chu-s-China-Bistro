$(function() {
    $("#navbarToggle").blur(function(event) {
        var screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            $("#navbarNav").collapse('hide');
        }
    });
});
(function(global) {
    var dc = {};
    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl = "http://davids-restaurant.herokuapp.com/categories.json";
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var menuItemsUrl = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-item.html";
    var arrayMenu =[
    	"A","B","SP","C","F","V","DK","VG","CU","NL","NF","PF","FR","CM","FY","SO","DS","D","SR",
    ]
    var insertHtml = function(selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };
    var showLoading = function(selector) {
        var html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHtml(selector, html);
    };
    var insertProperty = function(string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    }
    document.addEventListener("DOMContentLoaded", function(event) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(homeHtml, function(responseText) {
            document.querySelector("#main-content").innerHTML = responseText;
        }, false);
    });
    dc.loadMenuCategories = function() {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML, true);
    };
    dc.loadMenuItems = function(categoryShort) {
        showLoading("#main-content");
        if(categoryShort.indexOf('{{')!==-1){
        	categoryShort = arrayMenu[Math.floor(Math.random() * (18 - 0)) + 0];
        	console.log(arrayMenu[Math.floor(Math.random() * (18 - 0)) + 0]);
        }
        $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML, true);
    };

    function buildAndShowCategoriesHTML(categories) {
        $ajaxUtils.sendGetRequest(categoriesTitleHtml, function(categoriesTitleHtml) {
            $ajaxUtils.sendGetRequest(categoryHtml, function(categoryHtml) {
            	switchMenuToActive();
                var categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
                insertHtml("#main-content", categoriesViewHtml);
            }, false);
        }, false);
    };

    function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
        var finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";
        for (var i = 0; i < categories.length; i++) {
            var html = categoryHtml;
            var name = "" + categories[i].name;
            var short_name = categories[i].short_name;
            html = insertProperty(html, "name", name);
            html = insertProperty(html, "short_name", short_name);
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    };

    function buildAndShowMenuItemsHTML(categoryMenuItems) {
        $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function(menuItemsTitleHtml) {
            $ajaxUtils.sendGetRequest(menuItemHtml, function(menuItemHtml) {
                var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml);
                insertHtml("#main-content", menuItemsViewHtml);
            }, false);
        }, false);
    };

    function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);
        var finalHtml = menuItemsTitleHtml;
        finalHtml += "<section class='row'>";
        // Loop over menu items
        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;
        for (var i = 0; i < menuItems.length; i++) {
            // Insert menu item values
            var html = menuItemHtml;
            html = insertProperty(html, "short_name", menuItems[i].short_name);
            html = insertProperty(html, "catShortName", catShortName);
            html = insertItemPrice(html, "price_small", menuItems[i].price_small);
            html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
            html = insertItemPrice(html, "price_large", menuItems[i].price_large);
            html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
            html = insertProperty(html, "name", menuItems[i].name);
            html = insertProperty(html, "description", menuItems[i].description);
            // Add clearfix after every second menu item
            /*if (i % 2 != 0) {
              html +=
                "<div class='clearfix visible-lg-block visible-md-block'></div>";
            }*/
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    };

    function insertItemPrice(html, pricePropName, priceValue) {
        // If not specified, replace with empty string
        if (!priceValue) {
            return insertProperty(html, pricePropName, "");;
        }
        priceValue = "$" + priceValue.toFixed(2);
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }
    // Appends portion name in parens if it exists
    function insertItemPortionName(html, portionPropName, portionValue) {
        // If not specified, return original string
        if (!portionValue) {
            return insertProperty(html, portionPropName, "");
        }
        portionValue = "(" + portionValue + ")";
        html = insertProperty(html, portionPropName, portionValue);
        return html;
    };
    // Remove the class 'active' from home and switch to Menu button
    var switchMenuToActive = function() {
        // Remove 'active' from home button
        var classes = document.querySelector("#navHomeButton").className;
        classes = classes.replace(new RegExp("active", "g"), "");
        document.querySelector("#navHomeButton").className = classes;
        // Add 'active' to menu button if not already there
        classes = document.querySelector("#navMenuButton").className;
        if (classes.indexOf("active") == -1) {
            classes += " active";
            document.querySelector("#navMenuButton").className = classes;
        }
    };
    global.$dc = dc;
})(window);