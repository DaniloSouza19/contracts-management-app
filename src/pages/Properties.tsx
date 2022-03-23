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
} from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Copyright from '../components/copyright';
import MenuHeader from '../components/menuHeader';
import { useMessage } from '../hooks/message';

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
    width: 500,
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
  iptu_id: number;
  registry_office: string;
  registration_id: number;
  measure_type: 'm2' | 'aq';
  measure_amount: number;
}

const schemaValidation = Yup.object({
  description: Yup.string().required('Descrição obrigatória'),
  iptu_id: Yup.number().required('IPTU obrigatório'),
  registry_office: Yup.string().required('Cartório obrigatório'),
  registration_id: Yup.number().required('Número de registro obrigatório'),
  measure_type: Yup.string().required('Tipo de medida obrigatória'),
  measure_amount: Yup.number().required('Valor de medida obrigatório'),
});

export const Properties: React.FC = () => {
  const classes = useStyles();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = React.useState(false);

  const { addMessage } = useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePropertyFormData>({
    resolver: yupResolver(schemaValidation),
  });

  const onSubmit = useCallback(async (data: CreatePropertyFormData) => {
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

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    setPageIsLoading(false);
  }, []);

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

                  <div>
                    <Button type="button" onClick={handleOpenModal}>
                      Novo imóvel
                      <AddBoxIcon />
                    </Button>
                  </div>
                </Paper>
              </Grid>
            </Grid>

            {/* Modal de cadastro de imóvel */}
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={classes.modal}
              open={openModal}
              onClose={handleCloseModal}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={openModal}>
                <div className={classes.modalPaper}>
                  <h2 id="transition-modal-title">Novo imóvel</h2>
                  <form onSubmit={handleSubmit(onSubmit)}>
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
                      {errors.iptu_id?.message}
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      id="registry_office"
                      {...register('registry_office')}
                      error={!!errors.registry_office}
                      label="Cartório de Registro"
                      required
                      autoFocus
                    />

                    <Typography variant="inherit" color="secondary">
                      {errors.registry_office?.message}
                    </Typography>

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
                      {errors.registration_id?.message}
                    </Typography>

                    <Grid container>
                      <Grid item>
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
                          {errors.measure_amount?.message}
                        </Typography>
                      </Grid>

                      <Grid item>
                        <FormControl className={classes.formControl}>
                          <InputLabel id="demo-simple-select-label">
                            Tipo de medida
                          </InputLabel>
                          <Select
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
