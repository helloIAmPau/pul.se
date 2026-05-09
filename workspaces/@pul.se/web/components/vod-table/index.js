import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import { PlayIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';

import { useControls, Table } from '../table';

export default function VodTable() {
  const { app } = useParams();

  const vodsQuery = useGraphql(`
query($app: UUID!, $pagination: PaginationInput) {
  vods(app: $app, pagination: $pagination) {
    data {
      name
      url
      timestamp
    }
    count
  }
}
  `);

  const onData = useCallback(function({ page, limit, search, sorting }) {
    return vodsQuery({
      app,
      pagination: {
        page,
        limit,
        search,
        sorting
      }
    }).then(function({ vods }) {
      return vods;
    });
  }, [ vodsQuery ]);

  const onColumn = useCallback(function({ url }, { action }) {
    const onClick = function() {
      console.log(url);
    };

    return (
      <span onClick={ onClick } className={ action } title='Play'>
        <PlayIcon />
      </span>
    );
  }, []);
  const controls = useControls(onColumn);

  const columns = useMemo(function() {
    return [{
      label: 'name',
      sort: 'name',
      onColumn: function({ name }) {
        return name
      }
    }, {
      label: 'date',
      sort: 'timestamp',
      onColumn: function({ timestamp }) {
        return timestamp;
      }
    }, controls ];
  }, [ controls ]);

  return (
    <Table onData={ onData } columns={ columns } title='VODs' />
  );
};
