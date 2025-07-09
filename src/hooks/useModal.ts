import { useState, useCallback, useRef } from "react";

interface UseModalOptions<T = undefined> {
  initialOpen?: boolean;
  initialForm?: T;
}

interface UseModalOptionsWithForm<T> {
  initialOpen?: boolean;
  initialForm: T;
}

interface UseModalReturn<T = undefined> {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
  form: T;
  setForm: (form: T) => void;
  resetForm: () => void;
}

function useModal(): UseModalReturn<undefined>;
function useModal<T>(options: UseModalOptionsWithForm<T>): UseModalReturn<T>;
function useModal<T = undefined>(
  options: UseModalOptions<T> = {}
): UseModalReturn<T> {
  const initialFormRef = useRef<T>(options.initialForm as T);
  const [isOpen, setIsOpen] = useState<boolean>(!!options.initialOpen);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<T>(initialFormRef.current);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((v) => !v), []);
  const resetForm = useCallback(() => {
    setForm(initialFormRef.current);
    setError(null);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    loading,
    setLoading,
    error,
    setError,
    form,
    setForm,
    resetForm,
  };
}

export { useModal };
