import { brand, dot } from './styles.module.css';

export default function Brand({ className='' }) {
  return (
    <h1 className={ `${ brand } ${ className }` }>PUL<span className={ dot }>.</span>SE</h1>
  );
};
