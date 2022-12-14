let runInput = document.querySelector("#runsearch");
runInput.innerHTML += "<input type='text' id='runinput' class='run-search-input'>";
runInput.innerHTML += "<div class='js--search-clear-items run-search-clear-items'></div>";
runInput.innerHTML += `<div class='js--search-result run-search-result'>
<div onclick="search.runSearchPassive()" class="run-search-closer js--run-search-closer"></div>
<div onclick="filterToggle(this)" class="run-search-filter-toggle js--run-search-filter-toggle"></div>
<div class='js--search-filters run-search-filters'></div>
<div class="js--result-items run-search-products"></div>
<div class="js--loadMore run-search-load"></div>
</div>`;
let searchValue;
const searchApiKey = "HjLvLXNtyHLIFgWmrxHK1sBvF5SUC2HD";
let domainName2;
if(document.querySelector("#runsearch").dataset.domain) {
    domainName2 = document.querySelector("#runsearch").dataset.domain;
} else {
    domainName2 = window.location.host;
}

/* Language Select */
let languageShow = document.querySelector(".language-selector");
let languageSelect;
let languageId;

if(languageShow) {
    if(languageShow.querySelector("select")) {
        let arr = [];
        arr.length = languageShow.querySelector("select").length;
        languageId = languageShow.querySelector("select").options[languageShow.querySelector("select").selectedIndex].value;
        languageSelect = findLanguageId(languageId)
    }
    else if(languageShow.querySelector("ul")) {
        let arr = [];
        arr.length = languageShow.querySelectorAll("ul li").length;
        languageId = languageShow.querySelector("ul li a img.selected").parentElement.href;

        languageSelect = findLanguageId(languageId)
    }
}


const body2 = {
    "searches": [
        {
            "collection": "allProducts",
            "query_by": `Name_${languageSelect}`,
            "filter_by": `domain:=${domainName2}`,
            "use_cache": true,
            "cache_ttl": 60,
            "page": 1,
            "per_page": 75
        }
    ]
};

let filterCategoryShow;
let filterManufacturerShow;
let filterPriceShow;
// Settings
fetch("https://js.runview.de/assets/js/setting.json").then(res => res.json()).then(data => {
    filterCategoryShow = data.filter.filterCategoryShow;
    filterManufacturerShow = data.filter.filterManufacturerShow;
    filterPriceShow = data.filter.filterPriceShow;
    const searchStyle = document.createElement("style");

    searchStyle.textContent = `
        :root {
            --searchScrollBarBg: ${data.colors.scrollBarBg};
            --searchScrollBarThumbBg: ${data.colors.scrollBarThumbBg}
        }
        #runsearch .run-search-filters > b {
            background-color: ${data.colors.filterBoxHeadBg};
            color:${data.colors.filterBoxHeadTextColor};
        }
        #runsearch .run-search-filters > button{
            background-color: ${data.colors.filterArrowBg};
            background-image: ${data.images.filterArrow}
        }
        #runsearch .run-search-filter-price-box button{
            background-color:${data.colors.filterPriceButtonBg};
            color:${data.colors.filterPriceButtonText};
        }
        #runsearch .run-search-filter-toggle {
            background-color: ${data.colors.filterToggleButton};
            background-image: ${data.images.filterToggle}
        }
        #runsearch .run-search-item__info > span {
            color: ${data.colors.priceColor}
        }
        
        #runsearch .run-search-closer{
            background-image: ${data.images.closerButton};
            background-color: ${data.colors.searchCloserButton};
        }
        
        #runsearch .run-search-load{
            background-color: ${data.colors.loadMoreButtonBg};
            color: ${data.colors.loadMoreButtonText}
        }
      
        #runsearch .run-search-item__info b{
            color: ${data.colors.productTextColor} !important
        }
       
        #runsearch .run-search-buttons a {
            background-image: ${data.images.link};
        }
        
        #runsearch .run-search-buttons button {
            background-image: ${data.images.addToCart};
            background-color: ${data.colors.addToCardButtonBg}
        }
    
    `;

    document.head.append(searchStyle)
})
//
document.querySelector("#runinput").addEventListener("keyup", function () {
    search.classAdd(".js--search-result","active");
    search.classAdd(".js--search-clear-items","active")
    search.productsClear();
    body2.searches[0]["page"] = 1;
    if(this.classList.contains("active")) {
        search.pageValue(this.value);
    } else {
        search.value(this.value);
    }
});

const search = {
    value(value) {
        fetch(`https://live.runtext.de/multi_search?q=${value}`,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "X-TYPESENSE-API-KEY": searchApiKey
            },
            body: JSON.stringify(body2)
        }).then(res => res.json()).then(data => {
            console.log(data)
            let dataList = data.results[0].hits;
            search.products(dataList);
            let productLength = data.results[0].found;
            let pageLength = body2.searches[0]["page"];
            let perPageLength = body2.searches[0]["per_page"];

            document.querySelector(".js--loadMore").textContent = `Load more...`;
            search.pagination(productLength,perPageLength);
            document.querySelector(".js--loadMore").addEventListener("click", function () {search.loadMore();})


        });
    },
    pageValue(value) {
        fetch(`https://live.runtext.de/multi_search?q=${value}`,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "X-TYPESENSE-API-KEY": searchApiKey
            },
            body: JSON.stringify(body2)
        }).then(res => res.json()).then(data => {
            console.log(data)
            let dataList = data.results[0].hits;
            search.pageProducts(dataList);
            let productLength = data.results[0].found;
            let pageLength = body2.searches[0]["page"];
            let perPageLength = body2.searches[0]["per_page"];

            document.querySelector(".js--loadMore").textContent = `Load more...`;
            search.pagination(productLength,perPageLength);
            document.querySelector(".js--loadMore").addEventListener("click", function () {search.loadMore();})


        });
    },
    products(list) {

        list.map(item => this.product(item.document))
        // Filter Clear
        this.filterClear();
        // Filters Boxes
        if(filterManufacturerShow === 1) {this.filterManufacturer(list)};
        if(filterCategoryShow === 1) {this.filterCategory(list)};
        if(filterPriceShow === 1) {this.filterPrice(list)}

        //if(filterCategoryShow === 0 && filterManufacturerShow === 0 && filterPriceShow === 0){document.querySelector(".js--search-filters").classList.add("passive")}
    },
    pageProducts(list) {
        list.map(item => this.pageProduct(item.document))
        // Filter Clear
        this.filterClear();
        // Filters Boxes
        if(filterCategoryShow === 1)  {this.filterCategory(list)}
        if(filterManufacturerShow === 1)  {this.filterManufacturer(list)}
        if(filterPriceShow === 1)  {this.filterPrice(list);}
    },
    product(item) {

        let itemCat = item.CategoryNames.map(x => {return x});
       function langName() {switch (languageSelect) {
            case 1:
                if(item.Name_1) {
                    return item.Name_1
                } else if(item.Name_1 === "") {
                    return item.name
                }
                else {
                    return item.Name
                }
                break;
           case 2:
               if(item.Name_2) {
                   return item.Name_2
               } else if(item.Name_2 === "") {
                   return item.name
               }
               else {
                   return item.Name
               }
               break;
           case 3:
               if(item.Name_3) {
                   return item.Name_3
               } else if(item.Name_3 === "") {
                   return item.name
               }
               else {
                   return item.Name
               }
               break;
           case 4:
               if(item.Name_4) {
                   return item.Name_4
               } else if(item.Name_4 === "") {
                   return item.name
               }
               else {
                   return item.Name
               }
               break;
           case 5:
               if(item.Name_5) {
                   return item.Name_5
               } else if(item.Name_5 === "") {
                   return item.name
               }
               else {
                   return item.Name
               }
               break;
        }}
        function langSName() {switch (languageSelect) {
            case 1:
                if(item.SeName_1) {
                    return item.SeName_1
                } else if(item.SeName_1 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
            case 2:
                if(item.SeName_2) {
                    return item.SeName_2
                } else if(item.SeName_2 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
            case 3:
                if(item.SeName_3) {
                    return item.SeName_3
                } else if(item.SeName_3 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
            case 4:
                if(item.SeName_4) {
                    return item.SeName_4
                } else if(item.SeName_4 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
            case 5:
                if(item.SeName_5) {
                    return item.SeName_5
                } else if(item.SeName_5 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
        }}
         document.querySelector(".js--result-items").innerHTML += `
                    <a 
                    href="https://www.${domainName2}/${langSName()}" 
                    class="run-search-item js--run-search-item"
                    data-manufacturer="${item.Manufacturers[0]}" 
                    data-category="${itemCat}">
                        <img loading="lazy" width="35" height="35" src="${item.ProductPictureModels.Data.length === 0 ? "" : item.ProductPictureModels.Data[0].PictureUrl}">
                        <div class="run-search-item__info">
                            <b>${langName()}</b>
                            <span><span>${item.Price}</span> ${search.currency(item)}</span>
                        </div>
                        
                    </a>`;
    },
    pageProduct(item) {

        let itemCat = item.CategoryNames.map(x => {return x});

        function langName() {switch (languageSelect) {
            case 1:
                if(item.Name_1) {
                    return item.Name_1
                } else if(item.Name_1 === "") {
                    return item.name
                }
                else {
                    return item.Name
                }
                break;
            case 2:
                if(item.Name_2) {
                    return item.Name_2
                } else if(item.Name_2 === "") {
                    return item.name
                }
                else {
                    return item.Name
                }
                break;
            case 3:
                if(item.Name_3) {
                    return item.Name_3
                } else if(item.Name_3 === "") {
                    return item.name
                }
                else {
                    return item.Name
                }
                break;
            case 4:
                if(item.Name_4) {
                    return item.Name_4
                } else if(item.Name_4 === "") {
                    return item.name
                }
                else {
                    return item.Name
                }
                break;
            case 5:
                if(item.Name_5) {
                    return item.Name_5
                } else if(item.Name_5 === "") {
                    return item.name
                }
                else {
                    return item.Name
                }
                break;
        }}
        function langSName() {switch (languageSelect) {
            case 1:
                if(item.SeName_1) {
                    return item.SeName_1
                } else if(item.SeName_1 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
            case 2:
                if(item.SeName_2) {
                    return item.SeName_2
                } else if(item.SeName_2 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
            case 3:
                if(item.SeName_3) {
                    return item.SeName_3
                } else if(item.SeName_3 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
            case 4:
                if(item.SeName_4) {
                    return item.SeName_4
                } else if(item.SeName_4 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
            case 5:
                if(item.SeName_5) {
                    return item.SeName_5
                } else if(item.SeName_5 === "") {
                    return item.SeName
                }
                else {
                    return item.SeName
                }
                break;
        }}
        document.querySelector(".js--result-items").innerHTML += `
                    <div
                    class="run-search-item--type-2 js--run-search-item"
                    data-manufacturer="${item.Manufacturers[0]}" 
                    data-category="${itemCat}">
                        <img loading="lazy" src="${item.ProductPictureModels.Data.length === 0 ? "" : item.ProductPictureModels.Data[0].PictureUrl}">
                        <div class="run-search-item__info">
                            <b>${langName()}</b>
                            <span><span>${item.Price}</span> ${search.currency(item)}</span>
                        </div>
                        <div class="run-search-buttons">
                            <a href="https://www.${domainName2}/${langSName()}"></a>
                            <button onclick="if (!window.__cfRLUnblockHandlers) return false; AjaxCart.addproducttocart_details('/addproducttocart/details/${item.id}/1', '#product-details-form');return false;"></button>
                        </div>
                        
                    </a>`;
    },
    productsClear() {
        document.querySelector(".js--result-items").innerHTML = "";
    },
    filterClear() {
        document.querySelector(".js--search-filters").innerHTML = "";
    },
    filterCategory(list) {

        let categoryList= [];

        document.querySelector(".js--search-filters").innerHTML += `
<b>Category</b>
<div class="js--category-names run-search-filter-box" data-name="category">

</div>
`;

        list.map(category => {
            //console.log(...category.document.CategoryNames)
            categoryList.push(...category.document.CategoryNames)
        })

        categoryList = [...new Set(categoryList)]

        //console.log({categoryList})

        categoryList.map(item => {
            document.querySelector(".js--category-names").innerHTML += `<div onclick="search.filterClick(this,'.js--category-names div','.js--search-filter-category')">${item}</div>`
        })

        if(categoryList.length > 4) {
            document.querySelector(".js--category-names").insertAdjacentHTML("afterend",`<button onclick="search.lengthenAndShorten(this)"  class="js--filter-button"></button>`)
        }

        document.querySelector(".js--category-names").classList.add("run-search-filter-long")

    },
    filterManufacturer(list) {

        let manufacturerList = [];

        document.querySelector(".js--search-filters").innerHTML += `
<b>Manufacturer</b>
<div class="js--manufacturer-names run-search-filter-box" data-name="manufacturer">

</div>`;

        list.map(manufacturer => {
            manufacturerList.push(manufacturer.document.Manufacturers[0])
        })

        manufacturerList = [...new Set(manufacturerList)];

        manufacturerList.map(item => {
            document.querySelector(".js--manufacturer-names").innerHTML += `<div onclick="search.filterClick(this,'.js--manufacturer-names div','.js--search-filter-manufacturer')">${item}</div>`
        })

        if(manufacturerList.length > 4) {
            document.querySelector(".js--manufacturer-names").insertAdjacentHTML("afterend",`<button onclick="search.lengthenAndShorten(this)" class="js--filter-button"></button>`)
        }
        document.querySelector(".js--manufacturer-names").classList.add("run-search-filter-long")
    },
    filterPrice(list) {

        let prices= [];
        list.map(item => {
            prices.push(item.document.Price)
        })
        let pricesMax = Math.max(...prices);
        let pricesMin = Math.min(...prices);

        document.querySelector(".js--search-filters").innerHTML += `
<b>Price</b>
<div class="run-search-filter-price-box">
<input id="priceMin" type="number" placeholder="Min: ${pricesMin}">
<input id="priceMax" type="number" placeholder="Max: ${pricesMax}">
<button onclick="priceFilter(${pricesMin},${pricesMax})" class="js--run-search-price-analysis">Filter Price</button>
</div>
`;

    },
    classAdd(selector,className) {
        document.querySelector(selector).classList.add(className);
    },
    filterClearItem(select) {

        let arr = select.classList.value.split("-")
        select.remove();
        document.querySelectorAll(`.run-search-filter-box[data-name="${arr[arr.length -1]}"] div`).forEach(function (item) {
            item.classList.remove("active");
        })

        document.querySelectorAll(`.js--run-search-item[data-${arr[arr.length -1]}]`).forEach(function (item) {
            item.classList.remove(`${arr[arr.length - 1]}-none`)
        })
    },
    lengthenAndShorten(item) {
        item.previousElementSibling.classList.toggle("run-search-filter-long");
        item.classList.toggle("active");
    },
    loadMore(_this,number) {
            //document.querySelectorAll(".js--run-search-pagination div").forEach(function (el) {
            //    el.classList.remove("active");
            //    el.addEventListener("click", function () {
            //        el.classList.add("remove")
            //    })
            //})

            document.querySelector("#runsearch").classList.add("active");
            document.querySelector("#runinput").classList.add("active");
            document.querySelector(".js--search-clear-items").innerHTML = "";
            document.querySelector(".js--search-filters").innerHTML = "";
            document.querySelector(".js--result-items").innerHTML = "";
            body2.searches[0]["page"] = number;

            search.pageValue(document.querySelector("#runinput").value);




    },
    pagination(totalProduct,perPage) {

        if(document.querySelector(".js--run-search-pagination")) {
            document.querySelector(".js--run-search-pagination").remove();
        }
        document.querySelector(".js--search-result").innerHTML += `<div class="js--run-search-pagination run-search-pagination"></div>`

        let paginationLength = Math.ceil(totalProduct/perPage)

        for (let i=0; i < paginationLength; i++) {
            document.querySelector(".js--run-search-pagination").innerHTML += `<div onclick="search.loadMore(this,${i+1})">${i+1}</div>`
        }


    },
    currency(item) {
        switch (item.Currency) {
            case "EUR":
                return "???"
            default:
                return "$"
        }
    },
    runSearchPassive() {
        document.querySelector("#runinput").value = "";
        document.querySelector("#runsearch").classList.remove("active");
        document.querySelector(".js--search-clear-items").innerHTML = "";
        document.querySelector(".js--search-filters").innerHTML = "";
        document.querySelector(".js--result-items").innerHTML = "";
        document.querySelector(".js--run-search-pagination").innerHTML = "";
        document.querySelector(".js--search-clear-items").classList.remove("active");
        document.querySelector(".js--search-clear-items").classList.remove("active");
        document.querySelector("#runinput").classList.remove("active");
        document.querySelector(".js--search-result").classList.remove("active");
    },
    filterClick(el,filterItem,filterAddItem) {
            if(document.querySelector(filterAddItem)) {
                document.querySelector(filterAddItem).remove();
            }
            document.querySelector(".js--search-clear-items").innerHTML += `<button onclick="search.filterClearItem(this)" class="${filterAddItem.substr(1)}">${el.textContent} <span>&times;</span></button>`
            document.querySelectorAll(filterItem).forEach(function (clearItem) {
                clearItem.classList.remove("active")
            });
            el.classList.add("active");
            document.querySelectorAll(`.js--run-search-item`).forEach(function (addItem) {
                addItem.classList.remove(`${el.parentElement.dataset.name}-none`);
                let datasetContains = addItem.dataset[el.parentElement.dataset.name];


                if(!datasetContains.includes(el.textContent)) {
                    addItem.classList.add(`${el.parentElement.dataset.name}-none`)
                }
            });
    }

}


function filterToggle(_this) {
    _this.classList.toggle("active");
    document.querySelector(".js--search-filters").classList.toggle("active");
    document.querySelector(".js--result-items").classList.toggle("filter-active")
}

function priceFilter(listMin,listMax) {
    if(document.querySelector(".js--search-filter-price")) {
        document.querySelector(".js--search-filter-price").remove();
    }
    let min = document.querySelector("#priceMin").value
    let max = document.querySelector("#priceMax").value
    max = Number(max)
    min = Number(min)

    if(max <= 0) {max = listMax}
    if(min <= 0) {min = listMin}
    if(min > max) {max = listMax; min = listMin}

    document.querySelector(".js--search-clear-items").innerHTML += `<button onclick="priceFilterClear()" class="js--search-filter-price">${min}-${max} <span>&times;</span></button>`
    document.querySelectorAll(".js--run-search-item").forEach(function (el) {

        let price = el.children[1].children[1].children[0].textContent;
        price = Number(price)



        if(min < price) {
        } else {
            if(max > price) {
                el.classList.add("price-none");
            }
        }


    })
}
function priceFilterClear() {
    document.querySelector(".js--search-filter-price").remove();
    document.querySelector("#priceMin").value = "";
    document.querySelector("#priceMax").value = "";
    document.querySelectorAll(".js--run-search-item").forEach(function (el) {
        el.classList.remove("price-none")
    })
}

function findLanguageId(langUrl) {
    return Number(langUrl.split("/")[langUrl.split("/").length - 1].charAt(0))
}
