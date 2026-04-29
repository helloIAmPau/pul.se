import Express from 'express';
import cookieParser from 'cookie-parser';

import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { verify } from '@pul.se/auth/jwt';

import resolvers from './resolvers';
import typeDefs from './schema.graphql';

const app = Express();
app.use(cookieParser());

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

app.use(verify);

app.post('/graphql', createHandler({
  schema,
  context: function(request) {
    return {
      user: request.raw.user
    };
  }
}));

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
