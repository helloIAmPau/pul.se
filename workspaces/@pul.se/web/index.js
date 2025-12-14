import { server, assets } from '@pul.se/http';
import { renderToPipeableStream } from 'react-dom/server';
import { join } from 'path';

import Page from './components/page';

const app = server();

app.use('/assets', assets(join(__dirname, 'assets')))

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

app.start();
