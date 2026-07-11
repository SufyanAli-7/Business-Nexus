import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startupName: {
        type: String,
        required: true
    },
    logoUrl: {
        type: String,
        default: ""
    },
    industry: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    equity: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'],
        default: 'Due Diligence'
    },
    stage: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
