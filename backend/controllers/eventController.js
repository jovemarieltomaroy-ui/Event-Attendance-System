const Event = require('../models/event');
const Student = require('../models/student');

// Get all events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single event 
const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('attendees.student', 'studentID studentName');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create event
const createEvent = async (req, res) => {
    try {
        const { eventName, eventDate } = req.body;

        const event = await Event.create({
            eventName,
            eventDate,
            attendees: []
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        const { eventName, eventDate } = req.body;

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { eventName, eventDate },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Record Attendance (FIXED)
const recordAttendance = async (req, res) => {
    try {
        const { studentID, eventId } = req.body;
        const student = await Student.findOne({ studentID });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const alreadyExists = event.attendees.some(
            a => a.student?.toString() === student._id.toString()
        );

        if (alreadyExists) {
            return res.status(400).json({ message: "Attendance already recorded" });
        }

        event.attendees.push({
            student: student._id,
            method: "Manual"
        });

        await event.save();

        res.json({
            message: `Attendance recorded for ${student.studentName}`
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove Attendance
const removeAttendance = async (req, res) => {
    try {
        const { studentID, eventId } = req.body;

        const student = await Student.findOne({ studentID });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const exists = event.attendees.some(
            a => a.student?.toString() === student._id.toString()
        );

        if (!exists) {
            return res.status(400).json({ message: "Student is not in attendance" });
        }

        event.attendees = event.attendees.filter(
            a => a.student?.toString() !== student._id.toString()
        );

        await event.save();

        res.json({
            message: `Attendance removed for ${student.studentName}`
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Attendance Stats
const getAttendanceStats = async (req, res) => {
    try {
        const { eventId } = req.query;
        let matchStage = {};
        
        if (eventId && eventId !== 'all') {
            const mongoose = require('mongoose');
            matchStage = { _id: new mongoose.Types.ObjectId(eventId) };
        }

        const stats = await Event.aggregate([
            { $match: matchStage },
            { $unwind: "$attendees" },
            {
                $lookup: {
                    from: "students",
                    localField: "attendees.student",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" },
            {
                $facet: {
                    totalParticipation: [{ $count: "count" }],
                    byYearLevel: [
                        {
                            $group: {
                                _id: "$studentInfo.yearLevel",
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ]
                }
            }
        ]);

        const result = {
            total: stats[0].totalParticipation[0]?.count || 0,
            yearLevels: stats[0].byYearLevel || []
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Attendance per College 
const getAttendanceByCollege = async (req, res) => {
    try {
        const { eventId } = req.query;
        
        let matchStage = {};
        if (eventId) {
            
            const mongoose = require('mongoose');
            matchStage = { _id: new mongoose.Types.ObjectId(eventId) };
        }

        const result = await Event.aggregate([
            { $match: matchStage }, 
            { $unwind: "$attendees" },
            {
                $lookup: {
                    from: "students",
                    localField: "attendees.student",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" },
            {
                $group: {
                    _id: "$studentInfo.college",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Attendance per Event 
const getEventAttendanceCounts = async (req, res) => {
    try {
        const result = await Event.aggregate([
            { $unwind: "$attendees" },

            {
                $lookup: {
                    from: "students",
                    localField: "attendees.student",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" },
            {
                $facet: {
                    totalPerEvent: [
                        {
                            $group: {
                                _id: "$eventName",
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } }
                    ],
                    perCollege: [
                        {
                            $group: {
                                _id: {
                                    event: "$eventName",
                                    college: "$studentInfo.college"
                                },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { "_id.event": 1, count: -1 } }
                    ],
                    perYearLevel: [
                        {
                            $group: {
                                _id: {
                                    event: "$eventName",
                                    yearLevel: "$studentInfo.yearLevel"
                                },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { "_id.event": 1, "_id.yearLevel": 1 } }
                    ]
                }
            }
        ]);

        res.json(result[0]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    recordAttendance,
    removeAttendance,
    getAttendanceStats,
    getAttendanceByCollege,
    getEventAttendanceCounts
};