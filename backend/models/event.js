const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    }, 
    eventDate: {
        type: Date,
        required: [true, 'Event date is required'],
        default: Date.now 
    },
    attendees: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        checkInTime: { type: Date, default: Date.now },
        method: { type: String, enum: ['QR', 'Manual'], default: 'Manual' }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);