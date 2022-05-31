import {
  Button,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { useReactToPrint } from 'react-to-print';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useMessage } from '../hooks/message';
import { getToken } from '../utils/localStorageUtils';
import { useAuth } from '../hooks/auth';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  tableHeaders: {
    '& tr, th': {
      fontSize: 12,
      padding: '8px 5px',
      fontWeight: 'bold',
    },
  },
  marginTop: {
    marginTop: 10,
  },
  table: {
    minWidth: 650,
  },
  slimBorder: {
    '& th, td': {
      borderRight: '1px solid rgb(224, 224, 224)',
      borderLeft: '1px solid rgb(224, 224, 224)',
    },
  },
  forcePaddingRight: {
    paddingRight: '5px !important',
    '& td, th, tr': {
      paddingRight: '5px !important',
    },
  },
  fontBoldSmall: {
    '& td, th': {
      fontSize: 11,
      padding: '8px 5px',
      fontWeight: 'bold',
    },
  },
  fontSmall: {
    '& td, th': {
      fontSize: 10,
      padding: '8px 5px',
    },
  },
  tdStrongBorderBottom: {
    '& td': {
      borderBottom: '1px solid #010101',
    },
  },
  borderLeft: {
    '& tr, th, td': {
      '&:first-child': {
        borderLeft: '1px solid rgb(224, 224, 224)',
      },
      '&:last-child': {
        borderRight: '1px solid rgb(224, 224, 224)',
      },
    },
  },
  tableFooter: {
    '& td': {
      fontSize: 18,
      padding: '8px 5px',
      paddingRight: '5px !important',
      fontWeight: 'bold',
    },
  },
  maxWidth: {
    maxWidth: 180,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const marginTop = '5mm';
const marginRight = '5mm';
const marginBottom = '5mm';
const marginLeft = '5mm';
const orientation = 'landscape';

const getPageMargins = () => {
  return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};

const orientationProps = () => {
  return `@media print {
    @page { size: ${orientation}; }
  }`;
};

interface IOwner {
  id: string;
  name: string;
}

interface IAddress {
  street: string;
  city: string;
  neighborhood: string;
  postal_code: string;
  state: string;
}

interface IProperty {
  id: string;
  description: string;
  iptu_id: number;
  registry_office: string;
  registration_id: number;
  measure_type: string;
  measure_amount: number;
  owner: IOwner;
  address: IAddress;
}

export const PropertiesReport: React.FC = () => {
  const classes = useStyles();
  const [rows, setRows] = useState<[]>([]);

  const componentRef = useRef<HTMLDivElement>(null);

  const { addMessage } = useMessage();
  const { signOut } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current || null,
  });

  const loadProperties = useCallback(async () => {
    try {
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
    }
  }, [signOut]);

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <div>
      <Paper>
        <div ref={componentRef}>
          <header>
            <style>{getPageMargins()}</style>
            <style>{orientationProps()}</style>
          </header>
          <Grid container alignItems="center" justifyContent="center">
            <Grid item>
              <Typography variant="h5">Relatório de imóveis</Typography>
            </Grid>
          </Grid>
          <Divider />
          <main>
            <TableContainer component={Paper}>
              <Table
                className={classes.table}
                size="small"
                aria-label="a dense table"
              >
                <TableHead>
                  <TableRow
                    className={`${classes.fontBoldSmall} ${classes.slimBorder}`}
                  >
                    <TableCell align="center">Descrição</TableCell>
                    <TableCell align="center">IPTU</TableCell>
                    <TableCell align="center">Cartório</TableCell>
                    <TableCell align="center">Núm Registro</TableCell>
                    <TableCell align="center">Medida</TableCell>
                    <TableCell align="center">Proprietário</TableCell>
                    <TableCell align="center">Endereço</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((property: IProperty) => (
                    <TableRow
                      key={property.id}
                      className={`${classes.fontSmall} ${classes.slimBorder} ${classes.tdStrongBorderBottom}`}
                    >
                      <TableCell align="left">{property.description}</TableCell>
                      <TableCell align="left">{property.iptu_id}</TableCell>
                      <TableCell align="left">
                        {property.registry_office}
                      </TableCell>
                      <TableCell align="left">
                        {property.registration_id}
                      </TableCell>
                      <TableCell align="left">
                        {property.measure_amount} {property.measure_type}
                      </TableCell>

                      <TableCell align="left">{property.owner.name}</TableCell>
                      <TableCell align="left">
                        {property.address.street} - {property.address.city},
                        {property.address.neighborhood}
                        {' CEP: '}
                        {property.address.postal_code} {property.address.city} (
                        {property.address.state})
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter className={classes.borderLeft}>
                  <TableRow className={classes.fontBoldSmall}>
                    <TableCell align="center">Total de imóveis</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                  <TableRow className={classes.tableFooter}>
                    <TableCell align="center">{rows.length}</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </main>
        </div>
        <Button
          className={classes.marginTop}
          fullWidth
          variant="contained"
          color="primary"
          onClick={handlePrint}
        >
          Imprimir
        </Button>
      </Paper>
    </div>
  );
};
