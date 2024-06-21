let updateBlogButtons = document.querySelectorAll(".update-blog-btn");
let submitBlogUpdateBtn = document.getElementById("update")

updateBlogButtons.forEach((el) => {
    el.addEventListener("click", () => {
       const blogId =  el.getAttribute("data-id")
       $.ajax({
        method: "GET",
        url: `/update/${blogId}`,
        success:function(data){
            console.log("Blog Data", data)
            console.log($('#form').html(data));
        }
    })
    })
})

