import { useCallback, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { useMessage } from '../hooks/message';

interface CreatePersonProps {
  title?: string;
}

interface ICreatePersonFormData {
  name: string;
}

const schemaValidation = Yup.object({
  name: Yup.string().required('Nome é obrigatório'),
});

export function CreatePersonForm({ title }: CreatePersonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ICreatePersonFormData>({
    resolver: yupResolver(schemaValidation),
  });
  const { addMessage } = useMessage();

  const onSubmit = useCallback((data: ICreatePersonFormData) => {
    try {
      setIsLoading(true);

      console.log(data);

      addMessage({
        message: 'Imóvel cadastrado com sucesso!',
        severity: 'success',
      });
    } catch (error: any) {
      addMessage({
        message: 'Verifique os dados',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Container>
      {title && <h2>{title}</h2>}
      <form onSubmit={handleSubmit(onSubmit)}>
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
}
