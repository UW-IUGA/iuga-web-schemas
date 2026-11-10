import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import {
  rolesSchema,
  roleAssignmentsSchema,
  shopHoldsSchema,
  shopPurchasesSchema,
} from "../schemas.js";

const Roles = mongoose.model("Roles", rolesSchema);
const RoleAssignments = mongoose.model("RoleAssignments", roleAssignmentsSchema);
const ShopHolds = mongoose.model("ShopHolds", shopHoldsSchema);
const ShopPurchases = mongoose.model("ShopPurchases", shopPurchasesSchema);
const studentId = new mongoose.Types.ObjectId();
const officerId = new mongoose.Types.ObjectId();
const confirmedAt = new Date("2026-11-05T18:00:00Z");

function checkoutPurchase() {
  return {
    holdId: new mongoose.Types.ObjectId(),
    userId: studentId,
    catalogId: "fall-merch",
    catalogVersion: "v1",
    venmoUsername: "example-student",
    lines: [{ sku: "crewneck", name: "Crewneck", size: "M", quantity: 1, unitPriceCents: 3200 }],
    totalCents: 3200,
    status: "paid",
    confirmedAt,
  };
}

test("board roles retain permissions and assignment lifecycle data", async () => {
  const permissions = ["users.roles.manage", "events.requests.manage", "shop.purchases.review"];
  const role = new Roles({ roleName: "Board officer", roleKey: "board-officer", permissions });
  await role.validate();
  assert.deepEqual(role.toObject().permissions, permissions);
  assert.equal(role.isActive, true);

  const lifecycle = {
    userId: studentId,
    roleId: role._id,
    assignedBy: officerId,
    committeeId: new mongoose.Types.ObjectId(),
    reportsToUserId: officerId,
    assignedAt: confirmedAt,
    expiresAt: new Date("2027-06-30T00:00:00Z"),
    isActive: false,
    deactivatedBy: officerId,
    deactivatedAt: new Date("2026-11-06T18:00:00Z"),
  };
  const assignment = new RoleAssignments(lifecycle);
  await assignment.validate();
  const stored = assignment.toObject();
  for (const field of Object.keys(lifecycle)) {
    assert.deepEqual(stored[field], lifecycle[field], field);
  }
});

test("existing purchases keep checkout data and receive safe review defaults", async () => {
  const existing = checkoutPurchase();
  const purchase = ShopPurchases.hydrate(existing);
  await purchase.validate();
  const stored = purchase.toObject();
  for (const field of Object.keys(existing)) {
    assert.deepEqual(stored[field], existing[field], field);
  }
  assert.equal(stored.reviewRevision, 0);
  assert.equal(stored.amountReceivedCents, null);
  assert.equal(stored.awaitingStudentReply, false);
  assert.equal(stored.followUpStatus, null);
  assert.equal(stored.pickedUpAt, null);
  assert.equal(stored.pickedUpBy, null);
  assert.deepEqual(stored.reviewHistory, []);
});

test("shop holds retain the reservation needed to confirm a purchase", async () => {
  const purchase = checkoutPurchase();
  const reservation = {
    userId: purchase.userId,
    catalogId: purchase.catalogId,
    catalogVersion: purchase.catalogVersion,
    lines: purchase.lines,
    status: "confirmed",
    expiresAt: new Date("2026-11-05T18:15:00Z"),
    purchaseId: new mongoose.Types.ObjectId(),
  };
  const hold = new ShopHolds(reservation);
  await hold.validate();
  const stored = hold.toObject();
  for (const field of Object.keys(reservation)) {
    assert.deepEqual(stored[field], reservation[field], field);
  }
});

test("purchase reviews retain payment, follow-up, pickup, and officer history", async () => {
  const history = [
    { kind: "payment", from: "pending", to: "paid", changedBy: officerId, at: confirmedAt, afterPickup: false },
    { kind: "amount_received", from: "none", to: "3200", changedBy: officerId, at: confirmedAt },
    { kind: "follow_up", from: "none", to: "contacted", changedBy: officerId, at: confirmedAt },
    { kind: "pickup", from: "not_picked_up", to: "picked_up", changedBy: officerId, at: confirmedAt },
    { kind: "note", title: "Receipt checked", note: "Confirmed in Venmo", changedBy: officerId, at: confirmedAt },
  ];
  const review = {
    reviewRevision: 5,
    amountReceivedCents: 3200,
    awaitingStudentReply: true,
    followUpStatus: "contacted",
    followUpUpdatedBy: officerId,
    followUpUpdatedAt: confirmedAt,
    pickedUpAt: confirmedAt,
    pickedUpBy: officerId,
    reviewHistory: history,
  };
  const purchase = new ShopPurchases({ ...checkoutPurchase(), ...review });
  await purchase.validate();
  const stored = purchase.toObject();
  for (const field of Object.keys(review)) {
    assert.deepEqual(stored[field], review[field], field);
  }
});

test("invalid review amounts and unattributed history are rejected", async () => {
  const purchase = new ShopPurchases({
    ...checkoutPurchase(),
    amountReceivedCents: -1,
    reviewHistory: [{ kind: "payment", from: "pending", to: "paid", at: confirmedAt }],
  });
  await assert.rejects(purchase.validate(), (error) => {
    assert.ok(error.errors.amountReceivedCents);
    assert.ok(error.errors["reviewHistory.0.changedBy"]);
    return true;
  });
});
