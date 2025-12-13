import express from 'express';
import { providers } from './providers';
import { http } from './http';
import { query } from '@pul.se/postgres';
import { sign, verify } from '@pul.se/jwt';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());

app.get('/auth/providers', function(request, response) {
  response.json({
    data: {
      providers: providers.map(function({ id, label, icon, authorization }) {
        return {
          id,
          label,
          icon,
          authorization
        };
      })
    }
  });
});

app.get('/auth/valid', function(request, response) {
  try {
    verify(request.cookies.ACCESS_TOKEN);
    response.json({
      data: {
        valid: true
      }
    });
  } catch(error) {
    console.log(error);

    throw new Error('Unauthorized');
  }
});

app.get('/auth/callback', function(request, response) {
  const state = JSON.parse(request.query.state);
  const code = request.query.code;

  const { token, api } = providers.find(function({ id }) {
    return id === state.id;
  });

  return http(`${ token }&code=${ code }`, {
    method: 'POST'
  }).then(function({ access_token }) {
    return http(api, {
      headers: {
        authorization: `Bearer ${ access_token }`
      }
    });
  }).then(function({ email }) {
    return query(`
insert into users (email) values ($1) on conflict (email) do update set email = $1 returning uid
    `, [ email ]);
  }).then(function({ rows }) {
    return sign(rows[0]);
  }).then(function(token) {
    response.cookie('ACCESS_TOKEN', token, { httpOnly: true });
    response.type('text/html');
    response.send(`
<script>
  window.location = '${ process.env.APP_HOST }${ state.returnTo }';
</script>
    `);
  });

});

app.use(function(error, request, response, next) {
  console.log(error);

  response.json({
    errors: [{
      message: error.message
    }]
  });
});

app.listen(80, '0.0.0.0', function() {
  console.log(`${ process.env.service } started @ http://0.0.0.0`);
});
