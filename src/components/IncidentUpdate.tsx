import { Delete, Send } from "@mui/icons-material";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { formatDate } from "../lib/formatDate";
import { LoadingState } from "./LoadingState";
import { useEffect, useState } from "react";
import type { IncidentUpdate } from "../lib/types";
import { useAlert } from "../hooks/useAlert";
import { incidentService } from "../services/incidentService";

type IncidentUpdatesProps = {
  incidentId: string;
};

export default function IncidentUpdates({
  incidentId,
}: Readonly<IncidentUpdatesProps>) {
  const { showAlert } = useAlert();
  const [newUpdate, setNewUpdate] = useState("");
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUpdates = async () => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const data = await incidentService.getUpdates(incidentId);
      setUpdates(data);
    } catch (error) {
      console.error("Error fetching updates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [incidentId]);

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    try {
      const data = await incidentService.addUpdate(incidentId, newUpdate);
      setUpdates([data, ...updates]);
      setNewUpdate("");
      showAlert("Update posted!", "success");
    } catch (error) {
      console.error("Error posting update:", error);
      showAlert("Failed to post update", "error");
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    try {
      await incidentService.deleteUpdate(updateId);
      setUpdates((prev) => prev.filter((u) => u.id !== updateId));
      showAlert("Update deleted!", "info");
    } catch (error) {
      console.error("Error deleting update:", error);
      showAlert("Failed to delete update", "error");
    }
  };

  if (loading) {
    return <LoadingState message="Loading updates..." />;
  }

  return (
    <Box>
      <Box sx={{ my: 2 }}>
        <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a new update message..."
              value={newUpdate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNewUpdate(e.target.value);
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddUpdate}
              disabled={!incidentId}
              startIcon={<Send />}
            >
              Post
            </Button>
          </Stack>
        </Paper>
      </Box>
      <Card variant="outlined">
        <CardHeader
          title={<Typography variant="h6">Incident Timeline</Typography>}
        />
        <Divider />
        <CardContent>
          {updates.length > 0 ? (
            <Stack spacing={0}>
              <Timeline position="right">
                {updates.map((update) => (
                  <TimelineItem key={update.id}>
                    <TimelineOppositeContent
                      color="text.secondary"
                      sx={{ flex: 0.2 }}
                    >
                      {formatDate(update.created_at)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ pb: 4 }}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography>{update.message}</Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUpdate(update.id)}
                        >
                          <Delete fontSize="inherit" />
                        </IconButton>
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Stack>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              py={2}
            >
              No updates yet. Check back soon.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
