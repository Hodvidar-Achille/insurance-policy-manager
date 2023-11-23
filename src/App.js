import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {format, parseISO} from 'date-fns';
import './App.css';

const apiBaseURL = 'http://localhost:8080/api/v1/insurance-policies'; // TODO in a .env file
const api = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Authorization': `Basic ${window.btoa('user:password')}` // TODO in a .env file
    }
});
const dateFormat = 'd MMMM yyyy';
const dateTimeFormat = 'd MMM yyyy HH:mm:ss';

const determineDateColor = (startDate, endDate) => {
    const now = new Date();
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (start < now && end < now) {
        // Both dates are in the past
        return 'red';
    } else if (start > now && end > now) {
        // Both dates are in the future
        return 'blue';
    } else if (start < now && end > now) {
        // Start is in the past, end is in the future
        return 'green';
    }
    return 'black'; // Default color if none of the above conditions are met
};


function App() {
    const [policies, setPolicies] = useState([]);
    const [form, setForm] = useState({
        name: '',
        status: 'ACTIVE',
        startDate: '',
        endDate: ''
    });

    // Fetch insurance policies on component mount
    useEffect(() => {
        api.get('')
            .then(response => {
                setPolicies(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the policies', error);
            });
    }, []);

    // Handle form changes
    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(prevForm => ({...prevForm, [name]: value}));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        api.post(apiBaseURL, form)
            .then(response => {
                setPolicies([...policies, response.data]);
                setForm({name: '', status: 'ACTIVE', startDate: '', endDate: ''}); // Reset form
            })
            .catch(error => {
                console.error('There was an error creating the policy', error);
            });
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Insurance Policy Manager</h1>
            </header>
            <main>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Policy Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <label htmlFor="startDate">Start Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="endDate">End Date:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">Submit</button>
                </form>

                <div>
                    <div className="policies-title"><h2>Current Policies</h2></div>
                    <section className="policies-container">
                        {policies.map(policy => (
                            <div className="policy-card" key={policy.id}>
                                <div className="policy-field policy-name" title="Name">
                                    <span><b>{policy.name}</b></span>
                                </div>
                                <div className="policy-field policy-status" title="Status">
                                <span className={policy.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}>
                                  {policy.status}
                                </span>
                                </div>
                                <div className="policy-field policy-start-date" title="Start Date">
                                    <span style={{color: determineDateColor(policy.startDate, policy.endDate)}}>
                                      {format(parseISO(policy.startDate), 'd MMMM yyyy')}
                                    </span>
                                </div>
                                <div className="policy-field policy-end-date" title="End Date">
                                    <span style={{color: determineDateColor(policy.startDate, policy.endDate)}}>
                                      {format(parseISO(policy.endDate), 'd MMMM yyyy')}
                                    </span>
                                </div>
                                <div className="policy-field policy-creation-date" title="Creation Dat">
                                    <span>{format(parseISO(policy.creationDateTime), dateTimeFormat)}</span>
                                </div>
                                <div className="policy-field policy-update-date" title="Update Date">
                                    <span>{format(parseISO(policy.updateDateTime), dateTimeFormat)}</span>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

            </main>
        </div>
    );
}

export default App;
