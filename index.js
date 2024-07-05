const express = require("express")
const server = express()
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

server.use(cors())
server.use(express.static(path.join(__dirname, "public")))
server.use(bodyParser.urlencoded({extended:false}))
server.use(bodyParser.json())
server.use(cookieParser())
server.use(session({secret:"your secret key"}))
server.set("view engine", "ejs")
const port = process.env.port
// const admin = process.env.TABLE
// const sampleDB = process.env.DB_NAME

//home route
server.get("/home", (req, res)=>{
    res.render("dashboard")
})
// product upload route
server.get("/uploadproduct", (req, res)=>{
    res.render("uploads")
})
// blogs view route
server.get("/loads",(req, res)=>{
    res.render("loads")
})
server.get("/defaultpage", (req, res)=>{
    res.render("defaultpage")
})
server.get("/login", (req, res)=>{
    res.render("login")

})
server.get("/register", (req, res)=>{
    res.render("register")
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

server.get("/blogs", async(req, res)=>{
    const db = client.db("projectDB").collection("blogs").find();
    let records = [];
    for await (const doc of db) {
        records.push(doc);

    }
     res.render("blogs", {blogs: records})
     
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
server.post("/login", async(req, res) => {
    const email = req.body.email.trim()
    const password = req.body.password.trim()
    const confirm_email_in_db = await client.db("projectDB").collection("blogs").findOne({email:email})
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
            // res.send({
            //     message: "user login successful",
            //     code: "success",
            //     data: {
            //         email: email,
            //         token: token
            //     }
            // })
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
    const check_if_email_exists = await client.db("projectDB").collection("blogs").findOne({email:email});
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
        const store = client.db("projectDB").collection("blogs").insertOne(obj)
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