import { wrapper } from './styles.module.css';

export default function Card({ children, className='' }) {
  return (
    <div className={ `${ wrapper } ${ className }` }>
      { children }
    </div>
  );
};
