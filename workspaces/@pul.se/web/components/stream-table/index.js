import { useMemo, useCallback } from 'react';
import { CopySimpleIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';

import Table from '../table';

import { cell } from './styles.module.css';

export default function StreamTable() {
  const streamsQuery = useGraphql(`
query {
  streams {
    name
    app
    key
  }
}
  `);

  const columns = useMemo(function() {
    return [{
      label: 'name',
      onColumn: function(row) {
        return row.name;
      }
    }, {
      label: 'app',
      onColumn: function(row) {
        const onClick = function() {
          navigator.clipboard.writeText(`rtmp://${ window.location.hostname }/${ row.app }`).then(function() {
            console.log('URL copied');
          });
        };
        
        return (
          <div className={ cell }>
            <span onClick={ onClick } title='Copy stream URL'>
              <CopySimpleIcon />
            </span>
            <div>
              { row.app }
            </div>
          </div>
        );
      }
    }, {
      label: 'key',
      onColumn: function(row) {
        const onClick = function() {
          navigator.clipboard.writeText(row.key).then(function() {
            console.log('Key copied');
          });
        };
        
        return (
          <div className={ cell }>
            <span onClick={ onClick } title='Copy key'>
              <CopySimpleIcon />
            </span>
            <div>
              { row.key }
            </div>
          </div>
        );
      }
    }];
  }, []);

  const onData = useCallback(function() {
    return streamsQuery().then(function({ streams }) {
      return streams;
    });
  }, [ streamsQuery ]);

  return (
    <Table onData={ onData } columns={ columns } title='Streams' />
  );
};
