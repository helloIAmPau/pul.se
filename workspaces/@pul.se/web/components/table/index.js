import { useCallback, useMemo, useRef, useState, useLayoutEffect } from 'react';

import Card from '../card';
import Heading from '../heading';

import { tbody, wrapper, heading, thead, tr, table } from './styles.module.css';

const TableData = function({ children }) {
  const ref = useRef();

  const onMouseEnter = useCallback(function() {
    if(typeof(children) !== 'string') {
      return;
    }

    if(ref.current == null) {
      return;
    }

    if(ref.current.scrollWidth <= ref.current.clientWidth) {
      ref.current.removeAttribute('title');

      return;
    }

    ref.current.setAttribute('title', children);
  }, [ children, ref ]);

  return (
    <td onMouseEnter={ onMouseEnter } ref={ ref }>
      { children }
    </td>
  );
};

export default function Table({ title, columns, onData }) {
  const [ rows, setRows ] = useState([]);

  useLayoutEffect(function() {
    onData().then(function(rows) {
      setRows(rows);
    });
  }, [ onData ]);

  const columnHeaders = useMemo(function() {
    return columns.map(function({ label }) {
      return <th key={ label }>{ label }</th>
    });
  }, [ columns ]);

  const content = useMemo(function() {
    return rows.map(function(row, column) {
      const cells = columns.map(function({ onColumn }, cell) {
        const value = onColumn(row);

        return (
          <TableData key={ `${ column }_${ cell }` }>
            { value }
          </TableData>
        );
      });

      return (
        <tr key={ column } className={ tr }>
          { cells }
        </tr>
      );
    });
  }, [ columns, rows ]);

  return (
    <Card className={ wrapper }>
      <Heading secondary className={ heading }>{ title }</Heading>
      <table className={ table }>
        <thead className={ thead }>
          <tr className={ tr }>
            { columnHeaders }
          </tr>
        </thead>
        <tbody className={ tbody }>
          { content }
        </tbody>
      </table>
    </Card>
  );
};
