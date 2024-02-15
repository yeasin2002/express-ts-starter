import mongoose, { ConnectOptions } from "mongoose";
import { mongoUrl } from "./exportEnv";

export const connectDB = async (options: ConnectOptions = {}) => {
    try {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(mongoUrl, options);
            console.log("MongoDB Connected");
        }
    } catch (error) {
        console.log("MongoDB Connection Failed");
    }
};
