import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { CopySimpleIcon, WrenchIcon } from '@phosphor-icons/react';
import { useGraphql } from '@pul.se/graphql/client';

import useClipboard from '../../hooks/use-clipboard';

import { Table, useControls } from '../table';

import { cell } from './styles.module.css';

export default function StreamTable() {
  const navigate = useNavigate();
  const { copy } = useClipboard(); 

  const streamsQuery = useGraphql(`
query($pagination: PaginationInput) {
  streams(pagination: $pagination) {
    data {
      name
      app
      key
    }
    count
  }
}
  `);

  const onColumn = useCallback(function({ app }, { action }) {
    const onClick = function() {
      navigate(`/streams/${ app }`);
    };

    return (
      <span onClick={ onClick } className={ action } title='Open settings'>
        <WrenchIcon />
      </span>
    );
  }, [ navigate ]);
  const controls = useControls(onColumn);

  const columns = useMemo(function() {
    return [{
      label: 'name',
      sort: 'name',
      onColumn: function({ name }) {
        return name;
      }
    }, {
      label: 'app',
      sort: 'app',
      onColumn: function({ app }, { action }) {
        const onClick = function() {
          copy(`rtmp://${ window.location.hostname }/${ app }`);
        };
        
        return (
          <div className={ cell }>
            <span className={ action } onClick={ onClick } title='Copy stream URL'>
              <CopySimpleIcon />
            </span>
            <div>
              { app }
            </div>
          </div>
        );
      }
    }, {
      label: 'key',
      sort: 'key',
      onColumn: function({ key }, { action }) {
        const onClick = function() {
          copy(key);
        };
        
        return (
          <div className={ cell }>
            <span className={ action } onClick={ onClick } title='Copy key'>
              <CopySimpleIcon />
            </span>
            <div>
              { key }
            </div>
          </div>
        );
      }
    }, controls ];
  }, [ copy, controls ]);

  const onData = useCallback(function({ page, limit, search, sorting }) {
    return streamsQuery({
      pagination: {
        page,
        limit,
        search,
        sorting
      }
    }).then(function({ streams }) {
      return streams;
    });
  }, [ streamsQuery ]);

  return (
    <Table onData={ onData } columns={ columns } title='Streams' />
  );
};
