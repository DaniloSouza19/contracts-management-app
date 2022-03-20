import { useCallback } from 'react';
import {
  Button,
  TextField,
  Typography,
  CssBaseline,
  Container,
} from '@mui/material';
import { Login } from '@mui/icons-material';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/auth';
import { useMessage } from '../../hooks/Message';

import styles from './SingIn.module.css';

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

  const { signIn } = useAuth();
  const { addMessage } = useMessage();

  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit: SubmitHandler<Inputs> = useCallback(
    async ({ email, password }: Inputs) => {
      try {
        await signIn({
          email,
          password,
        });

        addMessage({
          message: 'Login com sucesso!',
          severity: 'success',
        });

        navigate(`/${location.search}`);
      } catch (error) {
        addMessage({
          message: 'Erro ao tentar logar! Cheque as credenciais',
          severity: 'error',
        });
      }
    },
    []
  );

  return (
    <Container className={styles.container} component="main" maxWidth="xs">
      <CssBaseline />
      <form
        className={styles.signForm}
        onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
      >
        <div className={styles.formTitle}>
          <Login className="login-image" color="primary" />
          <Typography variant="h5">Login</Typography>
        </div>
        <TextField
          className={styles.textInput}
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
          className={styles.textInput}
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
          className={styles.formButton}
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
