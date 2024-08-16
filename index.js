const express = require("express")
// use express as template engine
const server = express()

// Require dependencies
const path = require ("path")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const mongodb = require("mongodb")
const client = new mongodb.MongoClient("mongodb://localhost:27017/")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const bcrypt = require("bcrypt")
const multer = require("multer")
const session = require("express-session")
const jwt = require("jsonwebtoken")
const secret_key = "jgghfhfshfhgfhgghhvhcfchgxhfghvdhgsgvs"

// Use the dependencies
server.use(cors())
server.use(express.static(path.join(__dirname, "public"))) // give server access to the public folder in the project root directory
server.use(bodyParser.urlencoded({extended:false})) // give server access to use and to parse messages with clients 
server.use(bodyParser.json())
server.use(cookieParser()) // give server access to use and parse clients cookies
server.use(session({secret:"your secret key"}))

// Templating engine
server.set("view engine", "ejs")
const port = process.env.port
// const admin = process.env.TABLE
// const sampleDB = process.env.DB_NAME


// jwt middleware for the user creation
const verifyUserToken = function(req, res, next){
    const token = req.cookies.loginToken
    // console.log("from token: ", token)
    try{
        const verify = jwt.verify(token, secret_key)
        loggedinuser = verify.email
        // console.log("from verify: ", verify)

    }catch(error){
        //  console.log("from jwt error: ", error.message)
         res.redirect("/login")
    }

    next()

}
// jwt middleware for the admin creation
const verifyAdminToken = async function(req, res, next){
      
    try{
         const token = req.cookies.loginToken
         console.log("from token", token)
         const verify = jwt.verify(token, secret_key)  
        //  console.log(verify)
         email = verify.email
         findAdmin = await client.db("projectDB").collection("user").findOne({email: email});
         is_an_admin = findAdmin.is_an_admin
         if(!is_an_admin || typeof(is_an_admin) == undefined){
            res.redirect("/blogs")
         }else{
            res.render("dashboard")

         }
        //   console.log("from verify:", verify)
    }catch(error){
        console.log("from jwt error:", error.message)
        
        return res.redirect("/blogs")
    }
    next()
    
}




//home route
// this is where the jwt middleware for admin is used
server.get("/home", verifyAdminToken, (req, res)=>{
})
// product upload route not in use
// server.get("/uploadproduct", (req, res)=>{
//     res.render("uploads")
// })
// blogs view route
server.get("/loads",(req, res)=>{
    res.render("loads")
})
// landingpage route
server.get("/", (req, res)=>{
    res.render("landingpage")
})
// login route
server.get("/login", (req, res)=>{
    const token = req.cookies.loginToken
    console.log(token)
    if(token){
        res.redirect("blogs") 
    }else{
        res.render("login")
    }
})


// register route
server.get("/register", (req, res)=>{
    const token = req.cookies.loginToken
    console.log(token)
    if(token){
        res.redirect("blogs") 
    }else{
        res.render("register")
    }
})
server.get("/about", (req, res)=>{
    res.render("about")
})
server.get("/frequently-asked-question", (req, res)=>{
    res.render("faq")
})







// set up multer
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/uploads")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})
const uploads = multer({storage:storage})
server.post("/home", uploads.single("uploader"), async(req, res)=>{
    const title = req.body.title.trim()
    const content = req.body.content.trim()
    const uploader = req.file.filename.trim()
    const img_url = req.file.path.trim()
    const obj = {
        title:title,
        content:content,
        uploader:uploader,
        img_url:uploader
    }
    req.session.user = obj
    await client.db("projectDB").collection("blogs").insertOne(obj) 
        res.redirect("/home");

})

// this is where the jwt middleware for user is used
server.get("/blogs", verifyUserToken, async(req, res)=>{

    const db = client.db("projectDB").collection("blogs").find();
    let records = [];
    for await (const doc of db) {
        records.push(doc);

    }
     res.render("blogs", {blogs: records})
     
})
server.get("/admin/blogs", async (req, res)=>{
    const db = await client.db("projectDB").collection("blogs").find().toArray();
    // console.log(db)
    res.send(db || [])
     
})



//  update route
server.get("/update", async(req, res)=>{
    const db = client.db("projectDB").collection("blogs").find();
    let records = [];
    for await (const doc of db) {
        records.push(doc);    
    }
     res.render("update", {blogs: records});
})

server.get("/delete", async(req, res)=>{
    const db = client.db("projectDB").collection("blogs").find();
    let records = [];
    for await (const doc of db) {
        records.push(doc);     
    }
     res.render("delete", {blogs: records});

})

server.post("/delete", async(req, res)=>{
    let id = req.body.id.trim();
    id = new mongodb.ObjectId(id);

    await client.db("projectDB").collection("blogs").deleteOne({_id: id});
    
     res.redirect("/home");

})


server.get("/update/:blogId", async (req, res) => {
    let params = req.params;
    const id = new mongodb.ObjectId(params.blogId);

    console.log("Id:", id);

    const blog = await client.db("projectDB").collection("blogs").findOne({_id: id})
    
    console.log("Blog:", blog);
    
res.render('update-blog', { blog });
})


server.post("/update", async(req, res) => {
    const title = req.body.title.trim();
    const content = req.body.content.trim()
    const blogId = new mongodb.ObjectId(req.body.id.trim());

    // console.log("Request body: ", req.body)

    // const blogId = new mongodb.ObjectId(req.params.blogId);
    const update = { $set: { title, content }}
    await client.db("projectDB").collection("blogs").findOneAndUpdate({_id: blogId}, update).then(() => {
        res.redirect("/home")
    })

})
// client sending a post request to the server 
server.post("/login", async(req, res) => {
    const email = req.body.email.trim()
    const password = req.body.password.trim()
    const confirm_email_in_db = await client.db("projectDB").collection("user").findOne({email:email})
    console.log(confirm_email_in_db)
    if(confirm_email_in_db){
        const valid_password = confirm_email_in_db.password
        const check_password = await bcrypt.compare(password, valid_password)
        if(check_password){
            const userdetails = {
                email: email,
                password: password
            }
           const token = jwt.sign(userdetails, secret_key, expiresIn = null)
           if(token){
            const check_if_user_is_an_admin = await client.db("projectDB").collection("user").findOne({email:email})
            console.log(check_if_user_is_an_admin)
            const is_an_admin = check_if_user_is_an_admin.is_an_admin
            res.cookie("loginToken", token)


            if(is_an_admin){

                res.send({
                    message: "login successful",
                    user: "admin",
                    code : "success",
                    data: {
                        email: email,
                        token: token
                    }
                })
                
            }else{
                res.send({
                    message: "a user",
                    code: "success",
                    data: {
                        email: email,
                        token: token
                    }

                })
            }
           
           }

           
        }else{
            res.send({
                message: "password mismatch",
                code: "error"
            })
        }
    }else{
        res.send({
            message: "Account not found, have you registered",
            code: "error"
        })
    }

    // jwt.verify(req.token, "signin", function(error, user_data){ 
    //     // if(error){
    //     //     res.status(403).send({
    //     //       message: "not an authorized user"  
    //     //     })
    //     // }
    //     // res.status(200).send({
    //     //     message: "user logged in successfully",
    //     //     data:user_data
    //     // })
    // })    
})
server.post("/register", async(req, res) => {
    const firstname = req.body.firstname.trim()
    const lastname = req.body.lastname.trim()
    const email = req.body.email.trim()
    const password = req.body.password.trim()
    const check_if_email_exists = await client.db("projectDB").collection("user").findOne({email:email});
    console.log(check_if_email_exists)
    if(check_if_email_exists){
        res.send({
            message:"account could not be created",
            code: "error",
            reason: "email already in use "
        })

    }else{
        const hashpassword = await bcrypt.hash(password, 10)
        const obj = {
            firstname:firstname,
            lastname:lastname,
            email:email,
            password:hashpassword

        }
        const store = client.db("projectDB").collection("user").insertOne(obj)
        res.send({
            message:"account successfully created",
            code:"true",
            data:{
                firstname:firstname,
                lastname:lastname,
                email:email,
                password:hashpassword

            }
            
        })
    }

})


server.listen(port, (err)=>{
    if(err){
        console.log(err);
    }
    console.log('server is running on port' + port);
})








// console.log(title)
//         const updateuser = client.db("sampleDB").collection("admin").findOneAndUpdate({email:email}, {$set:{firstname: updatedfirstname}})
//         if(updateuser){
//             res.send({
//                 message: "user's firstname successfully updated",
//                 code: "success",
//                 data: {
//                     email: email,
//                     updatedfirstname: updatedfirstname
//                 }
//             })
//         }else{
//             res.send({
//                 message: "user's firstname could not be updated",
//                 code: "error"
//             })
//         }
//     }
// })

// register route
// server.post("/register", async(req, res)=>{
//     const email = req.body.email
//     const password = req.body.password
//     const firstname = req.body.firstname
//     const check_if_email_exists = await client.db("sampleDB").collection("admin").findOne({email:email});
//     if(check_if_email_exists){
//         res.send({
//             message: "account could not be created",
//             code:"error",
//             reason:"email already in use "
//         })
//     }else{
//         const hashpassword = await bcrypt.hash(password, 10)
//         const user_details = {
//             firstname: firstname,
//             email: email,
//             password: hashpassword
//         }
//         const store = await client.db("sampleDB").collection("admin").insertOne(user_details)
//         res.send({
//             message: "account successfully created",
//             code: "true",
//             data: {
//                 firstname: firstname,
//                 email:email,
//                 password:hashpassword
//             }

//         })
//     }
// })
// server.post("/update-user", async(req, res)=>{
//     const {email, updatedfirstname} = req.body
//     if(email == "" && updatedfirstname == ""){
//         res.send({
//             message: "invalid user details",
//             code: "error"

//         })
//     }else{
//         const updateuser = client.db("sampleDB").collection("admin").findOneAndUpdate({email:email}, {$set:{firstname: updatedfirstname}})
//         if(updateuser){
//             res.send({
//                 message: "user's firstname successfully updated",
//                 code: "success",
//                 data: {
//                     email: email,
//                     updatedfirstname: updatedfirstname
//                 }
//             })
//         }else{
//             res.send({
//                 message: "user's firstname could not be updated",
//                 code: "error"
//             })
//         }
//     }
// })
// server.post("/delete", (req, res)=>{
// })