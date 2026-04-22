import { wrapper } from './styles.module.css';

export default function Scrollable({ children, className='' }) {
  return (
    <div className={ `${ wrapper } ${ className }` }>
      { children }
    </div>
  );
};
