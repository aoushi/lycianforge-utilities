export function ThemeScript() {
  const script = `
    (function() {
      try {
        var storage = window.localStorage;
        var mode = storage.getItem('lf-theme-mode') || 'system';
        var palette = storage.getItem('lf-theme-palette') || 'midnight';
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = mode === 'dark' || (mode === 'system' && prefersDark);
        var root = document.documentElement;
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        root.setAttribute('data-initial-mode', mode);
        root.setAttribute('data-palette', palette);
      } catch (error) {
        console.error('Theme init failed', error);
      }
    })();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

