import express from 'express';
import { renderToPipeableStream } from 'react-dom/server';
import { join } from 'path';

import Page from './components/page';

const app = express();

app.use('/assets', express.static(join(__dirname, 'assets')))

app.get(/.*/, function(request, response) {
  const { pipe } = renderToPipeableStream(<Page />, {
    bootstrapScripts: [
      '/assets/client.js'
    ],
    onShellReady: function() {
      response.setHeader('content-type', 'text/html');

      pipe(response);
    }
  })
});

app.listen(80, '0.0.0.0', function() {
  console.log(`${ process.env.service } started @ http://0.0.0.0`);
});
