import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  by: { type: String },
  note: { type: String },
});

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    by: { type: String, required: true },
    amount: { type: Number, required: true }, // Total paid so far
    totalAmount: { type: Number }, // Total bill amount (for partial payments)
    paymentType: {
      type: String,
      enum: ["complete", "partial"],
      default: "complete",
    },
    status: { type: String, enum: ["paid", "partial"], default: "paid" },
    payments: [paymentSchema], // History of payments
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
