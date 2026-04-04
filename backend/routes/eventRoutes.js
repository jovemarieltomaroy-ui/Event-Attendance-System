const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/eventController');

router.post('/record-attendance', recordAttendance);
router.post('/remove-attendance', removeAttendance);
router.get('/stats', getAttendanceStats);
router.get('/stats/college', getAttendanceByCollege);
router.get('/stats/eventAtt', getEventAttendanceCounts);


router.route('/')
    .get(getEvents)
    .post(createEvent);

router.route('/:id')
    .get(getEvent)
    .put(updateEvent)
    .delete(deleteEvent);

module.exports = router;