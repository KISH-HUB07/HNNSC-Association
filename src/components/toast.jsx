import React, { useEffect } from 'react';
import './toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`toast-container ${type}`}>
            <div className="toast-content">
                <span className="toast-icon">
                    {type === 'success' && '✅'}
                    {type === 'error' && '❌'}
                    {type === 'info' && 'ℹ️'}
                    {type === 'warning' && '⚠️'}
                </span>
                <p className="toast-message">{message}</p>
                <button className="toast-close" onClick={onClose}>×</button>
            </div>
            <div className="toast-progress-bar"></div>
        </div>
    );
};

export default Toast;
