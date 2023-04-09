var express = require("express");
var bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.set("strictQuery","ture");
mongoose.connect("mongodb://127.0.0.1:27017/todolist");

const app = express();
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("item",itemSchema);

    const item1 = new Item({
        name: " welcome to do list "
    });
    const item2 = new Item({
        name:"press + to add the new item"
    });
    const item3 = new Item({
        name: " <--- press to delete the item"
    });

    const defaultitems = [item1,item2,item3];

    const listSchema = new mongoose.Schema({
        name: String,
        item: [itemSchema]
    });

    const List =  mongoose.model("List",listSchema);
    
app.get("/",function(req,res){
    //we use find beacuse it return us array
    Item.find({},function(err,founditem){
        if (founditem.length==0){
            Item.insertMany(defaultitems,function(err){
                if (err){
                    console.log(err);
                    
                }
                else{
                    console.log("data saved to database successfully");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{titlelist:"Today",list:founditem});
        }
    });

});



    app.get("/:listName",function(req,res){
        const x = _.capitalize(req.params.listName);
        
        List.findOne({name:x},function(err,foundlist){
           if (!err){
            if(!foundlist){
                
                // console.log(" does not exist");
                const list = new List({
                    name:x,
                    item: defaultitems
                });
                list.save();
                res.redirect("/" + x);
            }
            else{
                // console.log("exist");
                res.render("list",{titlelist:foundlist.name,list:foundlist.item});
            }
           }
        });
        

    });

    app.post("/",function(req,res){
        const posteditem = req.body.item;
        const listitem = req.body.list;

        
        const item4 = new Item({
            name: posteditem
        });

        if (listitem === "Today"){
            item4.save();
            res.redirect("/");
        }
        else {
            List.findOne({name:listitem},function(err,foundlist){
                foundlist.item.push(item4);
                foundlist.save();
                res.redirect("/" + listitem);
            });
        }
        
        
        
    });

    app.post("/delete",function(req,res){
        const deleteitem = req.body.checkbox;
        const Listname = req.body.Listname;

        if (Listname === "Today"){
            Item.findByIdAndRemove(deleteitem,function(err){
                if (!err){
                    console.log("the data delete from database succesfully");
                }
                
                res.redirect("/");
            });
        }
        else {
            List.findOneAndUpdate({name:Listname},{$pull:{item:{_id:deleteitem}}},function(err){
                if (!err){
                    res.redirect("/"+Listname);
                }
            });
        }
        
    });



app.listen("3000",function(){
    console.log("the server is running in local host");
});




