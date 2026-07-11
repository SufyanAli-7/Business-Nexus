import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['entrepreneur', 'investor']
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },

    // Entrepreneur specific fields
    startupName: {
        type: String,
        default: ''
    },
    pitchSummary: {
        type: String,
        default: ''
    },
    fundingNeeded: {
        type: String,
        default: ''
    },
    industry: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    foundedYear: {
        type: Number
    },
    teamSize: {
        type: Number,
        default: 0
    },

    // Investor specific fields
    investmentInterests: {
        type: [String],
        default: []
    },
    investmentStage: {
        type: [String],
        default: []
    },
    portfolioCompanies: {
        type: [String],
        default: []
    },
    totalInvestments: {
        type: Number,
        default: 0
    },
    minimumInvestment: {
        type: String,
        default: ''
    },
    maximumInvestment: {
        type: String,
        default: ''
    },
    resetPasswordToken: {
        type: String,
        default: ''
    },
    resetPasswordExpiresAt: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const User = mongoose.model("User", userSchema);

export default User;
