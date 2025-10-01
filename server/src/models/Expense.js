import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    by: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: "general" },
    note: { type: String },
    receiptImagePath: { type: String },
    receiptImagePublicId: { type: String },
  },
  { timestamps: true }
);
export default mongoose.model("Expense", expenseSchema);
