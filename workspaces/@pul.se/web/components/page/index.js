import { useMemo } from 'react';

import reset from './reset.css';
import styles from './styles.css';

export default function Page() {
  const css = useMemo(function() {
    return [ reset, styles ].map(function(css) {
      return css.replace(/\n/g, '').replace(/\,\s*/g, ',').replace(/\s*{\s*/g, '{').replace(/\:\s*/g, ':').replace(/\;\s*/g, ';');
    }).join('');
  }, []);

  return (
    <html lang='en'>
      <head>
        <title>Pul.SE</title>

        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta charSet='utf-8' />

        <meta name='description' content='Pul.SE is an open-source video distribution platform.' />
        <meta property='og:title' content='Pul.SE' />
        <meta property='og:site_name' content='pul.se' />
        <meta property='og:url' content='https://pul.se' />
        <meta property='og:image' content='https://pul.se/assets/logo.png' />

        <style>
          { css }
        </style>

        <link href='/assets/client.css' rel='stylesheet' />
      </head>
      <body>
        <div id='root'></div>
      </body>
    </html>
  );
};
