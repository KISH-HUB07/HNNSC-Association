import React, { useState } from 'react';
import './GuestRegistration.css';

const GuestRegistration = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        email: '',
        phone: '',
        kovil: '',
        pirivu: '',
        nativePlace: '',
        pattaPer: '',
        atHyderabad: false,
        familyMembers: []
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const addFamilyMember = () => {
        setFormData({
            ...formData,
            familyMembers: [
                ...formData.familyMembers,
                { relation: '', name: '', age: '', phone: '' }
            ]
        });
    };

    const removeFamilyMember = (index) => {
        const updatedFamily = formData.familyMembers.filter((_, i) => i !== index);
        setFormData({ ...formData, familyMembers: updatedFamily });
    };

    const handleFamilyChange = (index, field, value) => {
        const updatedFamily = formData.familyMembers.map((member, i) =>
            i === index ? { ...member, [field]: value } : member
        );
        setFormData({ ...formData, familyMembers: updatedFamily });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Save form data to Firebase/database
        // TODO: Redirect to payment gateway

        setTimeout(() => {
            alert('Registration submitted! You will be redirected to payment shortly.');
            console.log('Form Data:', formData);
            setLoading(false);
            // Here you'll redirect to payment in future
        }, 1500);
    };

    return (
        <div className="guest-registration-page">
            <div className="registration-container">
                <div className="registration-header">
                    <h1>🎯 Member Registration</h1>
                    <p className="registration-subtitle">Join the HNNSC Association Family</p>
                </div>

                <form onSubmit={handleSubmit} className="registration-form">
                    {/* Personal Details Section */}
                    <div className="form-section">
                        <h2 className="section-title">👤 Personal Details</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="age">Age *</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min="18"
                                    placeholder="Your age"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 9876543210"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cultural Details Section */}
                    <div className="form-section">
                        <h2 className="section-title">🏛️ Cultural Details</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="kovil">Kovil *</label>
                                <input
                                    type="text"
                                    id="kovil"
                                    name="kovil"
                                    value={formData.kovil}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your Kovil"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="pirivu">Pirivu *</label>
                                <input
                                    type="text"
                                    id="pirivu"
                                    name="pirivu"
                                    value={formData.pirivu}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your Pirivu"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nativePlace">Native Place *</label>
                                <input
                                    type="text"
                                    id="nativePlace"
                                    name="nativePlace"
                                    value={formData.nativePlace}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your native place"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="pattaPer">Patta Per *</label>
                                <input
                                    type="text"
                                    id="pattaPer"
                                    name="pattaPer"
                                    value={formData.pattaPer}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your Patta Per"
                                />
                            </div>
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="atHyderabad"
                                    checked={formData.atHyderabad}
                                    onChange={handleChange}
                                />
                                <span>Are you currently residing in Hyderabad?</span>
                            </label>
                        </div>
                    </div>

                    {/* Family Members Section */}
                    <div className="form-section">
                        <h2 className="section-title">👨‍👩‍👧‍👦 Family Members (Optional)</h2>

                        {formData.familyMembers.map((member, index) => (
                            <div key={index} className="family-member-card">
                                <div className="family-member-header">
                                    <h4>Family Member {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeFamilyMember(index)}
                                        className="remove-family-btn"
                                    >
                                        ✕ Remove
                                    </button>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Relation</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Spouse, Son, Daughter"
                                            value={member.relation}
                                            onChange={(e) => handleFamilyChange(index, 'relation', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            value={member.name}
                                            onChange={(e) => handleFamilyChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            placeholder="Age"
                                            value={member.age}
                                            onChange={(e) => handleFamilyChange(index, 'age', e.target.value)}
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 9876543210"
                                            value={member.phone}
                                            onChange={(e) => handleFamilyChange(index, 'phone', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addFamilyMember}
                            className="add-family-btn"
                        >
                            ➕ Add Family Member
                        </button>
                    </div>

                    {/* Payment Section - Placeholder */}
                    <div className="form-section payment-section">
                        <h2 className="section-title">💳 Membership Payment</h2>
                        <div className="payment-info-box">
                            <p className="payment-notice">
                                <strong>Membership Fee:</strong> ₹[Amount to be decided]
                            </p>
                            <p className="payment-description">
                                After submitting this form, you will be redirected to our secure payment gateway to complete your membership payment.
                            </p>
                            <div className="payment-methods">
                                <span className="payment-badge">💳 Credit/Debit Card</span>
                                <span className="payment-badge">🏦 Net Banking</span>
                                <span className="payment-badge">📱 UPI</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="submit-registration-btn" disabled={loading}>
                        {loading ? 'Processing...' : '💾 Submit & Proceed to Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GuestRegistration;
