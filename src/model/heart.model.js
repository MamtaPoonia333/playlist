const mongoose = require('mongoose');
const heartSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    songId:{
        type:String,
        required:true
    }
}
, { timestamps: true });
const Heart = mongoose.model('Heart', heartSchema);
module.exports = Heart;