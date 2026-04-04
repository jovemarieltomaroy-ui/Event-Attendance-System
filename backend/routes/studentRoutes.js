const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkCreateStudents,
    exportStudentsJSON 
} = require('../controllers/studentController');


router.route('/')
    .get(getStudents)
    .post(createStudent);


router.post('/upload', upload.single('file'), bulkCreateStudents);

router.get('/export-json', exportStudentsJSON); 

router.route('/:id')
    .get(getStudent)
    .put(updateStudent)
    .delete(deleteStudent);

module.exports = router;