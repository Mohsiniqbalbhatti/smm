import mongoose from "mongoose";

const CurrencyRateSchema = new mongoose.Schema({
  currency: { type: String, required: true, unique: true },
  rate: { type: Number, required: true },
});

export default mongoose.model("CurrencyRate", CurrencyRateSchema);
