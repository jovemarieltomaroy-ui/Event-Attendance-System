const fs = require('fs');
const csv = require('csv-parser');
const Student = require('../models/student');
const Event = require('../models/event');

//Get All Students
const getStudents = async (req, res) => {
    try {
        const { college, search } = req.query;
        let query = {};

        if (college && college !== 'ALL') query.college = college;
        if (search) {
            query.$or = [
                { studentName: { $regex: search, $options: 'i' } },
                { studentID: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await Student.find(query).sort({ yearLevel: 1, course: 1, studentName: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single student
const getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a single student
const createStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Create students in bulk and CSV update and insert
const bulkCreateStudents = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file.' });

        const results = [];
        const filePath = req.file.path;

        fs.createReadStream(filePath)
            .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const ops = results.map(student => ({
                        updateOne: {
                            filter: { studentID: student.studentID },
                            update: { $set: student },
                            upsert: true
                        }
                    }));
                    const bulkRes = await Student.bulkWrite(ops);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

                    res.status(201).json({
                        message: 'Import processed successfully.',
                        details: {
                            created: bulkRes.upsertedCount,
                            updated: bulkRes.modifiedCount
                        }
                    });
                } catch (dbError) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    res.status(400).json({ message: 'Database error', error: dbError.message });
                }
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Student
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await Event.updateMany(
            { "attendees.student": student._id }, 
            { $pull: { attendees: { student: student._id } } }
        );

        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student and attendance logs deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// System Backup Students and Attendance
const exportStudentsJSON = async (req, res) => {
    try {
        const students = await Student.find();
        const events = await Event.find().populate('attendees.student');
        
        const backupData = {
            backupTitle: "Full System Backup",
            timestamp: new Date().toLocaleString(),
            collections: {
                studentCount: students.length,
                eventCount: events.length
            },
            students: students,
            events: events
        };

        const fileName = `full_backup_${Date.now()}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(JSON.stringify(backupData, null, 2));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    getStudent,
    createStudent,
    bulkCreateStudents,
    updateStudent,
    deleteStudent,
    exportStudentsJSON
};