$.ajax({
    url: 'https://zoltu-bags-middleware.azurewebsites.net/api/tags',
    type: 'GET',
    dataType: 'JSON',
    success: function (tags) {
        console.dir(tags);

        $("#main-search").select2({
            placeholder: "Start typing..",
            tags: true,
            data: tags,
            language: {
                noResults: false
            },
            matcher: function (term, option) {
                if (typeof term.term != 'undefined') { //has terms
                    if (/\S/.test(term.term)) { //if empty or spaces
                        if (option.name.toUpperCase().indexOf(term.term.toUpperCase()) >= 0 || option.category.name.toUpperCase().indexOf(term.term.toUpperCase()) >= 0) {
                            return option;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            },
            templateResult: function (tag) {
                if (tag.category)
                    return "#" + tag.category.name + ": " + tag.name;
            },
            templateSelection: function (tag, container) {
                return "#" + tag.category.name + ": " + tag.name;
                //if (data.cssclass)
                //    $(container).addClass("tag-color").addClass(data.cssclass);
                //else
                //    $(container).css("background-color", data.element.attributes["bgcolor"].value);
                //return data.text;
            }
        });
        $("#main-search").on("change", function (e) {
            if ($("#main-search").val())
                $("#search-tag-cnt").text($("#search2").val().length).show();
            else
                $("#search-tag-cnt").text(0).hide();
        });

    },
    error: function () {
        alert('error in fetching tags');
    }
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
Handlebars.registerHelper('isLengthOf', function (array, operator, length, options) {
    switch (operator) {
        case '==':
            return (array.length == length) ? options.fn(this) : options.inverse(this);
        case '<':
            return (array.length < length) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (array.length <= length) ? options.fn(this) : options.inverse(this);
        case '>':
            return (array.length > length) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (array.length >= length) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
Handlebars.registerHelper('countMoreLength', function (array) {
    return array.length - visibleTagCnt;
});
Handlebars.registerHelper('titleCase', function (name) {
    return name.substr(0, 1).toUpperCase() + name.substr(1);
});
var visibleTagCnt = 5;
var sliderInterval;
var sliderRunning = false;
var overSlider = false;
$.ajax({
    url: 'https://zoltu-bags-middleware.azurewebsites.net/api/products',
    type: 'GET',
    dataType: 'JSON',
    success: function (data) {
        console.dir(data);

        //Initialize product template
        var template = Handlebars.templates['product'];

        //Bind products on UI
        $(".product-list").html(template({ products: data }));

        //Click event on Tags
        $(".product-list .product-card .card-body .tag").on("click", function () {
            $(this).tooltip('hide');
            $('#header').addClass('search-toggled');
            var $option = $("<option bgcolor='" + $(this).attr("background-color") + "' selected></option>");
            $option.val($(this).attr('tag-id'));
            $option.text($(this).text());
            $("#search2").append($option);
            $("#search2").trigger("change");
        });

        //Initialize sliding images for each product
        $(".carousel").on("mouseover", function (obj) {
            if (sliderRunning == false && overSlider == false) {
                sliderRunning = true;
                sliderInterval = setInterval(function () {
                    $(obj.currentTarget).children(".carousel-control.right").click();
                }, 1000);
            }
        }).on("mouseleave", function () {
            sliderRunning = false;
            clearInterval(sliderInterval);
        });
        $(".carousel-control").on("mouseenter", function () {
            overSlider = true;
            clearInterval(sliderInterval);
            sliderRunning = false;
        });
        $(".carousel-control").on("mouseleave", function () {
            overSlider = false;
        });
    },
    error: function () { }
});
function ShowProductPopup(productid) {
    $("#product-popup .modal-body").empty();
    $("#product-popup").modal("show");
    $.ajax({
        url: 'https://zoltu-bags-middleware.azurewebsites.net/api/products/' + productid,
        success: function (product) {
            console.dir(product);
            var template = Handlebars.templates['product-details'];
            $("#product-popup .modal-body").html(template(product));
        },
        error: function () {
            alert('error fetching product')
        }
    });
}