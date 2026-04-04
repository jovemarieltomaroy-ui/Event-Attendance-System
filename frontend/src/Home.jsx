import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import './home.css';

const API_BASE = 'http://localhost:5001/api/events';
const COLORS = ['#0065C7', '#7CF97C', '#FFBB28', '#FF8042', '#AF19FF'];

function Home() {
    const [stats, setStats] = useState({ total: 0, yearLevels: [] });
    const [collegeData, setCollegeData] = useState([]);
    const [eventData, setEventData] = useState({ totalPerEvent: [] });
    const [allEvents, setAllEvents] = useState([]); 
    const [selectedEvent, setSelectedEvent] = useState('all'); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [resEvents, resList] = await Promise.all([
                    axios.get(`${API_BASE}/stats/eventAtt`),
                    axios.get(`${API_BASE}`) 
                ]);
                
                setEventData(resEvents.data || { totalPerEvent: [] });
                setAllEvents(resList.data || []);
                
                await fetchFilteredStats('all');
                
                setError(null);
            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Failed to connect to server.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchFilteredStats = async (eventId) => {
        try {
            const query = eventId === 'all' ? '' : `?eventId=${eventId}`;
            
            const [resCollege, resYear] = await Promise.all([
                axios.get(`${API_BASE}/stats/college${query}`),
                axios.get(`${API_BASE}/stats${query}`)
            ]);
            
            setCollegeData(resCollege.data || []);
            setStats(resYear.data || { total: 0, yearLevels: [] });
        } catch (err) {
            console.error("Error fetching filtered stats:", err);
        }
    };

    const handleEventChange = (e) => {
        const id = e.target.value;
        setSelectedEvent(id);
        fetchFilteredStats(id);
    };

    if (loading) return <div className="home-wrapper"><div className="content-card">Loading...</div></div>;
    if (error) return <div className="home-wrapper"><div className="content-card" style={{color: 'red'}}>{error}</div></div>;

    return (
        <div className="home-wrapper">
            <div className="content-card dashboard-grid">
                
                <div className="dashboard-header">
                    <h1>Dashboard Overview</h1>
                    <div className="stat-pill">
                        {selectedEvent === 'all' ? 'Total Participation: ' : 'Event Attendance: '} 
                        <strong>{stats.total}</strong>
                    </div>
                </div>

                <div className="filter-section">
                    <label>View Statistics For: </label>
                    <select 
                        className="event-filter-dropdown"
                        value={selectedEvent} 
                        onChange={handleEventChange}
                    >
                        <option value="all">All Events Combined</option>
                        {allEvents.map(ev => (
                            <option key={ev._id} value={ev._id}>{ev.eventName}</option>
                        ))}
                    </select>
                </div>

                <div className="chart-row">
                    
                    <div className="chart-box">
                        <h3>Attendance by College</h3>
                        <div className="pie-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={collegeData} 
                                        dataKey="count" 
                                        nameKey="_id" 
                                        cx="30%" 
                                        cy="50%" 
                                        outerRadius={60} 
                                        innerRadius={35} 
                                        paddingAngle={5}
                                    >
                                        {collegeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend 
                                        layout="vertical" 
                                        verticalAlign="middle" 
                                        align="right" 
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '11px', paddingLeft: '10px', lineHeight: '24px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    
                    <div className="chart-box">
                        <h3>Year Level Distribution</h3>
                        <div className="bar-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.yearLevels} margin={{ left: -25, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} /> 
                                    <Tooltip cursor={{ fill: '#f9f9f9' }} />
                                    <Bar dataKey="count" fill="#0065C7" radius={[4, 4, 0, 0]} barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="chart-row full-width">
                    <div className="chart-box trend-box">
                        <h3>Event Participation Trends (Overall)</h3>
                        <div className="line-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={eventData.totalPerEvent} margin={{ left: -25, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#666' }} axisLine={false} /> 
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#0065C7" strokeWidth={2} dot={{ r: 3, fill: '#0065C7' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Home;