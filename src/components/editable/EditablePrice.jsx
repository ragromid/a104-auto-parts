import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const EditablePrice = ({ value, onSave, className = '', currency = '$' }) => {
    const { isAdminMode } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        const num = parseFloat(tempValue);
        if (!isNaN(num) && num !== value) {
            onSave(num);
        } else {
            setTempValue(value); // Revert if invalid
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    };

    if (!isAdminMode) {
        return <span className={className}>{currency}{value}</span>;
    }

    if (isEditing) {
        return (
            <div className="flex items-center">
                <span className="text-gray-500 mr-1">{currency}</span>
                <input
                    ref={inputRef}
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="bg-white text-black p-1 border rounded shadow-sm w-20"
                />
            </div>
        );
    }

    return (
        <span
            onClick={() => setIsEditing(true)}
            className={`${className} cursor-pointer hover:bg-green-100/20 hover:outline hover:outline-2 hover:outline-dashed hover:outline-green-400 rounded px-1 -ml-1 transition-all`}
            title="Click to edit price"
        >
            {currency}{value}
        </span>
    );
};

export default EditablePrice;
