import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        name: String,
        github: String,
        slack: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastSync: {
        type: String,
        default: 'Recently'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Project', projectSchema);
