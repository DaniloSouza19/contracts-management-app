import { Button, Container } from '@mui/material';
import { useAuth } from '../../hooks/auth';

export function Dashboard() {
  const { signOut } = useAuth();

  return (
    <Container component="main" maxWidth="xs">
      <Button onClick={signOut} variant="contained" type="button">
        SignOut
      </Button>
    </Container>
  );
}
