import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; 
import './masterlist.css';

const STUDENT_API = 'http://localhost:5001/api/students';

function Masterlist() {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCollege, setSelectedCollege] = useState('ALL');
    
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false); 
    const [currentId, setCurrentId] = useState(null); 
    
    const [selectedQR, setSelectedQR] = useState(null); 
    const [newStudent, setNewStudent] = useState({
        studentID: '',
        studentName: '',
        email: '',
        yearLevel: '',
        college: '',
        course: ''
    });

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(STUDENT_API);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

  
    const handleDownloadPNG = () => {
        const canvas = document.querySelector(".printable-content canvas");
        if (!canvas) {
            alert("QR Code not found");
            return;
        }
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${selectedQR.studentID}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudent(prev => ({ ...prev, [name]: value }));
    };

    
    const handleEditClick = (student) => {
        setIsEditing(true);
        setCurrentId(student._id);
        setNewStudent({
            studentID: student.studentID,
            studentName: student.studentName,
            email: student.email,
            yearLevel: student.yearLevel,
            college: student.college,
            course: student.course || student.program
        });
        setShowModal(true);
    };

    
    const handleSubmitStudent = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
               
                await axios.put(`${STUDENT_API}/${currentId}`, {
                    ...newStudent,
                    yearLevel: Number(newStudent.yearLevel)
                });
                alert("Student updated successfully!");
            } else {
                
                await axios.post(STUDENT_API, {
                    ...newStudent,
                    yearLevel: Number(newStudent.yearLevel)
                });
                alert("Student added successfully!");
            }
            
            closeModal();
            fetchStudents();
        } catch (err) {
            alert("Operation failed: " + (err.response?.data?.message || err.message));
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentId(null);
        setNewStudent({ studentID: '', studentName: '', email: '', yearLevel: '', college: '', course: '' });
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                const cleanId = String(id).split(':')[0].trim();
                await axios.delete(`${STUDENT_API}/${cleanId}`); 
                setStudents(prev => prev.filter(s => s._id !== id));
                alert("Student deleted successfully.");
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    const handleDownloadBackup = () => {
        window.location.href = `${STUDENT_API}/export-json`;
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            setLoading(true);
            const res = await axios.post(`${STUDENT_API}/upload`, formData);
            alert(`${res.data.message}`);
            fetchStudents();
        } catch (err) { 
            alert("Upload failed."); 
        } finally { 
            setLoading(false); 
            event.target.value = null; 
        }
    };

    const uniqueColleges = ["ALL", ...new Set(students.map(s => s.college).filter(Boolean))];

    const filteredStudents = students.filter(s => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = s.studentName.toLowerCase().includes(term) || String(s.studentID).includes(term);
        const matchesCollege = selectedCollege === 'ALL' || s.college === selectedCollege;
        return matchesSearch && matchesCollege;
    });

    return (
        <div className="home-wrapper">
            <div className="content-card">
                <h1 className="masterlist-title">Masterlist</h1>
                
                <div className="action-bar">
                    <div className="search-group">
                        <input type="text" className="search-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button className="search-btn">Search</button>
                    </div>

                    <div className="button-group">
                        <button className="add-btn" onClick={() => { setIsEditing(false); setShowModal(true); }}>Add Student</button>
                        <input type="file" id="csvUpload" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                        <button className="upload-btn" onClick={() => document.getElementById('csvUpload').click()}>
                            {loading ? "..." : "Upload CSV"}
                        </button>
                        <button className="backup-btn" onClick={handleDownloadBackup}>Backup JSON File</button>
                    </div>
                </div>

                <div className="filter-bar">
                    <label>College:</label>
                    <select className="college-select" value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}>
                        {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="masterlist-table-container">
                    <table className="masterlist-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>ID</th>
                                <th style={{ width: '18%' }}>Name</th>
                                <th style={{ width: '20%' }}>Email</th>
                                <th style={{ width: '7%' }}>Year</th>
                                <th style={{ width: '15%' }}>College</th>
                                <th style={{ width: '15%' }}>Program</th>
                                <th style={{ width: '15%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((s) => (
                                <tr key={s._id}>
                                    <td>{s.studentID}</td>
                                    <td className="text-left">{s.studentName}</td>
                                    <td className="text-left small-text">{s.email}</td>
                                    <td>{s.yearLevel}</td>
                                    <td className="text-left wrap-text">{s.college}</td>
                                    <td className="text-left wrap-text">{s.course || s.program}</td>
                                    <td>
                                        <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                                            <button className="qr-btn" onClick={() => setSelectedQR(s)} title="QR">QR</button>
                                            <button className="edit-btn" onClick={() => handleEditClick(s)} title="Edit">Edit</button>
                                            <button className="action-delete-btn" onClick={() => handleDelete(s._id, s.studentName)} title="Delete">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditing ? "Edit Student Details" : "Add New Student"}</h2>
                        <form onSubmit={handleSubmitStudent}>
                            <div className="form-grid">
                                <input type="text" name="studentID" placeholder="Student ID" value={newStudent.studentID} onChange={handleInputChange} required />
                                <input type="text" name="studentName" placeholder="Full Name" value={newStudent.studentName} onChange={handleInputChange} required />
                                <input type="email" name="email" placeholder="Email Address" value={newStudent.email} onChange={handleInputChange} required />
                                <input type="number" name="yearLevel" placeholder="Year" value={newStudent.yearLevel} onChange={handleInputChange} required />
                                <input type="text" name="college" placeholder="College" value={newStudent.college} onChange={handleInputChange} required />
                                <input type="text" name="course" placeholder="Course" value={newStudent.course} onChange={handleInputChange} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="save-btn">{isEditing ? "Update Changes" : "Save Student"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

           
            {selectedQR && (
                <div className="modal-overlay" onClick={() => setSelectedQR(null)}>
                    <div className="qr-card" onClick={e => e.stopPropagation()}>
                        <div className="qr-card-header no-print">
                            <h3>Digital ID</h3>
                            <button className="close-x" onClick={() => setSelectedQR(null)}>×</button>
                        </div>
                        <div className="qr-card-body">
                            <div className="printable-content">
                                <QRCodeCanvas value={selectedQR.studentID} size={250} includeMargin={true} level={"H"} />
                                <h4 className="no-print">{selectedQR.studentName}</h4>
                                <p className="qr-id-num id-to-print">{selectedQR.studentID}</p>
                                <span className="qr-dept no-print">{selectedQR.college}</span>
                            </div>
                        </div>
                        <button className="print-btn no-print" onClick={handleDownloadPNG}>💾 Save as PNG</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Masterlist;