Handlebars.registerHelper("colorTag", function (index) {
    switch (index) {
        case 0:
            return "bgm-red";
        case 1:
            return "bgm-blue";
        case 2:
            return "bgm-bluegray";
        case 3:
            return "bgm-lightgreen";
        case 4:
            return "bgm-cyan";
        case 5:
            return "bgm-teal";
        case 6:
            return "bgm-lightblue";
        case 7:
            return "bgm-orange";
        case 8:
            return "bgm-purple";
        case 9:
            return "bgm-deeporange";
        case 10:
            return "bgm-pink";
        case 11:
            return "bgm-amber";
        case 12:
            return "bgm-gray";
        case 13:
            return "bgm-indigo";
        case 14:
            return "bgm-lime";
        case 15:
            return "bgm-green";
        case 16:
            return "bgm-deeppurple";
        
    }
});
var tagsData = [];
$.ajax({
    url: 'https://zoltu-bags-middleware.azurewebsites.net/api/tags',
    type: 'GET',
    dataType: 'JSON',
    success: function (tags) {
        tagsData = $.map(tags, function (obj) {
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
GetProducts();



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