
import { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useToast, mapVariantToAlertColor } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();
  const muiTheme = useTheme();
  
  return (
    <>
      {toasts.map(({ id, title, description, variant, open, action, duration = 5000 }) => (
        <Snackbar
          key={id}
          open={open}
          autoHideDuration={duration}
          onClose={() => dispatch({ type: "DISMISS_TOAST", toastId: id || '' })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& + &': {
              marginTop: '10px',
            },
          }}
        >
          <Alert
            severity={mapVariantToAlertColor(variant)}
            onClose={() => dispatch({ type: "DISMISS_TOAST", toastId: id || '' })}
            sx={{ width: '100%' }}
            action={action}
          >
            {title && <div style={{ fontWeight: 'bold' }}>{title}</div>}
            {description && <div>{description}</div>}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}

// Global action dispatcher referenced from use-toast.ts
const dispatch = (action: any) => {
  window.dispatchEvent(new CustomEvent('toast-dispatch', { detail: action }));
};

// Listen for dispatch events from use-toast.ts
useEffect(() => {
  const handler = (e: any) => {
    dispatch(e.detail);
  };
  window.addEventListener('toast-dispatch', handler);
  return () => {
    window.removeEventListener('toast-dispatch', handler);
  };
}, []);
