const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    title:{
        type:String,
        required:true,
    },
    genre:{
        type:String,
        required:true
    },
    artist:{
        type:String,
        required:true
    },
    imageId: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    uploadedBy:{
        type:String,
        required:true
    }
},
{ timestamps: true });

const Song = mongoose.model('Song', songSchema);
module.exports = Song;