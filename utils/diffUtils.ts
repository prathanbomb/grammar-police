export interface DiffSegment {
  text: string;
  type: 'unchanged' | 'added' | 'removed';
}

/**
 * Extract plain text from HTML
 */
export function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText || div.textContent || '';
}

/**
 * Tokenize text into words while preserving whitespace
 */
function tokenize(text: string): string[] {
  // Split by whitespace but keep the delimiters
  return text.split(/(\s+)/).filter(t => t.length > 0);
}

/**
 * Compute Longest Common Subsequence table
 */
function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Backtrack through LCS table to find the diff
 */
function backtrackLCS(
  dp: number[][],
  a: string[],
  b: string[],
  i: number,
  j: number,
  resultA: DiffSegment[],
  resultB: DiffSegment[]
): void {
  if (i === 0 && j === 0) return;

  if (i > 0 && j > 0 && a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
    backtrackLCS(dp, a, b, i - 1, j - 1, resultA, resultB);
    resultA.push({ text: a[i - 1], type: 'unchanged' });
    resultB.push({ text: b[j - 1], type: 'unchanged' });
  } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
    backtrackLCS(dp, a, b, i, j - 1, resultA, resultB);
    resultB.push({ text: b[j - 1], type: 'added' });
  } else if (i > 0) {
    backtrackLCS(dp, a, b, i - 1, j, resultA, resultB);
    resultA.push({ text: a[i - 1], type: 'removed' });
  }
}

/**
 * Merge consecutive segments of the same type
 */
function mergeSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) return [];

  const merged: DiffSegment[] = [];
  let current = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    // Merge if same type, or if current is unchanged whitespace
    if (seg.type === current.type) {
      current.text += seg.text;
    } else {
      merged.push(current);
      current = { ...seg };
    }
  }
  merged.push(current);

  return merged;
}

/**
 * Compute word-level diff between two texts
 */
export function computeDiff(originalHtml: string, correctedHtml: string): {
  originalSegments: DiffSegment[];
  correctedSegments: DiffSegment[];
} {
  const originalText = extractText(originalHtml);
  const correctedText = extractText(correctedHtml);

  const originalTokens = tokenize(originalText);
  const correctedTokens = tokenize(correctedText);

  // Handle empty cases
  if (originalTokens.length === 0 && correctedTokens.length === 0) {
    return { originalSegments: [], correctedSegments: [] };
  }

  if (originalTokens.length === 0) {
    return {
      originalSegments: [],
      correctedSegments: [{ text: correctedText, type: 'added' }]
    };
  }

  if (correctedTokens.length === 0) {
    return {
      originalSegments: [{ text: originalText, type: 'removed' }],
      correctedSegments: []
    };
  }

  // Compute LCS
  const dp = computeLCS(originalTokens, correctedTokens);

  // Backtrack to get diff
  const originalSegments: DiffSegment[] = [];
  const correctedSegments: DiffSegment[] = [];

  backtrackLCS(
    dp,
    originalTokens,
    correctedTokens,
    originalTokens.length,
    correctedTokens.length,
    originalSegments,
    correctedSegments
  );

  return {
    originalSegments: mergeSegments(originalSegments),
    correctedSegments: mergeSegments(correctedSegments)
  };
}
