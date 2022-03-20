import React from 'react';
import { Link } from 'react-router-dom';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@material-ui/core';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PersonIcon from '@material-ui/icons/Person';
import HouseIcon from '@material-ui/icons/House';
import BarChartIcon from '@material-ui/icons/BarChart';
import ReceiptIcon from '@material-ui/icons/Receipt';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

export const MainListItems: React.FC = () => {
  return (
    <div>
      <Link
        to="/"
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItem button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </Link>
      <Link
        to="/properties"
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItem button>
          <ListItemIcon>
            <HouseIcon />
          </ListItemIcon>
          <ListItemText primary="Imóveis" />
        </ListItem>
      </Link>
      <Link
        to="/contracts"
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItem button>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Contratos" />
        </ListItem>
      </Link>
      <Link
        to="/payments"
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItem button>
          <ListItemIcon>
            <MonetizationOnIcon />
          </ListItemIcon>
          <ListItemText primary="Pagamentos" />
        </ListItem>
      </Link>
      <Link
        to="/reports"
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItem button>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Relatórios" />
        </ListItem>
      </Link>
    </div>
  );
};

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Conta</ListSubheader>
    <Link
      to="/accounts"
      style={{
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <ListItem button>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Minha conta" />
      </ListItem>
    </Link>
  </div>
);
