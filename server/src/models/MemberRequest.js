import mongoose from "mongoose";

const memberRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    memberType: {
      type: String,
      enum: ["honorary", "general"],
      default: "general",
    },
    membershipFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "approved_by_president",
        "approved_by_secretary",
        "approved",
        "rejected",
      ],
      default: "pending",
    },
    approvals: {
      president: { type: Boolean, default: false },
      secretary: { type: Boolean, default: false },
    },
    paidConfirmedByAccountant: { type: Boolean, default: false },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("MemberRequest", memberRequestSchema);
