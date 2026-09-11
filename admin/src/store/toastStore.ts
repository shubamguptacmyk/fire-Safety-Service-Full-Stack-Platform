import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { ...toast, id, duration: toast.duration ?? 4000 };
    set((state) => ({ toasts: [...state.toasts, item] }));

    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, item.duration);
    }
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),

  success: (message, title = "Success") => {
    useToast.getState().addToast({ type: "success", title, message });
  },
  error: (message, title = "Error") => {
    useToast.getState().addToast({ type: "error", title, message, duration: 6000 });
  },
  info: (message, title = "Notice") => {
    useToast.getState().addToast({ type: "info", title, message });
  },
  warning: (message, title = "Warning") => {
    useToast.getState().addToast({ type: "warning", title, message, duration: 5000 });
  },
}));
