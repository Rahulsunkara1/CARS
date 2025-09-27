import express from "express";
import connectDb from "./config/dbConnection.js";
import carRoutes from "./routes/cars.js";
import userRoutes from "./routes/users.js";
import errorHandler from "./middleware/errors.js";

const app = express();
const port = process.env.PORT || 5001;

app.use(express.static("public"));
app.use(express.json()); //So that req.body is not undefined
app.use("/api/cars", carRoutes);
app.use("/api/users", userRoutes);
app.use(errorHandler);

// Only start listening once the DB connection is established. This prevents
// the process from exiting immediately with ECONNREFUSED when Mongo isn't
// ready yet (common in Docker Compose).
connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    // connectDb already logs and exits on failure, but handle promise rejection
    console.error(
      "Failed to connect to DB, server not started:",
      err && err.message
    );
  });
