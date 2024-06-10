const dotenv = require("dotenv");
const express = require("express");
const app = express();
const cors = require("cors");
const connectDb = require("./config/connectdb");
const Port = process.env.PORT || 5000;
dotenv.config();
const userRoutes = require("./routes/userRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);

app.listen(Port, () => {
  connectDb();
  console.log(`The app is running at http://localhost:${Port}`);
});
