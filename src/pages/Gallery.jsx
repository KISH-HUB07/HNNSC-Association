import React, { useState } from 'react';
import './Gallery.css';

// --- IMPORT ALL IMAGES ---
import sangamamImage from '../assets/sangamam.jpg';
import nonbu1 from '../assets/nonbu1.jpg';
import nonbu2 from '../assets/nonbu2.jpg';
import nonbu3 from '../assets/nonbu3.jpg';
import nonbu4 from '../assets/nonbu4.jpg';
import nonbu5 from '../assets/nonbu5.jpg';
import nonbu6 from '../assets/nonbu6.jpg';
import kavadi1 from '../assets/kavadi1.jpg';
import kavadi2 from '../assets/kavadi2.jpg';
import kavadi3 from '../assets/kavadi3.jpg';

const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [modalData, setModalData] = useState(null);

    const galleryItems = [
        {
            id: 1,
            title: 'Sangamam 2025',
            category: 'events',
            description: 'Grand community gathering at Sri Vidyadhari Kshetram.',
            thumbnail: sangamamImage,
            images: [sangamamImage]
        },
        {
            id: 2,
            title: 'Pillayar Nonbu 2025',
            category: 'religious',
            description: 'Nagarathar unique festival celebration in December.',
            thumbnail: nonbu1,
            images: [nonbu1, nonbu2, nonbu3, nonbu4, nonbu5, nonbu6]
        },
        {
            id: 3,
            title: 'Murugan Kaavadi Poojai',
            category: 'religious',
            description: 'Murugan Kaavadi Poojai Jan 2026.',
            thumbnail: kavadi1, // Main cover image
            images: [kavadi1, kavadi2, kavadi3] // Album with 3 images
        }
    ];

    const categories = [
        { id: 'all', name: 'All' },
        { id: 'events', name: 'Events' },
        { id: 'religious', name: 'Religious' }
    ];

    const filteredItems = selectedCategory === 'all'
        ? galleryItems
        : galleryItems.filter(item => item.category === selectedCategory);

    const openAlbum = (item) => {
        setModalData({ images: item.images, currentIndex: 0, title: item.title, description: item.description });
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setModalData(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setModalData(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }));
    };

    return (
        <div className="gallery-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Our Gallery</h1>
                    <p className="header-subtitle">Capturing memories from our community</p>
                </div>
            </div>

            <section className="gallery-section">
                <div className="container">
                    <div className="gallery-filters">
                        {categories.map(cat => (
                            <button key={cat.id} className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.id)}>{cat.name}</button>
                        ))}
                    </div>

                    <div className="gallery-grid">
                        {filteredItems.map(item => (
                            <div key={item.id} className="gallery-item" onClick={() => openAlbum(item)}>
                                <div className="gallery-image-wrapper">
                                    <img src={item.thumbnail} alt={item.title} className="gallery-img" />
                                    <div className="image-overlay">
                                        <span className="overlay-icon">📷</span>
                                        <span className="overlay-text">{item.images.length > 1 ? `View Album (${item.images.length})` : 'View Full Size'}</span>
                                    </div>
                                    {item.images.length > 1 && <div className="multi-photo-badge">❐ {item.images.length}</div>}
                                </div>
                                <div className="gallery-info">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                    <span className="category-tag">{item.category}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {modalData && (
                <div className="fullscreen-modal" onClick={() => setModalData(null)}>
                    <button className="close-modal">✕</button>
                    <img src={modalData.images[modalData.currentIndex]} alt="Gallery" className="fullscreen-img" onClick={(e) => e.stopPropagation()} />
                    {modalData.images.length > 1 && (
                        <>
                            <button className="nav-btn prev" onClick={prevImage}>❮</button>
                            <button className="nav-btn next" onClick={nextImage}>❯</button>
                            <div className="slide-counter">{modalData.currentIndex + 1} / {modalData.images.length}</div>
                        </>
                    )}
                    <div className="fullscreen-caption">
                        <h2>{modalData.title}</h2>
                        <p>{modalData.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;