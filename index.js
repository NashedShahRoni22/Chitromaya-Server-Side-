const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());
require("dotenv").config();

//mongobd connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.auieprw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicefCollection = client.db("chitromayaDb").collection("services");
    //data limit 3
    app.get("/servicesThree", async (req, res) => {
      const query = {};
      const cursor = servicefCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });
    //no limit of loading data
    app.get("/services", async (req, res) => {
        const query = {};
        const cursor = servicefCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
    });
    //service details
    app.get("/services/:id", async(req, res) =>{
        id = req.params.id;
        const query = {_id: ObjectId(id)};
        const serviceDetails = await servicefCollection.findOne(query);
        res.send(serviceDetails);
    })
  } finally {
  }
}

run().catch((e) => console.error(e));

app.get("/", (req, res) => {
  res.send("Chitromaya Server is running");
});

app.listen(port, () => {
  console.log(`Chitromaya Server Running on ${port}`);
});
