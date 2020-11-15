//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://lakshayne:tyrell@cluster0.siopf.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true }, { useUnifiedTopology: true });

const itemSchema = {
  name: String
};
const listSchema = {
  name: String,
  items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const lists = mongoose.model("list", listSchema);

const item1 = new Item({
  name: "Eat"
});

const item2 = new Item({
  name: "Sleep"
});

const item3 = new Item({
  name: "wave"
});




app.get("/", function (req, res) {
  Item.find({}, function (err, result) {
    if (err) {
      console.log(err.message);
    }
    else {
      if (result.length == 0) {
        Item.insertMany([item1, item2, item3], function (err) {
          if (err) {
            console.log(err.message);
          }
          else {
            console.log("inserted");
          }
        });
        res.redirect("/");
      }
      else
        res.render("list", { listTitle: "Today", newListItems: result });
    }
  });

});

app.post("/", function (req, res) {
    const item = req.body.newItem;
    const newItem = new Item({
    name: item
  });
  if(req.body.list==='today'){
    newItem.save();
    res.redirect('/');
  }
  else{
    lists.findOne({name:req.body.list},function(err,foundlist){
    foundlist.items.push(newItem);
    foundlist.save();
    res.redirect('/'+req.body.list);
  });
}
});

app.post("/delete", function (req, res) {
  const checkItemId=req.body.checkbox;
  const listName=req.body.listname;
  console.log(checkItemId);
  console.log(listName);
  if(listName==='Today'){
    Item.findByIdAndRemove({ _id: req.body.checkbox }, function (err) {
      if (err)
        console.log(err.message);
      else
        console.log("deleted");
    });
    res.redirect('/');
  }
  else{
    lists.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}},function(err,foundList){
      if(!err)
      res.redirect('/'+listName);
    });
  }
  
});


app.get("/:randomListName",function (req, res) {
  lists.findOne({ name: req.params.randomListName} ,function(err,foundlist){
    if(!err){
      if(!foundlist){
        console.log("list not Existed before");
        console.log(req.params.randomListName);
        console.log(foundlist);
    const newList = new lists({
      name: req.params.randomListName,
      items: [item1, item2, item3]
    });
    newList.save();
    console.log("inserted");
    res.redirect('/'+req.params.randomListName);
      }
      else {
        res.render("list",{listTitle:req.params.randomListName,newListItems:foundlist.items})
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000 || process.env.PORT, function () {
  console.log("Server started on port 3000");
});
