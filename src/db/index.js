import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);
    const conInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n Mongo DB connected DB HOST: ${conInstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongo DB connection error: ", error);
    process.exit(1);
  }
};

export default connectDB;
