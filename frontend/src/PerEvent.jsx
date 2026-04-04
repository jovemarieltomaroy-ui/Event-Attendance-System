import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './perevent.css';
import QRScannerComponent from './QRScannerComponent.jsx';

const API_BASE = 'http://localhost:5001/api/events';

function PerEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [studentIdInput, setStudentIdInput] = useState('');
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false); 

    const loadEventDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE}/${id}`);
            setEventData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading event:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEventDetails();
    }, [id]);

    const handleSaveAttendance = useCallback(async (scannedId = null) => {
        const idToRecord = scannedId || studentIdInput;

        if (!idToRecord || isProcessing) return;

        try {
            setIsProcessing(true);
            const response = await axios.post(`${API_BASE}/record-attendance`, {
                studentID: idToRecord,
                eventId: id
            });

            alert(response.data.message);
            setStudentIdInput(''); 
            await loadEventDetails(); 
        } catch (error) {
            alert(error.response?.data?.message || "Error recording attendance");
        } finally {
            
            setTimeout(() => setIsProcessing(false), 2000);
        }
    }, [id, studentIdInput, isProcessing]);

    const handleQRScan = (decodedText) => {
        handleSaveAttendance(decodedText);
    };

    if (loading) return <div className="home-wrapper"><div className="content-card">Loading Event Details...</div></div>;
    if (!eventData) return <div className="home-wrapper"><div className="content-card">Event not found.</div></div>;

    const validAttendees = (eventData.attendees || []).filter(
        (entry) => entry.student !== null && entry.student !== undefined
    );

    return (
        <div className="home-wrapper">
            <div className="content-card">
                <div className="back-navigation">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back to Events
                    </button>
                </div>

                <h1 className="event-title">{eventData.eventName}</h1>

                <div className="interaction-panel">
                    <div className="entry-group">
                        <label>STUDENT ID NUMBER:</label>
                        <input 
                            type="text" 
                            value={studentIdInput}
                            placeholder="Enter ID (e.g. 2023-0001)"
                            onChange={(e) => setStudentIdInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveAttendance()}
                            disabled={isProcessing}
                        />
                        <button 
                            className="save-btn" 
                            onClick={() => handleSaveAttendance()}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "..." : "Save"}
                        </button>
                    </div>

                    <div className="qr-container-integrated">
                        <div className="qr-graphic-scanner">
                           <QRScannerComponent onScanSuccess={handleQRScan} />
                        </div>
                    </div>
                </div>

                <div className="logs-section">
                    <div className="action-bar" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                        <button 
                            className="full-attendance-btn"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                            onClick={() => navigate(`/event/${id}/full-attendance`)}
                        >
                            Full Attendance
                        </button>
                    </div>

                    <h3 className="section-title">Recent Logs ({validAttendees.length})</h3>
                    <div className="logs-table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {validAttendees.length > 0 ? (
                                    [...validAttendees].reverse().map((entry, index) => (
                                        <tr key={entry._id || index}>
                                            <td>{entry.student?.studentID}</td>
                                            <td>{entry.student?.studentName}</td>
                                            <td><span className="status-tag">PRESENT</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>
                                            No attendance recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PerEvent;