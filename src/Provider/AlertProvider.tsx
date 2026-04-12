import { useMemo, useState, type ReactNode } from "react";
import CustomAlert from "../components/CustomAlert";
import type { AlertState } from "../lib/types";
import { AlertContext } from "../context/AlertContext";


export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showAlert = (
    message: string,
    severity: AlertState["severity"] = "info",
  ) => {
    setAlert({ open: true, message, severity });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };
  const value = useMemo(() => ({ alert, showAlert, hideAlert }), [alert]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <CustomAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

