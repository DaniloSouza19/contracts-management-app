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

interface IContract {
  id: string;
  description: string;
}

interface IPayment {
  id: string;
  description: string;
  payment_date: number | null;
  due_date: Date;
  is_paid: boolean;
  value: number;
  additional_fees: number;
  discount: number;
  created_at: Date;
  contract: IContract;
  subtotal: number;
  subtotalFormatted: string;
  paymentDateFormatted: string;
  dueDateFormatted: string;
  valueAsCurrency: string;
  additionalFeesFormatted: string;
  discountFormatted: string;
}

interface PaymentsReportProps {
  onlyPay?: boolean;
  title: string;
}

export const PaymentsReport: React.FC<PaymentsReportProps> = ({
  onlyPay,
  title,
}) => {
  const classes = useStyles();
  const [rows, setRows] = useState<IPayment[]>([]);

  const componentRef = useRef<HTMLDivElement>(null);

  const { addMessage } = useMessage();
  const { signOut } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current || null,
  });

  const loadPayments = useCallback(async () => {
    try {
      const response = await api.get(`/api/v1/payments`, {
        headers: {
          Authorization: getToken(),
        },
      });

      if (response.data.length < 1) {
        addMessage({
          message: 'Nenhum lançamento encontrado',
          severity: 'info',
        });
      }

      const payments = response.data.map((payment: IPayment) => {
        return {
          ...payment,
          subtotalFormatted: formatValueAsCurrency(payment.subtotal),
          dueDateFormatted: formatStringDate(
            payment.due_date.toString(),
            'dd-MM-yyyy'
          ),
          paymentDateFormatted: payment.payment_date
            ? formatStringDate(payment.payment_date.toString(), 'dd-MM-yyyy')
            : '-',
          additionalFeesFormatted: formatValueAsCurrency(
            payment.additional_fees
          ),
          discountFormatted: formatValueAsCurrency(payment.discount),
        };
      }) as IPayment[];

      setRows(
        onlyPay
          ? payments.filter((payment) => payment.is_paid)
          : payments.filter((payment) => !payment.is_paid)
      );
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

  const calculateSubtotal = useCallback(() => {
    const total = rows
      .map((payment) => payment.subtotal)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return formatValueAsCurrency(total);
  }, [rows]);

  useEffect(() => {
    loadPayments();
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
              <Typography variant="h5">{title}</Typography>
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
                    <TableCell align="center">Contrato</TableCell>
                    <TableCell align="center">Data de vencimento</TableCell>
                    <TableCell align="center">pago</TableCell>
                    <TableCell align="center">Data de pagamento</TableCell>
                    <TableCell align="center">valor</TableCell>
                    <TableCell align="center">taxa adicional</TableCell>
                    <TableCell align="center">desconto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className={`${classes.fontSmall} ${classes.slimBorder} ${classes.tdStrongBorderBottom}`}
                    >
                      <TableCell align="left">{payment.description}</TableCell>
                      <TableCell align="left">
                        {payment.contract.description}
                      </TableCell>
                      <TableCell align="center">
                        {payment.dueDateFormatted}
                      </TableCell>
                      <TableCell align="left">
                        {payment.is_paid ? 'sim' : 'não'}
                      </TableCell>
                      <TableCell align="center">
                        {payment.paymentDateFormatted}
                      </TableCell>
                      <TableCell align="left">
                        {payment.subtotalFormatted}
                      </TableCell>
                      <TableCell align="left">
                        {payment.additionalFeesFormatted}
                      </TableCell>
                      <TableCell align="left">
                        {payment.discountFormatted}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter className={classes.borderLeft}>
                  <TableRow className={classes.fontBoldSmall}>
                    <TableCell align="center">Total</TableCell>
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
                    <TableCell> {calculateSubtotal()}</TableCell>
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
