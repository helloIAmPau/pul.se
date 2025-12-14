import { useForm } from '../../contexts/form';

import Button from '../button';

export default function FormButton({ children, secondary }) {
  const { disabled } = useForm();

  return (
    <Button disabled={ disabled } secondary={ secondary } type='submit'>{ children }</Button>
  );
};
