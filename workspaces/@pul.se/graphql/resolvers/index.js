import { query } from '@pul.se/postgres';

export default {
  Query: {
    test: function() {
      return query('select 1 as test').then(function({ rows }) {
        return rows[0].test
      });
    }
  }
};
