/**
 * Tailwind class merger (lightweight) – deduplicates and resolves simple conflicts by keeping the last token in a group.
 * If you later add tailwind-merge/clsx, replace implementation with twMerge(clsx(...)).
 */
export function mergeTw(...parts: Array<string | false | null | undefined>): string {
  const tokens = parts
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Basic groups to avoid obvious conflicts (background, text color, paddings, radius, shadow, sizing, layout)
  const groupMatchers: Array<RegExp> = [
    /^bg-/, /^text-/, /^px-/, /^py-/, /^p-/, /^m[trblxy]?-/,
    /^rounded/, /^shadow/, /^grid-/, /^flex$/, /^items-/, /^justify-/, /^gap-/,
    /^w-/, /^h-/, /^max-w-/, /^max-h-/
  ];

  const resolvedByGroup = new Map<string, string>();
  const passThrough: string[] = [];

  const getGroupKey = (token: string): string | null => {
    const idx = groupMatchers.findIndex(rx => rx.test(token));
    return idx >= 0 ? String(idx) : null;
  };

  for (const token of tokens) {
    // Guard against obviously malformed tokens like bg-bg-*
    if (/^(bg-bg-|text-text-)/.test(token)) continue;
    const groupKey = getGroupKey(token);
    if (groupKey) {
      // Keep last token per group (right-most wins)
      resolvedByGroup.set(groupKey, token);
    } else {
      // Keep unique non-group tokens in insertion order
      passThrough.push(token);
    }
  }

  return [...passThrough, ...resolvedByGroup.values()].join(' ').trim();
}


