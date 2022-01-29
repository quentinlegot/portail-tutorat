const categorieSelect = document.querySelector("#categorie-select");
const orderSelect = document.querySelector("#ordre-select");

const filter = {"categorie": categorieSelect, "order": orderSelect };

let filterChange = () => {
    let url = window.location.origin + window.location.pathname + "?";
    for(key in filter) {
        if(filter[key].value !== "0") {
            url += key + "=" + filter[key].value + "&";
        }
    }
    window.location.href = url;
};

categorieSelect.addEventListener("change", filterChange);
orderSelect.addEventListener("change", filterChange)