import { card } from './styles.module.css';

export default function Card({ children, className='' }) {
  return (
    <div className={ `${ card } ${ className }` }>
      { children }
    </div>
  );
};
