import mongoose from 'mongoose';
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  joinedOn: { type: Date, default: Date.now },
  membershipFee: { type: Number, default: 0 },
  receiptPdfPath: { type: String }
}, { timestamps: true });
export default mongoose.model('Member', memberSchema);
