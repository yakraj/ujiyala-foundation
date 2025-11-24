import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import Member from "../models/Member.js";
import MemberRequest from "../models/MemberRequest.js";

// Helper function to generate next membership number
async function generateMembershipNo(memberType) {
  const prefix = memberType === "honorary" ? "PM" : "GM";

  // Find the highest membership number for this type
  const existingMembers = await Member.find({
    membershipNo: { $regex: `^${prefix}-` },
  })
    .sort({ membershipNo: -1 })
    .limit(1);

  let nextNumber = 1;
  if (existingMembers.length > 0) {
    const lastNo = existingMembers[0].membershipNo;
    const lastNumStr = lastNo.split("-")[1];
    nextNumber = parseInt(lastNumStr, 10) + 1;
  }

  // Format with leading zeros (e.g., PM-0126)
  const formattedNumber = String(nextNumber).padStart(4, "0");
  return `${prefix}-${formattedNumber}`;
}

const router = express.Router();

const createSchema = {
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    membershipFee: z.number().min(0).default(0),
  }),
};

router.post(
  "/",
  requireAuth,
  validate(createSchema),
  async (req, res, next) => {
    try {
      // Attach approvedBy flags based on creator role (so we can filter for accountants)
      const payload = { ...req.body };
      payload.createdViaRequest = false;
      payload.addedBy = req.user?.sub;
      payload.approvedBy = { president: false, secretary: false };
      if (req.user?.role === "president") payload.approvedBy.president = true;
      if (req.user?.role === "secretary") payload.approvedBy.secretary = true;

      const member = await Member.create(payload);
      res.json({ ok: true, member });
    } catch (e) {
      next(e);
    }
  }
);

// Member request flow
const requestSchema = {
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    memberType: z.enum(["honorary", "general"]).optional().default("general"),
    membershipFee: z.number().min(0).default(0),
  }),
};

router.post(
  "/requests",
  requireAuth,
  validate(requestSchema),
  async (req, res, next) => {
    try {
      const data = { ...req.body, createdBy: req.user.sub };
      const mr = await MemberRequest.create(data);
      res.json({ ok: true, request: mr });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/requests", requireAuth, async (req, res, next) => {
  try {
    const reqs = await MemberRequest.find().sort({ createdAt: -1 }).limit(200);
    const User = (await import("../models/User.js")).default;
    const enriched = await Promise.all(
      reqs.map(async (r) => {
        const obj = r.toObject();
        if (obj.createdBy) {
          const u = await User.findById(obj.createdBy).select("name");
          obj.createdByName = u?.name || obj.createdBy;
        }
        return obj;
      })
    );
    res.json({ ok: true, requests: enriched });
  } catch (e) {
    next(e);
  }
});

// Filtered requests by role — accept POST so client can send role in body if needed
router.post("/requests/filter", requireAuth, async (req, res, next) => {
  try {
    const role = req.body?.role || req.user?.role;
    const reqs = await MemberRequest.find().sort({ createdAt: -1 }).limit(200);
    const User = (await import("../models/User.js")).default;
    const enriched = await Promise.all(
      reqs.map(async (r) => {
        const obj = r.toObject();
        if (obj.createdBy) {
          const u = await User.findById(obj.createdBy).select("name");
          obj.createdByName = u?.name || obj.createdBy;
        }
        return obj;
      })
    );

    let filtered = enriched;
    if (role === "accountant") {
      // accountants should only see requests that have both approvals
      filtered = enriched.filter(
        (r) =>
          r.approvals &&
          r.approvals.president &&
          r.approvals.secretary &&
          !r.paidConfirmedByAccountant
      );
    } else if (role === "president") {
      // presidents should only see requests they haven't approved yet
      filtered = enriched.filter(
        (r) => !(r.approvals && r.approvals.president)
      );
    } else if (role === "secretary") {
      // secretaries should only see requests they haven't approved yet
      filtered = enriched.filter(
        (r) => !(r.approvals && r.approvals.secretary)
      );
    } else {
      // other roles see none
      filtered = [];
    }

    res.json({ ok: true, requests: filtered });
  } catch (e) {
    next(e);
  }
});

// Also accept GET for compatibility (role via query or from token)
router.get("/requests/filter", requireAuth, async (req, res, next) => {
  try {
    const role = req.query?.role || req.user?.role;
    const reqs = await MemberRequest.find().sort({ createdAt: -1 }).limit(200);
    const User = (await import("../models/User.js")).default;
    const enriched = await Promise.all(
      reqs.map(async (r) => {
        const obj = r.toObject();
        if (obj.createdBy) {
          const u = await User.findById(obj.createdBy).select("name");
          obj.createdByName = u?.name || obj.createdBy;
        }
        return obj;
      })
    );

    let filtered = enriched;
    if (role === "accountant") {
      // accountants should only see requests that have both approvals
      filtered = enriched.filter(
        (r) => r.approvals && r.approvals.president && r.approvals.secretary
      );
    } else if (role === "president") {
      // presidents should only see requests they haven't approved yet
      filtered = enriched.filter(
        (r) => !(r.approvals && r.approvals.president)
      );
    } else if (role === "secretary") {
      // secretaries should only see requests they haven't approved yet
      filtered = enriched.filter(
        (r) => !(r.approvals && r.approvals.secretary)
      );
    } else {
      // other roles see none
      filtered = [];
    }

    res.json({ ok: true, requests: filtered });
  } catch (e) {
    next(e);
  }
});

// Approve by president or secretary
router.post("/requests/:id/approve", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const userRole = req.user.role;
    const mr = await MemberRequest.findById(id);
    if (!mr) return res.status(404).json({ ok: false, message: "Not found" });
    if (userRole === "president") mr.approvals.president = true;
    if (userRole === "secretary") mr.approvals.secretary = true;
    // update status
    if (mr.approvals.president && mr.approvals.secretary)
      mr.status = "approved";
    else if (mr.approvals.president) mr.status = "approved_by_president";
    else if (mr.approvals.secretary) mr.status = "approved_by_secretary";
    await mr.save();
    res.json({ ok: true, request: mr });
  } catch (e) {
    next(e);
  }
});

// bulk approve (president/secretary can call with list of ids)
router.post("/requests/approve-bulk", requireAuth, async (req, res, next) => {
  try {
    const ids = req.body?.ids || [];
    const userRole = req.user.role;
    const results = [];
    for (const id of ids) {
      const mr = await MemberRequest.findById(id);
      if (!mr) continue;
      if (userRole === "president") mr.approvals.president = true;
      if (userRole === "secretary") mr.approvals.secretary = true;
      if (mr.approvals.president && mr.approvals.secretary)
        mr.status = "approved";
      else if (mr.approvals.president) mr.status = "approved_by_president";
      else if (mr.approvals.secretary) mr.status = "approved_by_secretary";
      await mr.save();
      results.push(mr.toObject());
    }
    res.json({ ok: true, results });
  } catch (e) {
    next(e);
  }
});

// bulk confirm payment (accountant only)
router.post("/requests/confirm-bulk", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "accountant")
      return res.status(403).json({ ok: false, message: "Forbidden" });
    const ids = req.body?.ids || [];
    const results = [];
    for (const id of ids) {
      const mr = await MemberRequest.findById(id);
      if (!mr) continue;
      mr.paidConfirmedByAccountant = true;
      await mr.save();
      if (mr.status === "approved" && mr.paidConfirmedByAccountant) {
        // Generate membership number based on type
        const membershipNo = await generateMembershipNo(mr.memberType);

        // Transfer ALL data from request to member
        const member = await Member.create({
          name: mr.name,
          email: mr.email,
          phone: mr.phone,
          address: mr.address,
          memberType: mr.memberType,
          membershipNo: membershipNo,
          membershipFee: mr.membershipFee,
          approvedBy: mr.approvals || { president: false, secretary: false },
          createdViaRequest: true,
          addedBy: mr.createdBy,
          joinedOn: mr.createdAt, // Use request creation date as join date
        });
        await member.save();
        mr.status = "approved";
        await mr.save();
        results.push({ request: mr.toObject(), member: member.toObject() });
      } else {
        results.push({ request: mr.toObject() });
      }
    }
    res.json({ ok: true, results });
  } catch (e) {
    next(e);
  }
});

// Accountant confirms payment
router.post(
  "/requests/:id/confirm-payment",
  requireAuth,
  async (req, res, next) => {
    try {
      if (req.user.role !== "accountant")
        return res.status(403).json({ ok: false, message: "Forbidden" });
      const id = req.params.id;
      const mr = await MemberRequest.findById(id);
      if (!mr) return res.status(404).json({ ok: false, message: "Not found" });
      mr.paidConfirmedByAccountant = true;
      await mr.save();
      // when all clear, create actual Member and credit membershipFee
      if (mr.status === "approved" && mr.paidConfirmedByAccountant) {
        // Generate membership number based on type
        const membershipNo = await generateMembershipNo(mr.memberType);

        // Transfer ALL data from request to member
        const member = await Member.create({
          name: mr.name,
          email: mr.email,
          phone: mr.phone,
          address: mr.address,
          memberType: mr.memberType,
          membershipNo: membershipNo,
          membershipFee: mr.membershipFee,
          approvedBy: mr.approvals || { president: false, secretary: false },
          createdViaRequest: true,
          addedBy: mr.createdBy,
          joinedOn: mr.createdAt, // Use request creation date as join date
        });
        await member.save();
        // update request status
        mr.status = "approved";
        await mr.save();
        return res.json({ ok: true, member, request: mr });
      }
      res.json({ ok: true, request: mr });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/", requireAuth, async (req, res, next) => {
  try {
    // For privacy: accountants should only see members that have been approved by both president and secretary
    const query = {};
    if (req.user?.role === "accountant") {
      query["approvedBy.president"] = true;
      query["approvedBy.secretary"] = true;
    }
    console.debug("/api/members called by", {
      sub: req.user?.sub,
      role: req.user?.role,
      query,
    });
    const members = await Member.find(query).sort({ createdAt: -1 }).limit(200);
    console.debug("members returned:", members.length);
    res.json({ ok: true, members });
  } catch (e) {
    next(e);
  }
});

export default router;
