import Donation from '../models/Donation.js';
import Member from '../models/Member.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

export async function computeSummary() {
  const [donationsAgg] = await Donation.aggregate([
    // sum only verified donations
    { $match: { verified: true } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const donations = donationsAgg?.total || 0;

  const [membersAgg] = await Member.aggregate([
    { $group: { _id: null, total: { $sum: '$membershipFee' } } }
  ]);
  const membership = membersAgg?.total || 0;

  // Include any initialPaidAmount set on user accounts (founders or admins who've paid membership)
  const [usersAgg] = await User.aggregate([
    { $group: { _id: null, total: { $sum: '$initialPaidAmount' } } }
  ]);
  const initialPaid = usersAgg?.total || 0;

  const [expensesAgg] = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const expenses = expensesAgg?.total || 0;

  const membershipTotal = membership + initialPaid;
  const remaining = donations + membershipTotal - expenses;
  return { donations, membership: membershipTotal, expenses, remaining };
}
