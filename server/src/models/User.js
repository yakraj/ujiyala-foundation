import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  // roles expanded for NGO: president, vice_president, accountant, secretary, member
  // include 'admin' for backwards-compatibility with existing records
  role: { type: String, enum: ['president','vice_president','accountant','secretary','member','admin'], default: 'member' },
  // memberType: honorary, general - include 'founder' as a valid type (case-insensitive input will be normalized)
  memberType: { type: String, enum: ['honorary','general','founder'], default: 'general' },
  // initial paid amount (for membership)
  initialPaidAmount: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('User', userSchema);
