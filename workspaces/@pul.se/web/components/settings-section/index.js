import Heading from '../heading';
import Hr from '../hr';

import { section, section_title } from './styles.module.css';

export default function SettingsSection({ children, title }) {
  return (
    <form className={ section }>
      <div className={ section_title }>
        <Heading secondary>{ title }</Heading>
        <Hr />
      </div>

      { children }
    </form>
  );
};
