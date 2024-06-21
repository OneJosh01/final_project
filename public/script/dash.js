console.log($);
let btn_create = document.querySelector(".create>h3")
let product_tray = document.querySelector(".create>h3+ul")
let blog_v = document.querySelector(".read>h3")

btn_create.addEventListener("click", function(){
      product_tray.classList.add('show')
      btn_create.setAttribute('onclick', 'trayOff()')
//    product_tray.style.display = "block"   
})

// create a function to off
function trayOff(){
    product_tray.classList.remove('show')
    btn_create.removeAttribute("onclick")
}

// retrieve all product function
let static_dash = document.querySelector("#form")

// retrieve all view function
let productvkey = document.getElementById("allProducts")
productvkey.addEventListener("click", function(){
    $.ajax({
        method:"GET",
        url:"/loads",
        success:function(data){
            console.log($("#form").html(data))  
        }
    })
})



//onclick of the product load the product form
let pdtkey = document.getElementById("pdtUp")
pdtkey.addEventListener("click", function(){
    $.ajax({
        method:"GET",
        url:"/uploadproduct",
        success:function(data){
            console.log($("#form").html(data))
        },
      
        
    })
})
//onclick of the product  load blogs(read)
let blogv = document.getElementById("bg")
blogv.addEventListener("click", function(){
    $.ajax({
        method:"GET",
        url:"/blogs",
        success:function(data){
            console.log("data:", data)
            console.log($("#form").html(data))
        },
      
        
    })
})
//onclick of the product load the update
let updateblog = document.getElementById("upd")
updateblog.addEventListener("click", function(){
    $.ajax({
        method:"GET",
        url:"/update",
        success:function(data){
            console.log($("#form").html(data));
        },
    })
})

//onclick of the product load the delete
let deleteBlog = document.getElementById("del")
deleteBlog.addEventListener("click", function(){
    $.ajax({
        method:"GET",
        url:"/delete",
        success:function(data){
            console.log($("#form").html(data));
        },
    })
})

// updateBlogButton.addEventListener("click", function(){
//     $.ajax({
//         method: "GET",
//         url: "/update/blog",
//         success:function(data){
//             console.log("Blog Data", data)
//         }
//     })
// })