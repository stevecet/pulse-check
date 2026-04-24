import { useState } from "react";
import { Box, Typography, Divider, TextField, Grid } from "@mui/material";
import {
  CheckCircle,
  Error as ErrorIcon,
  Handyman,
  TravelExplore,
  Warning,
} from "@mui/icons-material";
import { StatusCard } from "../StatusCard";
import { EventCard } from "../EventCard";
import { LoadingState } from "../LoadingState";
import { useComponents } from "../../hooks/useComponents";

export default function StatusOverview() {
  const [search, setSearch] = useState("");
  const { data: components = [], isLoading } = useComponents();

  const filteredComponents = components.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const events = components.filter(
    (c) => c.status.toLowerCase() !== "operational",
  );

  if (isLoading) {
    return <LoadingState message="Loading events" />;
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        All Events
      </Typography>
      {events.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Box
            component="span"
            sx={{ fontSize: 40, mb: 1, display: "inline-block" }}
            aria-label="rocket"
          >
            <TravelExplore />
          </Box>
          <Typography>
            There are no <strong>Active Events</strong>
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h6">Components current status</Typography>

        <TextField
          size="small"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          my: 3,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            status: "Operational",
            icon: <CheckCircle color="success" fontSize="small" />,
          },
          {
            status: "Maintenance",
            icon: <Handyman sx={{ color: "#1976d2"}} fontSize="small" />,
          },
          {
            status: "Incident",
            icon: <Warning color="warning" fontSize="small" />,
          },
          { status: "Outage", icon: <ErrorIcon color="error" fontSize="small" /> },
        ].map((item) => (
          <Box
            key={item.status}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {item.icon}
            <Typography variant="body2">{item.status}</Typography>
          </Box>
        ))}
      </Box>
      <Grid container spacing={2}>
        {filteredComponents.map((item) => (
          <Grid size={6} key={item.id}>
            <StatusCard item={item} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
