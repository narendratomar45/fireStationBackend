import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import userRouter from "#routes/user.route.js";
import personnelRouter from "#routes/personnel.route.js";
import vehicleRouter from "#routes/vehicle.route.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://beautiful-dasik-ad7383.netlify.app",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow request
      } else {
        callback(new Error("Not allowed by CORS")); // Block request
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("Public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server started via GET request");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/personnel", personnelRouter);
app.use("/api/v1/vehicles", vehicleRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});
export default app;
