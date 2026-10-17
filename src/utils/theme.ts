export type ThemeMode = 'dark' | 'light';

export function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem('lovix_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {}
  return 'dark'; // Default premium dark
}

export function applyTheme(theme: ThemeMode) {
  try {
    localStorage.setItem('lovix_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  } catch {}
}
