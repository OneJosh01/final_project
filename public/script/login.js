const email = document.getElementById("email") 
const password = document.getElementById("password")
const form = document.getElementById("form")

form.addEventListener("submit", function(e){
    e.preventDefault()
    const emailValue = email.value.trim()
    const passwordValue = password.value.trim()
     console.log(passwordValue)

    if(emailValue === ""){
        error(email, "enter your email") 
    }else{ 
        const emailpara = email.nextElementSibling;
        emailpara.style.display = "none"  
    }

    if(passwordValue === ""){
        error(password, "enter your password")
    }else{
        const passwordpara = password.nextElementSibling;
        passwordpara.style.display = "none"


        axios.post("http://localhost:8000/login", {
            email: emailValue,
            password: passwordValue
        }).then((feedback) => {
            if(feedback)
           console.log(feedback) 
        }) 
    }
    
})


function error(element, message){
    const p = element.nextElementSibling
    p.style.display = "block";
    p.style.color = "red";
    p.innerText = message
}
