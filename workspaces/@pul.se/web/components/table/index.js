import { useCallback, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { CaretLineLeftIcon, CaretLeftIcon, CaretLineRightIcon, CaretRightIcon, ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';

import Card from '../card';
import Heading from '../heading';

import { action, wrapper, heading, thead, tr, thr, table, controls_heading, controls_data, clickable_header, footer } from './styles.module.css';

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

export const Table = function({ title, columns, onData, controls }) {
  const [ rows, setRows ] = useState([]);
  const [ pages, setPages ] = useState(0);
  const [ state, setState ] = useState({ page: 0, limit: 5, search: '', sorting: {} });

  useLayoutEffect(function() {
    onData(state).then(function(cursor) {
      setRows(cursor.data);
      setPages(Math.ceil(cursor.count / state.limit));
    });
  }, [ onData, state ]);

  const columnHeaders = useMemo(function() {
    return columns.map(function({ sort, label, hClassName = '' }, index) {
      const onClick = function() {
        if(sort == null) {
          return;
        }

        if(state.sorting.column === sort && state.sorting.direction === 'DESC') {
          setState({
            ...state,
            sorting: {}
          });

          return;
        }

        if(state.sorting.column === sort && state.sorting.direction === 'ASC') {
          setState({
            ...state,
            sorting: {
              column: sort,
              direction: 'DESC'
            }
          });

          return;
        }

        setState({
          ...state,
          sorting: {
            column: sort,
            direction: 'ASC'
          }
        });
      };

      let prefix = '';
      if(state.sorting.column === sort && state.sorting.direction === 'ASC') {
        prefix = (
          <ArrowUpIcon />
        );
      }
      else if(state.sorting.column === sort && state.sorting.direction === 'DESC') {
        prefix = (
          <ArrowDownIcon />
        );
      }
      
      let className = hClassName;
      if(sort != null) {
        className = `${ clickable_header } ${ hClassName }`;
      }

      return <th onClick={ onClick } className={ className } key={ `${ label }_${ index }` }>{ prefix } { label }</th>
    });
  }, [ columns, state ]);

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

  const onNext = useCallback(function() {
    if(state.page + 1 === pages) {
      return;
    }

    setState({
      ...state,
      page: state.page + 1
    });
  }, [ state, pages ]);

  const onBack = useCallback(function() {
    if(state.page === 0) {
      return;
    }

    setState({
      ...state,
      page: state.page - 1
    });
  }, [ state, pages ]);

  return (
    <Card className={ wrapper }>
      <div className={ heading }>
        <Heading secondary>{ title }</Heading>
        { controls }
      </div>
      <table className={ table }>
        <thead className={ thead }>
          <tr className={ `${ tr } ${ thr }` }>
            { columnHeaders }
          </tr>
        </thead>
        <tbody>
          { content }
        </tbody>
      </table>
      <div className={ footer }>
        Page { state.page + 1 } of { pages }
        <div>
          <span disabled={ state.page === 0 } title='Back' onClick={ onBack }><CaretLeftIcon weight='bold'/></span>
          <span disabled={ state.page + 1 === pages }title='Next' onClick={ onNext }><CaretRightIcon  weight='bold'/></span>
        </div>
      </div>
    </Card>
  );
};
