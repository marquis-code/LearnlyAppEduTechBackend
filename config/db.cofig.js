const mongoose = require('mongoose');
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
let MONGOURI = process.env.MONGODB_URI
const connectDB = async () => {
    try {
        await mongoose.connect(MONGOURI, dbOptions);
        console.log('Connection to database was successful');
    } catch (error) {
        console.log('Connection to MongoDB Failed', error);
    }
}
module.exports = connectDB;
