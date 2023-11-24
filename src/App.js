import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {format, parseISO} from 'date-fns';
import './App.css';

const apiURL = `${process.env.REACT_APP_API_HOST}${process.env.REACT_APP_API_BASE_URL}`;
const api = axios.create({
    baseURL: apiURL,
    headers: {
        'Authorization': `Basic ${window.btoa(`${process.env.REACT_APP_BASIC_AUTH_USER}:${process.env.REACT_APP_BASIC_AUTH_PASSWORD}`)}`
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
        api.post(apiURL, form)
            .then(response => {
                setPolicies([...policies, response.data]);
                setForm({name: '', status: 'ACTIVE', startDate: '', endDate: ''}); // Reset form
            })
            .catch(error => {
                console.error('There was an error creating the policy', error);
            });
    };

    const deletePolicy = async (policyId) => {
        try {
            await api.delete(`/${policyId}`);
            // Filter out the policy that has been deleted
            setPolicies(policies.filter(policy => policy.id !== policyId));
        } catch (error) {
            console.error('There was an error deleting the policy', error);
            // Handle the error properly (e.g., show a message to the user)
        }
    };

    const [editingPolicyId, setEditingPolicyId] = useState(null);
    const [editingForm, setEditingForm] = useState({
        name: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const handleEdit = policy => {
        setEditingPolicyId(policy.id);
        setEditingForm({
            name: policy.name,
            status: policy.status,
            startDate: policy.startDate,
            endDate: policy.endDate
        });
    };
    const handleCancel = () => {
        setEditingPolicyId(null);
    };
    const handleConfirm = async () => {
        try {
            const response = await api.put(`/${editingPolicyId}`, editingForm);
            // Update the policies state with the new policy data
            setPolicies(policies.map(policy => policy.id === editingPolicyId ? response.data : policy));
            setEditingPolicyId(null);
        } catch (error) {
            console.error('There was an error updating the policy', error);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Insurance Policy Manager</h1>
            </header>
            <main>
                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-field">
                        <label htmlFor="name">Policy Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-field">
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
                    </div>
                    <div className="form-field">
                        <label htmlFor="startDate">Start Date:</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="endDate">End Date:</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="create-button">
                        Create New Insurance Policy
                    </button>
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
                                      {format(parseISO(policy.startDate), dateFormat)}
                                    </span>
                                </div>
                                <div className="policy-field policy-end-date" title="End Date">
                                    <span style={{color: determineDateColor(policy.startDate, policy.endDate)}}>
                                      {format(parseISO(policy.endDate), dateFormat)}
                                    </span>
                                </div>
                                <div className="policy-field policy-creation-date" title="Creation Dat">
                                    <span>{format(parseISO(policy.creationDateTime), dateTimeFormat)}</span>
                                </div>
                                <div className="policy-field policy-update-date" title="Update Date">
                                    <span>{format(parseISO(policy.updateDateTime), dateTimeFormat)}</span>
                                </div>

                                {editingPolicyId === policy.id ? (
                                    // If we're editing this policy, show the editing form
                                    <>
                                        <input
                                            type="text"
                                            value={editingForm.name}
                                            onChange={e => setEditingForm({...editingForm, name: e.target.value})}
                                        />
                                        <div className="policy-field">
                                            <select
                                                value={editingForm.status}
                                                onChange={e => setEditingForm({...editingForm, status: e.target.value})}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="policy-field">
                                            <input
                                                type="date"
                                                value={editingForm.startDate}
                                                onChange={e => setEditingForm({...editingForm, startDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="policy-field">
                                            <input
                                                type="date"
                                                value={editingForm.endDate}
                                                onChange={e => setEditingForm({...editingForm, endDate: e.target.value})}
                                            />
                                        </div>
                                        <button onClick={handleConfirm}>Confirm</button>
                                        <button onClick={handleCancel}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="edit-button" onClick={() => handleEdit(policy)}>
                                            Edit
                                        </button>
                                    </>
                                )}
                                <button className="delete-button" onClick={() => deletePolicy(policy.id)} title="Delete Policy">
                                    Delete
                                </button>
                            </div>
                        ))}
                    </section>
                </div>

            </main>
        </div>
    );
}

export default App;
