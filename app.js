const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const MONGO_URL = "mongodb://127.0.0.1:27017/transaction";
const Listing = require("./models/schema.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

async function main() {
    await mongoose.connect(MONGO_URL);
}

main().then(res => console.log("connection establish with database succesfully"))
.catch(err=>console.log(err));

app.get("/listing",async(req,res)=>{
    let allLists = await Listing.find();
    res.render("index.ejs",{allLists});
});

app.get("/listing/show",async(req,res)=>{
    let {month}=req.query;
    // month=month.toString().padStart(2,"0");

    let allLists = await Listing.find();
    let date;
    let totalSale=0;
    let totalSoldItem=0;
    let totalNotSoldItem=0;
    for(let list of allLists){
         date = list.dateOfSale.toString().split("-")[1];
        //  console.log(date==month.toString().padStart(2,"0"));
         if (month.toString().padStart(2,"0") === date){
            console.log(list);
            if(list.sold===true){
                totalSoldItem+=1;
                totalSale+=list.price;
            }else{
                totalNotSoldItem+=1;
            }
         }
    }
    
    console.log(date,month,totalSale );
    res.render("show.ejs",{totalSale,totalSoldItem,totalNotSoldItem});
});

app.listen(8080,()=>{
    console.log("server is listening");
})
