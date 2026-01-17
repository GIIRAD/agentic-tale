import { PropsWithChildren } from "react";

import { ThemeProvider } from "flowbite-react";

import { ToastProvider } from "@/components/providers/toast-provider";

import { flowbiteTheme } from "../../util/flowbite-theme";
import { ModalContextProvider } from "./modal-provider";
import { ReactQueryProvider } from "./react-query-provider";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <ThemeProvider theme={flowbiteTheme}>
        <ModalContextProvider>
          {children}
          <ToastProvider />
        </ModalContextProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
};
