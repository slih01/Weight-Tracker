const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler")


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://darren:mazah4@weightcluster-2vr2i.mongodb.net/weightTracker?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Weight Schema and Model
const weightSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,

  },
  date: String,
  change: Number
});

const Weight = mongoose.model("Weight", weightSchema);

// Get date
const todaysDay = new Date().getDate();
const todaysMonth = new Date().getMonth();
const todaysYear = new Date().getFullYear();
const todaysDate = todaysDay + "/" + todaysMonth + "/" + todaysYear;



app.get("/", function(req, res) {
  Weight.find({}, function(err, foundWeights) {
    if (err) {
      console.log(err)
      res.status(500).send();
    } else {
      res.render("home", {
        weightData: foundWeights,
      })
    }
  })
});


app.post("/", (req, res) => {

// Get previous weight
  const changeInWeight = new Promise((resolve, reject) => {
    Weight.find({}, (err, foundWeights) => {
      if (err) {
        console.log(err)
      } else {
        if (foundWeights.length === 0) {
          resolve(req.body.weight)
        } else {
          const previousWeight = foundWeights[foundWeights.length - 1];
          resolve(previousWeight.weight)
        }
      }
    })

  });

  changeInWeight.then((result) => {
    const weightInput = (req.body.weight);

    // Change weight to lbs if in kgs and return to 2 decimal places//
    const unitOfWeight = req.body.weightFormat;

    function convertWeightToLbs(weight) {
      if (unitOfWeight === "lbs") {
        return (weight)
      }
      if (unitOfWeight === "kgs") {
        return weight * 2.20462
      }
    }
    const weightInLbs = Number(convertWeightToLbs(weightInput)).toFixed(2);

    const weightChange = Number(weightInLbs - result).toFixed(2);

// Create and save new document to database
    const weightEntry = new Weight({
      weight: weightInLbs,
      date: todaysDate,
      change: weightChange
    })

    weightEntry.save()

    res.redirect("/")

  }).catch((result) => {
    console.log(result);
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
