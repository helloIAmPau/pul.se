import Express from 'express';

import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';

import resolvers from './resolvers';
import typeDefs from './schema.graphql';

const app = Express();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

app.post('/graphql', createHandler({
  schema,
  context: function(request) {
    return {
      user: '44a83ba4-ada8-4d7b-8ce4-c7dd63abebb7'
    };
  }
}));

app.listen(80, '0.0.0.0', function() {
  console.log(`${ process.env.SERVICE } started @ http://0.0.0.0`);
});
