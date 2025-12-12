import React from 'react';
import { Tone } from '../types';
import { FileText, MessageCircle, Mail, Mic } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: Tone;
  onSelect: (tone: Tone) => void;
  disabled?: boolean;
}

const tones = [
  { value: Tone.ORIGINAL, label: 'Original', icon: <FileText className="w-4 h-4" /> },
  { value: Tone.CHAT, label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
  { value: Tone.EMAIL, label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: Tone.SPEAKING, label: 'Speaking', icon: <Mic className="w-4 h-4" /> },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onSelect, disabled }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-royal-900 font-serif tracking-wide">
        Select Your Tone
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tones.map((t) => (
          <button
            key={t.value}
            onClick={() => onSelect(t.value)}
            disabled={disabled}
            className={`
              flex items-center justify-center gap-2 px-3 py-3 rounded-lg border transition-all duration-200
              ${selectedTone === t.value 
                ? 'bg-royal-800 text-white border-royal-900 shadow-md transform scale-[1.02]' 
                : 'bg-white text-gray-700 border-gray-200 hover:border-royal-400 hover:bg-royal-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {t.icon}
            <span className="text-sm font-medium truncate">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};