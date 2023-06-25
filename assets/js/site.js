var menuClick = false;



function AddToCart(item) {
    var cart = localStorage.getItem("cart");
    if (!cart)
        cart = [];
    else
        cart = JSON.parse(cart);


    if (cart.length == 0) {
        cart.push(item);
    } else {
        var incart = false;
        $.each(cart, function (i, e) {
            if (e.id == item.id) {
                e.quantity = item.quantity
                incart = true;
            }
        });

        if (!incart)
            cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    CalculateCart();
}

function CalculateCart(set) {
    var total = 0;
    var cart = localStorage.getItem("cart");

    if (!cart)
        cart = [];
    else
        cart = JSON.parse(cart);

    $.each(cart, function (i, e) {
        var pr = parseFloat(e.quantity * e.price);

        if (set)
            $(".order[data-id=" + e.id + "]").find(".quantity").val(e.quantity);

        total += pr;
    });

    total = parseFloat(total.toFixed(2))
    $("#pricetotal").text(total + "$");
}

function GetProducts() {
    if (window["products"]) {
        w3.displayObject("cards", window["products"]);
        return false;
    }
    var url = "api/products.json";
    $.ajax({
        url: url,
        type: "GET",
        cache: false,
        success: function (data) {
            w3.displayObject("cards", data);
        }
    });
}

function CreateMenu() {

    var url = "api/menu.json";
    var menuBind = function (data, inline) {


        $.each(data, function (index, menu) {
            var a = $("<a />").attr("href", "#" + menu.url.replace(".", "")).text(menu.title);


            $("#myNavbar").append(a);
            if (inline != "go") {
                a.on("click", function (e) {
                    //e.preventDefault();
                    $(this).siblings(".active").removeClass("active");
                    $(this).addClass("active");
                    document.title = a.text();
                    $("#page").fadeOut("", function () {
                        $.get(menu.url, function (page) {
                            $("#page").html(page).fadeIn();
                        });
                    })

                });


            } else {
                a.on("click", function (e) {
                    e.preventDefault();
                    $(this).siblings(".active").removeClass("active");
                    $(this).addClass("active");
                    document.title = a.text();
                    menuClick = true;
                    smoothScroll(a.attr("href"));
                    $(".navbar").removeClass("open");

                });
            }
            if (index == 0)
                a.click();
            a.clone(true).appendTo("#sitemap")
        })
    }


    if (window["menu"]) {
        menuBind(window["menu"], "go");
        return false;
    }

    $.ajax({
        url: url,
        type: "GET",
        success: menuBind
    });

}

function GoToOrders(inline) {
    if (inline) {
        window.location.href += "#orderhtml";
    } else {
        $.get("order.html", function (page) {
            $("#page").html(page);
        });
    }
}



function CreateCarousel() {
    var elem = document.querySelector('.main-carousel');
    var flkty = new Flickity(elem, {
        // options
        cellAlign: 'left',
        contain: true
    });

    // element argument can be a selector string
    //   for an individual element
    var flkty = new Flickity('.main-carousel', {
        // options
    });
}

function myFunction() {
    var x = document.getElementById("myNavbar");
    if (x.className === "navbar") {
        x.className += " responsive";
    } else {
        x.className = "navbar";
    }
}

var lastScrollTop = 0;
var scrollAuto = false;

function smoothScroll(id) {
    
    document.querySelector(id).scrollIntoView({
        behavior: 'smooth'
    });
    $(id).addClass("one");
    $(id).siblings(".page").removeClass("one");
}

function SetQuantity(button) {
    var order = button.closest(".order");
    var quantity = order.find(".quantity");
    var price = order.attr("data-price");
    var qval = parseInt(quantity.val());
    if (button.hasClass("minus")) {
        qval--;
    } else {
        qval++;
    }

    if (qval < 0)
        qval = 0;

    quantity.val(qval);

    AddToCart({ id: order.attr("data-id"), quantity: qval, price: price })
}

$(function () {
    CreateMenu();

    $(".order .minus, .order .plus").click(function () {
        SetQuantity($(this));
    });

    

    $(window).scrollend(function (e, c, b) {
        if (menuClick) {
            menuClick = false;
            return false;
        }
        var direction = "";
        var st = $(this).scrollTop();
        var range = 0;
        if (st > lastScrollTop) {
            range = st - lastScrollTop;
            direction = "down";
        } else {
            range = lastScrollTop - st;
            direction = "up";
        }
        lastScrollTop = st;
        
        
        //alert(direction);
        var ar = [];
        $("#pages .page").each(function () {
            if ($(this).isInViewport()) {
                ar.push($(this));
            }
        });

        if (ar.length > 1) {
            var t = direction == "up" ? ar[0] : ar[1];
            var r = 0;

            if (direction == "up") {
                r = $(window).scrollTop() - t.position().top;
                console.log(r)
                if (r < 400)
                    r = 0;
            } else {
                r = t.position().top - $(window).scrollTop()
                console.log(r)
                if (r > 400)
                    r = 0;
            }

            

            //alert(r);
            if (r == 0)
                return false;

            

            smoothScroll("#" + t.attr("id"));
            t.addClass("one");
            
        }
    });

    CalculateCart(true);

    $("#mobileMenuBtn").click(function () {
        $(".navbar").toggleClass("open");
    });
    
});

$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};