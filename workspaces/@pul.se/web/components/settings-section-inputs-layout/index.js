import { wrapper } from './styles.module.css';

export default function SettingsSectionInputsLayout({ children }) {
  return (
    <div className={ wrapper }>
      { children }
    </div>
  );
};
