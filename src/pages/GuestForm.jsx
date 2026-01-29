import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './GuestForm.css';

const GuestForm = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        purposeOfVisit: '',
        visitDate: '',
        visitTime: '',
        numberOfPeople: '1',
        accompanied: [],
        additionalComments: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    const [accompaniedPerson, setAccompaniedPerson] = useState({
        name: '',
        age: '',
        relation: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddAccompanied = () => {
        if (!accompaniedPerson.name || !accompaniedPerson.age || !accompaniedPerson.relation) {
            alert('Please fill all accompanied person details');
            return;
        }
        setFormData({
            ...formData,
            accompanied: [...formData.accompanied, accompaniedPerson]
        });
        setAccompaniedPerson({ name: '', age: '', relation: '' });
    };

    const handleRemoveAccompanied = (index) => {
        setFormData({
            ...formData,
            accompanied: formData.accompanied.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.purposeOfVisit) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, 'guests'), {
                ...formData,
                status: 'pending',
                createdAt: new Date().toISOString(),
                type: 'walk-in-guest'
            });

            setSubmitted(true);
            setLoading(false);

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form. Please try again.');
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="guest-form-page">
                <div className="success-message">
                    <div className="success-icon">✅</div>
                    <h1>Registration Successful!</h1>
                    <p>Thank you for registering. We will contact you shortly.</p>
                    <button onClick={() => navigate('/')} className="home-btn">
                        Go Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="guest-form-page">
            <div className="form-header">
                <button onClick={() => navigate('/')} className="back-home-btn">
                    ← Back to Home
                </button>
                <h1>GUEST REGISTRATION</h1>
                <p>Hyderabad Nattukottai Nagarathar Sangam</p>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="guest-registration-form">
                    <div className="form-section">
                        <h3>👤 Personal Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Age *</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    placeholder="Enter your age"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+91 9876543210"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>📍 Address Details</h3>
                        <div className="form-group">
                            <label>Full Address *</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter your complete address"
                                rows="3"
                                required
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Enter city"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="Enter state"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Country *</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="Enter country"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>🏛️ Visit Information</h3>
                        <div className="form-group">
                            <label>Purpose of Visit *</label>
                            <select
                                name="purposeOfVisit"
                                value={formData.purposeOfVisit}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Purpose</option>
                                <option value="Temple Visit">Temple Visit</option>
                                <option value="Cultural Event">Cultural Event</option>
                                <option value="Religious Ceremony">Religious Ceremony</option>
                                <option value="Meeting">Meeting</option>
                                <option value="Festival">Festival</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Preferred Visit Date *</label>
                                <input
                                    type="date"
                                    name="visitDate"
                                    value={formData.visitDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Preferred Visit Time *</label>
                                <input
                                    type="time"
                                    name="visitTime"
                                    value={formData.visitTime}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Number of People *</label>
                            <input
                                type="number"
                                name="numberOfPeople"
                                value={formData.numberOfPeople}
                                onChange={handleInputChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>👨‍👩‍👧‍👦 Accompanied Persons (Optional)</h3>
                        <div className="accompanied-builder">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={accompaniedPerson.name}
                                        onChange={(e) => setAccompaniedPerson({ ...accompaniedPerson, name: e.target.value })}
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        value={accompaniedPerson.age}
                                        onChange={(e) => setAccompaniedPerson({ ...accompaniedPerson, age: e.target.value })}
                                        placeholder="Enter age"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Relation</label>
                                    <input
                                        type="text"
                                        value={accompaniedPerson.relation}
                                        onChange={(e) => setAccompaniedPerson({ ...accompaniedPerson, relation: e.target.value })}
                                        placeholder="Enter relation"
                                    />
                                </div>
                            </div>
                            <button type="button" className="add-btn" onClick={handleAddAccompanied}>
                                + Add Person
                            </button>
                        </div>

                        {formData.accompanied.length > 0 && (
                            <div className="accompanied-list">
                                <h4>Accompanied Persons:</h4>
                                {formData.accompanied.map((person, index) => (
                                    <div key={index} className="accompanied-item">
                                        <span>{person.name} ({person.age} years, {person.relation})</span>
                                        <button type="button" className="remove-btn-small" onClick={() => handleRemoveAccompanied(index)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <h3>🚨 Emergency Contact</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Emergency Contact Name *</label>
                                <input
                                    type="text"
                                    name="emergencyContactName"
                                    value={formData.emergencyContactName}
                                    onChange={handleInputChange}
                                    placeholder="Enter emergency contact name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Emergency Contact Phone *</label>
                                <input
                                    type="tel"
                                    name="emergencyContactPhone"
                                    value={formData.emergencyContactPhone}
                                    onChange={handleInputChange}
                                    placeholder="Enter emergency contact phone"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>💬 Additional Information (Optional)</h3>
                        <div className="form-group">
                            <label>Any Special Requirements or Comments?</label>
                            <textarea
                                name="additionalComments"
                                value={formData.additionalComments}
                                onChange={handleInputChange}
                                placeholder="Enter any additional information"
                                rows="4"
                            ></textarea>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn-guest" disabled={loading}>
                        {loading ? 'SUBMITTING...' : '✅ SUBMIT REGISTRATION'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GuestForm;
