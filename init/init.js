const mongoose = require("mongoose");
const initData = require("./data.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/transaction";
const Listing = require("../models/schema.js");

async function main() {
    await mongoose.connect(MONGO_URL);
}

main().then(res => console.log("connection establish with database succesfully"))
.catch(err=>console.log(err));

const initDB =async () =>{
    await Listing.deleteMany({});
   await Listing.insertMany(initData.data);
};
console.log(initData);
initDB();
console.log("data is initilized");
