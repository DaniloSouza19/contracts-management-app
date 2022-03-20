import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import ExitIcon from '@material-ui/icons/ExitToApp';
import Paper from '@material-ui/core/Paper';
import { Toolbar } from '@material-ui/core';
import Copyright from '../components/copyright';
import MenuHeader from '../components/menuHeader';
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
  margin: {
    margin: 15,
  },
}));

export const Accounts: React.FC = () => {
  const classes = useStyles();
  const { user, signOut } = useAuth();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <MenuHeader title="Minha Conta" />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8} lg={9}>
              <Paper className={classes.paper}>
                <Typography className={classes.title} variant="h4">
                  Dados da conta
                </Typography>
                <Typography variant="h6">Nome</Typography>
                <TextField value={user?.name} contentEditable={false} />
                <Typography variant="h6">E-mail</Typography>
                <TextField value={user?.email} contentEditable={false} />

                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <Typography variant="h6">Sair da aplicação</Typography>
                  </Grid>
                  <Grid item>
                    <Toolbar>
                      <IconButton color="secondary" onClick={signOut}>
                        <ExitIcon />
                      </IconButton>
                    </Toolbar>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </div>
  );
};
