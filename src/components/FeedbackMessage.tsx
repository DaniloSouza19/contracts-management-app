import React from 'react';
import { Snackbar, Stack, AlertColor } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface FeedBackMessageProps {
  message: string;
  severity: AlertColor;
  isOpen: boolean;
  autoHideDuration?: number | null;
  handleClose(event?: React.SyntheticEvent | Event, reason?: string): void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const FeedbackMessage: React.FC<FeedBackMessageProps> = ({
  message,
  severity,
  isOpen,
  autoHideDuration,
  handleClose,
}) => {
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar
        open={isOpen}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
      >
        <Alert severity={severity} sx={{ width: '100%' }} onClose={handleClose}>
          {message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
