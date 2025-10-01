import Donation from '../models/Donation.js';
import Member from '../models/Member.js';
import Expense from '../models/Expense.js';

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

  const [expensesAgg] = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const expenses = expensesAgg?.total || 0;

  const remaining = donations + membership - expenses;
  return { donations, membership, expenses, remaining };
}
