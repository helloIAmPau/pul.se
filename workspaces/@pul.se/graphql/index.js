import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';

import resolvers from './resolvers';
import typeDefs from './schema.graphql';

const app = express();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

app.post('/graphql', createHandler({
  schema,
  context: function() {
    return {
      user: {
        uid: 'e3fe6712-9ca1-4f4d-835d-eecbfe989d59'
      }
    };
  }
}));

app.listen(80, '0.0.0.0', function() {
  console.log(`${ process.env.service } started @ http://0.0.0.0`);
});
