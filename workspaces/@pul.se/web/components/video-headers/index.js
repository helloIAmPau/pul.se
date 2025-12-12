import { useStream } from '../../contexts/stream';

import { header } from './styles.module.css';

export default function() {
  const { title } = useStream();

  return (
    <div className={ header }>
      <h1>{ title }</h1>
    </div>
  );
};
