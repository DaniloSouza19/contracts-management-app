import {
  Button,
  TableContainer,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Table,
  TableFooter,
  Paper,
  Divider,
  makeStyles,
  Typography,
  Grid,
} from '@material-ui/core';
import * as React from 'react';
import { useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { calculateValueFromPercentage } from '../utils/calculateValues';
import {
  formatStringDate,
  formatValueAsCurrency,
  formatValueWithThousandsSeparator,
} from '../utils/formatter';

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

const useStyles = makeStyles(() => ({
  flex: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'space-between',
  },
  fontSmall: {
    '& td, th': {
      fontSize: 10,
      padding: '8px 5px',
    },
  },
  fontBoldSmall: {
    '& td, th': {
      fontSize: 11,
      padding: '8px 5px',
      fontWeight: 'bold',
    },
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
  maxWidth: {
    maxWidth: 180,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slimBorder: {
    '& th, td': {
      borderRight: '1px solid rgb(224, 224, 224)',
      borderLeft: '1px solid rgb(224, 224, 224)',
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
  forcePaddingRight: {
    paddingRight: '5px !important',
    '& td, th, tr': {
      paddingRight: '5px !important',
    },
  },
  tdStrongBorderBottom: {
    '& td': {
      borderBottom: '1px solid #010101',
    },
  },
}));

interface OrderProps {
  order: any;
}

const OrderDetails: React.FC<OrderProps> = ({ order }) => {
  const classes = useStyles();

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current || null,
  });

  const calculateSubtotal = useCallback(() => {
    const subtotal = order.items
      .map((item: any) => item.amount * item.price)
      .reduce((acc: number, current: number) => {
        return acc + current;
      });

    return formatValueAsCurrency(subtotal);
  }, [order]);

  const calculateTotalPurchaseSuggested = useCallback(() => {
    const subtotal = order.items
      .map((item: any) => item.purchase_suggestion * item.price)
      .reduce((acc: number, current: number) => {
        return acc + current;
      });

    return formatValueAsCurrency(subtotal);
  }, [order]);

  const calculateTotalSupplierBudget = useCallback(() => {
    const subtotal = order.items
      .map((item: any) => {
        const budgetValue = calculateValueFromPercentage(
          item.percentage_supplier_budget,
          item.price,
        );

        return budgetValue * item.amount;
      })
      .reduce((acc: number, current: number) => {
        return acc + current;
      });

    return formatValueAsCurrency(subtotal);
  }, [order]);

  return (
    <div>
      <div ref={componentRef}>
        <header>
          <style>{getPageMargins()}</style>
          <style>{orientationProps()}</style>

          <Grid container spacing={2} justifyContent="space-between">
            <Grid item>
              <Typography variant="h6">Pedido: {order.id}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">
                {' '}
                <strong> Data:</strong>{' '}
                {formatStringDate(order.created_at, `d/MM/yy 'às' H:mm`)}
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="subtitle1">
            {' '}
            <strong> Usuário:</strong> {order.user.name}
          </Typography>

          <Grid container spacing={2} justifyContent="space-between">
            <Grid item>
              <Typography variant="subtitle1">
                {' '}
                <strong> Comprador:</strong>{' '}
                {`${order.buyer_id} - ${order.buyer_name}`}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">
                {' '}
                <strong> Fornecedor:</strong>{' '}
                {`${order.items[0].supplier_id} - ${order.items[0].supplier_name}`}
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2} justifyContent="space-between">
            <Grid item>
              <Typography variant="subtitle1">
                <strong>Autorizado:</strong>{' '}
                {order.authorized === 'Y' ? 'Sim' : 'Não'}
              </Typography>
            </Grid>
            <Grid item>
              {order.authorized === 'Y' && (
                <Typography variant="subtitle1">
                  <strong>Autorizado em:</strong>{' '}
                  {formatStringDate(order.updated_at, `d/MM/yy 'às' H:mm`)}
                </Typography>
              )}
            </Grid>
            <Grid item>
              {order.authorized === 'Y' && (
                <Typography variant="subtitle1">
                  <strong>Num. sugestão ERP</strong>{' '}
                  {order.erp_suggested_order_id
                    ? order.erp_suggested_order_id
                    : 'Não vinculado'}
                </Typography>
              )}
            </Grid>
          </Grid>
        </header>
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
                  className={`${classes.slimBorder} ${classes.tableHeaders}`}
                >
                  <TableCell align="center" colSpan={5}>
                    Dados do produto
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    Ult. Compra
                  </TableCell>
                  <TableCell align="center" colSpan={4}>
                    Qt Venda Mês
                  </TableCell>
                  <TableCell align="center" colSpan={3}>
                    Estoque
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    Compra
                  </TableCell>
                  <TableCell
                    className={classes.forcePaddingRight}
                    align="center"
                    colSpan={2}
                  >
                    Verba
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableHead>
                <TableRow
                  className={`${classes.fontBoldSmall} ${classes.slimBorder}`}
                >
                  <TableCell>Código</TableCell>
                  <TableCell align="center">Descrição</TableCell>
                  <TableCell align="center">Emb.</TableCell>
                  <TableCell align="center">Curva</TableCell>
                  <TableCell align="center">Giro</TableCell>
                  <TableCell align="center">Custo</TableCell>
                  <TableCell align="center">QT</TableCell>
                  <TableCell align="center">Atual</TableCell>
                  <TableCell align="center">Ant1</TableCell>
                  <TableCell align="center">Ant2</TableCell>
                  <TableCell align="center">Ant3</TableCell>
                  <TableCell align="center">Reserv</TableCell>
                  <TableCell align="center">Disp.</TableCell>
                  <TableCell align="center">Sug.</TableCell>
                  <TableCell align="center">QT</TableCell>
                  <TableCell align="center">Preço</TableCell>
                  <TableCell align="center">%</TableCell>
                  <TableCell align="center">valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow
                    key={item.product_id}
                    className={`${classes.slimBorder} ${classes.fontSmall} ${classes.tdStrongBorderBottom}`}
                  >
                    <TableCell className={classes.fontSmall} scope="row">
                      {item.product_id}
                    </TableCell>
                    <TableCell
                      className={`${classes.fontSmall} ${classes.maxWidth}`}
                      align="left"
                    >
                      {item.product_description}
                    </TableCell>
                    <TableCell align="right">{item.packaging}</TableCell>
                    <TableCell align="right">{item.curve}</TableCell>
                    <TableCell align="right">
                      {Math.round(item.inventory_turnover)}
                    </TableCell>
                    <TableCell align="right">
                      {formatValueAsCurrency(item.last_income_price)}
                    </TableCell>
                    <TableCell align="right">
                      {item.last_purchase_quantity}
                    </TableCell>
                    <TableCell align="right">
                      {formatValueWithThousandsSeparator(
                        item.amount_sale_month,
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatValueWithThousandsSeparator(
                        item.amount_sale_month1,
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatValueWithThousandsSeparator(
                        item.amount_sale_month2,
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatValueWithThousandsSeparator(
                        item.amount_sale_month3,
                      )}
                    </TableCell>
                    <TableCell align="right">{item.reserved_stock}</TableCell>
                    <TableCell align="right">{item.amount_stock}</TableCell>
                    <TableCell align="right">
                      {formatValueWithThousandsSeparator(
                        item.purchase_suggestion,
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatValueWithThousandsSeparator(item.amount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatValueAsCurrency(item.price)}
                    </TableCell>
                    <TableCell align="center">
                      {item.percentage_supplier_budget}
                    </TableCell>
                    <TableCell
                      className={classes.forcePaddingRight}
                      align="center"
                    >
                      {item.percentage_supplier_budget
                        ? formatValueAsCurrency(
                            calculateValueFromPercentage(
                              item.percentage_supplier_budget,
                              item.price,
                            ),
                          )
                        : 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter className={classes.borderLeft}>
                <TableRow className={classes.fontBoldSmall}>
                  <TableCell align="center">SKU</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell colSpan={4} align="center">
                    Total Verba
                  </TableCell>
                  <TableCell colSpan={4} align="center">
                    Total Sugestão
                  </TableCell>
                  <TableCell colSpan={4} align="center">
                    Total compra
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableFooter}>
                  <TableCell align="center">{order.items.length}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell colSpan={4} align="center">
                    {' '}
                    {calculateTotalSupplierBudget()}{' '}
                  </TableCell>
                  <TableCell colSpan={4} align="center">
                    {calculateTotalPurchaseSuggested()}
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    align="center"
                    style={{
                      color: '#000',
                    }}
                  >
                    {calculateSubtotal()}
                  </TableCell>
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
    </div>
  );
};

export default OrderDetails;
