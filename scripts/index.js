Handlebars.registerHelper("colorTag", function (categoryid) {
    var color = '';
    $.each(categories, function (index, category) {
        if (category.id == categoryid) {
            color = category.color;
            return;
        }
    });
    return color;
});
var category_colors = ["bgm-red", "bgm-blue", "bgm-bluegray", "bgm-lightgreen", "bgm-cyan", "bgm-teal", "bgm-lightblue",
    "bgm-orange", "bgm-purple", "bgm-deeporange", "bgm-pink", "bgm-amber", "bgm-gray", "bgm-indigo", "bgm-lime", "bgm-green", "bgm-deeppurple"];

var categories = [];
$.ajax({
    url: 'https://zoltu-bags-middleware.azurewebsites.net/api/tag_categories',
    type: 'GET',
    dataType: 'JSON',
    success: function (cats) {
        console.dir(cats);
        //assign each category a color
        $.each(cats, function (index, cat) {
            var category = cat;
            category.color = category_colors[index];
            categories.push(category);
        });

        getTags();
        GetProducts();
    },
    error: function () {
        alert('error in fetching categories');
    }
});

var tagsData = [];
function getTags() {
    $.ajax({
        url: 'https://zoltu-bags-middleware.azurewebsites.net/api/tags',
        type: 'GET',
        dataType: 'JSON',
        success: function (tags) {
            console.dir(tags);
            tagsData = $.map(tags, function (obj, index) {
                obj.id = obj.id;
                obj.text = "#" + obj.category.name + ": " + obj.name;
                return obj;
            });

            //Load all tags in the search
            loadTags();

            $("#main-search").on("change", function (e) {
                if ($("#main-search").val())
                    $("#search-tag-cnt").text($("#main-search").val().length).show();
                else
                    $("#search-tag-cnt").text(0).hide();

                GetProducts();
            });
            $("#main-search").on("select2:unselect", function (e) {
                $("#main-search option[value='" + e.params.data.id + "'").prop('selected', false);
                $("#main-search").trigger("change");
            });

        },
        error: function () {
            alert('error in fetching tags');
        }
    });
}

function loadTags() {
    $("#main-search").select2({
        placeholder: "Start typing..",
        data: tagsData,
        allowClear: true,
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
    });
    $("#main-search").on("select2:selecting", function (event) {
        console.dir(event.params.args.data);
    });
}

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


function GetProducts() {
    var api = 'https://zoltu-bags-middleware.azurewebsites.net/api/products';
    var selectedTags = $("#main-search").val();
    if (selectedTags && selectedTags.length > 0) {
        api = 'https://bags-api.zoltu.com/api/products/by_tags?';
        var tagids = [];
        for (var i = 0; i < selectedTags.length; i++) {
            tagids.push("tag_id=" + selectedTags[i]);
        }
        api += tagids.join("&");
    }
    $.ajax({
        url: api,
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
                $("#main-search option[value=" + $(this).attr('tag-id') + "]").prop('selected', true);
                $("#main-search").trigger("change");
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
            if ($('[data-toggle="tooltip"]')[0]) {
                $('[data-toggle="tooltip"]').tooltip();
            }
        },
        error: function () { }
    });
}
function ShowProductPopup(productid) {
    $("body").css("margin-right:17px;overflow:hidden");
    $("#product-popup-loader").fadeIn("fast",function () {
        $.ajax({
            url: 'https://zoltu-bags-middleware.azurewebsites.net/api/products/' + productid,
            success: function (product) {
                console.dir(product);
                var template = Handlebars.templates['product-details'];
                $.magnificPopup.open({
                    closeBtnInside: true,
                    closeOnContentClick: false,
                    items: {
                        src: template(product),
                        type: 'inline'
                    },
                    callbacks: {
                        beforeOpen: function () {
                            $("#product-popup-loader").hide();
                            this.st.mainClass = "mfp-zoom-in";
                            $("body").css("margin-right overflow:hidden");
                        },
                        open: function () {
                            //Click event on Tags
                            $(".product-popup .product-tags .tag").on("click", function () {
                                $(this).tooltip('hide');
                                $('#header').addClass('search-toggled');
                                $("#main-search option[value=" + $(this).attr('tag-id') + "]").prop('selected', true);
                                $("#main-search").trigger("change");
                            });
                        }
                    }
                });
            },
            error: function () {
                alert('error fetching product')
            }
        });
    });
}