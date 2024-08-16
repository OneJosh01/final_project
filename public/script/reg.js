const firstname = document.getElementById("firstname") 
const lastname = document.getElementById("lastname")
const email = document.getElementById("email")
const password = document.getElementById("password")
const form = document.getElementById("form")

form.addEventListener("submit", function(e){
    e.preventDefault()
    
    const firstnameValue = firstname.value.trim()
    const lastnameValue = lastname.value.trim()
    const emailValue = email.value.trim()
    const passwordValue = password.value.trim()

    if(firstnameValue === ""){
        error(firstname, "enter your firstname")
    }else{ 
        const firstnamepara = firstname.nextElementSibling;
        firstnamepara.style.display = "none"
    }

    if(lastnameValue === ""){
        error(lastname, "enter your lastname")
    }else{
        const lastnamepara = lastname.nextElementSibling;
        lastnamepara.style.display = "none"   
    }
    
    if(emailValue === ""){
        error(email, "enter your email")
    }else{
        const emailpara = email.nextElementSibling;
        emailpara.style.display = "none"
    }
    
    if(passwordValue === ""){
        error(password, "enter your password")
    }else{const passwordpara = password.nextElementSibling;
        passwordpara.style.display = "none"
        // let str = firstnameValue + "" + lastnameValue + "" + emailValue + "" + passwordValue + ""

        // firstname.value = ""
        // lastname.value = ""
        // email.value = ""
        // password.value = ""

        // const firstnamepara = firstname.nextElementSibling;
        // const lastnamepara = lastname.nextElementSibling;
        // const emailpara = email.nextElementSibling;
        // const passwordpara = password.nextElementSibling

        // firstnamepara.style.display = "none"
        // lastnamepara.style.display = "none"
        // emailpara.style.display = "none"
        // passwordpara.style.display = "none"
        
// form data sent to server using axios
        axios.post("http://localhost:8000/register", {
            firstname: firstnameValue,
            lastname: lastnameValue,
            email: emailValue,
            password: passwordValue
        }).then((feedback) => {
            console.log(feedback)
            if(feedback.data.code == "error"){
                document.getElementById("errormessage").innerText = feedback.data.message
            }
        })
        // window.location.href = "/dashboard"

    }


})

function error(element, message){
    const p = element.nextElementSibling
    p.style.display = "block";
    p.style.color = "red";
    p.innerText = message
}

