import { useMemo } from 'react';
import { useTheme } from '../../contexts/theme';

import { SunDim, Moon } from '@phosphor-icons/react';

import { theme_switch } from './styles.module.css';

export default function ThemeSwitch() {
  const { currentTheme, switchTheme } = useTheme();

  const icon = useMemo(function() {
    if(currentTheme === 'LIGHT') {
      return (
        <SunDim weight='bold' size={ 24 }/>
      );
    }

    return (
      <Moon weight='bold' size={ 24 } />
    );
  }, [ currentTheme ]);

  return (
    <div title='Switch Theme' onClick={ switchTheme } className={ theme_switch }>
      { icon }
    </div>
  );
};
