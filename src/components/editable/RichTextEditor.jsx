import React, { useRef, useEffect, useState } from 'react';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import PaletteIcon from '@mui/icons-material/Palette';

const RichTextEditor = ({ value, onChange, className = '' }) => {
    const editorRef = useRef(null);
    const [color, setColor] = useState('#ff5722'); // Default to an orange/secondary color
    const initialized = useRef(false);
    const savedSelection = useRef(null);

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            savedSelection.current = sel.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        if (savedSelection.current) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSelection.current);
        }
    };

    // Initialize content
    useEffect(() => {
        if (!initialized.current && editorRef.current && value !== undefined) {
            editorRef.current.innerHTML = value;
            initialized.current = true;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const formatText = (e, command, value = null) => {
        e.preventDefault(); // Prevent focus loss
        restoreSelection();
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            editorRef.current.focus();
            saveSelection();
        }
    };

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setColor(newColor);
        restoreSelection();
        document.execCommand('foreColor', false, newColor);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            editorRef.current.focus();
            saveSelection();
        }
    };

    return (
        <div className="w-full flex flex-col gap-2">
            {/* Toolbar */}
            <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-lg border border-white/20 backdrop-blur-md">
                <button
                    onMouseDown={(e) => formatText(e, 'bold')}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Bold"
                >
                    <FormatBoldIcon fontSize="small" />
                </button>
                <button
                    onMouseDown={(e) => formatText(e, 'italic')}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Italic"
                >
                    <FormatItalicIcon fontSize="small" />
                </button>
                <button
                    onMouseDown={(e) => formatText(e, 'underline')}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Underline"
                >
                    <FormatUnderlinedIcon fontSize="small" />
                </button>
                
                <div className="w-px h-5 bg-white/20 mx-1"></div>

                <div className="relative flex items-center group">
                    <button 
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors flex items-center gap-1"
                        title="Text Color"
                    >
                        <PaletteIcon fontSize="small" />
                        <div className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: color }}></div>
                    </button>
                    {/* Hidden color input stretched over the button */}
                    <input
                        type="color"
                        value={color}
                        onMouseDown={saveSelection}
                        onChange={handleColorChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                </div>
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                className={`w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary min-h-[60px] cursor-text select-text ${className}`}
                contentEditable={true}
                onInput={handleInput}
                onBlur={(e) => {
                    saveSelection();
                    handleInput(e);
                }}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                suppressContentEditableWarning={true}
            />
        </div>
    );
};

export default RichTextEditor;
