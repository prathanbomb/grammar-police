import React, { useMemo, useRef, useCallback } from 'react';
import { computeDiff, DiffSegment } from '../utils/diffUtils';

interface DiffViewProps {
  originalHtml: string;
  correctedHtml: string;
}

const DiffSegmentRenderer: React.FC<{ segments: DiffSegment[]; side: 'original' | 'corrected' }> = ({
  segments,
  side
}) => {
  return (
    <div className="prose prose-slate max-w-none text-lg leading-relaxed font-serif">
      {segments.map((segment, index) => {
        if (segment.type === 'unchanged') {
          return <span key={index}>{segment.text}</span>;
        }

        if (side === 'original' && segment.type === 'removed') {
          return (
            <span
              key={index}
              className="bg-guardsman-100 text-guardsman-700 line-through rounded px-0.5"
            >
              {segment.text}
            </span>
          );
        }

        if (side === 'corrected' && segment.type === 'added') {
          return (
            <span
              key={index}
              className="bg-emerald-100 text-emerald-700 font-medium rounded px-0.5"
            >
              {segment.text}
            </span>
          );
        }

        return null;
      })}
    </div>
  );
};

export const DiffView: React.FC<DiffViewProps> = ({ originalHtml, correctedHtml }) => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  // Compute diff
  const { originalSegments, correctedSegments } = useMemo(() => {
    return computeDiff(originalHtml, correctedHtml);
  }, [originalHtml, correctedHtml]);

  // Synchronized scrolling
  const handleScroll = useCallback((source: 'left' | 'right') => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    const sourceEl = source === 'left' ? leftRef.current : rightRef.current;
    const targetEl = source === 'left' ? rightRef.current : leftRef.current;

    if (sourceEl && targetEl) {
      const scrollPercentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);
      targetEl.scrollTop = scrollPercentage * (targetEl.scrollHeight - targetEl.clientHeight);
    }

    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[400px]">
      {/* Original Text */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
          <span className="w-3 h-3 rounded-full bg-guardsman-500/30"></span>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Original</h3>
        </div>
        <div
          ref={leftRef}
          onScroll={() => handleScroll('left')}
          className="flex-1 overflow-y-auto p-4 bg-guardsman-50/30 rounded-lg border border-guardsman-100"
        >
          <DiffSegmentRenderer segments={originalSegments} side="original" />
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:flex items-center">
        <div className="w-px h-full bg-gray-200"></div>
      </div>

      {/* Corrected Text */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
          <span className="w-3 h-3 rounded-full bg-emerald-500/30"></span>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Corrected</h3>
        </div>
        <div
          ref={rightRef}
          onScroll={() => handleScroll('right')}
          className="flex-1 overflow-y-auto p-4 bg-emerald-50/30 rounded-lg border border-emerald-100"
        >
          <DiffSegmentRenderer segments={correctedSegments} side="corrected" />
        </div>
      </div>
    </div>
  );
};
