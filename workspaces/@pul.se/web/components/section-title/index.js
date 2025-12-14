import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { ArrowLeft } from '@phosphor-icons/react';

import { wrapper, header, toolbar, header_wrapper, back_button } from './styles.module.css';

export default function SectionTitle({ children, title, hasBack }) {
  const navigate = useNavigate();

  const backButton = useMemo(function() {
    if(hasBack !== true) {
      return;
    }

    const back = function() {
      navigate(-1);
    };

    return (
      <div className={ back_button } onClick={ back }>
        <ArrowLeft size={ 24 } weight='bold' />
      </div>
    );
  }, [ hasBack, navigate ]);

  return (
    <div className={ wrapper }>
      <div className={ header_wrapper }>
        { backButton }
        <h1 className={ header }>{ title }</h1>
      </div>
      <div className={ toolbar }>
        { children }
      </div>
    </div>
  );
}
