import Button from '../button';

export default function Landing() {
  return (
    <div>
      <h1>The fucking streaming service for your events</h1>
      <Button>Watch Now</Button>
      <Button href='/admin' secondary>Admin</Button>
    </div>
  );
};
