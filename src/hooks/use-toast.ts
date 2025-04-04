
import { useState, useEffect, useCallback } from 'react';
import { AlertColor } from '@mui/material';

export type ToastProps = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: AlertColor | "default" | "destructive";
  open?: boolean;
  duration?: number;
};

// Helper to convert custom variants to MUI AlertColor
export function mapVariantToAlertColor(variant?: ToastProps["variant"]): AlertColor {
  switch (variant) {
    case "destructive":
      return "error";
    case "default":
      return "info";
    default:
      return (variant as AlertColor) || "info";
  }
}

type ToastState = {
  toasts: ToastProps[];
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return `${count}`;
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

type ActionType =
  | {
      type: "ADD_TOAST";
      toast: ToastProps;
    }
  | {
      type: "UPDATE_TOAST";
      toast: ToastProps;
    }
  | {
      type: "DISMISS_TOAST";
      toastId: string;
    }
  | {
      type: "REMOVE_TOAST";
      toastId: string;
    };

let listeners: ((state: ToastState) => void)[] = [];

let memoryState: ToastState = { toasts: [] };

function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function reducer(state: ToastState, action: ActionType): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Add toast to remove queue
      addToRemoveQueue(toastId);

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === 'all') {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

export function toast(props: ToastProps) {
  const id = genId();

  const update = (props: ToastProps) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  const dismiss = () =>
    dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      // No onDismiss property in ToastProps
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((listener) => listener !== setState);
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId: toastId || 'all' }),
  };
}
