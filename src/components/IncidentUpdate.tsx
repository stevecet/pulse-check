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
import { useState } from "react";
import type { IncidentUpdate } from "../lib/types";
import { useAlert } from "../hooks/useAlert";
import { supabase } from "../services/supabase";

type IncidentUpdatesProps = {
  incidentId: string;
};

export default function IncidentUpdates({
  incidentId,
}: Readonly<IncidentUpdatesProps>) {
  const { showAlert } = useAlert();
  const [newUpdate, setNewUpdate] = useState("");
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    const { data, error } = await supabase
      .from("incident_updates")
      .insert([{ incident_id: incidentId, message: newUpdate }])
      .select()
      .single();

    if (!error) {
      setUpdates([data, ...updates]);
      setNewUpdate("");
      showAlert("Update posted!", "success");
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    const { error } = await supabase
      .from("incident_updates")
      .delete()
      .eq("id", updateId);
    if (!error) {
      setUpdates((prev) => prev.filter((u) => u.id !== updateId));
      showAlert("Update deleted!", "info");
    }
  };
  return (
    <Box>
      <Box sx={{ mt: 4 }}>
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
              sx={{ bgcolor: "#0a1628" }}
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
                      <TimelineDot sx={{ bgcolor: "#0a1628" }} />
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
