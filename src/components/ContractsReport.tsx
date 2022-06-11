import {
  Button,
  CircularProgress,
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
import { formatStringDate, formatValueAsCurrency } from '../utils/formatter';

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
  center: {
    position: 'absolute',
    left: '50%',
    top: '50%',
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

interface IPeople {
  id: string;
  name: string;
}

interface IProperty {
  id: string;
  description: string;
}

interface IAddress {
  street: string;
  city: string;
  neighborhood: string;
  postal_code: string;
  state: string;
}

interface IContract {
  id: string;
  description: string;
  contractor_id: string;
  property_id: string;
  property: IProperty;
  registry_office: string;
  registration_id: number;
  expiresInDays: number;
  price: number;
  priceAsCurrency: string;
  isActive: boolean;
  contractor: IPeople;
  customer: IPeople;
  start_date: string;
  end_date: string;
  formattedStartDate: string;
  formattedEndDate: string;
}

export const ContractsReport: React.FC = () => {
  const classes = useStyles();
  const [rows, setRows] = useState<IContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const CONTRACTS_EXPIRE_DAYS = 30;

  const componentRef = useRef<HTMLDivElement>(null);

  const { addMessage } = useMessage();
  const { signOut } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current || null,
  });

  const loadContracts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/v1/contracts`, {
        headers: {
          Authorization: getToken(),
        },
      });

      const contracts = (response.data as IContract[])
        .filter(
          (contract) =>
            contract.isActive && contract.expiresInDays <= CONTRACTS_EXPIRE_DAYS
        )
        .map((contract) => {
          return {
            ...contract,
            priceAsCurrency: formatValueAsCurrency(contract.price),
            formattedEndDate: formatStringDate(contract.end_date, 'dd-MM-yyyy'),
            formattedStartDate: formatStringDate(
              contract.start_date,
              'dd-MM-yyyy'
            ),
          };
        });

      if (contracts.length === 0) {
        addMessage({
          message: 'Nenhum contrato próximo à vencer',
          severity: 'info',
        });
      }

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
    }
  }, [signOut]);

  useEffect(() => {
    loadContracts();
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
              <Typography variant="h5">
                Contratos a vencer em até {CONTRACTS_EXPIRE_DAYS} dias
              </Typography>
            </Grid>
          </Grid>
          <Divider />

          {rows.length > 0 && (
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
                      <TableCell align="center">Cartório</TableCell>
                      <TableCell align="center">Núm Registro</TableCell>
                      <TableCell align="center">Valor</TableCell>
                      <TableCell align="center">Contratante</TableCell>
                      <TableCell align="center">Contratado</TableCell>
                      <TableCell align="center">Data inicio</TableCell>
                      <TableCell align="center">Data venc</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((contract) => (
                      <TableRow
                        key={contract.id}
                        className={`${classes.fontSmall} ${classes.slimBorder} ${classes.tdStrongBorderBottom}`}
                      >
                        <TableCell align="left">
                          {contract.description}
                        </TableCell>
                        <TableCell align="left">
                          {contract.registry_office}
                        </TableCell>
                        <TableCell align="left">
                          {contract.registration_id}
                        </TableCell>
                        <TableCell align="left">
                          {contract.priceAsCurrency}
                        </TableCell>

                        <TableCell align="left">
                          {contract.contractor.name}
                        </TableCell>
                        <TableCell align="left">
                          {contract.customer.name}
                        </TableCell>
                        <TableCell align="left">
                          {contract.formattedStartDate}
                        </TableCell>
                        <TableCell align="left">
                          {contract.formattedEndDate}
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
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </main>
          )}
        </div>
        {rows.length > 0 && (
          <Button
            className={classes.marginTop}
            fullWidth
            variant="contained"
            color="primary"
            onClick={handlePrint}
          >
            Imprimir
          </Button>
        )}
        {isLoading && (
          <CircularProgress
            color="primary"
            size={50}
            className={classes.center}
          />
        )}
      </Paper>
    </div>
  );
};
