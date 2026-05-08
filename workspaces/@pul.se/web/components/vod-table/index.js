import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import { PlayIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';

import { useControls, Table } from '../table';

export default function VodTable() {
  const { app } = useParams();

  const vodsQuery = useGraphql(`
query($app: UUID!) {
  vods(app: $app) {
    name
    url
    timestamp
  }
}
  `);

  const onData = useCallback(function() {
    return vodsQuery({
      app
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
      onColumn: function({ name }) {
        return name
      }
    }, {
      label: 'date',
      onColumn: function({ timestamp }) {
        return timestamp;
      }
    }, controls ];
  }, [ controls ]);

  return (
    <Table onData={ onData } columns={ columns } title='VODs' />
  );
};
