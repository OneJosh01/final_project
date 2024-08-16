














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

// form data sent to the server using axios
        axios.post("http://localhost:8000/login", {
            email: emailValue,
            password: passwordValue
        }).then((feedback) => {
            console.log(feedback) 
            if(feedback.data.code === "success"){
                const gotit = document.getElementById("successmessage").innerText = "Login successful"
                const token = feedback.data.data.token
                let userData = {
                    email: feedback.data.data.email,
                    token: feedback.data.data.token
                }
                // localStorage.setItem("user", JSON.stringify(userData))
               
 
                 
                if(feedback.data.user === "admin"){
                    window.location.href = "/home"
            
                }else{
                    window.location.href = "/blogs"
                     
                }

               

              
               
            }else if(feedback.data.code === "error") {
                document.getElementById("errormessage").innerText = feedback.data.message
            }
    
                
        }) 
    }
    
})


function error(element, message){
    const p = element.nextElementSibling
    p.style.display = "block";
    p.style.color = "red";
    p.innerText = message
}
