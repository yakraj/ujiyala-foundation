import mongoose from 'mongoose';
const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  amount: { type: Number, required: true },
  verified: { type: Boolean, default: false },
  // who added the donation
  addedBy: { type: String },
  // who verified the payment
  verifiedBy: { type: String },
  // new field: payment verified flag (alias for verified) kept for clarity
  paymentVerified: { type: Boolean, default: false },
  // who received the payment (accountant id or name)
  receivedBy: { type: String },
  method: { type: String, enum: ['cash','upi','bank','card','other'], default: 'cash' },
  date: { type: Date, default: Date.now },
  note: { type: String },
  receiptPdfPath: { type: String }
}, { timestamps: true });
export default mongoose.model('Donation', donationSchema);
