import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { PropertiesReport } from './PropertiesReport';
import { PaymentsReport } from './PaymentsReport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function TabsReports() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (
    event: React.ChangeEvent<Record<string, unknown>>,
    newValue: number
  ) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="report tabs">
          <Tab label="Relatório de imóveis" {...a11yProps(0)} />
          <Tab label="Lançamentos não pagos" {...a11yProps(1)} />
          <Tab label="Lançamentos pagos" {...a11yProps(2)} />
          <Tab label="Contratos à vencer" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <PropertiesReport />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PaymentsReport title="Relatório de lançamentos não pagos" />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <PaymentsReport title="Relatório de lançamentos pagos" onlyPay />
      </TabPanel>
      <TabPanel value={value} index={3}>
        Relatorio Contratos à vencer
      </TabPanel>
    </div>
  );
}
