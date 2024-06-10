const mongoose = require('mongoose')

const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Connected to database successfully");
    } catch (error) {
        console.log("Error connected to database");
        console.log(error);     
    }
}

module.exports = connectDb