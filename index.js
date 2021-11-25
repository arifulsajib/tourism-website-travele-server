const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mongodb connection string
const { MongoClient } = require("mongodb");
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.19q2o.mongodb.net:27017,cluster0-shard-00-01.19q2o.mongodb.net:27017,cluster0-shard-00-02.19q2o.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-9mitof-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();

    const database = client.db("tourism-website");
    const toursCollection = database.collection("tours");
    const bookingsCollection = database.collection("bookings");

    // Get all tours
    app.get("/tours", async (req, res) => {
      const query = {};
      const result = await toursCollection.find(query).toArray();
      res.json(result);
    });

    // Get tours by id
    app.get("/tour/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toursCollection.findOne(query);
      res.send(result);
    });

    // add Tours
    app.post("/addTour", async (req, res) => {
      const result = await toursCollection.insertOne(req.body);
      res.send(result);
    });

    //add booking
    app.post("/addBooking", async (req, res) => {
      const result = await bookingsCollection.insertOne(req.body);
      res.send(result);
    });

    // get all bookings
    app.get("/allBookings", async (req, res) => {
      const result = await bookingsCollection.find({}).toArray();
      res.send(result);
    });

    // get my bookings
    app.get("/myBookings/:email", async (req, res) => {
      const result = await bookingsCollection
        .find({
          email: req.params.email
        })
        .toArray();
      res.send(result);
    });

    //Update status
    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "success"
        }
      };
      const result = await bookingsCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // delete event
    app.delete("/deleteBooking/:id", async (req, res) => {
      const result = await bookingsCollection.deleteOne({
        _id: ObjectId(req.params.id)
      });
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Server home
app.get("/", (req, res) => {
  res.send("Tourism server home");
});

app.listen(port, () => {
  console.log("listening to port ", port);
});
