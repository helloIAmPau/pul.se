import { wrapper } from './styles.module.css';

export default function Container({ children, className = '' }) {
  return (
    <div className={ `${ wrapper } ${ className }` }>
      { children }
    </div>
  );
};
