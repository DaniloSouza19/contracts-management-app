import { StyledEngineProvider } from '@mui/material/styles';
import { SignIn } from './pages/SignIn';

export function App() {
  return (
    <div className="App">
      <StyledEngineProvider injectFirst>
        <SignIn />
      </StyledEngineProvider>
    </div>
  );
}
