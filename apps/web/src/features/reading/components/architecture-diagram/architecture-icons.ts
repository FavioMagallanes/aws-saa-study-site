const rawIcons = import.meta.glob<string>('./icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Pele draws each icon inside a 24-unit box. The official files are 48-64px squares, so only the
// outer size and the <title> (the source path, shown as a tooltip) are adjusted; the artwork is intact.
const fitToIconBox = (markup: string): string =>
  markup
    .replace(/<\?xml[^>]*\?>\s*/, '')
    .replace(/<title>[^<]*<\/title>\s*/, '')
    .replace(/width="\d+px" height="\d+px"/, 'width="24" height="24"');

// Closed allowlist: Pele inserts the returned markup unfiltered, so only the
// official AWS icons bundled in ./icons can be resolved, by exact name.
const iconsByName = new Map<string, string>(
  Object.entries(rawIcons).flatMap(([path, markup]) => {
    const fileName = path
      .split('/')
      .pop()
      ?.replace(/\.svg$/, '');
    return fileName === undefined ? [] : [[`aws:${fileName}`, fitToIconBox(markup)] as const];
  }),
);

export const resolveArchitectureIcon = (name: string): string | null =>
  iconsByName.get(name) ?? null;
