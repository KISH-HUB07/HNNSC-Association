import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Toast from '../components/toast';
import './MemberDashboard.css';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [registeredEventIds, setRegisteredEventIds] = useState([]);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    // Voting State
    const [polls, setPolls] = useState([]);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [myVotes, setMyVotes] = useState({});
    const [hasVoted, setHasVoted] = useState({});

    // --- PROFILE STATE ---
    const [profileData, setProfileData] = useState({
        name: '',
        age: '',
        email: '',
        phone: '',
        kovil: '',
        pirivu: '',
        nativePlace: '',
        pattaPer: '',
        residentOfHyd: 'yes',
        familyMembers: [],
        profileImage: '' // New Field for Base64 Image
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    // Event Registration Form State
    const [registrationForm, setRegistrationForm] = useState({
        memberName: '',
        memberEmail: '',
        memberPhone: '',
        familyMembers: []
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchEvents();
        fetchMyRegistrations();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'voting') {
            fetchActivePolls();
            checkMyVotes();
        }
    }, [activeTab]);

    // --- SMART FETCH USER PROFILE ---
    const fetchUserProfile = async () => {
        if (!auth.currentUser) return;
        try {
            console.log("Fetching profile for:", auth.currentUser.email);

            let finalProfile = {
                name: auth.currentUser.displayName || '',
                age: '',
                email: auth.currentUser.email || '',
                phone: '',
                kovil: '',
                pirivu: '',
                nativePlace: '',
                pattaPer: '',
                residentOfHyd: 'yes',
                familyMembers: [],
                profileImage: ''
            };

            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                finalProfile = { ...finalProfile, ...data };
            }

            if (!finalProfile.familyMembers || finalProfile.familyMembers.length === 0 || !finalProfile.kovil) {
                const membersRef = collection(db, 'members');
                const q = query(membersRef, where('email', '==', auth.currentUser.email));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const memberData = snapshot.docs[0].data();
                    finalProfile.name = finalProfile.name || memberData.name;
                    finalProfile.age = finalProfile.age || memberData.age;
                    finalProfile.phone = finalProfile.phone || memberData.phone;
                    finalProfile.kovil = finalProfile.kovil || memberData.kovil;
                    finalProfile.pirivu = finalProfile.pirivu || memberData.pirivu;
                    finalProfile.nativePlace = finalProfile.nativePlace || memberData.nativePlace;
                    finalProfile.pattaPer = finalProfile.pattaPer || memberData.pattaPer;

                    if (memberData.atHyderabad !== undefined) {
                        finalProfile.residentOfHyd = memberData.atHyderabad ? 'yes' : 'no';
                    }

                    if (memberData.familyMembers && memberData.familyMembers.length > 0) {
                        finalProfile.familyMembers = memberData.familyMembers;
                    }
                }
            }
            setProfileData(finalProfile);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // --- IMAGE UPLOAD HANDLER (Base64) ---
    // --- IMAGE UPLOAD HANDLER (with compression) ---
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (limit to 500KB raw file)
        if (file.size > 500000) {
            showToast('Image too large! Please choose an image under 500KB.', 'error');
            e.target.value = ''; // Clear input
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // Create image element to compress
            const img = new Image();
            img.onload = () => {
                // Create canvas to compress
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Resize to max 300x300 (perfect for profile pics)
                const maxSize = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64 with quality compression
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

                console.log("Image compressed:", Math.round(compressedBase64.length / 1024), "KB");
                setProfileData({ ...profileData, profileImage: compressedBase64 });
                showToast('Image uploaded successfully!', 'success');
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };


    // --- PROFILE UPDATE HANDLERS ---
    const handleProfileInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileFamilyChange = (index, field, value) => {
        const updatedMembers = [...profileData.familyMembers];
        updatedMembers[index][field] = value;
        setProfileData({ ...profileData, familyMembers: updatedMembers });
    };

    const addProfileFamilyMember = () => {
        setProfileData({
            ...profileData,
            familyMembers: [...profileData.familyMembers, { name: '', relation: '', age: '', phone: '' }]
        });
    };

    const removeProfileFamilyMember = (index) => {
        const updatedMembers = profileData.familyMembers.filter((_, i) => i !== index);
        setProfileData({ ...profileData, familyMembers: updatedMembers });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const updateData = { ...profileData, updatedAt: new Date().toISOString() };
            await setDoc(userRef, updateData, { merge: true });

            const membersRef = collection(db, 'members');
            const q = query(membersRef, where('email', '==', auth.currentUser.email));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const memberDocId = snapshot.docs[0].id;
                await updateDoc(doc(db, 'members', memberDocId), {
                    ...profileData,
                    atHyderabad: profileData.residentOfHyd === 'yes',
                    updatedAt: new Date().toISOString()
                });
            }

            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    // --- PASSWORD LOGIC ---
    const handlePasswordInputChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) { showToast('Passwords do not match!', 'error'); return; }
        if (passwordData.newPassword.length < 6) { showToast('Password must be at least 6 characters!', 'error'); return; }

        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordData.currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, passwordData.newPassword);
            showToast('Password changed successfully!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsEditingPassword(false);
        } catch (error) {
            console.error('Error updating password:', error);
            if (error.code === 'auth/wrong-password') showToast('Current password is incorrect!', 'error');
            else showToast('Failed to change password. Please login again.', 'error');
        }
    };

    // --- EVENTS & REGISTRATION ---
    const fetchEvents = async () => { /* ...existing... */
        try {
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) { console.error(e); }
    };

    const fetchMyRegistrations = async () => { /* ...existing... */
        if (!auth.currentUser) return;
        try {
            const q = query(collection(db, 'registrations'), where('userId', '==', auth.currentUser.uid));
            const snapshot = await getDocs(q);
            const regsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMyRegistrations(regsData);
            setRegisteredEventIds(regsData.map(r => r.eventId));
        } catch (e) { console.error(e); }
    };

    const fetchActivePolls = async () => { /* ... */ };
    const checkMyVotes = async () => { /* ... */ };
    const handleVoteSelect = (r, c) => setMyVotes({ ...myVotes, [r]: c });
    const handleSubmitVote = async () => { /* ... */ };

    const handleRegisterClick = (event) => {
        setSelectedEvent(event);
        setActiveTab('register');
        setRegistrationForm({
            memberName: profileData.name,
            memberEmail: profileData.email,
            memberPhone: profileData.phone,
            familyMembers: []
        });
    };

    const handleRegInputChange = (e) => setRegistrationForm({ ...registrationForm, [e.target.name]: e.target.value });
    const handleRegFamilyChange = (i, f, v) => { const m = [...registrationForm.familyMembers]; m[i][f] = v; setRegistrationForm({ ...registrationForm, familyMembers: m }); };
    const addRegFamily = () => setRegistrationForm({ ...registrationForm, familyMembers: [...registrationForm.familyMembers, { name: '', relation: '', age: '' }] });
    const removeRegFamily = (i) => setRegistrationForm({ ...registrationForm, familyMembers: registrationForm.familyMembers.filter((_, x) => x !== i) });

    const handleSubmitRegistration = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'registrations'), { ...registrationForm, eventId: selectedEvent.id, eventName: selectedEvent.name, userId: auth.currentUser.uid, createdAt: new Date().toISOString() });
            showToast('Registered successfully!', 'success');
            setSelectedEvent(null);
            setActiveTab('events');
            fetchMyRegistrations();
        } catch (e) { showToast('Registration failed', 'error'); }
    };

    return (
        <div className="member-dashboard">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="dashboard-header">
                <h1>Member Dashboard</h1>
                <div className="user-info">
                    {profileData.profileImage ?
                        <img src={profileData.profileImage} alt="Profile" className="header-avatar" />
                        : <div className="header-avatar-placeholder">{profileData.name.charAt(0)}</div>
                    }
                    <span>{profileData.name || auth.currentUser?.email}</span>
                    <button onClick={() => { auth.signOut(); navigate('/'); }} className="logout-btn">Logout</button>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>📅 Events</button>
                <button className={`tab-btn ${activeTab === 'voting' ? 'active' : ''}`} onClick={() => setActiveTab('voting')}>🗳️ Voting</button>
                <button className={`tab-btn ${activeTab === 'myRegistrations' ? 'active' : ''}`} onClick={() => setActiveTab('myRegistrations')}>📋 Registrations</button>
                <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Edit Profile</button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'events' && !selectedEvent && (
                    <div className="events-section">
                        <h2>Available Events</h2>
                        <div className="events-grid">
                            {events.map(event => (
                                <div key={event.id} className="event-card">
                                    <h3>{event.name}</h3>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-details"><p>📅 {event.date} | 🕒 {event.time}</p><p>📍 {event.location}</p></div>
                                    {registeredEventIds.includes(event.id) ? <button className="registered-btn" disabled>✓ Registered</button> : <button className="register-btn" onClick={() => handleRegisterClick(event)}>Register Now</button>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'register' && selectedEvent && (
                    <div className="registration-form-section">
                        <button onClick={() => setActiveTab('events')} className="back-btn">← Back</button>
                        <h2>Register: {selectedEvent.name}</h2>
                        <form onSubmit={handleSubmitRegistration} className="registration-form">
                            <div className="form-group"><label>Name</label><input type="text" name="memberName" value={registrationForm.memberName} onChange={handleRegInputChange} required /></div>
                            <div className="form-group"><label>Email</label><input type="email" name="memberEmail" value={registrationForm.memberEmail} onChange={handleRegInputChange} required /></div>
                            <div className="form-group"><label>Phone</label><input type="tel" name="memberPhone" value={registrationForm.memberPhone} onChange={handleRegInputChange} required /></div>
                            <h3 style={{ color: 'white', marginTop: '2rem' }}>Guest Members (Optional)</h3>
                            {registrationForm.familyMembers.map((m, i) => (
                                <div key={i} className="family-member-row">
                                    <input placeholder="Name" value={m.name} onChange={(e) => handleRegFamilyChange(i, 'name', e.target.value)} />
                                    <input placeholder="Relation" value={m.relation} onChange={(e) => handleRegFamilyChange(i, 'relation', e.target.value)} />
                                    <input placeholder="Age" type="number" value={m.age} onChange={(e) => handleRegFamilyChange(i, 'age', e.target.value)} />
                                    <button type="button" onClick={() => removeRegFamily(i)} className="remove-btn">✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={addRegFamily} className="add-family-btn">+ Add Guest</button>
                            <button type="submit" className="submit-btn">Confirm Registration</button>
                        </form>
                    </div>
                )}

                {activeTab === 'myRegistrations' && (
                    <div className="my-registrations-section">
                        <h2>My Registrations</h2>
                        <div className="registrations-list">
                            {myRegistrations.map(reg => (
                                <div key={reg.id} className="registration-card">
                                    <h3>{reg.eventName}</h3>
                                    <p>👤 {reg.memberName} ({reg.memberEmail})</p>
                                    {reg.familyMembers?.length > 0 && (<div className="family-members-list"><strong>Guests:</strong><ul>{reg.familyMembers.map((m, i) => <li key={i}>{m.name} ({m.relation})</li>)}</ul></div>)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="profile-edit-section">
                        <h2>Edit My Details</h2>
                        <form onSubmit={handleProfileUpdate} className="profile-form">
                            {/* --- PROFILE IMAGE UPLOAD --- */}
                            {/* --- REFINED PROFILE IMAGE UPLOAD --- */}
                            {/* --- PROFESSIONAL PROFILE IMAGE UPLOAD --- */}
                            <div className="profile-image-section">
                                <div className="profile-image-wrapper" onClick={() => document.getElementById('imageUpload').click()}>

                                    {/* The Image or Placeholder */}
                                    {profileData.profileImage ? (
                                        <img src={profileData.profileImage} alt="Profile" className="profile-img-preview" />
                                    ) : (
                                        <div className="profile-img-placeholder">
                                            {profileData.name ? profileData.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}

                                    {/* The Hover Overlay */}
                                    <div className="image-upload-overlay">
                                        <span className="overlay-icon">📷</span>
                                        <span className="overlay-text">Change</span>
                                    </div>

                                    {/* Hidden Input */}
                                    <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                </div>
                            </div>



                            <div className="form-group"><label>Full Name</label><input type="text" name="name" value={profileData.name} onChange={handleProfileInputChange} required /></div>
                            <div className="form-group"><label>Age</label><input type="number" name="age" value={profileData.age} onChange={handleProfileInputChange} required /></div>
                            <div className="form-group"><label>Mail ID</label><input type="email" name="email" value={profileData.email} disabled style={{ background: 'rgba(255,255,255,0.1)', cursor: 'not-allowed' }} /></div>
                            <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" value={profileData.phone} onChange={handleProfileInputChange} required /></div>
                            <div className="form-group"><label>Kovil (Temple)</label><input type="text" name="kovil" value={profileData.kovil} onChange={handleProfileInputChange} required /></div>
                            <div className="form-group"><label>Pirivu (Division)</label><input type="text" name="pirivu" value={profileData.pirivu} onChange={handleProfileInputChange} required /></div>
                            <div className="form-group"><label>Native Place</label><input type="text" name="nativePlace" value={profileData.nativePlace} onChange={handleProfileInputChange} required /></div>
                            <div className="form-group"><label>Patta Per</label><input type="text" name="pattaPer" value={profileData.pattaPer} onChange={handleProfileInputChange} /></div>
                            <div className="form-group"><label>Resident at Hyderabad?</label><select name="residentOfHyd" value={profileData.residentOfHyd} onChange={handleProfileInputChange} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}><option value="yes" style={{ color: 'black' }}>Yes</option><option value="no" style={{ color: 'black' }}>No</option></select></div>

                            <h3 style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>Family Members</h3>
                            {profileData.familyMembers.length === 0 && <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No family members added yet.</p>}
                            {profileData.familyMembers.map((member, index) => (
                                <div key={index} className="family-member-row">
                                    <input type="text" placeholder="Name" value={member.name || ''} onChange={(e) => handleProfileFamilyChange(index, 'name', e.target.value)} required />
                                    <input type="text" placeholder="Relation" value={member.relation || ''} onChange={(e) => handleProfileFamilyChange(index, 'relation', e.target.value)} required />
                                    <input type="number" placeholder="Age" value={member.age || ''} onChange={(e) => handleProfileFamilyChange(index, 'age', e.target.value)} required />
                                    <input type="tel" placeholder="Phone" value={member.phone || ''} onChange={(e) => handleProfileFamilyChange(index, 'phone', e.target.value)} />
                                    <button type="button" onClick={() => removeProfileFamilyMember(index)} className="remove-btn">✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={addProfileFamilyMember} className="add-family-btn" style={{ width: '100%', marginBottom: '2rem' }}>+ Add Family Member</button>

                            <button type="submit" className="btn-update" disabled={profileLoading}>{profileLoading ? 'Saving...' : '💾 Save Profile Details'}</button>
                        </form>

                        <div className="password-section">
                            <button type="button" onClick={() => setIsEditingPassword(!isEditingPassword)} className="btn-toggle-password">{isEditingPassword ? 'Cancel' : '🔒 Change Password'}</button>
                            {isEditingPassword && (
                                <form onSubmit={handlePasswordUpdate} className="password-form">
                                    <div className="form-group password-input-wrapper"><label>Current Password *</label><div className="password-field"><input type={showCurrentPassword ? 'text' : 'password'} name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordInputChange} required /><button type="button" className="toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</button></div></div>
                                    <div className="form-group password-input-wrapper"><label>New Password *</label><div className="password-field"><input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordInputChange} required /><button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</button></div></div>
                                    <div className="form-group password-input-wrapper"><label>Confirm New Password *</label><div className="password-field"><input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordInputChange} required /><button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</button></div></div>
                                    <button type="submit" className="btn-update" style={{ background: '#F4B41A', color: '#000' }}>Update Password</button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDashboard;
