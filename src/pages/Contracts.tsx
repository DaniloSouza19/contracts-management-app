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
import { CreatePersonForm } from '../components/CreatePersonForm';
import { api } from '../services/api';
import { getToken } from '../utils/localStorageUtils';
import { useAuth } from '../hooks/auth';
import { formatValueAsCurrency } from '../utils/formatter';
import { RenewContractForm } from '../components/RenewContractForm';

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

interface CreateContractFormData {
  description: string;
  customer_id: string;
  property_id: string;
  price: number;
  start_date: Date;
  end_date: Date;
  registration_id: string;
  registry_office: string;
}

interface IOwnerOptions {
  id: string;
  name: string;
}

interface IPropertyOptions {
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
  description: Yup.string().required('Descri????o obrigat??ria'),
  customer_id: Yup.string().uuid().required('Contratado obrigat??rio'),
  property_id: Yup.string().uuid().required('Im??vel obrigat??rio'),
  price: Yup.number().required('Valor obrigat??ria'),
  start_date: Yup.date().required('Data inicio obrigat??ria'),
  end_date: Yup.date().required('Data fim obrigat??ria'),
  registration_id: Yup.string().required('Descri????o obrigat??ria'),
  registry_office: Yup.string().required('Descri????o obrigat??ria'),
});

export const Contracts: React.FC = () => {
  const classes = useStyles();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [openPropertyModal, setOpenPropertyModal] = React.useState(false);
  const [openPersonModal, setOpenPersonModal] = React.useState(false);
  const [openRenewContractModal, setOpenRenewContractModal] =
    React.useState(false);
  const [ownerOptions, setOwnerOptions] = useState<IOwnerOptions[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<IPropertyOptions[]>(
    []
  );
  const [rows, setRows] = useState<IContract[]>([] as IContract[]);
  const [contractSelected, setContractSelected] = useState<IContract>();

  const { signOut } = useAuth();

  const { addMessage } = useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateContractFormData>({
    resolver: yupResolver(schemaValidation),
  });

  const handleOpenModal = () => {
    setOpenPropertyModal(true);
  };

  const handleCloseModal = () => {
    setOpenPropertyModal(false);
  };

  const handleOpenPersonModal = () => {
    setOpenPersonModal(true);
  };

  const handleClosePersonModal = () => {
    setOpenPersonModal(false);
  };

  const handleOpenRenewModal = () => {
    setOpenRenewContractModal(true);
  };

  const handleCloseRenewModal = () => {
    setOpenRenewContractModal(false);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 150, hide: true },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      editable: false,
      renderCell: ({ value }: GridCellParams) => {
        return (
          <Grid container alignItems="center">
            <FiberManualRecordIcon htmlColor={!value ? 'red' : 'green'} />
            <span style={{ marginLeft: '10px' }}>
              {' '}
              {!value ? 'Vencido' : 'Ativo'}
            </span>
          </Grid>
        );
      },
    },
    {
      field: 'updated_at',
      headerName: 'Renovar',
      width: 130,
      editable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: ({ row }: GridCellParams) => {
        const { end_date } = row;

        const dateParsedToISO = parseISO(end_date);

        const contractIsExpired = isBefore(new Date(), dateParsedToISO);

        const onSubmit = useCallback(() => {
          setContractSelected(row as IContract);
          handleOpenRenewModal();
        }, [handleOpenRenewModal]);

        return (
          <Grid container alignItems="center">
            <Button
              fullWidth
              type="button"
              variant="contained"
              color="primary"
              onClick={onSubmit}
              disabled={contractIsExpired}
            >
              Renovar
            </Button>
          </Grid>
        );
      },
    },
    {
      field: 'description',
      headerName: 'Descri????o',
      width: 180,
      editable: false,
    },
    {
      field: 'created_at',
      headerName: 'Data de cria????o',
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
      field: 'price',
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
      field: 'start_date',
      headerName: 'Data inicio',
      type: 'date',
      width: 150,
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
      field: 'end_date',
      headerName: 'Data fim',
      type: 'date',
      width: 150,
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
      field: 'expiresInDays',
      headerName: 'Finaliza em',
      width: 160,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        if (!value) {
          return '0 dias';
        }

        if (value < 0) {
          const days = Number(value) * -1;

          return value === -1
            ? `Vencido a ${days} dia`
            : `Vencido a ${days} dias`;
        }

        return value > 1 ? `${value} dias` : `${value} dia`;
      },
    },
    {
      field: 'registry_office',
      headerName: 'Cart??rio',
      description: 'Nome do cart??rio de registro',
      width: 160,
    },
    {
      field: 'registration_id',
      headerName: 'Num. registro',
      description: 'N??mero de registro',
      width: 160,
    },
    {
      field: 'contractor',
      headerName: 'Contratante',
      description: 'Nome do contratante',
      width: 160,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        const customer = value as IOwnerOptions;

        return customer.name;
      },
    },
    {
      field: 'customer',
      headerName: 'Contratado',
      description: 'Nome do contratado',
      width: 160,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        const owner = value as IOwnerOptions;

        return owner.name;
      },
    },
  ];

  const loadingContracts = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get(`/api/v1/contracts`, {
        headers: {
          Authorization: getToken(),
        },
      });

      const contracts = response.data;

      setRows(contracts);
    } catch (error: any) {
      if (error.response.status === 401) {
        addMessage({
          message: 'Sess??o expirou, logue novamente',
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
      customer_id,
      description,
      end_date,
      price,
      property_id,
      registration_id,
      registry_office,
      start_date,
    }: CreateContractFormData) => {
      try {
        setIsLoading(true);

        await api.post(
          '/api/v1/contracts',
          {
            customer_id,
            description,
            end_date,
            price,
            property_id,
            registration_id,
            registry_office,
            start_date,
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        );

        addMessage({
          message: 'Contrato cadastrado com sucesso!',
          severity: 'success',
        });

        setTimeout(handleCloseModal, 500);
      } catch (error: any) {
        if (error.response.status === 401) {
          addMessage({
            message: 'Sess??o expirou, logue novamente',
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
    if (!openPropertyModal) {
      loadingContracts();
    }
  }, [openPropertyModal]);

  // Load all owners
  useEffect(() => {
    if (!openPersonModal && openPropertyModal) {
      Promise.all([
        api
          .get('/api/v1/people', {
            headers: {
              Authorization: getToken(),
            },
          })
          .then((response) => {
            const owners = response.data.map((person: IOwnerOptions) => {
              return {
                id: person.id,
                name: person.name.toLowerCase(),
              };
            });

            setOwnerOptions(owners);
          })
          .catch((error) => {
            if (error.response.status === 401) {
              addMessage({
                message: 'Sess??o expirou, logue novamente',
                severity: 'error',
              });

              signOut();
            } else {
              addMessage({
                message: 'Verifique os dados e tente novamente',
                severity: 'error',
              });
            }
          }),
        api
          .get('/api/v1/properties', {
            headers: {
              Authorization: getToken(),
            },
          })
          .then((response) => {
            const properties = response.data.map(
              (property: IPropertyOptions) => {
                return {
                  id: property.id,
                  description: property.description.toLowerCase(),
                };
              }
            );

            setPropertyOptions(properties);
          })
          .catch((error) => {
            if (error.response.status === 401) {
              addMessage({
                message: 'Sess??o expirou, logue novamente',
                severity: 'error',
              });

              signOut();
            } else {
              addMessage({
                message: 'Verifique os dados e tente novamente',
                severity: 'error',
              });
            }
          }),
      ]);
    }
  }, [openPersonModal, openPropertyModal]);

  // reload contracts from contract when modal is closed
  useEffect(() => {
    if (
      !openRenewContractModal &&
      contractSelected &&
      contractSelected.id.length > 0 &&
      !openRenewContractModal
    ) {
      loadingContracts();
    }
  }, [openRenewContractModal, contractSelected, openRenewContractModal]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <MenuHeader title="Gest??o de Contratos" />
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
                  <Typography variant="h5">Cadastro de Contratos</Typography>

                  <div style={{ margin: '10px 0' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      type="button"
                      onClick={handleOpenModal}
                    >
                      Novo Contrato
                      <AddCircleIcon fontSize="large" htmlColor="green" />
                    </Button>
                  </div>
                  <div style={{ height: 400, width: '100%' }}>
                    <DataGrid rows={rows} columns={columns} pageSize={5} />
                  </div>
                </Paper>
              </Grid>
            </Grid>

            {/* Modal de cadastro de contratos */}
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={classes.modal}
              open={openPropertyModal}
              onClose={handleCloseModal}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={openPropertyModal}>
                <div className={classes.modalPaper}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <h2 id="transition-modal-title">Novo Contrato</h2>
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
                      Dados b??sicos
                    </Typography>
                    <Divider title="Propriet??rio" />
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      id="description"
                      {...register('description')}
                      error={!!errors.description}
                      label="Descri????o"
                      required
                      autoFocus
                    />

                    <Typography variant="inherit" color="secondary">
                      {errors.description?.message}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="start_date"
                          {...register('start_date')}
                          error={!!errors.start_date}
                          label="Data inicio"
                          required
                          focused
                          type="date"
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
                          required
                          focused
                          type="date"
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.end_date}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={7}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="registry_office"
                          {...register('registry_office')}
                          error={!!errors.registry_office}
                          label="Nome do Cart??rio"
                          required
                          autoFocus
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.registry_office?.message}
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="registration_id"
                          {...register('registration_id')}
                          error={!!errors.registration_id}
                          label="N??mero de Registro"
                          required
                          autoFocus
                          type="number"
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.registration_id &&
                            'N??mero de Registro ?? obrigat??rio'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="price"
                          {...register('price')}
                          error={!!errors.price}
                          label="Pre??o"
                          required
                          autoFocus
                          type="number"
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.price}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="inherit" color="primary">
                      Partes e im??vel
                    </Typography>
                    <Divider />

                    <Divider title="Propriet??rio" />

                    <Grid
                      container
                      justifyContent="center"
                      spacing={2}
                      alignItems="center"
                    >
                      <Grid item xs={12}>
                        <Autocomplete
                          options={propertyOptions}
                          getOptionLabel={(option) => option.id}
                          renderOption={(option) => option.description}
                          fullWidth
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="outlined"
                              margin="normal"
                              id="owner_id"
                              {...register('property_id')}
                              error={!!errors.property_id}
                              label="Im??vel"
                              required
                              autoFocus
                            />
                          )}
                        />
                        <Typography variant="inherit" color="secondary">
                          {errors.property_id?.message}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid
                      container
                      justifyContent="center"
                      spacing={2}
                      alignItems="center"
                    >
                      <Grid item xs={10}>
                        <Autocomplete
                          options={ownerOptions}
                          getOptionLabel={(option) => option.id}
                          renderOption={(option) => option.name}
                          fullWidth
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="outlined"
                              margin="normal"
                              id="owner_id"
                              {...register('customer_id')}
                              error={!!errors.customer_id}
                              label="Contratado"
                              required
                              autoFocus
                            />
                          )}
                        />
                        <Typography variant="inherit" color="secondary">
                          {errors.customer_id?.message}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Button type="button" onClick={handleOpenPersonModal}>
                          <AddCircleIcon fontSize="large" htmlColor="green" />
                        </Button>
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

            {/* Person Modal */}
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={classes.modal}
              open={openPersonModal}
              onClose={handleClosePersonModal}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={openPersonModal}>
                <div className={classes.modalPaper}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <h2 id="transition-modal-title">Cadastro de Contratado</h2>
                    <Button
                      type="button"
                      style={{
                        borderRadius: '50%',
                      }}
                      onClick={handleClosePersonModal}
                    >
                      <CloseIcon id="transition-modal-title" />
                    </Button>
                  </div>
                  <CreatePersonForm onSubmit={handleClosePersonModal} />
                </div>
              </Fade>
            </Modal>

            {/* Modal de pagamento de lan??amento */}
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={classes.modal}
              open={openRenewContractModal}
              onClose={handleCloseRenewModal}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={openRenewContractModal}>
                <div className={classes.modalPaper}>
                  <RenewContractForm
                    contract={contractSelected as IContract}
                    onSubmit={handleCloseRenewModal}
                  />
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
