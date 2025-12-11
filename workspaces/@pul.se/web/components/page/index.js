import reset from './reset.css';
import theme from './theme.css';

export default function Page() {
  return (
    <html>
      <head>
        <style>
          { reset }
        </style>
        <style>
          { theme }
        </style>
        <link rel='stylesheet' href='/assets/client.css' />
      </head>
      <body>
        <div id='root'></div>
      </body>
    </html>
  );
};
