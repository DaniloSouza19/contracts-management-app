import React from 'react';
import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import PersonIcon from '@material-ui/icons/Person';
import BarChartIcon from '@material-ui/icons/BarChart';

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
        to="/orders-suggested"
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItem button>
          <ListItemIcon>
            <AddShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Nova Sugestão" />
        </ListItem>
      </Link>
      <Link
        to="/my-orders"
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItem button>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Minhas Sugestões" />
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
