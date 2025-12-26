import React from 'react';

export const CorrectionLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
      <span className="text-gray-500 font-medium">Legend:</span>

      {/* Spelling */}
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-12 h-4 rounded bg-guardsman-500/15 border-b-2 border-guardsman-500" style={{ textDecoration: 'underline wavy', textDecorationColor: '#dc2626' }}></span>
        <span>Spelling</span>
      </span>

      {/* Grammar */}
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-12 h-4 rounded bg-royal-500/15 border-b-2 border-royal-500"></span>
        <span>Grammar</span>
      </span>

      {/* Tone */}
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-12 h-4 rounded bg-amber-500/15 border-b-2 border-dashed border-amber-500"></span>
        <span>Tone</span>
      </span>

      {/* Punctuation */}
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-12 h-4 rounded bg-emerald-500/15 border-b-2 border-dotted border-emerald-600"></span>
        <span>Punctuation</span>
      </span>
    </div>
  );
};
