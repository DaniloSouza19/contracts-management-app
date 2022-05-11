import { Grid, Link, Typography } from '@material-ui/core';
import { version } from '../../package.json';

const Copyright: React.FC = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item>
          {'Copyright © '}
          <Link
            color="inherit"
            href="https://www.linkedin.com/in/danilosouzati/"
          >
            Danilo G. Souza | DGS Sistemas e consultoria
          </Link>{' '}
          {new Date().getFullYear()}
        </Grid>
        <Grid item>Versão: {version}</Grid>
        <Grid item />
      </Grid>
    </Typography>
  );
};

export default Copyright;
