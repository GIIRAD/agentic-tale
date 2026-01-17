"use client";

import { ReactNode, createContext, useState } from "react";

type ModalContext = {
  open: boolean;
  openModal: (nextModal: ReactNode) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<ModalContext>({
  open: false,
  openModal: () => {},
  closeModal: () => {},
});

type Props = {
  children: ReactNode;
};

export function ModalContextProvider({ children }: Props) {
  const [modal, setModal] = useState<ReactNode>(null);
  const [open, setOpen] = useState<boolean>(false);

  const openModal = (nextModal: ReactNode) => {
    setModal(nextModal);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setModal(null);
  };

  return (
    <ModalContext.Provider value={{ open, openModal, closeModal }}>
      {children}
      {modal}
    </ModalContext.Provider>
  );
}
