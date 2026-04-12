import { useEffect, useState } from "react";
import { Box, Typography, Divider, TextField, Grid } from "@mui/material";
import {
  CheckCircle,
  Error,
  Handyman,
  TravelExplore,
  Warning,
} from "@mui/icons-material";
import { StatusCard } from "../StatusCard";
import { EventCard } from "../EventCard";
import type { Component } from "../../lib/types";
import { LoadingState } from "../LoadingState";
import { componentService } from "../../services/componentService";

export default function StatusOverview() {
  const [search, setSearch] = useState("");
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const filteredComponents = components.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const events = components.filter(
    (c) => c.status.toLowerCase() != "operational",
  );

  useEffect(() => {
    const loadComponents = async () => {
      setLoading(true);
      try {
        const data = await componentService.getAll();
        setComponents(data);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    loadComponents();
  }, []);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        All Events
      </Typography>
      {loading ? (
        <LoadingState message="Loading events" />
      ) : events.length === 0 ? (
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
        <Typography variant="h6">Components: Current Status</Typography>

        <TextField
          size="small"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <Grid container spacing={2}>
        {loading ? (
          <LoadingState message="Loading component" />
        ) : (
          filteredComponents.map((item) => (
            <Grid size={6} key={item.id}>
              <StatusCard item={item} />
            </Grid>
          ))
        )}
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          mt: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2">Operational</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Handyman color="primary" fontSize="small" />
          <Typography variant="body2">Maintenance</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="warning" fontSize="small" />
          <Typography variant="body2">Incident</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Error color="error" fontSize="small" />
          <Typography variant="body2">Outage</Typography>
        </Box>
      </Box>
    </>
  );
}
