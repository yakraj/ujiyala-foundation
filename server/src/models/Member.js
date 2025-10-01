import mongoose from 'mongoose';
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  joinedOn: { type: Date, default: Date.now },
  membershipFee: { type: Number, default: 0 },
  receiptPdfPath: { type: String },
  // who added the member (user id)
  addedBy: { type: String },
  // approvals when created via request or direct add
  approvedBy: {
    president: { type: Boolean, default: false },
    secretary: { type: Boolean, default: false }
  },
  createdViaRequest: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Member', memberSchema);
