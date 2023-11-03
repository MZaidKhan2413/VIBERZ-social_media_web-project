let image = document.getElementById("source_image");
let input = document.getElementById("image");
let icon = document.getElementById("image_icon");

input.onchange = function(){
    icon.remove();
    image.src = URL.createObjectURL(input.files[0]);
}