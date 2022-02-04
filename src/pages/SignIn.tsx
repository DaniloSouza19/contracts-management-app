import {
  Button,
  TextField,
  Typography,
  CssBaseline,
  Container,
} from '@mui/material';
import { Login } from '@mui/icons-material';
import { useForm, SubmitHandler } from 'react-hook-form';
import './SingIn.css';

interface Inputs {
  email: string;
  password: string;
}

export function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    console.log(data);
  };

  return (
    <Container className="container" component="main" maxWidth="xs">
      <CssBaseline />
      <form className="sign-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-title">
          <Login className="login-image" color="primary" />
          <Typography variant="h5">Login</Typography>
        </div>
        <TextField
          className="text-input"
          variant="outlined"
          label="E-mail"
          placeholder="E-mail"
          id="email"
          required
          fullWidth
          type="email"
          autoFocus
          error={!errors}
          {...register('email', { required: true })}
        />
        <TextField
          className="text-input"
          variant="outlined"
          label="Password"
          placeholder="Password"
          id="password"
          required
          fullWidth
          type="password"
          autoFocus
          error={!errors}
          {...register('password', { required: true })}
        />
        <Button
          className="form-button"
          type="submit"
          variant="contained"
          fullWidth
        >
          Entrar
        </Button>
      </form>
    </Container>
  );
}
