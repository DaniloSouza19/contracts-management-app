import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useMessage } from '../hooks/message';

import Copyright from '../components/copyright';
import MenuHeader from '../components/menuHeader';
import { useAuth } from '../hooks/auth';
import { api } from '../services/api';
import { getToken } from '../utils/localStorageUtils';

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
  link: {
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  colorRed: {
    color: 'red',
  },
}));

interface IContract {
  id: string;
  description: string;
  price: string;
  end_date: string;
  start_date: string;
  expiresInDays: number;
  isActive: boolean;
}

interface IContractAnalysis {
  contractsToExpires: number;
  activeContracts: number;
  inactiveContracts: number;
}

export const Dashboard: React.FC = () => {
  const classes = useStyles();
  const [contracts, setContracts] = useState<IContract[]>([] as IContract[]);
  const { user, signOut } = useAuth();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [contractAnalysis, setContractAnalysis] = useState<IContractAnalysis>({
    activeContracts: 0,
    contractsToExpires: 0,
    inactiveContracts: 0,
  });

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const { addMessage } = useMessage();

  const preLoadingContracts = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/v1/contracts/`, {
        headers: {
          Authorization: getToken(),
        },
      });

      const allContracts = data as IContract[];

      const activeContracts =
        allContracts.filter((contract) => contract.isActive).length || 0;

      const inactiveContracts =
        allContracts.filter((contract) => !contract.isActive).length || 0;

      const contractsToExpires =
        allContracts.filter(
          (contract) =>
            contract.expiresInDays < 30 && contract.expiresInDays >= 0
        ).length || 0;

      setContracts(allContracts);
      setContractAnalysis({
        activeContracts,
        inactiveContracts,
        contractsToExpires,
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        signOut();
      }

      setContracts([]);
    } finally {
      setPageIsLoading(false);
    }
  }, [signOut, user.email]);

  useEffect(() => {
    preLoadingContracts();
  }, [preLoadingContracts]);

  useEffect(() => {
    if (contractAnalysis.contractsToExpires > 0) {
      addMessage({
        message: `Há  ${contractAnalysis.contractsToExpires} contratos com menos de 30 dias que estão prestes a vencer`,
        severity: 'info',
      });
    }
  }, [contractAnalysis.contractsToExpires]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <MenuHeader title="Dashboard" />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={2}>
            {pageIsLoading ? (
              <CircularProgress
                color="primary"
                size={50}
                className={classes.center}
              />
            ) : (
              <>
                <Grid item xs={8} md={8} lg={7}>
                  <Paper className={fixedHeightPaper}>
                    {' '}
                    <Typography variant="h6">
                      Olá {user.name}, Seja bem vindo(a) ao App de gestão de
                      contratos de imóveis
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item>
                  <Paper className={fixedHeightPaper}>
                    <Grid
                      alignItems="center"
                      alignContent="center"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                      }}
                    >
                      <div>
                        <Typography variant="h6">Contratos ativos</Typography>
                      </div>
                      <div>
                        <Typography variant="h4">
                          {contractAnalysis.activeContracts}
                        </Typography>
                      </div>
                      <div>
                        <Link className={classes.link} to="/contracts">
                          <Typography variant="h6" color="primary">
                            Detalhes
                          </Typography>
                        </Link>
                      </div>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item>
                  <Paper className={fixedHeightPaper}>
                    <Grid
                      alignItems="center"
                      alignContent="center"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                      }}
                    >
                      <div>
                        <Typography variant="h6">Contratos Vencidos</Typography>
                      </div>
                      <div>
                        <Typography variant="h4" className={classes.colorRed}>
                          {contractAnalysis.inactiveContracts}
                        </Typography>
                      </div>
                      <div>
                        <Link className={classes.link} to="/contracts">
                          <Typography variant="h6" color="primary">
                            Detalhes
                          </Typography>
                        </Link>
                      </div>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item>
                  <Paper className={fixedHeightPaper}>
                    <Grid
                      alignItems="center"
                      alignContent="center"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                      }}
                    >
                      <div>
                        <Typography variant="h6">
                          Contratos prestes a vencer
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="h4" className={classes.colorRed}>
                          {contractAnalysis.contractsToExpires}
                        </Typography>
                      </div>
                      <div>
                        <Link className={classes.link} to="/contracts">
                          <Typography variant="h6" color="primary">
                            Detalhes
                          </Typography>
                        </Link>
                      </div>
                    </Grid>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </div>
  );
};
