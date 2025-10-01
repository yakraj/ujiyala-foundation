import mongoose from 'mongoose';
const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash','upi','bank','card','other'], default: 'cash' },
  date: { type: Date, default: Date.now },
  note: { type: String },
  receiptPdfPath: { type: String }
}, { timestamps: true });
export default mongoose.model('Donation', donationSchema);
