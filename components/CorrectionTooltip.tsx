import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GrammarCorrection } from '../types';
import { getCorrectionBadgeClasses } from '../utils/highlightUtils';

interface CorrectionTooltipProps {
  correction: GrammarCorrection | null;
  targetRect: DOMRect | null;
  visible: boolean;
}

export const CorrectionTooltip: React.FC<CorrectionTooltipProps> = ({
  correction,
  targetRect,
  visible
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, placement: 'top' as 'top' | 'bottom' });

  useEffect(() => {
    if (!visible || !targetRect || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 8;

    // Default: position above the target, centered horizontally
    let x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    let y = targetRect.top - tooltipRect.height - padding;
    let placement: 'top' | 'bottom' = 'top';

    // Adjust horizontal position if overflowing
    if (x < padding) {
      x = padding;
    } else if (x + tooltipRect.width > window.innerWidth - padding) {
      x = window.innerWidth - tooltipRect.width - padding;
    }

    // If no room above, show below
    if (y < padding) {
      y = targetRect.bottom + padding;
      placement = 'bottom';
    }

    setPosition({ x, y, placement });
  }, [visible, targetRect]);

  if (!visible || !correction) return null;

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className="fixed z-50 animate-fadeIn pointer-events-none"
      style={{ left: position.x, top: position.y }}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-xs">
        {/* Arrow indicator */}
        <div
          className={`absolute w-2 h-2 bg-white border-gray-200 transform rotate-45 ${
            position.placement === 'top'
              ? 'bottom-[-5px] border-r border-b'
              : 'top-[-5px] border-l border-t'
          }`}
          style={{ left: '50%', marginLeft: '-4px' }}
        />

        {/* Type badge */}
        <div className="mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getCorrectionBadgeClasses(correction.type)}`}>
            {correction.type}
          </span>
        </div>

        {/* Original -> Correction */}
        <p className="text-sm mb-2">
          <span className="text-guardsman-600 line-through">{correction.original}</span>
          <span className="mx-2 text-gray-400">→</span>
          <span className="font-semibold text-royal-700">{correction.correction}</span>
        </p>

        {/* Explanation */}
        <p className="text-sm text-gray-600 italic">
          "{correction.explanation}"
        </p>
      </div>
    </div>
  );

  return createPortal(tooltipContent, document.body);
};
