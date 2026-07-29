import { createApp } from './src/app.js';
import { config } from './src/config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`GLASS server listening on http://localhost:${config.port}`);
});
