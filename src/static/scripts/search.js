const categorieSelect = document.querySelector("#categorie-select");

const filter = {"categorie": categorieSelect };

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