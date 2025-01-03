require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.68dnu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const needVolunteer = client.db("volunteerDB").collection("needVolunteer");
    const volunteerRequest = client.db("volunteerDB").collection("volunteerRequest");

    // get all volunteer post
    app.get("/needVolunteer", async (req, res) => {
      const cursor = needVolunteer.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get volunteer post by close deadline
    app.get("/topNeedVolunteer", async (req, res) => {
      const cursor = needVolunteer.find().sort({ deadline: 1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get specific volunteer post
    app.get("/volunteerPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await needVolunteer.findOne(query);
      res.send(result);
    });

    // add volunteer request
    app.post("/volunteerRequest", async (req, res) => {
      const newRequest = req.body;
      const result = await volunteerRequest.insertOne(newRequest);
      res.send(result);
    });

    // get requested volunteers
    app.get("/volunteerRequest", async (req, res) => {
      const cursor = volunteerRequest.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get all jobs posted by a specific user
    app.get("/post/:email", async (req, res) => {
      const email = req.params.email;
      const query = { organizerEmail: email };
      const result = await needVolunteer.find(query).toArray();
      res.send(result);
    });

    // Update a post in db
    app.put("/updatePost/:id", async (req, res) => {
      const id = req.params.id;
      const postData = req.body;
      const updated = {
        $set: postData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await needVolunteer.updateOne(query, updated, options);
      res.send(result);
    });

    // delete a post from db
    app.delete("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await needVolunteer.deleteOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("VolunVibe Server Is Running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port: ${port}`);
});
