import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {
  CircularProgress,
  Typography,
  Button,
  Modal,
  TextField,
  Divider,
} from '@material-ui/core';
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
  GridCellValue,
  GridCellParams,
} from '@material-ui/data-grid';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Autocomplete from '@material-ui/lab/Autocomplete';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { format, isBefore, parseISO } from 'date-fns';
import Copyright from '../components/copyright';
import MenuHeader from '../components/menuHeader';
import { useMessage } from '../hooks/message';
import { api } from '../services/api';
import { getToken } from '../utils/localStorageUtils';
import { useAuth } from '../hooks/auth';
import { formatValueAsCurrency } from '../utils/formatter';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  center: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  submitButtonHover: {
    '&:hover': {
      color: '#fff',
      background: '#409c3f',
      borderColor: 'inherit',
    },
  },
  gridFooter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  totalOrder: {
    color: '#2b1818',
    fontSize: 20,
    padding: 10,
    fontWeight: 600,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPaper: {
    maxHeight: '90%',
    maxWidth: 800,
    overflow: 'scroll',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  select: {
    height: '100%',
    width: '100%',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

interface CreatePaymentFormData {
  description: string;
  contract_id: string;
  due_date: Date;
  additional_fees?: number;
  discount?: number;
}

interface IContractOptions {
  id: string;
  description: string;
}

interface IContract {
  id: string;
  description: string;
  price: string;
  end_date: string;
  start_date: string;
}

const schemaValidation = Yup.object({
  description: Yup.string().required('Descrição obrigatória'),
  contract_id: Yup.string().uuid().required('Contrato obrigatório'),
  due_date: Yup.date().required('Data de pagamento obrigatória'),
  additional_fees: Yup.number().default(0),
  discount: Yup.number().default(0),
});

export const Payments: React.FC = () => {
  const classes = useStyles();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const [contractOptions, setContractOptions] = useState<IContractOptions[]>(
    []
  );
  const [rows, setRows] = useState<IContract[]>([] as IContract[]);

  const { signOut } = useAuth();

  const { addMessage } = useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePaymentFormData>({
    resolver: yupResolver(schemaValidation),
  });

  const handleOpenModal = () => {
    setOpenPaymentModal(true);
  };

  const handleCloseModal = () => {
    setOpenPaymentModal(false);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 150, hide: true },
    {
      field: 'description',
      headerName: 'Descrição',
      width: 180,
      editable: false,
    },
    {
      field: 'is_paid',
      headerName: 'Pago?',
      width: 120,
      editable: false,
      renderCell: ({ value }: GridCellParams) => {
        return (
          <Grid container alignItems="center">
            <FiberManualRecordIcon htmlColor={!value ? 'red' : 'green'} />
            <span style={{ marginLeft: '10px' }}>
              {' '}
              {!value ? 'Não' : 'Sim'}
            </span>
          </Grid>
        );
      },
    },
    {
      field: 'created_at',
      headerName: 'Data de criação',
      type: 'date',
      width: 180,
      editable: false,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        if (!value) {
          return '';
        }

        const dateParsed = parseISO(value?.toString());

        const formattedDate = format(dateParsed, 'd/MM/yy H:mm');

        return formattedDate;
      },
    },
    {
      field: 'value',
      headerName: 'Valor',
      type: 'string',
      width: 150,
      editable: false,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        if (!value) {
          return '';
        }

        return formatValueAsCurrency(Number(value));
      },
    },
    {
      field: 'due_date',
      headerName: 'Data de venc.',
      type: 'date',
      width: 180,
      editable: false,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        if (!value) {
          return '';
        }

        const dateParsed = parseISO(value?.toString());

        const formattedDate = format(dateParsed, 'd/MM/yyyy');

        return formattedDate;
      },
    },
    {
      field: 'contract',
      headerName: 'Contrato',
      description: 'Nome do cartório de registro',
      width: 160,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        const contract = value as IContract;

        return contract.description;
      },
    },
    {
      field: 'payment_date',
      headerName: 'Data Pag.',
      type: 'date',
      width: 180,
      editable: false,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        if (!value) {
          return '';
        }

        const dateParsed = parseISO(value?.toString());

        const formattedDate = format(dateParsed, 'd/MM/yyyy');

        return formattedDate;
      },
    },
    {
      field: 'registration_id',
      headerName: 'Num. registro',
      description: 'Número de registro',
      width: 160,
    },
  ];

  const loadingPayments = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get(`/api/v1/payments`, {
        headers: {
          Authorization: getToken(),
        },
      });

      const contracts = response.data.map((contract: IContract) => {
        const end_date = contract.end_date as string;

        const endDateParsedISO = parseISO(end_date);

        const today = new Date();

        const contractsIsInactive = isBefore(endDateParsedISO, today);

        return {
          ...contract,
          active: !contractsIsInactive,
        };
      });

      setRows(contracts);
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
      setRows([]);
    } finally {
      setIsLoading(false);
      setPageIsLoading(false);
    }
  }, [signOut]);

  const onSubmit = useCallback(
    async ({
      description,
      due_date,
      contract_id,
      additional_fees,
      discount,
    }: CreatePaymentFormData) => {
      try {
        setIsLoading(true);

        await api.post(
          `/api/v1/contracts/${contract_id}/payments`,
          {
            description,
            due_date,
            additional_fees,
            discount,
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        );

        addMessage({
          message: 'Pagamento registrado com sucesso!',
          severity: 'success',
        });

        setTimeout(handleCloseModal, 500);
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
    [handleCloseModal]
  );

  useEffect(() => {
    setPageIsLoading(false);
  }, []);

  useEffect(() => {
    if (!openPaymentModal) {
      loadingPayments();
    }
  }, [openPaymentModal]);

  // Load all contracts
  useEffect(() => {
    if (openPaymentModal) {
      api
        .get('/api/v1/contracts', {
          headers: {
            Authorization: getToken(),
          },
        })
        .then((response) => {
          const contracts = response.data.map((contract: IContractOptions) => {
            return {
              id: contract.id,
              description: contract.description.toLowerCase(),
            };
          });

          setContractOptions(contracts);
        })
        .catch((error) => {
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
        });
    }
  }, [openPaymentModal]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <MenuHeader title="Gestão de Pagamentos" />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {pageIsLoading ? (
          <CircularProgress
            color="primary"
            size={50}
            className={classes.center}
          />
        ) : (
          <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Typography variant="h5">Registro de Pagamentos</Typography>

                  <Grid
                    container
                    justifyContent="center"
                    spacing={2}
                    alignItems="center"
                  >
                    <Grid item xs={12}>
                      <Autocomplete
                        options={contractOptions}
                        getOptionLabel={(option) => option.id}
                        renderOption={(option) => option.description}
                        fullWidth
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            id="contract_id"
                            {...register('contract_id')}
                            error={!!errors.contract_id}
                            label="Contrato"
                            required
                            autoFocus
                          />
                        )}
                      />
                      <Typography variant="inherit" color="secondary">
                        {errors.contract_id?.message}
                      </Typography>
                    </Grid>
                  </Grid>

                  <div style={{ margin: '10px 0' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      type="button"
                      onClick={handleOpenModal}
                    >
                      Registrar pagamento
                      <AddCircleIcon fontSize="large" htmlColor="green" />
                    </Button>
                  </div>
                  <div style={{ height: 400, width: '100%' }}>
                    <DataGrid rows={rows} columns={columns} pageSize={5} />
                  </div>
                </Paper>
              </Grid>
            </Grid>

            {/* Modal de cadastro de pagamento */}
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={classes.modal}
              open={openPaymentModal}
              onClose={handleCloseModal}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={openPaymentModal}>
                <div className={classes.modalPaper}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <h2 id="transition-modal-title">Registro de pagamento</h2>
                    <Button
                      type="button"
                      style={{
                        borderRadius: '50%',
                      }}
                      onClick={handleCloseModal}
                    >
                      <CloseIcon id="transition-modal-title" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Typography variant="inherit" color="primary">
                      Dados básicos
                    </Typography>
                    <Divider title="Proprietário" />
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      id="description"
                      {...register('description')}
                      error={!!errors.description}
                      label="Descrição"
                      required
                      autoFocus
                    />

                    <Typography variant="inherit" color="secondary">
                      {errors.description?.message}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="due_date"
                          {...register('due_date')}
                          error={!!errors.due_date}
                          label="Data de pagamento"
                          required
                          autoFocus
                          type="date"
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.due_date?.message}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="inherit" color="primary">
                      Taxas e desconto
                    </Typography>
                    <Divider title="feesAndDiscount" />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="registry_office"
                          {...register('additional_fees')}
                          error={!!errors.additional_fees}
                          label="Taxa adicional"
                          autoFocus
                          type="number"
                          defaultValue={0}
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.additional_fees?.message}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="registration_id"
                          {...register('discount')}
                          error={!!errors.discount}
                          label="Valor de desconto"
                          autoFocus
                          type="number"
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.discount}
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
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Cadastrar'
                      )}
                    </Button>
                  </form>
                </div>
              </Fade>
            </Modal>

            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        )}
      </main>
    </div>
  );
};
