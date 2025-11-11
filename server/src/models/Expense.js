import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    by: { type: String, required: true },
    amount: { type: Number, required: true },
  category: { type: String, default: "general" },
  // kept old 'Description' key for backward-compatibility with existing docs
  Description: { type: String },
  // prefer using `note` (matches API field) and `description` (lowercase) for clarity
  note: { type: String },
  description: { type: String },
    receiptImagePath: { type: String },
    receiptImagePublicId: { type: String },
  },
  { timestamps: true }
);
export default mongoose.model("Expense", expenseSchema);
