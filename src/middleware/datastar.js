function writeFrame(res, event, dataLines) {
  const frame = [`event: ${event}`, ...dataLines.map((line) => `data: ${line}`), '', ''].join('\n');
  res.write(frame);
}

export function startSSE(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
}

export function patchSignals(res, signals) {
  writeFrame(res, 'datastar-patch-signals', [`signals ${JSON.stringify(signals)}`]);
}

/**
 * @param {import('http').ServerResponse} res
 * @param {string} html
 * @param {{ selector?: string, mode?: string }} [options]
 */
export function patchElements(res, html, { selector, mode } = {}) {
  const dataLines = [];
  if (selector) dataLines.push(`selector ${selector}`);
  if (mode) dataLines.push(`mode ${mode}`);
  for (const line of html.split('\n')) dataLines.push(`elements ${line}`);
  writeFrame(res, 'datastar-patch-elements', dataLines);
}
