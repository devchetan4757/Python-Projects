import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  score: { type: Number, required: true },
  verdict: { type: String, required: true },
  
}, { timestamps: true });

export default mongoose.model("Report",
 HistorySchema);

