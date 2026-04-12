import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { SubTabs } from "../../components/SubTabs";
import { Cached } from "@mui/icons-material";
import StatusOverview from "../../components/CurrentStatus/StatusOverview";
import ActiveIncidents from "../../components/CurrentStatus/ActiveIncidents";
import { useNavigate } from "react-router-dom";
import { componentService } from "../../services/componentService";
import { incidentService } from "../../services/incidentService";
import type { Component, Incident } from "../../lib/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState("1");
  const [currentSubTab, setCurrentSubTab] = useState("1");
  const [historySubTab, setHistorySubTab] = useState("1");
  const [refreshKey, setRefreshKey] = useState(0);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleMainChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    setMainTab(newValue);
  };

  const handleCurrentSubChange = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    event.preventDefault();
    setCurrentSubTab(newValue);
  };

  const handleHistorySubChange = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    event.preventDefault();
    setHistorySubTab(newValue);
  };

  const fetchSummary = async () => {
    setRefreshing(true);
    try {
      const [incidentData, componentData] = await Promise.all([
        incidentService.getAll(),
        componentService.getAll(),
      ]);
      setIncidents(incidentData);
      setComponents(componentData);
    } catch (error) {
      console.error("Dashboard refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const showAllOperational = useMemo(() => {
    const activeIncidents = incidents.filter(
      (incident) => incident.status !== "resolved",
    );
    const allOperational = components.every(
      (component) => component.status === "operational",
    );
    return activeIncidents.length === 0 && allOperational;
  }, [incidents, components]);

  const maintenanceComponents = useMemo(
    () => components.filter((component) => component.status === "maintenance"),
    [components],
  );

  const resolvedIncidents = useMemo(
    () => incidents.filter((incident) => incident.status === "resolved"),
    [incidents],
  );

  const operationalComponentsCount = useMemo(
    () => components.filter((component) => component.status === "operational")
      .length,
    [components],
  );

  const historyMetrics = useMemo(
    () => [
      { label: "Total Incidents", value: incidents.length },
      { label: "Resolved Incidents", value: resolvedIncidents.length },
      { label: "Total Components", value: components.length },
      { label: "Operational Components", value: operationalComponentsCount },
    ],
    [
      incidents.length,
      resolvedIncidents.length,
      components.length,
      operationalComponentsCount,
    ],
  );
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SubTabs
              value={mainTab}
              onChange={handleMainChange}
              panels={[
                { value: "1", label: "Current Status" },
                { value: "2", label: "History" },
              ]}
            />
            <Box gap={2} sx={{ display: "flex" }}>
              <IconButton
                aria-label="refresh"
                onClick={() => {
                  setRefreshKey((prev) => prev + 1);
                  fetchSummary();
                }}
                disabled={refreshing}
              >
                <Cached />
              </IconButton>
              <Button
                variant="contained"
                size="small"
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            </Box>
          </Box>

          {mainTab === "1" && (
            <Box sx={{ mt: 2 }}>
              {showAllOperational && (
                <Box
                  sx={{
                    bgcolor: "#00AA66",
                    color: "white",
                    p: 2,
                    borderRadius: 1,
                    my: 2,
                    textAlign: "center",
                    fontWeight: "medium",
                  }}
                >
                  All systems operational
                </Box>
              )}
              {!showAllOperational && (
                <Box
                  sx={{
                    bgcolor: "#F59E0B",
                    color: "white",
                    p: 2,
                    borderRadius: 1,
                    my: 2,
                    textAlign: "center",
                    fontWeight: "medium",
                  }}
                >
                  Some systems are currently experiencing issues.
                </Box>
              )}
              <SubTabs
                value={currentSubTab}
                onChange={handleCurrentSubChange}
                panels={[
                  {
                    value: "1",
                    label: "Status Overview",
                    content: <StatusOverview key={`status-${refreshKey}`} />,
                  },
                  {
                    value: "2",
                    label: "Active Incidents",
                    content: <ActiveIncidents key={`incidents-${refreshKey}`} />,
                  },
                  {
                    value: "3",
                    label: "Active Maintenance",
                    content: (
                      <Box sx={{ mt: 2 }}>
                        {maintenanceComponents.length === 0 ? (
                          <Card variant="outlined" sx={{ py: 6, textAlign: "center" }}>
                            <Typography color="text.secondary">
                              No active maintenance right now.
                            </Typography>
                          </Card>
                        ) : (
                          <Stack spacing={2}>
                            {maintenanceComponents.map((component) => (
                              <Card key={component.id} variant="outlined">
                                <CardContent
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 2,
                                  }}
                                >
                                  <Box>
                                    <Typography fontWeight={600}>
                                      {component.name}
                                    </Typography>
                                    {component.description && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                      >
                                        {component.description}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Chip
                                    label="Maintenance"
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                  />
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    ),
                  },
                  {
                    value: "4",
                    label: "Scheduled Maintenance",
                    // TODO: Replace placeholder when scheduled maintenance data is available.
                    content: (
                      <Card variant="outlined" sx={{ py: 6, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          No scheduled maintenance available.
                        </Typography>
                      </Card>
                    ),
                  },
                ]}
              />
            </Box>
          )}

          {mainTab === "2" && (
            <Box sx={{ mt: 2 }}>
              <SubTabs
                value={historySubTab}
                onChange={handleHistorySubChange}
                panels={[
                  {
                    value: "1",
                    label: "History Overview",
                    content: (
                      <Box sx={{ mt: 2 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: 2,
                          }}
                        >
                          {historyMetrics.map((metric) => (
                            <Card key={metric.label} variant="outlined">
                              <CardContent>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  {metric.label}
                                </Typography>
                                <Typography variant="h6">{metric.value}</Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="body2" color="text.secondary">
                          This overview summarizes incident and component history
                          based on the latest status data.
                        </Typography>
                      </Box>
                    ),
                  },
                  {
                    value: "2",
                    label: "Past Incidents",
                    content: (
                      <Box sx={{ mt: 2 }}>
                        {resolvedIncidents.length === 0 ? (
                          <Card variant="outlined" sx={{ py: 6, textAlign: "center" }}>
                            <Typography color="text.secondary">
                              No resolved incidents yet.
                            </Typography>
                          </Card>
                        ) : (
                          <Stack spacing={2}>
                            {resolvedIncidents.map((incident) => (
                              <Card key={incident.id} variant="outlined">
                                <CardContent
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 2,
                                  }}
                                >
                                  <Box>
                                    <Typography fontWeight={600}>
                                      {incident.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mt: 0.5 }}
                                    >
                                      {incident.description}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label="Resolved"
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                  />
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    ),
                  },
                  {
                    value: "3",
                    label: "Past Maintenance",
                    // TODO: Replace placeholder when maintenance history is modeled.
                    content: (
                      <Card variant="outlined" sx={{ py: 6, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Past maintenance records will appear here.
                        </Typography>
                      </Card>
                    ),
                  },
                  {
                    value: "4",
                    label: "Component History",
                    // TODO: Replace placeholder when component history data is available.
                    content: (
                      <Card variant="outlined" sx={{ py: 6, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Component history tracking is coming soon.
                        </Typography>
                      </Card>
                    ),
                  },
                ]}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
