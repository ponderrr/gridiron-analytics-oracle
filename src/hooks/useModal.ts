import { useState, useCallback } from "react";

interface UseModalOptions {
  initialOpen?: boolean;
}

interface UseModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

/**
 * Reusable hook for modal open/close and loading state.
 */
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const [isOpen, setIsOpen] = useState<boolean>(!!options.initialOpen);
  const [loading, setLoading] = useState<boolean>(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((v) => !v), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    loading,
    setLoading,
  };
}
