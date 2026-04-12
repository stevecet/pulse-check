import { createContext } from "react";
import type { AlertContextType } from "../lib/types";

export const AlertContext = createContext<AlertContextType | undefined>(undefined);