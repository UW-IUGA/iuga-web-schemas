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
    organizationSchema
};
