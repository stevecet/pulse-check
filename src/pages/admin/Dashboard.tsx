import {
  Box,
  Card,
  CardActions,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import { Header } from "../../components/Header";
import { useEffect, useState } from "react";
import { componentService } from "../../services/componentService";
import { incidentService } from "../../services/incidentService";

export default function AdminDashboard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [incidentCount, setIncidentCount] = useState(0);
  const [activeIncidentCount, setActiveIncidentCount] = useState(0);
  const [operationalComponentCount, setOperationalComponentCount] = useState(0);
  const [componentCount, setComponentCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [incidents, components] = await Promise.all([
          incidentService.getAll(),
          componentService.getAll(),
        ]);
        setIncidentCount(incidents.length);
        const activeIncidents = incidents.filter(
          (i) => i.status === "processing",
        );
        setActiveIncidentCount(activeIncidents.length);

        setComponentCount(components.length);
        const operationalComponents = components.filter(
          (i) => i.status === "operational",
        );
        setOperationalComponentCount(operationalComponents.length);
      } catch (error) {
        console.error("Dashboard Error:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const dashboardCount = [
    {
      id: 1,
      name: "Total Incidents",
      count: incidentCount,
    },
    { id: 2, name: "Active Incidents", count: activeIncidentCount },
    { id: 3, name: "Total Components", count: componentCount },
    { id: 4, name: "Operational", count: operationalComponentCount },
  ];
  return (
    <Box sx={{ flexGrow: 1, px: 4 }}>
      <Header
        heading="Admin Dashboard"
        message="Monitor and manage your incidents"
      />

      <Grid container spacing={2}>
        {dashboardCount.map((item) => (
          <Grid size={{ xs: 6, sm: 6, md: 3 }} key={item.id}>
            <Card sx={{ minWidth: { xs: 150, sm: 200, lg: 300 } }}>
              <CardContent>
                <Typography
                  gutterBottom
                  sx={{ color: "text.primary", fontSize: 14 }}
                >
                  {item.name}
                </Typography>
              </CardContent>
              <CardActions>
                <Typography
                  gutterBottom
                  sx={{ color: "text.secondary", fontSize: 20, ml: 2 }}
                >
                  {loading ? (
                    <Skeleton variant="circular" width={40} height={40} />
                  ) : (
                    item.count
                  )}
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card sx={{ minWidth: { xs: 150, sm: 200, lg: 300 }, my: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Welcome to the admin dashboard! Here you can:
          </Typography>
          {[
            "Create and manage incidents",
            "Add updates to ongoing incidents",
            "Manage system components",
            "Track incident history",
          ].map((item) => (
            <List key={item} sx={{ listStyleType: "disc", ml: 4 }}>
              <ListItem sx={{ display: "list-item" }} disablePadding>
                <ListItemText primary={item} />
              </ListItem>
            </List>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
