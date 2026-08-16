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

/**
 * @post expects an SSE response, so a plain res.redirect() on success gets
 * swallowed by the client's SSE reader instead of navigating the browser.
 * Appending a <script> via patch-elements runs client-side and does the redirect for us.
 */
export function redirectClient(res, url) {
  patchElements(res, `<script>window.location = ${JSON.stringify(url)}</script>`, {
    selector: 'body',
    mode: 'append',
  });
}
