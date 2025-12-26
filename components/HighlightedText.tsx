import React, { useMemo, useCallback } from 'react';
import { GrammarCorrection } from '../types';
import { highlightCorrectionsInHtml } from '../utils/highlightUtils';

interface HighlightedTextProps {
  html: string;
  corrections: GrammarCorrection[];
  onCorrectionHover?: (correction: GrammarCorrection | null, rect: DOMRect | null) => void;
  onCorrectionClick?: (correctionIndex: number) => void;
  className?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  html,
  corrections,
  onCorrectionHover,
  onCorrectionClick,
  className = ''
}) => {
  // Memoize the highlighted HTML to avoid re-processing on every render
  const highlightedHtml = useMemo(() => {
    return highlightCorrectionsInHtml(html, corrections);
  }, [html, corrections]);

  // Event delegation for hover events
  const handleMouseOver = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCorrectionHover) return;

    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-correction-index')) {
      const index = parseInt(target.getAttribute('data-correction-index') || '0', 10);
      const correction = corrections[index];
      if (correction) {
        const rect = target.getBoundingClientRect();
        onCorrectionHover(correction, rect);
      }
    }
  }, [corrections, onCorrectionHover]);

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCorrectionHover) return;

    const target = e.target as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement | null;

    // Only trigger if we're leaving a correction span
    if (target.hasAttribute('data-correction-index')) {
      // Check if we're moving to another part of the same correction or outside
      if (!relatedTarget || !relatedTarget.hasAttribute('data-correction-index')) {
        onCorrectionHover(null, null);
      }
    }
  }, [onCorrectionHover]);

  // Event delegation for click events
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCorrectionClick) return;

    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-correction-index')) {
      const index = parseInt(target.getAttribute('data-correction-index') || '0', 10);
      onCorrectionClick(index);
    }
  }, [onCorrectionClick]);

  return (
    <div
      className={`prose prose-slate max-w-none text-lg leading-relaxed font-serif ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
    />
  );
};
