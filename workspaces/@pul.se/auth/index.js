import Express from 'express';
import { query } from '@pul.se/postgres';
import cookieParser from 'cookie-parser';

import { sign, verify } from './jwt';
import providers from './providers';

const app = Express();
app.use(cookieParser());

app.get('/auth/valid', verify, function(request, response) {
  response.json({
    data: {
      valid: true
    }
  });
});

app.get('/auth/providers/:provider', function(request, response) {
  const provider = request.params.provider;

  if(providers[provider] == null) {
    throw new Error(`Invalid provider name ${ provider }`);
  }

  const selectedProvider = providers[provider];

  response.json({
    data: {
      provider: {
        authorization: selectedProvider.authorization
      }
    }
  });
});

app.get('/auth/callback', function(request, response) {
  const state = JSON.parse(request.query.state);
  const code = request.query.code;

  const { verify } = providers[state.type];
  return verify(code).then(function({ email }) {
    return query(`
insert into users (email) values ($1) on conflict (email) do update set email = $1 returning uid
    `, [ email ]);
  }).then(function(rows) {
    return sign(rows[0]);
  }).then(function(token) {
    response.cookie('ACCESS_TOKEN', token, { httpOnly: true });
    response.redirect(state.redirect);
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
