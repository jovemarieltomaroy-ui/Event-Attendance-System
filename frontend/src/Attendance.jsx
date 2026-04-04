import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './attendance.css';


const API_BASE = 'http://localhost:5001/api/events';

function Attendance() {
    const navigate = useNavigate();

    const [eventsList, setEventsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(API_BASE);
                setEventsList(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching events:", error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleRowClick = (eventId) => {
        
        navigate(`/event/${eventId}`);
    };

    
    const filteredEvents = eventsList.filter(event =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="home-wrapper">
                <div className="content-card"><h2>Loading Events...</h2></div>
            </div>
        );
    }

    return (
        <div className="home-wrapper">
            <div className="content-card">
                <h2 className="eventLabel"> All Events </h2>

              
               <div className="search-groupA">
                    <input 
                        type="text" 
                        placeholder="Search event name..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="search-btn">Search</button>
                </div>
                
                <div className="event-list-container">
                    <table className="event-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => (
                                    <tr 
                                        key={event._id} 
                                        className="clickable-row" 
                                        onClick={() => handleRowClick(event._id)}
                                    >
                                        <td>{event.eventName}</td>
                                        <td>{new Date(event.eventDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" style={{ padding: '20px', color: '#666', textAlign: 'center' }}>
                                        {searchTerm ? `No events found matching "${searchTerm}"` : "No events available."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Attendance;