import { Button } from '@mui/material';
import { useAuth } from '../hooks/auth';

export function Dashboard() {
  const { signOut } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <Button onClick={signOut} variant="contained" type="button">
        SignOut
      </Button>
    </div>
  );
}
