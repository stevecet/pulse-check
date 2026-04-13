import { Close, Search } from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useData } from "../../hooks/useData";
import { type Incident } from "../../lib/types";
import { formatDate } from "../../lib/formatDate";
import { LoadingState } from "../LoadingState";
export default function ActiveIncidents() {
  const { incidents, loading } = useData();
  const [selectedButton, setSelectedButton] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeIncidents = useMemo(() => {
    return incidents.filter((c: Incident) => c.status.toLowerCase() !== "resolved");
  }, [incidents]);


  const filteredIncidents = useMemo(() => {
    return activeIncidents.filter((incident: Incident) => {
      const matchesFilter =
        selectedButton === "all" ||
        incident.status.toLowerCase() === selectedButton.toLowerCase();

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        incident.title.toLowerCase().includes(searchLower) ||
        incident.description.toLowerCase().includes(searchLower) ||
        incident.status.toLowerCase().includes(searchLower) ||
        incident.severity.toLowerCase().includes(searchLower);

      return matchesFilter && matchesSearch;
    });
  }, [incidents, selectedButton, searchQuery]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "warning";
      case "identified":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Stack spacing={2} direction="row" marginBottom={5}>
          {["all", "processing", "identified"].map((filter) => {
            const isSelected = selectedButton === filter;
            return (
              <Button
                key={filter}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => setSelectedButton(filter)}
                sx={{
                  textTransform: "capitalize",
                }}
              >
                {filter}
              </Button>
            );
          })}
        </Stack>
        <TextField
          value={searchQuery}
          variant="outlined"
          size="small"
          placeholder="Search incident..."
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery.length > 0 && (
                <InputAdornment position="start">
                  <IconButton
                    sx={{ "&:hover": { background: "none" } }}
                    onClick={() => {
                      setSearchQuery("");
                    }}
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {loading ? (
        <LoadingState message="Loading Incidents..." />
      ) : (
        <Stack spacing={2} marginBottom={3}>
          {filteredIncidents.length === 0 ? (
            <Card variant="outlined" sx={{ py: 8, textAlign: "center" }}>
              <Typography color="text.secondary">No incidents found</Typography>
            </Card>
          ) : (
            filteredIncidents.map((incident) => (
              <Card
                key={incident.id}
                variant="outlined"
                sx={{
                  transition: "0.2s",
                  "&:hover": { borderColor: "#333" },
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Badge
                        badgeContent={incident.status}
                        color={getStatusColor(incident.status)}
                        sx={{
                          "& .MuiBadge-badge": {
                            right: -35,
                            bottom: 1,
                            px: 1,
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.primary"
                          sx={{ mt: 0.5, fontWeight: 600 }}
                        >
                          {incident.title}
                        </Typography>
                      </Badge>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {incident.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1 }}
                      >
                        Created: {formatDate(incident.created_at)}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={1}>
                      <Chip
                        variant="outlined"
                        label={incident.severity}
                        color={getSeverityColor(incident.severity)}
                        size="small"
                      />
                      {incident.impact_estimate && (
                        <Typography variant="caption" color="text.secondary">
                          Impact: {incident.impact_estimate}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}
    </Box>
  );
}
