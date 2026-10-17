/**
 * Robust copy helper with fallback for all browser contexts
 */
export function copyToClipboardSafe(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve(true))
        .catch(() => {
          fallbackCopy(text);
          resolve(true);
        });
    } else {
      fallbackCopy(text);
      resolve(true);
    }
  });
}

function fallbackCopy(text: string) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch {}
}
