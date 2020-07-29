const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// creo uno Schema
const IdeaSchema = new Schema({
    // creo gli attributi dello Schema. Sono tutti jsObjects.
    title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    } 
});

// creo il modello
mongoose.model("ideas", IdeaSchema);