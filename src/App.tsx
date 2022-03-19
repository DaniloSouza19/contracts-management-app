import { StyledEngineProvider } from '@mui/material/styles';
import { Router } from './Router';

export function App() {
  return (
    <div className="App">
      <StyledEngineProvider injectFirst>
        <Router />
      </StyledEngineProvider>
    </div>
  );
}
