//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
//const md5 = require("md5");
//const encrypt = require("mongoose-encryption");

const app=express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/authentication");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
//userSchema.plugin(encrypt,{secret : process.env.SECRET,encryptedFields : ["password"]});

const user = new mongoose.model("User",userSchema);

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error hashing password");
        } else {
            const newUser = new user({
                email: req.body.username,
                password: hash
            });

            newUser.save()
                .then(() => {
                    res.render("secrets");
                    console.log("successfully added newUser");
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error saving user");
                });
        }
    });
});


app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    user.findOne({ email: username })
        .then((foundUser) => {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, (err, result) => {
                    if (result === true) {
                        res.render("secrets");
                    } else {
                        console.log("Wrong password!!");
                    }
                });
            } else {
                console.log("User not found");
            }
        })
        .catch(err => {
            console.log(err);
        });
});


app.listen(3000,(req,res)=>{
  console.log("successfully running on 3000");
});