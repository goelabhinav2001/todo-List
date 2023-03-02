const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const app = express();
const _ = require("lodash");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.text());
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://iit2020112:hiitsme@cluster0.ad2eypm.mongodb.net/todoListDB');



const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


const Item1 = new Item({
  name: "Welcome to your todolist"
})
const Item2 = new Item({
  name: "Hit the + button to add a new item"
})

const Item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [Item1, Item2, Item3];
// Item.insertMany(defaultItems, function(err)
// {
//   if(err)
//   console.log(err);
//   else
//   console.log("successfully saved");
// })

app.get("/", function(req, res) {
  // let day = date.getDay();
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("successfully saved");
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        listItem: foundItems
      });
    }
  })

});

app.get('/:listName', function(req, res) {
  const customListName = _.capitalize(req.params.listName);

  List.findOne({name : customListName},function(err,foundList)
{
  if(!err)
  {
    if(!foundList )
    {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
        list.save();
        res.redirect("/" + customListName);
    }
    else {

      res.render("list", {
        listTitle: foundList.name,
        listItem: foundList.items
      });
    }
  }
})

})

app.get("/temp", function(req, res) {
  res.render("about", {
  })
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.button;
  const item4 = new Item({
    name: itemName
  });

    if(listName==="Today")
    {
      item4.save();
      res.redirect("/");
    }
    else
    {
      List.findOne({name: listName}, function(err,foundList)
    {
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/" + listName);
    });
    }

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==='Today')
  {
    Item.deleteOne({
      _id: checkedItemId
    }, function(err) {
      if (err)
        console.log(err);
      else
        console.log("Deleted Successfully");
      res.redirect("/");
    })
  }
  else
  {
    List.findOneAndUpdate({name: listName},{$pull: {items: { _id: checkedItemId}}}, function(err,foundList){
      if(!err)
      {
        res.redirect("/" + listName);
      }
    })
  }
})



app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
