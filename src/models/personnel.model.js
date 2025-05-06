import mongoose from "mongoose";
const personnelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  badge: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["on-duty", "off-duty", "on-leave", "training"],
  },
  team: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});
const Personnel = mongoose.model("Personnel", personnelSchema);
export { Personnel };
