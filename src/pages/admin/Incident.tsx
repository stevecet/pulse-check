import { Close, Search } from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Header } from "../../components/Header";
import { LoadingState } from "../../components/LoadingState";
import { formatDate } from "../../lib/formatDate";
import { useIncidents } from "../../hooks/useIncidents";
import type { Incident } from "../../lib/types";

export default function Incident() {
  const navigate = useNavigate();
  const { data: incidents = [], isLoading } = useIncidents();
  const [selectedButton, setSelectedButton] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident: Incident) => {
      const matchesFilter =
        selectedButton === "all" ||
        incident.status.toLowerCase() === selectedButton.toLowerCase();

      const matchesSearch =
        incident.title.toLowerCase().includes(normalizedSearchQuery) ||
        incident.description.toLowerCase().includes(normalizedSearchQuery) ||
        incident.status.toLowerCase().includes(normalizedSearchQuery) ||
        incident.severity.toLowerCase().includes(normalizedSearchQuery);

      return matchesFilter && matchesSearch;
    });
  }, [incidents, selectedButton, normalizedSearchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIncidents.length / pageSize),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * pageSize,
    page * pageSize,
  );

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
      case "resolved":
        return "success";
      case "identified":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ flexGrow: 1, px: 4 }}>
      <Header heading="Incident" message="Manage and track all incidents" />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Stack spacing={2} direction="row" marginBottom={5}>
          {["all", "processing", "identified", "resolved"].map((filter) => {
            const isSelected = selectedButton === filter;
            return (
              <Button
                key={filter}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => setSelectedButton(filter)}
                sx={{
                  textTransform: "capitalize",
                  ...(!isSelected && {
                    color: "black",
                    borderColor: "black",
                    "&:hover": {
                      borderColor: "#333",
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }),
                  ...(isSelected && {
                    backgroundColor: "#0a1628",
                    "&:hover": { backgroundColor: "#152a4a" },
                  }),
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

      {isLoading ? (
        <LoadingState message="Loading Incidents..." />
      ) : (
        <Stack spacing={2} marginBottom={3}>
          {filteredIncidents.length === 0 ? (
            <Card variant="outlined" sx={{ py: 8, textAlign: "center" }}>
              <Typography color="text.secondary">No incidents found</Typography>
            </Card>
          ) : (
            paginatedIncidents.map((incident: Incident) => (
              <Card
                key={incident.id}
                variant="outlined"
                sx={{
                  transition: "0.2s",
                  "&:hover": { borderColor: "#333" },
                }}
              >
                <CardActionArea onClick={() => navigate(`${incident.id}`)}>
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
                </CardActionArea>
              </Card>
            ))
          )}
        </Stack>
      )}
      {!isLoading && filteredIncidents.length > pageSize && (
        <Stack alignItems="end" sx={{ mb: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_event, value) => setPage(value)}
            shape="rounded"
          />
        </Stack>
      )}
    </Box>
  );
}
