import { container } from './styles.module.css';

export default function Container({ children, className = '' }) {
  return (
    <div className={ `${ container } ${ className }` }>
      { children }
    </div>
  );
};
