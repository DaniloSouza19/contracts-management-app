import React, { useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {
  Divider,
  TextField,
  CircularProgress,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import {
  DataGrid,
  GridColDef,
  GridCellEditCommitParams,
  GridSelectionModel,
  GridCellParams,
  GridValueFormatterParams,
  GridCellValue,
} from '@material-ui/data-grid';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Copyright from '../components/copyright';
import MenuHeader from '../components/menuHeader';
import { api } from '../services/api';
import { getToken } from '../utils/localStorageUtils';
import AppError from '../errors/AppError';
import { useAuth } from '../hooks/auth';
import { formatValueAsCurrency } from '../utils/formatter';
import { calculateValueFromPercentage } from '../utils/calculateValues';
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
}));

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Código', width: 125 },
  {
    field: 'product_description',
    headerName: 'Descrição',
    width: 250,
    editable: false,
  },
  {
    field: 'purchase_suggestion',
    headerName: 'Sug. Compra',
    type: 'number',
    width: 180,
    editable: false,
    renderCell: ({ value }: GridCellParams) => {
      let color = '';
      if (value !== null) {
        if (Number(value) > 0) {
          color = 'green';
        } else {
          color = 'red';
        }
      }

      return (
        <div
          style={{
            color,
          }}
        >
          {value}
        </div>
      );
    },
  },
  {
    field: 'amount',
    headerName: 'QT',
    type: 'number',
    width: 110,
    editable: true,
    renderCell: ({ value }: GridCellParams) => {
      let color = '';
      if (value !== null) {
        if (Number(value) > 0) {
          color = 'blue';
        } else {
          color = 'red';
        }
      }
      return (
        <div
          style={{
            color,
          }}
        >
          {value}
        </div>
      );
    },
  },
  {
    field: 'price',
    headerName: 'Preço',
    type: 'number',
    width: 130,
    editable: true,
    renderCell: ({ value }: GridCellParams) => {
      let color = '';
      if (value !== null) {
        if (Number(value) > 0) {
          color = 'blue';
        } else {
          color = 'red';
        }
      }
      return (
        <div
          style={{
            color,
          }}
        >
          {value}
        </div>
      );
    },
  },
  {
    field: 'percentage_supplier_budget',
    headerName: '% Verba',
    type: 'number',
    width: 110,
    editable: true,
    disableColumnMenu: true,
    renderCell: ({ value }: GridCellParams) => {
      let color = '';
      if (value !== null) {
        if (Number(value) > 0) {
          color = 'blue';
        } else {
          color = 'red';
        }
      }
      return (
        <div
          style={{
            color,
          }}
        >
          {value}
        </div>
      );
    },
  },
  {
    field: 'value_supplier_budget',
    headerName: 'Vl Verba',
    type: 'number',
    width: 120,
    disableColumnMenu: true,
    renderCell: ({ row }: GridCellParams) => {
      const percentage = row.percentage_supplier_budget;
      const totalValue = row.price;

      const valueCalculated = calculateValueFromPercentage(
        percentage,
        totalValue
      );

      return <div>{Number(valueCalculated.toFixed(2))}</div>;
    },
  },
  {
    field: 'curve',
    headerName: 'Curva',
    width: 130,
    editable: false,
  },
  {
    field: 'packaging',
    headerName: 'Embalagem',
    width: 130,
    editable: false,
  },
  {
    field: 'out_of_line',
    headerName: 'Fora de linha',
    width: 150,
    editable: false,
    renderCell: ({ value }: GridCellParams): GridCellValue => {
      const valueFormatted = value === 'Y' ? 'SIM' : 'NÃO';

      const color = value === 'Y' ? 'red' : 'green';

      return (
        <div
          style={{
            color,
          }}
        >
          {valueFormatted}
        </div>
      );
    },
  },
  {
    field: 'last_income_price',
    headerName: 'Custo Ult. Ent.',
    width: 150,
    editable: false,
    valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
      const valueFormatted = formatValueAsCurrency(Number(value));

      return valueFormatted;
    },
  },
  {
    field: 'supplier_name',
    headerName: 'Fornecedor',
    width: 250,
    editable: false,
  },
  {
    field: 'inventory_turnover',
    headerName: 'Giro dia',
    width: 150,
    editable: false,
    valueFormatter: ({ value }: GridValueFormatterParams): GridCellValue => {
      const valueFormatted = Number(value).toFixed(2);

      return valueFormatted;
    },
  },
  {
    field: 'amount_stock',
    headerName: 'Estoque',
    width: 150,
    editable: false,
  },
  {
    field: 'requested_amount',
    headerName: 'QT pedida',
    width: 150,
    editable: false,
  },
  {
    field: 'ideal_stock',
    headerName: 'Estoque ideal',
    width: 170,
    editable: false,
  },
  {
    field: 'amount_sale_month',
    headerName: 'Qt Venda mês atual',
    width: 150,
    editable: false,
  },
  {
    field: 'amount_sale_month1',
    headerName: 'Qt Venda Ant1',
    description: 'QT de venda mês anterior',
    width: 150,
    editable: false,
  },
  {
    field: 'amount_sale_month2',
    headerName: 'Qt Venda Ant2',
    description: 'QT de venda mês anterior2',
    width: 150,
    editable: false,
  },
  {
    field: 'amount_sale_month3',
    headerName: 'Qt Venda Ant3',
    description: 'QT de venda mês anterior3',
    width: 150,
    editable: false,
  },
];

interface IProduct {
  product_id: number;
  product_description: string;
  purchase_suggestion: number;
  last_income_price: number;
  percentage_supplier_budget: number;
  value_supplier_budget: number;
}

interface IRow {
  id: number;
  product_description: string;
  purchase_suggestion: number;
  amount: number;
  price: number;
  percentage_supplier_budget: number;
  value_supplier_budget: number;
}

interface SearchProductsFormData {
  supplier_id: number;
  supplier_name: string;
  add_out_of_line?: boolean;
}

const schemaValidation = Yup.object({
  supplier_name: Yup.string().required('Fornecedor obrigatório'),
  add_out_of_line: Yup.boolean(),
});

interface ISupplierOptions {
  supplier_id: number;
  supplier_name: string;
  buyer_name: string;
}

export const Properties: React.FC = () => {
  const classes = useStyles();
  const { signOut } = useAuth();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<IRow[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<ISupplierOptions[]>(
    []
  );

  const { addMessage } = useMessage();

  const [selectedRows, setSelectedRows] = useState<IRow[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchProductsFormData>({
    resolver: yupResolver(schemaValidation),
  });

  const onSubmit = useCallback(
    async (data: SearchProductsFormData) => {
      try {
        setIsLoading(true);

        const supplierSlicedFields = data.supplier_name.split('-');

        // eslint-disable-next-line no-param-reassign
        data.supplier_id = Number(supplierSlicedFields[0]);
        const response = await api.get(
          `/curve-products/supplier/${data.supplier_id}`,
          {
            params: {
              add_out_of_line: data.add_out_of_line,
            },
            headers: {
              Authorization: getToken(),
            },
          }
        );

        const responseProducts = response.data as IProduct[];

        if (responseProducts.length === 0) {
          throw new AppError('Nenhum produto encontrado');
        }

        const products = responseProducts.map((product) => {
          return {
            ...product,
            id: product.product_id,
            amount:
              product.purchase_suggestion > 0 ? product.purchase_suggestion : 0,
            price:
              product.last_income_price > 0
                ? Number(product.last_income_price.toFixed(2))
                : 0,
            percentage_supplier_budget: 0,
            value_supplier_budget: 0,
          };
        });

        setRows(products);
      } catch (error: any) {
        if (error instanceof AppError) {
          addMessage({
            message: error.message,
            severity: 'error',
          });
          setRows([]);
          return;
        }

        if (error.response?.status === 401) {
          signOut();
        }

        addMessage({
          message:
            'Erro ao buscar produtos verifique se digitou o código do fornecedor corretamente.',
          severity: 'error',
        });
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, signOut]
  );

  const validateOrder = useCallback(async () => {
    const productsPrepared = selectedRows.map((row) => {
      return {
        product_id: row.id,
        amount: row.amount,
        price: row.price,
        percentage_supplier_budget: row.percentage_supplier_budget,
      };
    });

    const schema = Yup.array()
      .required('Sem produtos')
      .of(
        Yup.object({
          product_id: Yup.number().positive(),
          amount: Yup.number()
            .positive('Quantidade invalida, deve ser maior que 0')
            .integer('Deve ser número inteiro')
            .required('Quantidade obrigatória'),
          price: Yup.number()
            .positive('Preço invalido, deve ser maior que 0')
            .required('Preço obrigatório'),
        }).required('Sem produtos')
      );

    await schema.validate(productsPrepared);

    return productsPrepared;
  }, [selectedRows]);

  const handleCreateOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await validateOrder();

      await api.post(
        '/orders-suggested',
        {
          items,
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      addMessage({
        message: 'Pedido realizado com sucesso',
        severity: 'success',
      });
      setRows([]);
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        addMessage({
          message:
            'Erro na validação o pedido! verifique se as quantidades e preços estão validas',
          severity: 'error',
        });
        return;
      }
      addMessage({
        message:
          'Um erro ocorreu, tente novamente se persistir informe ao responsável pela aplicação',
        severity: 'error',
      });

      if (error.response?.status === 401) {
        signOut();
      }
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [validateOrder, addMessage, signOut]);

  useEffect(() => {
    api
      .get('/suppliers', {
        headers: {
          Authorization: getToken(),
        },
      })
      .then((response) => setSupplierOptions(response.data));

    setPageIsLoading(false);
  }, []);

  const handleSelectedRows = useCallback(
    (ids: GridSelectionModel) => {
      const selectedIDs = new Set(ids);
      const selectedRowData = rows.filter((row) => selectedIDs.has(row.id));
      setSelectedRows(selectedRowData);
    },
    [rows]
  );

  const handleUpdateRowValue = useCallback(
    ({ field, id, value }: GridCellEditCommitParams) => {
      const updatedRows = rows.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            [field]: value,
          };
        }
        return row;
      });

      setRows(updatedRows);

      const updatedRowsSelected = selectedRows.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            [field]: value,
          };
        }
        return row;
      });

      setSelectedRows(updatedRowsSelected);
    },
    [rows, selectedRows]
  );

  const getTotalOrder = useCallback(() => {
    const subTotalByItems = selectedRows.map((item) => {
      return item.amount * item.price;
    });

    const total = subTotalByItems.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    return <div>Total: {formatValueAsCurrency(total)} </div>;
  }, [selectedRows]);

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
                  <Typography variant="h5">
                    Incluir sugestão de compra
                  </Typography>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Typography>Pesquisa de produtos</Typography>
                    <Autocomplete
                      options={supplierOptions}
                      getOptionLabel={(option) =>
                        `${option.supplier_id} - ${option.supplier_name} | comprador: ${option.buyer_name}`
                      }
                      fullWidth
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          id="supplier_name"
                          {...register('supplier_name')}
                          error={!!errors.supplier_name}
                          label="Fornecedor"
                          required
                          autoFocus
                        />
                      )}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          {...register('add_out_of_line')}
                          name="add_out_of_line"
                        />
                      }
                      label="Incluir Produtos fora de linha"
                    />

                    <Typography variant="inherit" color="secondary">
                      {errors.supplier_id?.message}
                    </Typography>
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
                        'Pesquisar'
                      )}
                    </Button>
                  </form>
                  <Divider />
                </Paper>
                <Paper className={classes.paper}>
                  <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={5}
                      checkboxSelection
                      disableSelectionOnClick
                      onSelectionModelChange={handleSelectedRows}
                      onCellEditCommit={handleUpdateRowValue}
                    />
                  </div>
                  <Grid className={classes.gridFooter}>
                    <Typography className={classes.totalOrder}>
                      {getTotalOrder()}
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      type="button"
                      onClick={handleCreateOrder}
                      disabled={isLoading || selectedRows.length === 0}
                      className={classes.submitButtonHover}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Gravar Sugestão'
                      )}
                    </Button>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        )}
      </main>
    </div>
  );
};
