import { controls } from './styles.module.css';

export default function SettingsSectionControlsLayout({ children }) {
  return (
    <div className={ controls }>
      { children }
    </div>
  );
};
