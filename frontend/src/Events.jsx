import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './events.css';

const API_BASE = 'http://localhost:5001/api/events';

function Events() {
    const navigate = useNavigate();
    const [eventsList, setEventsList] = useState([]); 
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);

   
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState({ id: '', name: '' });

    const today = new Date().toISOString().split('T')[0];

    const loadEvents = async () => {
        try {
            const response = await axios.get(API_BASE);
            setEventsList(response.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        loadEvents();
        const closeMenu = () => setOpenMenuId(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const handleSave = async () => {
        if (!eventName || !eventDate) return;
        await axios.post(API_BASE, { eventName, eventDate });
        setEventName(''); 
        setEventDate('');
        loadEvents();
    };

    const handleRenameSubmit = async () => {
        await axios.put(`${API_BASE}/${selectedEvent.id}`, { eventName: selectedEvent.name });
        setShowRenameModal(false);
        loadEvents();
    };

    const handleDeleteSubmit = async () => {
        await axios.delete(`${API_BASE}/${selectedEvent.id}`);
        setShowDeleteModal(false);
        loadEvents();
    };

    return (
        <div className="home-wrapper">

            {showRenameModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Rename Event</h3>
                        <p style={{marginBottom: '10px', fontSize: '12px', color: 'black'}}>
                            Enter new name for <strong>{selectedEvent.oldName}</strong>
                        </p>
                        <input 
                            type="text" 
                            className="event-input"
                            style={{width: '100%', border: '1px solid #ddd'}}
                            value={selectedEvent.name}
                            onChange={(e) => setSelectedEvent({...selectedEvent, name: e.target.value})}
                        />
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowRenameModal(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={handleRenameSubmit}>Update Name</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Are you sure?</h3>
                        <p style={{marginBottom: '10px', fontSize: '12px', color: 'black'}}>
                            You are about to delete <strong>{selectedEvent.name}</strong>. This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>No, Keep it</button>
                            <button className="confirm-btn" onClick={handleDeleteSubmit}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="content-card">
                <div className="event-form-container">
                    <div className="form-group">
                        <label>EVENT NAME:</label>
                        <input 
                            type="text" 
                            className="event-input" 
                            value={eventName} 
                            onChange={(e) => setEventName(e.target.value)} 
                        />
                    </div>

                    <div className="form-group">
                        <label>EVENT DATE:</label>
                       <input 
                        type="date" 
                        className="event-input date-picker-input"
                        min={today}
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        />
                    </div>

                    <button className="save-btn" onClick={handleSave}>SAVE</button>
                </div>
                
                <h2 className="eventLabel"> Events </h2>
                
                <div className="event-list-container">
                    <table className="event-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventsList.map((event) => (
                                <tr key={event._id}>
                                    <td>{event.eventName}</td>
                                    <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button 
                                                className="go-btn" 
                                                onClick={() => navigate(`/event/${event._id}`)}
                                            >
                                                Go to Event
                                            </button>

                                            <div className="menu-container">
                                                <button 
                                                    className="kebab-btn" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setOpenMenuId(openMenuId === event._id ? null : event._id); 
                                                    }}
                                                >
                                                    &#8942;
                                                </button>

                                                {openMenuId === event._id && (
                                                    <div className="dropdown-menu">
                                                        <button onClick={() => { 
                                                            setSelectedEvent({
                                                                id: event._id, 
                                                                name: event.eventName, 
                                                                oldName: event.eventName
                                                            }); 
                                                            setShowRenameModal(true); 
                                                        }}>
                                                            Rename
                                                        </button>

                                                        <button onClick={() => {
                                                            setSelectedEvent({
                                                                id: event._id, 
                                                                name: event.eventName
                                                            });
                                                            setShowDeleteModal(true);
                                                        }}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Events;