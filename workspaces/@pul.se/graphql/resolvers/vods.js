import { query } from '@pul.se/postgres';
import { formatUrl, usePagination } from '../tools';

export const vods = function(_, { app, pagination }, { user }) {
  const { limit, sorting } = usePagination(pagination);
  const sortingSnippet = sorting || 'order by timestamp desc';

  return query(`
select
  *,
  count(*) over() as count
from
  sessions
where owner = $1 and app = $2 and event = 'STOP'
${ sortingSnippet }
${ limit }
  `, [ user.uid, app ]).then(function(rows) {
    if(rows.length === 0) {
      return {
        data: [],
        count: 0
      };
    }

    const data = rows.map(function(stream) {
      stream.url = formatUrl(stream.uid);

      return stream;
    });

    return {
      data,
      count: data[0].count
    };
  });
};

export const vod = function(_, { uid }, { user }) {
  return query(`
select
  *
from
  sessions
where owner = $1 and uid = $2
  `, [ user.uid, uid ]).then(function(rows) {
    const data = rows.map(function(stream) {
      stream.url = formatUrl(stream.uid);

      return stream;
    });

    return data[0];
  });
};
