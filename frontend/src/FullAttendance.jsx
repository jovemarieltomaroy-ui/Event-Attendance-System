import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FullAttendance.css';

const API_BASE = 'http://localhost:5001/api/events';
const STUDENT_API = 'http://localhost:5001/api/students'; 

function FullAttendance() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [eventData, setEventData] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollege, setSelectedCollege] = useState('ALL');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, studentRes] = await Promise.all([
                    axios.get(`${API_BASE}/${id}`),
                    axios.get(STUDENT_API)
                ]);
                setEventData(eventRes.data);
                setAllStudents(studentRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getAttendanceRecord = (studentID) => {
        return eventData?.attendees?.find(a => a.student?.studentID === studentID);
    };


    const filteredStudents = allStudents.filter(student => {
        const matchesSearch = 
            (student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentID?.includes(searchTerm));
        
        const matchesCollege = selectedCollege === 'ALL' || student.college === selectedCollege;
        
        return matchesSearch && matchesCollege;
    });

    const exportToCSV = () => {
        const headers = ["Student ID", "Name", "Year", "College", "Program", "Status", "Time Logged"];
        const rows = filteredStudents.map(student => {
            const record = getAttendanceRecord(student.studentID);
            const rawDate = record?.checkInTime; 
            const time = (record && rawDate) ? new Date(rawDate).toLocaleTimeString() : "";
            
            return [
                `"${student.studentID}"`, 
                `"${student.studentName}"`,
                student.yearLevel,
                student.college,
                student.course,
                record ? "PRESENT" : "ABSENT",
                time
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${eventData?.eventName}_Report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const colleges = ['ALL', ...new Set(allStudents.map(s => s.college).filter(Boolean))];

    if (loading) return <div className="home-wrapper"><div className="content-card">Loading Report...</div></div>;

    return (
        <div className="home-wrapper">
            <div className="content-card">
                <div className="back-navigation">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back to Event
                    </button>
                </div>

                <h1 className="masterlist-title">Attendance: {eventData?.eventName}</h1>

                <div className="action-bar">
                    <div className="search-group">
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search Name or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-btn">Search</button>
                    </div>

                    <button className="upload-btn" onClick={exportToCSV}>
                        EXPORT AS CSV
                    </button>
                </div>

                <div className="filter-bar">
                    <label>FILTER BY COLLEGE:</label>
                    <select 
                        className="college-select"
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                    >
                        {colleges.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                </div>

                <div className="masterlist-table-container">
                    <table className="masterlist-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Year</th>
                                <th>College</th>
                                <th>Program</th>
                                <th>Status</th>
                                <th>Time Logged</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => {
                                    const record = getAttendanceRecord(student.studentID);
                                    const isPresent = !!record;
                                    const rawDate = record?.checkInTime;

                                    return (
                                        <tr key={student._id}>
                                            <td>{student.studentID}</td>
                                            <td>{student.studentName}</td>
                                            <td>{student.yearLevel}</td>
                                            <td style={{ textAlign: 'left' }}>{student.college}</td>
                                            <td style={{ textAlign: 'left' }}>{student.course}</td>
                                            <td style={{ 
                                                color: isPresent ? '#008000' : '#FF0000', 
                                                fontWeight: 'bold', 
                                                textAlign: 'left' 
                                            }}>
                                                {isPresent ? "PRESENT" : "ABSENT"}
                                            </td>
                                            <td>
                                                {(isPresent && rawDate && !isNaN(new Date(rawDate).getTime())) 
                                                    ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                    : (isPresent ? "Time N/A" : "")}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{padding: '20px'}}>No students found matching filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default FullAttendance;