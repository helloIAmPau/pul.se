import { useMemo, useCallback } from 'react';

import Grid from '../grid';

export default function Admin() {
  const columns = useMemo(function() {
    return [];
  }, []);

  const onData = useCallback(function() {
    return Promise.resolve([{
      yolo: 'Pippo',
      nolo: 123
    }, {
      yolo: 'Pluto',
      nolo: 456
    }, {
      yolo: 'Pippo',
      nolo: 123
    }, {
      yolo: 'Pluto',
      nolo: 456
    }, {
      yolo: 'Pippo',
      nolo: 123
    }, {
      yolo: 'Pluto',
      nolo: 456
    }, {
      yolo: 'Pippo',
      nolo: 123
    }, {
      yolo: 'Pluto',
      nolo: 456
    }, {
      yolo: 'Pippo',
      nolo: 123
    }, {
      yolo: 'Pluto',
      nolo: 456
    }, {
      yolo: 'Pippo',
      nolo: 123
    }, {
      yolo: 'Pluto',
      nolo: 456
    }, {
      yolo: 'Pippo',
      nolo: 123
    }, {
      yolo: 'Pluto',
      nolo: 456
    }]);
  }, []);

  return (
    <div>
      <Grid onData={ onData } columns={ columns } />
    </div>
  );
};
