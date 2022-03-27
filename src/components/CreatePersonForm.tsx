import React, { useCallback, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  Grid,
  Divider,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { useMessage } from '../hooks/message';
import { api } from '../services/api';
import { getToken } from '../utils/localStorageUtils';
import { useAuth } from '../hooks/auth';

interface CreatePersonFormProps {
  title?: string;
  onSubmit?(): void;
}

interface ICreatePersonFormData {
  name: string;
  is_legal_person?: boolean;
  document_id: string;
  telephone: string;
  email: string;

  // address
  street: string;
  postal_code: string;
  state: string;
  city: string;
  neighborhood: string;
}

const schemaValidation = Yup.object({
  name: Yup.string().required('Nome é obrigatório'),
  is_legal_person: Yup.boolean().default(false),
  document_id: Yup.string().required('CNPJ/CPF Obrigatório'),
  telephone: Yup.string().required('Telephone obrigatório').min(6),
  email: Yup.string()
    .email('Deve ser um e-mail valido')
    .required('Email obrigatório'),

  // address
  street: Yup.string().required('Rua obrigatória'),
  postal_code: Yup.string().required('CEP obrigatório'),
  state: Yup.string().required('Estado obrigatório'),
  city: Yup.string().required('Cidade obrigatória'),
  neighborhood: Yup.string().required('Bairro obrigatória'),
});

export const CreatePersonForm: React.FC<CreatePersonFormProps> = ({
  onSubmit: onSubmitForm,
  title,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ICreatePersonFormData>({
    resolver: yupResolver(schemaValidation),
  });
  const { addMessage } = useMessage();
  const { signOut } = useAuth();

  const onSubmit = useCallback(
    async ({
      neighborhood,
      city,
      document_id,
      email,
      name,
      postal_code,
      state,
      street,
      telephone,
      is_legal_person,
    }: ICreatePersonFormData) => {
      try {
        setIsLoading(true);

        const responseAddress = await api.post(
          '/api/v1/people-address',
          {
            neighborhood,
            city,
            postal_code,
            state,
            street,
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        );

        const { id: address_id } = responseAddress.data;

        await api.post(
          '/api/v1/people',
          {
            document_id,
            email,
            name,
            telephone,
            is_legal_person,
            address_id,
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        );

        addMessage({
          message: 'Pessoa cadastrada com sucesso!',
          severity: 'success',
        });

        // Execute parent function after submit form
        if (onSubmitForm) {
          setTimeout(onSubmitForm, 500);
        }
      } catch (error: any) {
        if (error.status === 401) {
          addMessage({
            message: 'Sessão expirou, logue novamente',
            severity: 'error',
          });

          signOut();
        } else {
          addMessage({
            message: 'Verifique os dados e tente novamente',
            severity: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmitForm]
  );

  return (
    <Container>
      {title && <h2>{title}</h2>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="inherit" color="primary">
          Dados básicos
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          id="description"
          {...register('name')}
          error={!!errors.name}
          label="Nome"
          required
          autoFocus
        />

        <Typography variant="inherit" color="secondary">
          {errors.name?.message}
        </Typography>

        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="telephone"
              {...register('telephone')}
              error={!!errors.telephone}
              label="Telefone"
              required
              autoFocus
            />

            <Typography variant="inherit" color="secondary">
              {errors.telephone?.message}
            </Typography>
          </Grid>

          <Grid item xs={8}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="email"
              {...register('email')}
              error={!!errors.email}
              label="E-mail"
              required
              type="email"
              autoFocus
            />
            <Typography variant="inherit" color="secondary">
              {errors.email?.message}
            </Typography>
          </Grid>
        </Grid>

        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={4}>
            <FormControlLabel
              control={
                <Checkbox
                  {...register('is_legal_person')}
                  name="is_legal_person"
                />
              }
              label="Pessoa Jurídica"
            />
          </Grid>

          <Grid item xs={8}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="document_id"
              {...register('document_id')}
              error={!!errors.document_id}
              label="CPF / CNPJ"
              required
              autoFocus
            />

            <Typography variant="inherit" color="secondary">
              {errors.document_id?.message}
            </Typography>
          </Grid>
        </Grid>

        {/* Address */}
        <Typography variant="inherit" color="primary">
          Endereço
        </Typography>
        <Divider />
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="postal_code"
              {...register('postal_code')}
              error={!!errors.postal_code}
              label="CEP"
              required
              autoFocus
            />
            <Typography variant="inherit" color="secondary">
              {errors.postal_code && 'CEP é obrigatório'}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="street"
              {...register('street')}
              error={!!errors.street}
              label="Rua"
              required
              autoFocus
            />

            <Typography variant="inherit" color="secondary">
              {errors.street?.message}
            </Typography>
          </Grid>
        </Grid>

        <Grid container direction="row" spacing={2}>
          <Grid item xs={9}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="city"
              {...register('city')}
              error={!!errors.city}
              label="Cidade"
              required
              autoFocus
            />

            <Typography variant="inherit" color="secondary">
              {errors.city?.message}
            </Typography>
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="state"
              {...register('state')}
              error={!!errors.state}
              label="UF"
              required
              autoFocus
            />

            <Typography variant="inherit" color="secondary">
              {errors.state?.message}
            </Typography>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          id="neighborhood"
          {...register('neighborhood')}
          error={!!errors.neighborhood}
          label="Bairro"
          required
          autoFocus
        />

        <Typography variant="inherit" color="secondary">
          {errors.neighborhood?.message}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Cadastrar'
          )}
        </Button>
      </form>
    </Container>
  );
};
