const songModel = require("../model/song.model");
const ImageKit = require("imagekit");

const mongoose = require('mongoose');
let imagekit = null;
function getImageKit() {
    if (imagekit) return imagekit;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/mamta03";
    if (!publicKey || !privateKey) return null;
    imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
    return imagekit;
}
function santiseFileName(filename){
    return filename.replace(/\s/g, "_");
}
async function createSong(req ,res){
    try{
        const email = req.user.email;
        if(!email){
            return res.status(400).json({message: "User not authenticated"

            });
        }
        if(!req.file){
            return res.status(400).json({message: "No file uploaded"});
        }
        if(!req.body.title || !req.body.artist){
            return res.status(400).json({message: "Title and artist are required"});
        }
        const ik = getImageKit();
        if (!ik) {
            console.error('ImageKit credentials missing');
            return res.status(500).json({ message: "ImageKit not configured" });
        }
        const file = await ik.upload({
            file: req.file.buffer,
            fileName :  'song_' + Date.now() + "_" + santiseFileName(req.file.originalname),
        });
        const newSong = new songModel({
            fileName: santiseFileName(req.file.originalname),
            title: req.body.title,
            artist: req.body.artist,
            genre: req.body.genre,
            imageId: file.fileId,
            imageUrl: file.url,
            uploadedBy: email
        });
        await newSong.save();
        res.status(201).json({message: "Song created successfully", song: newSong
        });
    } catch (error) {
        console.error("Error creating song:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

async function getAllSongs(req, res) {
    try {
        const songs = await songModel.find().sort({ _id: -1 });
        return res.status(200).json({ songs });
    } catch (error) {
        console.error("Error fetching all songs:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getSongById(req, res) {
    try {
        const songId = {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Song'};
        if (!mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({ message: "Invalid song ID" });
        }

        const song = await songModel.findById(songId);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        return res.status(200).json({ song });
    } catch (error) {
        console.error("Error fetching song by id:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function searchSongs(req, res) {
    try {
        const query = (req.query.q || '').trim();
        if (!query) {
            return res.status(400).json({ message: "Search query parameter q is required" });
        }

        const regex = new RegExp(query, 'i');
        const songs = await songModel.find({
            $or: [{ title: regex }, { artist: regex }, { genre: regex }]
        });

        return res.status(200).json({ songs });
    } catch (error) {
        console.error("Error searching songs:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function heartSong(req, res){
    try{
        const songId = req.params.id;
        const email = req.user.email;
        if(!email){
            return res.status(400).json({message: "User not authenticated"});
        }
        if(!mongoose.Types.ObjectId.isValid(songId)){
            return res.status(400).json({message: "Invalid song ID"});
        }
        const song = await songModel.findById(songId);
        if(!song){
            return res.status(404).json({message: "Song not found"});
        }
        return res.status(200).json({ message: "Song hearted successfully" });
    } catch (error) {
        console.error("Error hearting song:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

async function deleteSong(req, res) {
    try {
        const songId = req.params.id;
        const email = req.user?.email;

        if (!mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({ message: "Invalid song ID" });
        }

        const song = await songModel.findById(songId);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        if (!email || song.uploadedBy !== email) {
            return res.status(403).json({ message: "You can only delete your own song" });
        }

        await songModel.findByIdAndDelete(songId);
        return res.status(200).json({ message: "Song deleted successfully" });
    } catch (error) {
        console.error("Error deleting song:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


async function getAllSongsByGenre(req, res){
    try{
        const genre = req.query.genre;
        if(!genre){
            return res.status(400).json({message: "Genre query parameter is required"});
        }
        const songs = await songModel.find({genre: genre});
        res.status(200).json({songs: songs});
    } catch (error) {
        console.error("Error fetching songs by genre:", error);
        res.status(500).json({message: "Internal server error"});
    }

}


async function getPlaylistByArtist(req,res){
    try{
const artist = req.query.artist;
        if(!artist){
            return res.status(400).json({message: "Artist query parameter is required"});
        }
        const songs = await songModel.find({artist: artist});
        res.status(200).json({songs: songs});
    } catch (error) {
        console.error("Error fetching songs by artist:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

module.exports = {
    createSong,
    getAllSongs,
    getSongById,
    searchSongs,
    heartSong,
    deleteSong,
    getAllSongsByGenre,
    getPlaylistByArtist
}
   