const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// creo uno Schema
const UserSchema = new Schema({
    // creo gli attributi dello Schema. Sono tutti jsObjects.
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    } 
});

// creo il modello
mongoose.model("users", UserSchema);