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
import { formatStringDate } from '../utils/formatter';

interface MakePaymentProps {
  payment_id: string;
  onSubmit?(): void;
  payment_name?: string;
}

interface IMakePaymentFormData {
  payment_date: Date;
}

const schemaValidation = Yup.object({
  payment_date: Yup.date().required('Data de pagamento obrigatória'),
});

export const MakePaymentForm: React.FC<MakePaymentProps> = ({
  onSubmit: onSubmitForm,
  payment_id,
  payment_name,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IMakePaymentFormData>({
    resolver: yupResolver(schemaValidation),
  });
  const { addMessage } = useMessage();
  const { signOut } = useAuth();

  const onSubmit = useCallback(
    async ({ payment_date }: IMakePaymentFormData) => {
      try {
        setIsLoading(true);

        await api.put(
          `/api/v1/payments/${payment_id}/pay`,
          {
            payment_date,
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        );

        addMessage({
          message: 'Lançamento pago com sucesso!',
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
            message:
              'Verifique o data de pagamento - Não deve ser uma data que ainda não passou!',
            severity: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmitForm]
  );

  const getTodayDate = useCallback(() => {
    const today = new Date().toISOString();

    return formatStringDate(today, 'yyyy-MM-dd');
  }, []);

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h5" color="primary">
          {payment_name}
        </Typography>

        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="payment_date"
              defaultValue={getTodayDate()}
              {...register('payment_date')}
              error={!!errors.payment_date}
              label="Data de pagamento"
              type="date"
              focused
            />

            <Typography variant="inherit" color="secondary">
              {errors.payment_date?.message}
            </Typography>
          </Grid>
        </Grid>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Pagar'}
        </Button>
      </form>
    </Container>
  );
};
