import mongoose from 'mongoose';


/* Events Schema:
    image fields such as ePics are handled by Multer.
*/
const eventsSchema = new mongoose.Schema({
    eName: { type: String, required: true },
    eOrganizers: { type: String, required: true },
    eStartDate: { type: Date, required: true },
    eEndDate: Date,
    eAltLink: {
        title: { type: String, required: false },
        url: { type: String, required: false }
    },
    eLocation: { type: String, required: true },
    eDescription: { type: String, required: true },
    eThumbnailPath: String,
    eLabels: [String],
    eParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participants' }],
    eShowParticipants: { type: Boolean, default: true },
    eRsvpEnabled: { type: Boolean, default: true },
    rsvpQuestions: [{
        qId: { type: String, required: true },
        qString: { type: String, required: true }
    }]
})

/* Feedback Schema:
    Participant information for a given event.
*/
const participantsSchema = new mongoose.Schema({
    pUID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    eID: { type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true },  //
    rsvpAnswers: [{
        qId: { type: String, required: true },
        aString: { type: String, required: true }
    }],
    confirmationEmailSent: { type: Boolean, default: false },
    reminderEmailSent: { type: Boolean, default: false },
})

/* Feedback Schema:
    Saving information submitted via the feedback form.
*/
const feedbackSchema = new mongoose.Schema({
    fUID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    fType: { type: String, default: "General" },
    fTopic: { type: String, required: true },
    fDescription: { type: String, required: true },
    fRating: Number
})

/* Users Schema:
    Basic information when a user signs up
    Default user account type is Member, unless otherwise noted.
*/
const usersSchema = new mongoose.Schema({
    uId: Number,
    // uPic: {
    //     data: Buffer,
    //     contentType: String
    // },
    uFirstName: String,
    uLastName: String,
    uDisplayName: String,
    uEmail: String,
    uNetId: { type: String, sparse: true, unique: true },
    // uBio: String,
    // uMajor: {type:String, default: ""},
    uType: { type: String, default: "Member" },
    uPrivate: { type: Boolean, default: false }
})

/* Roles Schema:
    Defines a reusable officer role and the backend permissions it grants.
    roleKey is the stable internal identifier; roleName is shown to users.
*/
const rolesSchema = new mongoose.Schema({
    roleName: { type: String, required: true, trim: true },
    roleKey: { type: String, required: true, unique: true, lowercase: true, trim: true },
    roleDescription: { type: String, default: "" },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null }
}, { timestamps: true })

/* Role Assignments Schema:
    Connects users to roles, committees, and reporting relationships.
    assignedBy identifies the authenticated user who made the assignment.
*/
const roleAssignmentsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roles', required: true },
    committeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Committees', default: null },
    reportsToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    assignedAt: { type: Date, default: Date.now },
    deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    deactivatedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

roleAssignmentsSchema.index({ userId: 1, isActive: 1 })
roleAssignmentsSchema.index({ roleId: 1, isActive: 1 })

/* Event Requests Schema:
    Tracks an event from officer submission through publication and operations.
*/
const eventRequestsSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    eventName: { type: String, required: true, trim: true, maxlength: 120 },
    requestingGroup: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    proposedStartDate: { type: Date, required: true },
    proposedEndDate: Date,
    audience: { type: String, trim: true, maxlength: 500 },
    rsvpEnabled: { type: Boolean, default: true },
    rsvpQuestions: [{ qId: String, qString: String }],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'changes_requested', 'approved', 'denied', 'completed', 'cancelled'],
        default: 'submitted'
    },
    submittedAt: { type: Date, default: Date.now },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    changesRequestedAt: Date,
    changesRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    changesRequestedReason: { type: String, trim: true, maxlength: 2000 },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    deniedAt: Date,
    deniedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    denialReason: { type: String, trim: true, maxlength: 2000 },
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    publishedEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Events', default: null },
    checkpoints: [{
        key: {
            type: String,
            enum: ['proposal', 'meeting', 'finance', 'room', 'marketing', 'purchases', 'completion', 'review'],
            required: true
        },
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        notes: { type: String, trim: true, maxlength: 2000 },
        link: { type: String, trim: true, maxlength: 1000 },
        completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
        completedAt: { type: Date, default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
        updatedAt: { type: Date, default: null }
    }],
    finance: {
        allocatedCents: { type: Number, min: 0, default: null },
        actualSpendCents: { type: Number, min: 0, default: null },
        notes: { type: String, trim: true, maxlength: 2000 },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
        approvedAt: { type: Date, default: null }
    },
    booking: {
        location: { type: String, trim: true, maxlength: 500 },
        startDate: Date,
        endDate: Date,
        notes: { type: String, trim: true, maxlength: 2000 },
        bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
        bookedAt: { type: Date, default: null }
    },
    slideTemplate: {
        name: { type: String, trim: true, maxlength: 120 },
        url: { type: String, trim: true, maxlength: 1000 },
        version: { type: String, trim: true, maxlength: 80 }
    },
    reviewLink: { type: String, trim: true, maxlength: 1000 },
    reviewReceivedAt: Date,
    reviewReceivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null }
}, { timestamps: true })

eventRequestsSchema.index({ status: 1, proposedStartDate: 1 })
eventRequestsSchema.index({ requesterId: 1, createdAt: -1 })

/* Event Reviews Schema:
    Stores the required organizer and distinct-member post-event reviews.
*/
const eventReviewsSchema = new mongoose.Schema({
    eventRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventRequests', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    reviewerRole: { type: String, enum: ['organizer', 'member'], required: true },
    attendeeCount: { type: Number, min: 0 },
    whatWentWell: { type: String, trim: true, maxlength: 2000 },
    whatMissedExpectations: { type: String, trim: true, maxlength: 2000 },
    totalSpentCents: { type: Number, min: 0 },
    locationReview: { type: String, trim: true, maxlength: 2000 },
    timingReview: { type: String, trim: true, maxlength: 2000 },
    extenuatingCircumstances: { type: String, trim: true, maxlength: 2000 }
}, { timestamps: true })

eventReviewsSchema.index({ eventRequestId: 1, reviewerRole: 1 }, { unique: true })
eventReviewsSchema.index({ eventRequestId: 1, reviewerId: 1 }, { unique: true })

/* Officers Schema:
    ofUID refers to the officer's user id.
*/
const officersSchema = new mongoose.Schema({
    offTitle: { type: String, required: true },
    offDescription: { type: String, required: true },
    offTermYear: Number,
    offUID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    offPic: {
        data: Buffer,
        contentType: String
    },
    offSocials: [{
        platform: String,
        link: String
    }]
})

/* Committees Schema:
    The cmeMembers field will be an array of userID along with their chosen committee pic.
*/
const committeesSchema = new mongoose.Schema({
    cmeName: { type: String, required: true },
    cmeDescription: { type: String, required: true },
    cmeYear: { type: Number, required: true },
    cmeMembers: [{
        cmeUID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        memberPic: {
            data: Buffer,
            contentType: String
        }
    }]
})

/* Organization Schema:
    For storing both org logo and name.
*/
const organizationSchema = new mongoose.Schema({
    orgName: { type: String, required: true },
    orgPic: {
        data: Buffer,
        contentType: String
    }
})

const safeIntegerValidator = {
    validator: (val) => val === undefined || val === null || (Number.isSafeInteger(val) && val >= 0),
    message: "{VALUE} must be a non-negative safe integer"
};

/* Shop Catalog Entry Schema */
const catalogEntrySchema = new mongoose.Schema({
    skuKey: { type: String, required: true },
    catalogVersion: { type: String, required: true },
    dropKey: { type: String, required: true },
    productKey: { type: String, required: true },
    title: { type: String, required: true },
    variant: {
        size: { type: String, default: null },
        color: { type: String, default: null },
        style: { type: String, default: null }
    },
    imageKey: { type: String, default: null },
    fulfillmentSku: { type: String, required: true },
    currency: { type: String, default: "usd" },
    unitAmountCents: { type: Number, required: true, validate: safeIntegerValidator },
    priceId: { type: String, default: null },
    taxCode: { type: String, default: null },
    inventoryPolicy: { type: String, enum: ["finite", "preorder"], default: "finite" },
    availableFrom: { type: Date, default: null },
    availableUntil: { type: Date, default: null },
    maxPerOrder: { type: Number, default: 5 },
    isEnabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
catalogEntrySchema.index({ skuKey: 1, dropKey: 1, catalogVersion: 1 }, { unique: true });

/* Shop Drop Schema */
const shopDropSchema = new mongoose.Schema({
    dropKey: { type: String, required: true, unique: true },
    opensAt: { type: Date, required: true },
    closesAt: { type: Date, required: true },
    isEnabled: { type: Boolean, default: true },
    catalogVersion: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

/* Inventory Counter Schema */
const inventoryCounterSchema = new mongoose.Schema({
    fulfillmentSku: { type: String, required: true, unique: true },
    available: { type: Number, required: true, min: 0 },
    reserved: { type: Number, required: true, min: 0, default: 0 },
    consumed: { type: Number, required: true, min: 0, default: 0 },
    version: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

/* Inventory Reservation Schema */
const inventoryReservationSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    skuKey: { type: String, required: true },
    fulfillmentSku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    state: { type: String, enum: ["reserved", "consumed", "released"], default: "reserved" },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
inventoryReservationSchema.index({ orderId: 1, skuKey: 1 }, { unique: true });
inventoryReservationSchema.index({ skuKey: 1, state: 1, expiresAt: 1 });

/* Checkout Attempt Schema */
const checkoutAttemptSchema = new mongoose.Schema({
    owner: {
        type: { type: String, default: "user" },
        userId: { type: String, required: true }
    },
    attemptKey: { type: String, required: true },
    providerIdempotencyKey: { type: String, required: true },
    attemptCart: { type: String, required: true },
    items: [{
        skuKey: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    catalogVersion: { type: String, required: true },
    dropKey: { type: String, required: true },
    quoteSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    frozenStripeRequest: { type: mongoose.Schema.Types.Mixed, default: null },
    expiresAt: { type: Date, required: true },
    firstSubmissionAt: { type: Date, default: null },
    status: {
        type: String,
        enum: ["pending", "dispatching", "ready", "reconciliation_required", "expired", "failed"],
        default: "pending"
    },
    orderId: { type: String, required: true },
    sessionId: { type: String, default: null },
    paymentIntentId: { type: String, default: null },
    providerMode: { type: String, default: null },
    providerAccountId: { type: String, default: null },
    providerApiVersion: { type: String, default: null },
    reconciliationReason: { type: String, default: null },
    lastErrorCode: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
checkoutAttemptSchema.index({ "owner.type": 1, "owner.userId": 1, attemptKey: 1 }, { unique: true });
checkoutAttemptSchema.index(
    { providerMode: 1, providerAccountId: 1, sessionId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            providerMode: { $type: "string" },
            providerAccountId: { $type: "string" },
            sessionId: { $type: "string" }
        }
    }
);
checkoutAttemptSchema.index(
    { providerMode: 1, providerAccountId: 1, paymentIntentId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            providerMode: { $type: "string" },
            providerAccountId: { $type: "string" },
            paymentIntentId: { $type: "string" }
        }
    }
);

/* Order Schema */
const orderSchema = new mongoose.Schema({
    owner: {
        type: { type: String, default: "user" },
        userId: { type: String, required: true }
    },
    orderReference: { type: String, required: true, unique: true },
    items: [{
        skuKey: { type: String, required: true },
        title: { type: String, required: true },
        variant: { type: String, default: null },
        quantity: { type: Number, required: true, min: 1 },
        unitAmountCents: { type: Number, required: true, validate: safeIntegerValidator },
        subtotalCents: { type: Number, required: true, validate: safeIntegerValidator }
    }],
    currency: { type: String, default: "usd" },
    totalCents: { type: Number, required: true, validate: safeIntegerValidator },
    quoteSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    settlementSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    receiptEmail: { type: String, default: null },
    fulfillmentMethod: { type: String, enum: ["pickup", "shipping"], default: "pickup" },
    paymentState: { type: String, enum: ["pending", "paid"], default: "pending" },
    fulfillmentState: {
        type: String,
        enum: ["pending", "preparing", "ready_for_pickup", "picked_up", "shipped", "delivered", "on_hold", "cancelled"],
        default: "pending"
    },
    fulfillmentHold: {
        reason: { type: String, default: null },
        placedAt: { type: Date, default: null },
        // The fulfilment state the order was in when the hold was placed, so lifting the hold can
        // put the order back where it was.
        returnToState: { type: String, default: null }
    },
    trackingNumber: { type: String, default: null },
    refundState: { type: String, enum: ["none", "partial", "full"], default: "none" },
    pendingRefundCents: { type: Number, default: 0, validate: safeIntegerValidator },
    refundedCents: { type: Number, default: 0, validate: safeIntegerValidator },
    dispute: {
        state: { type: String, enum: ["none", "open", "won", "lost", "closed"], default: "none" },
        reason: { type: String, default: null },
        evidenceDueBy: { type: Date, default: null }
    },
    paidAt: { type: Date, default: null },
    version: { type: Number, required: true, default: 0 },
    claim: {
        claimedBy: { type: String, default: null },
        claimExpiresAt: { type: Date, default: null },
        claimNumber: { type: Number, required: true, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
orderSchema.index({ "owner.type": 1, "owner.userId": 1, createdAt: -1, _id: -1 });

/* Refund Operation Schema */
const refundOperationSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    commandId: { type: String, required: true, unique: true },
    providerIdempotencyKey: { type: String, required: true },
    firstSubmissionAt: { type: Date, default: null },
    providerRefundId: { type: String, default: null },
    providerAccountId: { type: String, default: null },
    providerMode: { type: String, default: null },
    amountCents: { type: Number, required: true, validate: safeIntegerValidator },
    currency: { type: String, default: "usd" },
    commandState: {
        type: String,
        enum: ["created", "submitting", "reconciliation_required", "resolved"],
        default: "created"
    },
    providerStatus: {
        type: String,
        enum: ["pending", "requires_action", "succeeded", "failed", "canceled", null],
        default: null
    },
    reason: { type: String, default: null },
    requestedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
refundOperationSchema.index(
    { providerAccountId: 1, providerMode: 1, providerRefundId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            providerAccountId: { $type: "string" },
            providerMode: { $type: "string" },
            providerRefundId: { $type: "string" }
        }
    }
);

/* Dispute Schema */
const disputeSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    providerDisputeId: { type: String, required: true },
    providerAccountId: { type: String, default: null },
    providerMode: { type: String, default: null },
    amountCents: { type: Number, required: true, validate: safeIntegerValidator },
    currency: { type: String, default: "usd" },
    status: {
        type: String,
        enum: [
            "warning_needs_response",
            "warning_under_review",
            "warning_closed",
            "needs_response",
            "under_review",
            "charge_refunded",
            "won",
            "lost"
        ],
        required: true
    },
    reason: { type: String, default: null },
    evidenceDueBy: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
disputeSchema.index(
    { providerAccountId: 1, providerMode: 1, providerDisputeId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            providerAccountId: { $type: "string" },
            providerMode: { $type: "string" },
            providerDisputeId: { $type: "string" }
        }
    }
);

/* Received Stripe Event Schema */
const receivedStripeEventSchema = new mongoose.Schema({
    accountId: { type: String, required: true },
    livemode: { type: Boolean, required: true },
    eventId: { type: String, required: true },
    eventType: { type: String, required: true },
    apiVersion: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: null },
    status: {
        type: String,
        enum: ["received", "processing", "processed", "stopped"],
        default: "received"
    },
    attempts: { type: Number, required: true, default: 0 },
    retryAfter: { type: Date, default: Date.now },
    claimedBy: { type: String, default: null },
    claimExpiresAt: { type: Date, default: null },
    claimNumber: { type: Number, required: true, default: 0 },
    lastErrorCode: { type: String, default: null },
    stoppedAt: { type: Date, default: null }
});
receivedStripeEventSchema.index({ accountId: 1, livemode: 1, eventId: 1 }, { unique: true });
receivedStripeEventSchema.index({ status: 1, retryAfter: 1 });

/* Order Activity Schema */
const orderActivitySchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    actor: {
        type: { type: String, required: true },
        userId: { type: String, default: null }
    },
    action: { type: String, required: true },
    beforeFacts: { type: mongoose.Schema.Types.Mixed, default: null },
    afterFacts: { type: mongoose.Schema.Types.Mixed, default: null },
    reason: { type: String, default: null },
    correlationId: { type: String, default: null },
    occurredAt: { type: Date, default: Date.now }
});

/* Pending Work Schema */
const pendingWorkSchema = new mongoose.Schema({
    dedupeKey: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    kind: {
        type: String,
        enum: ["receipt_email", "fulfillment_notice", "operator_alert"],
        required: true
    },
    payload: { type: mongoose.Schema.Types.Mixed, default: null },
    status: {
        type: String,
        enum: ["pending", "delivering", "delivered", "stopped"],
        default: "pending"
    },
    attempts: { type: Number, required: true, default: 0 },
    retryAfter: { type: Date, default: Date.now },
    claimedBy: { type: String, default: null },
    claimExpiresAt: { type: Date, default: null },
    claimNumber: { type: Number, required: true, default: 0 },
    deliveredAt: { type: Date, default: null },
    lastErrorCode: { type: String, default: null },
    stoppedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
pendingWorkSchema.index({ status: 1, retryAfter: 1 });

/* Stripe Payment Evidence Schema */
const stripePaymentEvidenceSchema = new mongoose.Schema({
    source: {
        type: String,
        enum: ["signed_webhook", "authenticated_server_retrieval"],
        required: true
    },
    observedAt: { type: Date, required: true },
    recordedAt: { type: Date, default: Date.now },
    accountId: { type: String, required: true },
    livemode: { type: Boolean, required: true },
    apiVersion: { type: String, default: null },
    eventId: { type: String, default: null },
    eventType: { type: String, default: null },
    objectType: { type: String, required: true },
    objectId: { type: String, required: true },
    orderId: { type: String, default: null },
    attemptId: { type: String, default: null },
    sessionId: { type: String, default: null },
    paymentIntentId: { type: String, default: null },
    amountCents: { type: Number, default: null, validate: safeIntegerValidator },
    currency: { type: String, default: "usd" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
    matchState: {
        type: String,
        enum: ["matched", "unmatched", "held"],
        default: "held"
    }
});
stripePaymentEvidenceSchema.index({ accountId: 1, livemode: 1, objectType: 1, objectId: 1 });
stripePaymentEvidenceSchema.index({ orderId: 1, observedAt: -1 });

/* Stripe Scan Progress Schema */
const stripeScanProgressSchema = new mongoose.Schema({
    accountId: { type: String, required: true },
    livemode: { type: Boolean, required: true },
    lastEventCreatedAt: { type: Date, default: null },
    lastEventId: { type: String, default: null },
    claimedBy: { type: String, default: null },
    claimExpiresAt: { type: Date, default: null },
    claimNumber: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});
stripeScanProgressSchema.index({ accountId: 1, livemode: 1 }, { unique: true });

export {
    eventsSchema,
    participantsSchema,
    feedbackSchema,
    usersSchema,
    rolesSchema,
    roleAssignmentsSchema,
    eventRequestsSchema,
    eventReviewsSchema,
    officersSchema,
    committeesSchema,
    organizationSchema,
    catalogEntrySchema,
    shopDropSchema,
    inventoryCounterSchema,
    inventoryReservationSchema,
    checkoutAttemptSchema,
    orderSchema,
    refundOperationSchema,
    disputeSchema,
    receivedStripeEventSchema,
    orderActivitySchema,
    pendingWorkSchema,
    stripePaymentEvidenceSchema,
    stripeScanProgressSchema
};

