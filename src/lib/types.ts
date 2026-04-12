export type IncidentStatus = "identified" | "processing" | "resolved";

export type ComponentStatus =
  | "operational"
  | "maintenance"
  | "incident"
  | "outage";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export interface Component {
  id: string;
  name: string;
  description?: string;
  status: ComponentStatus;
  created_at: string;
  updated_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  message: string;
  created_by: string;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: SeverityLevel;
  impact_estimate?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  created_by: string;
  incident_components?: IncidentComponentLink[];
}

export interface IncidentComponentLink {
  component: Component; 
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "contributor";
  created_at: string;
}

export interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export interface AlertContextType {
  alert: AlertState;
  showAlert: (message: string, severity?: AlertState["severity"]) => void;
  hideAlert: () => void;
}