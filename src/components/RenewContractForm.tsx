import React, { useCallback, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Grid,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { useMessage } from '../hooks/message';
import { api } from '../services/api';
import { getToken } from '../utils/localStorageUtils';
import { useAuth } from '../hooks/auth';

interface IContract {
  id: string;
  description: string;
}

interface RenewContractFormProps {
  contract: IContract;
  onSubmit?(): void;
}

interface IRenewContractFormData {
  start_date: Date;
  end_date: Date;
  price: number;
}

const schemaValidation = Yup.object({
  start_date: Yup.date().required('Data inicio obrigatória'),
  end_date: Yup.date().required('Data final obrigatória'),
  price: Yup.number()
    .positive('Deve ser um número positivo')
    .required('Preço obrigatório'),
});

export const RenewContractForm: React.FC<RenewContractFormProps> = ({
  onSubmit: onSubmitForm,
  contract,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IRenewContractFormData>({
    resolver: yupResolver(schemaValidation),
  });
  const { addMessage } = useMessage();
  const { signOut } = useAuth();

  const onSubmit = useCallback(
    async ({ end_date, price, start_date }: IRenewContractFormData) => {
      try {
        setIsLoading(true);

        const { id } = contract;

        await api.post(
          `/api/v1/contracts/${id}/renew`,
          {
            end_date,
            price,
            start_date,
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        );

        addMessage({
          message: 'Contrato renovado com sucesso!',
          severity: 'success',
        });

        // Execute parent function after submit form
        if (onSubmitForm) {
          setTimeout(onSubmitForm, 200);
        }
      } catch (error: any) {
        if (error.response.status === 401) {
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h5" color="primary">
          {contract.description}
        </Typography>

        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="start_date"
              {...register('start_date')}
              error={!!errors.start_date}
              label="Data inicio"
              type="date"
              focused
            />

            <Typography variant="inherit" color="secondary">
              {errors.start_date?.message}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="end_date"
              {...register('end_date')}
              error={!!errors.end_date}
              label="Data fim"
              type="date"
              focused
              defaultValue={new Date().toLocaleString()}
            />

            <Typography variant="inherit" color="secondary">
              {errors.end_date?.message}
            </Typography>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          id="price"
          {...register('price')}
          error={!!errors.price}
          label="Valor de contrato"
          required
          autoFocus
          type="number"
        />
        <Typography variant="inherit" color="secondary">
          {errors.price?.message}
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
            'Renovar'
          )}
        </Button>
      </form>
    </Container>
  );
};
