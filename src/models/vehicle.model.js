import mongoose from "mongoose";
const VehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    callSign: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [],
    },

    lastMaintenance: {
      type: String,
      required: true,
    },
    nextMaintenance: {
      type: String,
      required: true,
    },
    fuelLevel: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { Timestamp: true }
);
const Vehicle = mongoose.model("Vehicle", VehicleSchema);
export { Vehicle };
