import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}> = ({ icon, onClick, disabled, title }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    title={title}
    className={`
      p-1.5 rounded hover:bg-white transition-colors
      ${disabled ? 'opacity-40 cursor-default' : 'text-gray-600 hover:text-royal-600 hover:shadow-sm'}
    `}
  >
    {icon}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  disabled,
  readOnly,
  placeholder,
  className = "h-64"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync value from props to editable div
  useEffect(() => {
    if (editorRef.current) {
      // Only update if the value is different and we didn't just type it ourselves
      // or if the value is empty (resetting)
      if (editorRef.current.innerHTML !== value) {
        // If we are focused, be careful about overwriting unless value is empty (clear)
        if (document.activeElement !== editorRef.current || !value) {
           editorRef.current.innerHTML = value;
        }
      }
    }
  }, [value]);

  const handleInput = () => {
    if (readOnly) return;
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      // When empty, browsers might leave <br> or similar. Normalize to empty string.
      onChange(html === '<br>' ? '' : html);
      isInternalUpdate.current = false;
    }
  };

  const execCommand = (command: string) => {
    if (disabled || readOnly) return;
    document.execCommand(command, false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const interactionDisabled = disabled || readOnly;

  return (
    <div className={`
      flex flex-col w-full rounded-lg bg-gray-50 border border-gray-200 
      ${!interactionDisabled ? 'focus-within:border-royal-500 focus-within:ring-2 focus-within:ring-royal-200' : ''}
      transition-all duration-200 overflow-hidden bg-white
      ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      ${className}
    `}>
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 select-none overflow-x-auto">
        <ToolbarButton title="Bold" icon={<Bold className="w-4 h-4" />} onClick={() => execCommand('bold')} disabled={interactionDisabled} />
        <ToolbarButton title="Italic" icon={<Italic className="w-4 h-4" />} onClick={() => execCommand('italic')} disabled={interactionDisabled} />
        <ToolbarButton title="Underline" icon={<Underline className="w-4 h-4" />} onClick={() => execCommand('underline')} disabled={interactionDisabled} />
        <div className="w-px h-4 bg-gray-300 mx-1 flex-shrink-0" />
        <ToolbarButton title="Bullet List" icon={<List className="w-4 h-4" />} onClick={() => execCommand('insertUnorderedList')} disabled={interactionDisabled} />
      </div>
      
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={editorRef}
          contentEditable={!disabled && !readOnly}
          onInput={handleInput}
          data-placeholder={placeholder}
          className="w-full h-full p-4 outline-none overflow-y-auto prose prose-slate max-w-none text-lg leading-relaxed font-serif empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
          style={{ minHeight: '100%' }}
        />
      </div>
    </div>
  );
};