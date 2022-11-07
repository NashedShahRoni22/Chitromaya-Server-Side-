const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());
require("dotenv").config();


app.get("/", (req, res) => {
  res.send("Chitromaya Server is running");
});

app.listen(port, () => {
  console.log(`Chitromaya Server Running on ${port}`);
});
