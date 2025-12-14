import { useMemo, useState, useLayoutEffect } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

import Card from '../card';

import { wrapper, row, card, footer, head } from './styles.module.css';

export default function Grid({ columns, onData }) {
  const [ data, setData ] = useState([]);

  useLayoutEffect(function() {
    onData().then(function(data) {
      setData(data);
    });
  }, [ onData ]);

  const headings = useMemo(function() {
    return columns.map(function({ label, key }) {
      return (
        <th key={ key }>{ label }</th>
      );
    });
  }, [ columns ]);

  const rows = useMemo(function() {
    return data.map(function(dataRow, index) {
      const cells = columns.map(function({ key }) {
        return (
          <td key={ `${ key }_${ index }` }>{ dataRow[key] }</td>
        );
      });

      return (
        <tr key={ index } className={ row }>{ cells }</tr>
      );
    });
  }, [ data, columns ]);

  return (
    <Card className={ card }>
      <table className={ wrapper }>
        <thead className={ head }>
          <tr className={ row }>{ headings }</tr>
        </thead>
        <tbody>
          { rows }
        </tbody>
      </table>
      <div className={ footer }>
        <CaretLeft />
        <CaretRight />
      </div>
    </Card>
  );
};
