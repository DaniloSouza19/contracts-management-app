import { StyledEngineProvider } from '@mui/material/styles';
import { AppProvider } from './hooks';
import { Router } from './Router';

export function App() {
  return (
    <div className="App">
      <StyledEngineProvider injectFirst>
        <AppProvider>
          <Router />
        </AppProvider>
      </StyledEngineProvider>
    </div>
  );
}
