import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from './RichTextEditor';
import CheckIcon from '@mui/icons-material/Check';

const EditableText = ({ value, onSave, className = '', tag = 'span', multiline = false, rich = false }) => {
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
        return rich ? <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} /> : <Tag className={className}>{value}</Tag>;
    }

    if (isEditing) {
        if (rich) {
            return (
                <div className="relative w-full z-50 bg-black/80 p-3 rounded-xl border border-white/20 shadow-2xl backdrop-blur-md mb-4">
                    <RichTextEditor
                        value={tempValue}
                        onChange={setTempValue}
                        className={`bg-white/5 border-white/10 ${className}`}
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 shadow-lg transition-colors text-sm font-medium"
                        >
                            <CheckIcon fontSize="small" /> Save
                        </button>
                    </div>
                </div>
            );
        }

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
    return rich ? (
        <Tag
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={`${className} cursor-pointer hover:bg-yellow-100/20 dark:hover:bg-yellow-500/20 hover:outline hover:outline-2 hover:outline-dashed hover:outline-yellow-400 rounded transition-all duration-200 relative`}
            title="Click to edit (Rich Text)"
            dangerouslySetInnerHTML={{ __html: value }}
        />
    ) : (
        <Tag
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={`${className} cursor-pointer hover:bg-yellow-100/20 dark:hover:bg-yellow-500/20 hover:outline hover:outline-2 hover:outline-dashed hover:outline-yellow-400 rounded transition-all duration-200 relative`}
            title="Click to edit"
        >
            {value}
        </Tag>
    );
};

export default EditableText;
