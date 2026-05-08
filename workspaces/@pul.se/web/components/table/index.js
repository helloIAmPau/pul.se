import { useCallback, useMemo, useRef, useState, useLayoutEffect } from 'react';

import Card from '../card';
import Heading from '../heading';

import { action, tbody, wrapper, heading, thead, tr, thr, table, controls_heading, controls_data } from './styles.module.css';

const TableData = function({ children, className = '' }) {
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
    <td className={ className } onMouseEnter={ onMouseEnter } ref={ ref }>
      { children }
    </td>
  );
};

export const useControls = function(onColumn) {
  return useMemo(function() {
    return {
      hClassName: controls_heading,
      dClassName: controls_data,
      onColumn
    };
  }, [ onColumn ]);
};

export const Table = function({ title, columns, onData }) {
  const [ rows, setRows ] = useState([]);

  useLayoutEffect(function() {
    onData().then(function(rows) {
      setRows(rows);
    });
  }, [ onData ]);

  const columnHeaders = useMemo(function() {
    return columns.map(function({ label, hClassName = '' }, index) {
      return <th className={ hClassName } key={ `${ label }_${ index }` }>{ label }</th>
    });
  }, [ columns ]);

  const content = useMemo(function() {
    return rows.map(function(row, column) {
      const cells = columns.map(function({ onColumn, dClassName }, cell) {
        const value = onColumn(row, { action });

        return (
          <TableData className={ dClassName } key={ `${ column }_${ cell }` }>
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
          <tr className={ `${ tr } ${ thr }` }>
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
