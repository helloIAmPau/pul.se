import Express from 'express';

import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { verify } from '@pul.se/auth/jwt';

import resolvers from './resolvers';
import typeDefs from './schema.graphql';

const app = Express();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

//app.post('/graphql', verify, createHandler({
//  schema,
//  context: function(request) {
//    return {
//      user: request.raw.user
//    };
//  }
//}));

app.post('/graphql', createHandler({
  schema
}));


app.listen(80, '0.0.0.0', function() {
  console.log(`${ process.env.SERVICE } started @ http://0.0.0.0`);
});
