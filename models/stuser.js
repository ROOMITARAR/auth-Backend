const mongoose = require('mongoose');

const stuserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String, // You might want to use an enum for gender, e.g., 'Male', 'Female', 'Other'
        required: true
    },
    cgpa: {
        type: Number, // Assuming CGPA is a numeric value
        required: true
    },
    transcriptFile: {
        type: String
    },
    transcriptFileName: {
        type: String
    },
    transcriptMimeType: {
        type: String
    }
});

module.exports = mongoose.model("stuser", stuserSchema);
