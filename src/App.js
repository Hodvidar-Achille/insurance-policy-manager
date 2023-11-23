import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {formatISO, parseISO} from 'date-fns';
import './App.css';

const apiBaseURL = 'http://localhost:8080/api/v1/insurance-policies'; // TODO in a .env file

const api = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Authorization': `Basic ${window.btoa('user:password')}` // TODO in a .env file
    }
});

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

                <section>
                    <h2>Current Policies</h2>
                    <ul>
                        {policies.map(policy => (
                            <li key={policy.id}>
                                {policy.name} - {policy.status} (Starts: {formatISO(parseISO(policy.startDate))},
                                Ends: {formatISO(parseISO(policy.endDate))})
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}

export default App;
