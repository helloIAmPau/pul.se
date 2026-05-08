import { wrapper, heading } from './styles.module.css';

export default function InputGroup({ children, label }) {
  return (
    <div className={ wrapper }>
      <label className={ heading }>{ label }</label>
      { children }
    </div>
  );
};
