const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentID: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true,
    },
    studentName: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    yearLevel:{
        type: Number,
        required: [true, 'Year Level is required'],
        min: [1, 'Year level cannot be less than 1'],
        max: [4, 'Year level cannot be more than 4']
    },
    college: {
        type: String,
        required: [true, 'College is required'],
        trim: true
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        trim: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);