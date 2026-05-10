const mongoose = require('mongoose');

const fundUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    identity: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    whyneed: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("FundUser", fundUserSchema);