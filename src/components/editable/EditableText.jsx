import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const EditableText = ({ value, onSave, className = '', tag = 'span', multiline = false }) => {
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
        if (tempValue !== value) {
            onSave(tempValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        e.stopPropagation(); // Prevent parent handlers (like buttons) from catching Space/Enter
        if (e.key === 'Enter' && !multiline) {
            handleSave();
        } else if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    };

    if (!isAdminMode) {
        const Tag = tag;
        return <Tag className={className}>{value}</Tag>;
    }

    if (isEditing) {
        return multiline ? (
            <textarea
                ref={inputRef}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={`bg-white text-black p-1 border rounded shadow-sm w-full min-h-[60px] ${className}`}
            />
        ) : (
            <input
                ref={inputRef}
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={`bg-white text-black p-1 border rounded shadow-sm w-full ${className}`}
            />
        );
    }

    const Tag = tag;
    return (
        <Tag
            onClick={() => setIsEditing(true)}
            className={`${className} cursor-pointer hover:bg-yellow-100/20 dark:hover:bg-yellow-500/20 hover:outline hover:outline-2 hover:outline-dashed hover:outline-yellow-400 rounded transition-all duration-200 relative`}
            title="Click to edit"
        >
            {value}
        </Tag>
    );
};

export default EditableText;
