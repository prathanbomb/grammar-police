import { GrammarCorrection } from '../types';

export type CorrectionType = GrammarCorrection['type'];

interface IndexedCorrection extends GrammarCorrection {
  originalIndex: number;
}

interface CorrectionMatch {
  start: number;
  end: number;
  correction: IndexedCorrection;
}

/**
 * Get Tailwind CSS classes for a correction type
 */
export function getCorrectionTypeClasses(type: CorrectionType): string {
  const baseClasses = 'correction-highlight cursor-pointer transition-all duration-200 rounded-sm px-0.5 -mx-0.5';

  switch (type) {
    case 'spelling':
      return `${baseClasses} bg-guardsman-500/15 decoration-wavy decoration-guardsman-500 underline underline-offset-4`;
    case 'grammar':
      return `${baseClasses} bg-royal-500/15 border-b-2 border-royal-500`;
    case 'tone':
      return `${baseClasses} bg-amber-500/15 border-b-2 border-dashed border-amber-500`;
    case 'punctuation':
      return `${baseClasses} bg-emerald-500/15 border-b-2 border-dotted border-emerald-600`;
    default:
      return baseClasses;
  }
}

/**
 * Get badge classes for correction type
 */
export function getCorrectionBadgeClasses(type: CorrectionType): string {
  switch (type) {
    case 'spelling':
      return 'bg-guardsman-100 text-guardsman-700';
    case 'grammar':
      return 'bg-royal-100 text-royal-700';
    case 'tone':
      return 'bg-amber-100 text-amber-700';
    case 'punctuation':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Create a regex pattern for matching correction text
 */
function createMatchPattern(text: string): RegExp {
  // Escape regex special characters
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Simple case-insensitive match - more permissive to catch all corrections
  return new RegExp(escaped, 'gi');
}

/**
 * Walk through all text nodes in a DOM tree
 */
function walkTextNodes(node: Node, callback: (textNode: Text) => void): void {
  if (node.nodeType === Node.TEXT_NODE) {
    callback(node as Text);
  } else {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      walkTextNodes(child, callback);
    }
  }
}

/**
 * Find all matches of corrections in a text string
 */
function findMatches(text: string, corrections: IndexedCorrection[]): CorrectionMatch[] {
  const matches: CorrectionMatch[] = [];
  const usedPositions = new Set<string>();

  corrections.forEach((correction) => {
    const pattern = createMatchPattern(correction.correction);
    let match: RegExpExecArray | null;

    // Reset lastIndex for global regex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const posKey = `${match.index}-${match.index + match[0].length}`;

      // Avoid overlapping matches
      if (!usedPositions.has(posKey)) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          correction
        });
        usedPositions.add(posKey);
        // Only match first occurrence of each correction
        break;
      }
    }
  });

  // Sort by position
  return matches.sort((a, b) => a.start - b.start);
}

/**
 * Process a text node and replace corrections with highlighted spans
 */
function processTextNode(
  textNode: Text,
  corrections: IndexedCorrection[],
  usedCorrections: Set<number>
): void {
  const text = textNode.textContent || '';
  if (!text.trim()) return;

  // Find corrections that haven't been used yet
  const availableCorrections = corrections.filter(c => !usedCorrections.has(c.originalIndex));
  if (availableCorrections.length === 0) return;

  const matches = findMatches(text, availableCorrections);
  if (matches.length === 0) return;

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const match of matches) {
    // Add text before match
    if (match.start > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.start)));
    }

    // Create highlighted span
    const span = document.createElement('span');
    span.className = getCorrectionTypeClasses(match.correction.type);
    span.setAttribute('data-correction-index', String(match.correction.originalIndex));
    span.setAttribute('data-correction-type', match.correction.type);
    span.setAttribute('data-original', match.correction.original);
    span.setAttribute('data-explanation', match.correction.explanation);
    span.textContent = text.slice(match.start, match.end);
    fragment.appendChild(span);

    // Mark this correction as used by its original index
    usedCorrections.add(match.correction.originalIndex);

    lastIndex = match.end;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  // Replace the text node with our fragment
  textNode.parentNode?.replaceChild(fragment, textNode);
}

/**
 * Highlight corrections in HTML string
 * Returns the modified HTML with highlighted spans
 */
export function highlightCorrectionsInHtml(
  html: string,
  corrections: GrammarCorrection[]
): string {
  if (!html) return '';
  if (!corrections || corrections.length === 0) return html;

  // Map corrections with their original index, then filter out invalid ones
  const indexedCorrections: IndexedCorrection[] = corrections
    .map((c, i) => ({ ...c, originalIndex: i }))
    .filter(c =>
      c.correction &&
      c.correction.trim().length > 0 &&
      c.type
    );

  if (indexedCorrections.length === 0) return html;

  // Parse HTML into DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="highlight-root">${html}</div>`, 'text/html');
  const container = doc.getElementById('highlight-root');

  if (!container) return html;

  // Track which corrections have been matched
  const usedCorrections = new Set<number>();

  // Collect all text nodes first (to avoid mutation issues during iteration)
  const textNodes: Text[] = [];
  walkTextNodes(container, (node) => textNodes.push(node));

  // Process each text node
  for (const textNode of textNodes) {
    processTextNode(textNode, indexedCorrections, usedCorrections);
  }

  return container.innerHTML;
}

/**
 * Extract plain text from HTML (for copy functionality)
 */
export function extractPlainText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText;
}
