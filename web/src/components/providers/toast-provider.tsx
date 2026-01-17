import { Slide, ToastContainer } from "react-toastify";

export const ToastProvider = () => (
  <ToastContainer
    transition={Slide}
    position="top-center"
    hideProgressBar={true}
    newestOnTop={true}
    closeButton={false}
    pauseOnFocusLoss={false}
    className="w-screen"
  />
);
