import Express from 'express';
import { renderToPipeableStream } from 'react-dom/server';
import { join } from 'path';

import Page from './components/page';

const app = Express();

app.use('/assets', Express.static(join(__dirname, 'assets')));

app.get(/.*/, function(request, response) {
  const { pipe } = renderToPipeableStream(<Page />, {
    bootstrapScripts: [
      '/assets/client.js'
    ],
    onShellReady: function() {
      response.setHeader('content-type', 'text/html');

      pipe(response);
    }
  });
});

app.use(function(error, request, response, next) {
  response.json({
    errors: [{
      message: error.message
    }]
  });
});

app.listen(80, '0.0.0.0', function() {
  console.log(`${ process.env.SERVICE } started @ http://0.0.0.0`);
});
