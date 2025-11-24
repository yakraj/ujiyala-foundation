import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    membershipNo: { type: String, unique: true, sparse: true }, // PM-0001 or GM-0001
    memberType: {
      type: String,
      enum: ["honorary", "general"],
      default: "general",
    },
    refId: { type: String, unique: true, default: () => uuidv4() }, // Unique reference ID
    joinedOn: { type: Date, default: Date.now },
    membershipFee: { type: Number, default: 0 },
    // receiptPdfPath removed (PDF receipts disabled)
    // who added the member (user id)
    addedBy: { type: String },
    // approvals when created via request or direct add
    approvedBy: {
      president: { type: Boolean, default: false },
      secretary: { type: Boolean, default: false },
    },
    createdViaRequest: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export default mongoose.model("Member", memberSchema);
