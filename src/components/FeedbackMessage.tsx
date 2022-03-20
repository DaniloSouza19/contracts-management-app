import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

interface FeedBackMessageProps {
  message: string;
  severity: 'success' | 'info' | 'error';
  isOpen: boolean;
  autoHideDuration?: number | null;
  handleClose(event?: React.SyntheticEvent | Event, reason?: string): void;
}

export const FeedbackMessage: React.FC<FeedBackMessageProps> = ({
  message,
  severity,
  isOpen,
  autoHideDuration,
  handleClose,
}) => {
  return (
    // <Stack spacing={2} sx={{ width: '100%' }}>
    <Snackbar
      open={isOpen}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
    >
      <Alert severity={severity} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
    // </Stack>
  );
};
