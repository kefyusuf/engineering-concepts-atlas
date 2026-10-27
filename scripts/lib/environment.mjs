const MIN_NODE_22 = [22, 23, 4];

export function supportedNode(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version ?? '');
  if (!match) return false;
  const [major, minor, patch] = match.slice(1).map(Number);
  if (major < 22 || major % 2 !== 0) return false;
  if (major > 22) return true;
  return minor > MIN_NODE_22[1] || (minor === MIN_NODE_22[1] && patch >= MIN_NODE_22[2]);
}

export function assessM12Environment({ nodeVersion, hasDependencies, hasLockfile, hasChromium }) {
  const errors = [];
  if (!supportedNode(nodeVersion)) errors.push(`Node.js ${nodeVersion} is unsupported; use Node.js 22.23.4+ or a supported even-numbered major.`);
  if (!hasDependencies) errors.push('Astro/Starlight dependencies missing: run npm install from the project root.');
  if (!hasLockfile) errors.push('package-lock.json missing: run npm install, then commit the generated lockfile for reproducible CI.');
  if (!hasChromium) errors.push('Chromium-based browser not detected: install Chrome/Edge or set CHROME_BIN to an executable.');
  return { ready: errors.length === 0, errors };
}
