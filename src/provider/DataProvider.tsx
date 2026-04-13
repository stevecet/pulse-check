import React, { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { DataContext } from "../context/DataContext";
import type { Component, Incident } from "../lib/types";
import { incidentService } from "../services/incidentService";
import { componentService } from "../services/componentService";

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  const refreshIncidents = useCallback(async () => {
    try {
      const data = await incidentService.getAll();
      const sorted = [...data].sort((a, b) => {
          // Sort by date descending if created_at exists, else title
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setIncidents(sorted);
    } catch (error) {
      console.error("Error refreshing incidents:", error);
    }
  }, []);

  const refreshComponents = useCallback(async () => {
    try {
      const data = await componentService.getAll();
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setComponents(sorted);
    } catch (error) {
      console.error("Error refreshing components:", error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshIncidents(), refreshComponents()]);
    setLoading(false);
  }, [refreshIncidents, refreshComponents]);

  useEffect(() => {
    if (!initialized) {
      refreshAll();
      setInitialized(true);
    }
  }, [initialized, refreshAll]);

  const value = useMemo(() => ({
    incidents,
    components,
    loading,
    refreshIncidents,
    refreshComponents,
    refreshAll,
  }), [incidents, components, loading, refreshIncidents, refreshComponents, refreshAll]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
