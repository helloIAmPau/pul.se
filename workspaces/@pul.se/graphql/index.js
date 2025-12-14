import { server } from '@pul.se/http';
import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { verify } from '@pul.se/jwt';

import resolvers from './resolvers';
import typeDefs from './schema.graphql';

const app = server();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

app.post('/graphql', function(request, response, next) {
  request.user = verify(request.cookies.ACCESS_TOKEN);
  next();
}, createHandler({
  schema,
  context: function(request) {
    return {
      user: request.raw.user
    };
  }
}));

app.start();
