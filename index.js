const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
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
    const servicesCollection = client.db("chitromayaDb").collection("services");
    const reviewsCollection = client.db("chitromayaDb").collection("reviews");
    //jwt token function
    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      if(!authHeader){
        return res.status(401).send({message:'unauthorized access'})
      }
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
          return res.status(403).send({message:'user forbidden from access'})
        }
        req.decoded = decoded;
        next();
      })
    }
    
    //data load limit 3 api
    app.get("/servicesThree", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });
    //no limit of service data load api
    app.get("/services", async (req, res) => {
        const query = {};
        const cursor = servicesCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
    });
    //service details api
    app.get("/services/:id", async(req, res) =>{
        id = req.params.id;
        const query = {_id: ObjectId(id)};
        const serviceDetails = await servicesCollection.findOne(query);
        res.send(serviceDetails);
    })

    //new service post api
    app.post("/services", async(req, res)=>{
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    })

    //reviews post api
    app.post("/reviews", async(req, res)=>{
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    })

    //reviews get api
    app.get("/reviews", async(req,res)=>{
      let query = {};
      if(req.query.serviceId){
        query = {
          serviceId:req.query.serviceId
        }
      }
      const cursor = reviewsCollection.find(query); 
      const reviews = await cursor.toArray();
      res.send(reviews);
    })
    
    //reviews get api
    app.get("/userReviews", verifyJWT, async(req,res)=>{
      const decoded = req.decoded;
      if(decoded.email !== req.query.userEmail){
        return res.status(401).send({message:'unauthorized access'})
      }

      let query = {};
      if(req.query.userEmail){
        query = {
          userEmail:req.query.userEmail
        }
      }
      const cursor = reviewsCollection.find(query); 
      const userreviews = await cursor.toArray();
      res.send(userreviews);
    })
    //update reviews api
    // app.patch("/userReviews/:id", async(req, res)=>{
    //   const id = req.params.id;
    //   const reviewTxt = req.body.reviewTxt;
    //   const query={_id:ObjectId(id)};
    //   const updatedDoc ={
    //     $set:{
    //       reviewTxt:reviewTxt
    //     }
    //   }
    //   const result = await reviewsCollection.updateOne(query, updatedDoc);
    //   res.send(result);
    // })

    //jwt api
    app.post('/jwt',(req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10h'});
      res.send({token});
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
