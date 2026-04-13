import { createContext } from "react";
import type { Component, Incident } from "../lib/types";

export interface DataContextType {
  incidents: Incident[];
  components: Component[];
  loading: boolean;
  refreshIncidents: () => Promise<void>;
  refreshComponents: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);
