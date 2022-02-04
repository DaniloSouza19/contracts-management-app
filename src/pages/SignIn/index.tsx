import { Button, Container, TextField, Typography } from '@mui/material';

export function SignIn() {
  return (
    <Container component="main" maxWidth="xs">
      <Typography variant="h3">Login Page</Typography>
      <TextField
        variant="outlined"
        label="E-mail"
        placeholder="E-mail"
        id="email"
        required
        fullWidth
        type="email"
      />
      <Button variant="contained" fullWidth>
        SignIn
      </Button>
    </Container>
  );
}
