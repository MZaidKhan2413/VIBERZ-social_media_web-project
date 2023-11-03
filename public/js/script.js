let btn = document.getElementById("more_btn");
let div = document.getElementById("more_opts");

btn.addEventListener("click", function() {
    if(div.style.gridTemplateRows != "1fr") {
        div.style.gridTemplateRows = "1fr";
        btn.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
    }
    else {
        div.style.gridTemplateRows = "0fr";
        btn.innerHTML = '<i class="fa-solid fa-caret-up"></i>';
    }
})