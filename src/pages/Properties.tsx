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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
} from '@material-ui/core';
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
  GridCellValue,
  GridCellParams,
  GridValueGetterParams,
} from '@material-ui/data-grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { format, parseISO } from 'date-fns';
import Copyright from '../components/copyright';
import MenuHeader from '../components/menuHeader';
import { useMessage } from '../hooks/message';
import { CreatePersonForm } from '../components/CreatePersonForm';
import { api } from '../services/api';
import { getToken } from '../utils/localStorageUtils';
import { useAuth } from '../hooks/auth';

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

interface CreatePropertyFormData {
  description: string;
  iptu_id: string;
  registry_office: string;
  registration_id: string;
  measure_type: 'm2' | 'aq';
  measure_amount: number;

  street: string;
  postal_code: string;
  state: string;
  city: string;
  neighborhood: string;

  owner_id: string;
}

interface IOwnerOptions {
  id: string;
  name: string;
}

interface IAddress {
  street: string;
  postal_code: string;
  state: string;
  city: string;
  neighborhood: string;
}

const schemaValidation = Yup.object({
  description: Yup.string().required('Descrição obrigatória'),
  iptu_id: Yup.string().required('IPTU obrigatório'),
  registry_office: Yup.string().required('Cartório obrigatório'),
  registration_id: Yup.string().required('Número de registro obrigatório'),
  measure_type: Yup.string().required('Tipo de medida obrigatória'),
  measure_amount: Yup.number().required('Valor de medida obrigatório'),

  street: Yup.string().required('Rua obrigatória'),
  postal_code: Yup.string().required('CEP obrigatório').min(8).max(8),
  state: Yup.string().required('Estado obrigatório'),
  city: Yup.string().required('Cidade obrigatória'),
  neighborhood: Yup.string().required('Bairro obrigatória'),

  owner_id: Yup.string().uuid().required('Proprietário é obrigatório'),
});

export const Properties: React.FC = () => {
  const classes = useStyles();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [openPropertyModal, setOpenPropertyModal] = React.useState(false);
  const [openPersonModal, setOpenPersonModal] = React.useState(false);
  const [ownerOptions, setOwnerOptions] = useState<IOwnerOptions[]>([]);
  const [rows, setRows] = useState<[]>([]);

  const { signOut } = useAuth();

  const { addMessage } = useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePropertyFormData>({
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 150, hide: true },
    {
      field: 'description',
      headerName: 'Descrição',
      width: 180,
      editable: false,
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
      field: 'iptu_id',
      headerName: 'IPTU',
      type: 'string',
      width: 150,
      editable: false,
    },
    {
      field: 'registry_office',
      headerName: 'Cartório',
      description: 'Nome do cartório de registro',
      width: 160,
    },
    {
      field: 'registration_id',
      headerName: 'Num. registro',
      description: 'Número de registro',
      width: 160,
    },
    {
      field: 'measure_amount',
      headerName: 'Medida/area',
      width: 160,
      editable: false,
      valueFormatter: ({ row }: GridValueFormatterParams): GridCellValue => {
        const { measure_amount, measure_type } = row;

        return `${measure_amount} ${measure_type}`;
      },
    },
    {
      field: 'owner',
      headerName: 'Proprietário',
      width: 180,
      editable: false,
      valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
        const { name } = value as IOwnerOptions;

        return name;
      },
    },
    {
      field: 'address',
      headerName: 'Endereço',
      width: 600,
      editable: false,
      renderCell: ({ value }: GridCellParams) => {
        const { street, city, neighborhood, postal_code, state } =
          value as IAddress;

        return (
          <Grid container alignItems="center">
            <span>
              {street}, {neighborhood}, {city} - {state} - CEP: {postal_code}
            </span>
          </Grid>
        );
      },
    },
  ];

  const loadingProperties = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get(`/api/v1/properties`, {
        headers: {
          Authorization: getToken(),
        },
      });

      setRows(response.data);
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
      city,
      description,
      iptu_id,
      measure_amount,
      measure_type,
      neighborhood,
      owner_id,
      postal_code,
      registration_id,
      registry_office,
      state,
      street,
    }: CreatePropertyFormData) => {
      try {
        setIsLoading(true);

        const responseAddress = await api.post(
          '/api/v1/properties-address',
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
          '/api/v1/properties',
          {
            description,
            iptu_id,
            measure_amount,
            measure_type,
            address_id,
            registration_id,
            registry_office,
            owner_id,
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        );

        addMessage({
          message: 'Imóvel cadastrado com sucesso!',
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
    if (!openPropertyModal) {
      loadingProperties();
    }
  }, [openPropertyModal]);

  // Load all owners
  useEffect(() => {
    if (!openPersonModal && openPropertyModal) {
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
  }, [openPersonModal, openPropertyModal]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <MenuHeader title="Gestão de imóveis" />
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
                  <Typography variant="h5">Cadastro de imóveis</Typography>

                  <div style={{ margin: '10px 0' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      type="button"
                      onClick={handleOpenModal}
                    >
                      Novo imóvel
                      <AddCircleIcon fontSize="large" htmlColor="green" />
                    </Button>
                  </div>
                  <div style={{ height: 400, width: '100%' }}>
                    <DataGrid rows={rows} columns={columns} pageSize={5} />
                  </div>
                </Paper>
              </Grid>
            </Grid>

            {/* Modal de cadastro de imóvel */}
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
                    <h2 id="transition-modal-title">Novo imóvel</h2>
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
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      id="iptu_id"
                      {...register('iptu_id')}
                      error={!!errors.iptu_id}
                      label="IPTU"
                      required
                      autoFocus
                      type="number"
                    />

                    <Typography variant="inherit" color="secondary">
                      {errors.iptu_id && 'IPTU é obrigatório'}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={7}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="registry_office"
                          {...register('registry_office')}
                          error={!!errors.registry_office}
                          label="Nome do Cartório"
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
                          label="Número de Registro"
                          required
                          autoFocus
                          type="number"
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.registration_id &&
                            'Número de Registro É obrigatório'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="measure_amount"
                          {...register('measure_amount')}
                          error={!!errors.measure_amount}
                          label="Medida"
                          required
                          autoFocus
                          type="number"
                        />

                        <Typography variant="inherit" color="secondary">
                          {errors.measure_amount && 'Medida é obrigatória'}
                        </Typography>
                      </Grid>

                      <Grid item xs={4}>
                        <FormControl className={classes.formControl}>
                          <InputLabel id="demo-simple-select-label">
                            Tipo de medida
                          </InputLabel>
                          <Select
                            fullWidth
                            label="asdv"
                            className={classes.select}
                            labelId="demo-simple-select-label"
                            id="measure_type"
                            {...register('measure_type')}
                            defaultValue="m2"
                          >
                            <MenuItem value="m2">m&sup2;</MenuItem>
                            <MenuItem value="aq">alqueire</MenuItem>
                          </Select>
                        </FormControl>
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
                          {errors.postal_code}
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

                    <br />

                    <Typography variant="inherit" color="primary">
                      Proprietário
                    </Typography>

                    <Divider title="Proprietário" />

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
                              {...register('owner_id')}
                              error={!!errors.owner_id}
                              label="Proprietário"
                              required
                              autoFocus
                            />
                          )}
                        />
                        <Typography variant="inherit" color="secondary">
                          {errors.owner_id?.message}
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
                    <h2 id="transition-modal-title">
                      Cadastro de proprietário
                    </h2>
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

            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        )}
      </main>
    </div>
  );
};
