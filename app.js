const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Nhattien98:Nhattien12@cluster0.wmycumr.mongodb.net/todolistDB", {useNewUrlParser: true})

const itemsSchema = {
  name : String,
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: 'Welcome to my todolist!'
});
const item2= new Item({
  name: 'Click + button to add a new item.'
});
const item3 = new Item({
  name: '<== Click here to delete an item.'
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length ===0) {
      Item.insertMany(defaultItems, (err)=> {
        if (err) {
          console.log(err);
        } else {
          console.log("Sucessfully save to DB");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems})
    }
  });

});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req,res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) =>{
      if (!err) {
        console.log("Successfully remove this item from DB");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
}); 

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList) => {
    if (!err){
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  }})  
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});