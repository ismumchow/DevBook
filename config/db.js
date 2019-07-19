const mongoose = require('mongoose');
const config = require('config'); 
const db = config.get('mongoURI'); 

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true
        });
        console.log("mongodb connected");
    } catch (error) {
        console.log(error.message); 
        process.exit(1); // exit process w/ failiure
    }
};

module.exports = connectDB;