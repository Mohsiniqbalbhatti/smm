import mongoose from "mongoose";

const updateSchema = new mongoose.Schema({
  ApiName: { type: String, required: true },
  serviceId: { type: Number, required: true },
  name: { type: String, required: true },
  changeType: { type: String, required: true }, // 'added', 'updated', 'removed'

  timestamp: { type: Date, default: Date.now },
});

const Update = mongoose.model("Update", updateSchema);
export default Update;
