import React, { useCallback, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import * as Yup from 'yup';

import { TextField, CircularProgress } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../hooks/auth';
import Copyright from '../components/copyright';
import { useMessage } from '../hooks/message';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  link: {
    color: '#3f51b5',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

interface SingInFormData {
  email: string;
  password: string;
}

const schemaValidation = Yup.object().shape({
  email: Yup.string()
    .required('Email obrigatório')
    .email('Digite um e-mail valido')
    .min(1, 'E-mail obrigatório'),
  password: Yup.string().required('Senha obrigatória'),
});

export const SignIn: React.FC = () => {
  const classes = useStyles();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { addMessage } = useMessage();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SingInFormData>({
    resolver: yupResolver(schemaValidation),
  });

  const onSubmit = useCallback(
    async (data: SingInFormData) => {
      setIsLoading(true);
      try {
        await signIn(data);

        addMessage({
          message: 'logado com sucesso!',
          severity: 'success',
        });

        navigate(`/${location.search}`);
      } catch (error) {
        addMessage({
          message: 'Erro ao tentar logar na aplicação, cheque as credenciais',
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [signIn, addMessage]
  );

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Entrar
        </Typography>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={classes.form}
          noValidate
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            error={!!errors.email?.message}
            autoComplete="email"
            autoFocus
            {...register('email')}
          />
          <Typography variant="inherit" color="secondary">
            {errors.email?.message}
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="senha"
            error={!!errors.password?.message}
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password')}
          />
          <Typography variant="inherit" color="secondary">
            {errors.password?.message}
          </Typography>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default SignIn;
