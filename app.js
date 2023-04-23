const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


async function main() {
  await mongoose.connect("mongodb+srv://2710rismi:sHUBHAM%40456@cluster0.8zvrghh.mongodb.net/todolistDB");
}
main();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


  const itemsSchema = new mongoose.Schema({
      name: String
  });

  const Item = mongoose.model("Item", itemsSchema);

  const item1 = new Item({
    name : "Welcome to your to do list"
  });
  const item2 = new Item({
    name : "Press the + button to add item"
  });
  const item3 = new Item({
    name : "<-- Hit this to delete an item"
  });

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name:String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List",listSchema);




app.get("/", function(req, res) {
  Item.find()
    .then((items) =>{
      if(items.length === 0){
        Item.insertMany(defaultItems).then(result => {
          console.log(result);
        });
        res.redirect("/");
      }
      else{
        console.log(items);
        res.render("list", {listTitle: "Today", newListItems: items});
      }

    })
    .catch((error)=>{
      console.log(error)
      res.sendStatus(500);
    })
  ;


});

app.get("/:customeListName", function(req,res){
  const custom = _.capitalize(req.params.customeListName);

  List.findOne({name: custom})
    .then(function(foundList){
      if(!foundList){
        const list = new List({
          name: custom,
          items : defaultItems
        });
        list.save();

        res.redirect("/" + custom);
      }
      else{
        res.render("list" , { listTitle: foundList.name , newListItems: foundList.items})
      }
    })
  ;


});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
      .then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
    ;
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
      .then((doc) => {
        console.log('Document removed:', doc);
        res.redirect("/");
      })
      .catch((err) => {
        console.log('Error:', err);
      })
    ;
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
      .then(function(){
        res.redirect("/"+listName);
      })
      .catch(function(err){
        if(!err){
          res.redirect("/" + listName);
        }
        else{
          console.log(err);
        }
      })
    ;
  }



});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
