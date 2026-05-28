const mongoose = require('mongoose');
require('dotenv').config();
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:[true ,"Username already exists"]
    },
    email:{
        type:String,
        lowercase:true,
        required:true,
        unique:[true ,"Email already exists"],
        match :/^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password:{
        type:String,
        required:true,
        select:false,
      
    },
    profilePicture:{
        type:String,
        default:"https://www.pngall.com/wp-content/uploads/5/Profile-PNG-High-Quality-Image.png"
    }
}, { timestamps: true }
);
const User = mongoose.model('User', userSchema);
module.exports = User;