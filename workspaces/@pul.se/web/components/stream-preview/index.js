import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import Video from '../video';

import { wrapper, meta, title } from './styles.module.css';

export default function StreamPreview({ url, app, name }) {
  const navigate = useNavigate();

  const onClick = useCallback(function() {
    navigate(`/live/${ app }`);
  }, [ navigate, app ]);

  return (
    <div className={ wrapper } onClick={ onClick }>
      <div className={ meta }>
        <div className={ title }>{ name }</div>
      </div>
      <Video url={ url } muted />
    </div>
  );
};
