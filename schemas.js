import mongoose from 'mongoose';


/* Events Schema:
    image fields such as ePics are handled by Multer.
*/
export const eventsSchema = new mongoose.Schema({
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
export const participantsSchema = new mongoose.Schema({
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
export const feedbackSchema = new mongoose.Schema({
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
export const usersSchema = new mongoose.Schema({
    uId: Number,
    // uPic: {
    //     data: Buffer,
    //     contentType: String
    // },
    uFirstName: String,
    uLastName: String,
    uDisplayName: String,
    uEmail: String,
    // uBio: String,
    // uMajor: {type:String, default: ""},
    uType: { type: String, default: "Member" },
    uPrivate: { type: Boolean, default: false }
})

/* Officers Schema:
    ofUID refers to the officer's user id.
*/
export const officersSchema = new mongoose.Schema({
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
export const committeesSchema = new mongoose.Schema({
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
export const organizationSchema = new mongoose.Schema({
    orgName: { type: String, required: true },
    orgPic: {
        data: Buffer,
        contentType: String
    }
})