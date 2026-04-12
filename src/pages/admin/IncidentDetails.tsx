import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Badge,
  Chip,
  Tooltip,
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Autocomplete,
  type BadgeProps,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowBack,
  CheckBox,
  CheckBoxOutlineBlank,
  Delete,
  Edit,
  Send,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import type {
  Component,
  Incident,
  IncidentComponentLink,
  IncidentStatus,
  IncidentUpdate,
  SeverityLevel,
} from "../../lib/types";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import DeleteDialog from "../../components/DeleteDialog";
import { formatDate } from "../../lib/formatDate";
import { useAlert } from "../../hooks/useAlert";
import { componentService } from "../../services/componentService";
import { incidentService } from "../../services/incidentService";

type EditableIncident = Omit<Incident, "incident_components"> & {
  incident_components: Component[];
};

type IncidentWithRelations = Omit<Incident, "incident_components"> & {
  incident_components?: IncidentComponentLink[];
};

export default function IncidentDetail() {
  const { id } = useParams();
  const { showAlert } = useAlert();
  const [incident, setIncident] = useState<IncidentWithRelations | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newUpdate, setNewUpdate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [editData, setEditData] = useState<EditableIncident | null>(null);

  const getChangedMessages = (
    previousIncident: IncidentWithRelations,
    nextIncident: EditableIncident,
  ) => {
    const messages: string[] = [];

    if (previousIncident.title !== nextIncident.title) {
      messages.push(
        `Title changed from "${previousIncident.title}" to "${nextIncident.title}"`,
      );
    }

    if (previousIncident.description !== nextIncident.description) {
      messages.push("Description has been updated");
    }

    if (
      (previousIncident.impact_estimate ?? "") !==
      (nextIncident.impact_estimate ?? "")
    ) {
      messages.push("Impact estimate has been updated");
    }

    if (previousIncident.status !== nextIncident.status) {
      messages.push(
        `Status changed from "${previousIncident.status}" to "${nextIncident.status}"`,
      );
    }

    if (previousIncident.severity !== nextIncident.severity) {
      messages.push(
        `Severity changed from "${previousIncident.severity}" to "${nextIncident.severity}"`,
      );
    }

    const previousComponentIds = new Set(
      previousIncident.incident_components?.map(({ component }) => component.id) ??
        [],
    );
    const nextComponentIds = new Set(
      nextIncident.incident_components.map((component) => component.id),
    );

    const componentsChanged =
      previousComponentIds.size !== nextComponentIds.size ||
      [...previousComponentIds].some((componentId) => !nextComponentIds.has(componentId));

    if (componentsChanged) {
      messages.push("Affected components have been updated");
    }

    return messages;
  };

  const getStatusColor = (status: string): BadgeProps["color"] => {
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [incidentData, updatesData, componentsData] = await Promise.all([
          id ? incidentService.getByIdWithComponents(id) : Promise.resolve(null),
          id ? incidentService.getUpdates(id) : Promise.resolve([]),
          componentService.getAll(),
        ]);

        if (incidentData) {
          setIncident(incidentData as IncidentWithRelations);
        }
        setUpdates(updatesData);
        const sortedComponents = [...componentsData].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setComponents(sortedComponents);
      } catch (error) {
        console.error("Incident Error:", error);
      }

      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    if (!id) return;

    try {
      const data = await incidentService.addUpdate(id, newUpdate);
      setUpdates([data, ...updates]);
      setNewUpdate("");
      showAlert("Update posted!", "success");
    } catch (error) {
      console.error("Error while posting update:", error);
      showAlert("Failed to post update", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await incidentService.delete(deleteTarget);
      navigate("/admin/incidents");
    } catch (error) {
      console.error("Error while unlinking component:", error);
      showAlert("Error unlinking component", "error");
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    try {
      await incidentService.deleteUpdate(updateId);
      setUpdates((prev) => prev.filter((u) => u.id !== updateId));
      showAlert("Update deleted!", "info");
    } catch (error) {
      console.error("Error while deleting update:", error);
      showAlert("Failed to delete update", "error");
    }
  };

  const startEditing = () => {
    if (!incident) return;

    setIsEditing(true);
    setEditData({
      ...incident,
      incident_components:
        incident.incident_components?.map(({ component }) => component) || [],
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleUpdate = async (updatedFields: EditableIncident) => {
    if (!incident) return;

    if (!updatedFields.title || !updatedFields.description) {
      showAlert("Please fill in required information", "warning");
      return;
    }

    setSubmitting(true);

    const changedMessages = getChangedMessages(incident, updatedFields);

    const { id, incident_components, ...payload } = updatedFields;

    let updatedIncident: Incident;
    try {
      updatedIncident = await incidentService.update(id, payload as Incident);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update incident";
      showAlert(message, "error");
      setSubmitting(false);
      return;
    }

    try {
      await incidentService.removeComponents(id);
      if (incident_components.length > 0) {
        await incidentService.addComponents(
          id,
          incident_components.map((component) => component.id),
        );
      }
    } catch (error) {
      console.error("Error while syncing components:", error);
      showAlert("Incident saved, but components failed to sync", "warning");
    }

    if (changedMessages.length > 0) {
      try {
        const insertedUpdates = await incidentService.addUpdates(
          id,
          changedMessages,
        );
        setUpdates((prev) => [...insertedUpdates, ...prev]);
      } catch (error) {
        console.error("Error while adding change log updates:", error);
        showAlert(
          "Incident updated, but change log could not be recorded",
          "warning",
        );
      }
    }

    showAlert("Incident updated successfully!", "success");
    setIsEditing(false);
    setSubmitting(false);

    setIncident((prev) =>
      prev
        ? {
            ...prev,
            ...updatedIncident,
            incident_components: incident_components.map((component) => ({
              component,
            })),
          }
        : null,
    );
  };

  return (
    <Box sx={{ flexGrow: 1, px: 4, mb: 5 }}>
      {loading ? (
        <LoadingState message="Loading Incident..." />
      ) : (
        <Box>
          <Box
            sx={{
              pt: 6,
            }}
          >
            <Container>
              <Button
                onClick={() => navigate("/admin/incidents")}
                startIcon={<ArrowBack />}
                sx={{ mb: 3, textTransform: "none", color: "text.secondary" }}
              >
                Back to Incident Page
              </Button>
            </Container>
          </Box>

          <Container maxWidth="md">
            {incident ? (
              <Stack spacing={4}>
                <Card variant="outlined">
                  <CardHeader
                    title={
                      <Box
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 0.5,
                        }}
                      >
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
                            variant="h5"
                            color="text.primary"
                            sx={{ fontWeight: 600 }}
                          >
                            {incident.title}
                          </Typography>
                        </Badge>
                        <Stack direction="row" gap={0.5}>
                          {isEditing ? (
                            <>
                              <Button
                                variant="contained"
                                sx={{ bgcolor: "#0a1628" }}
                                onClick={() => editData && handleUpdate(editData)}
                              >
                                {submitting ? "Saving..." : "Save changes"}
                              </Button>
                              <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => cancelEditing()}
                                disabled={submitting}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <IconButton
                                sx={{ color: "#0a1628" }}
                                onClick={() => startEditing()}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => setDeleteTarget(incident.id)}
                              >
                                <Delete />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ pl: 5 }}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {!isEditing && (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
                            {incident?.incident_components?.map(
                              ({ component }) => (
                                <Tooltip
                                  title={component.status}
                                  placement="top"
                                  key={component.id}
                                >
                                  <Chip
                                    label={component.name}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              ),
                            )}
                          </Box>
                        )}

                        {isEditing && (
                          <Autocomplete
                            multiple
                            options={components}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option.name}
                            value={editData?.incident_components ?? []}
                            onChange={(_, newValue) => {
                              setEditData((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      incident_components: newValue,
                                    }
                                  : prev,
                              );
                            }}
                            renderOption={(props, option, { selected }) => {
                              const { key, ...optionProps } = props;
                              const SelectionIcon = selected
                                ? CheckBox
                                : CheckBoxOutlineBlank;
                              return (
                                <li key={key} {...optionProps}>
                                  <SelectionIcon
                                    fontSize="small"
                                    style={{ marginRight: 8 }}
                                  />
                                  {option.name}
                                </li>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Components"
                                placeholder="Add components"
                              />
                            )}
                            renderTags={(tagValue, getTagProps) =>
                              tagValue.map((option, index) => (
                                <Chip
                                  label={option.name}
                                  {...getTagProps({ index })}
                                  size="small"
                                  variant="outlined"
                                />
                              ))
                            }
                          />
                        )}
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          Description
                        </Typography>
                        {isEditing ? (
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              size="small"
                              value={editData?.description ?? ""}
                              onChange={(e) =>
                                setEditData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        description: e.target.value,
                                      }
                                    : prev,
                                )
                              }
                              sx={{ mt: 1 }}
                            />
                        ) : (
                          <Typography>{incident.description}</Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>Impact</Typography>
                        {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editData?.impact_estimate ?? ""}
                              onChange={(e) =>
                                setEditData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        impact_estimate: e.target.value,
                                      }
                                    : prev,
                                )
                              }
                              sx={{ mt: 1 }}
                            />
                        ) : (
                          <Typography>
                            {incident.impact_estimate || "No impact specified"}
                          </Typography>
                        )}
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography sx={{ fontWeight: 600 }}>
                            Severity
                          </Typography>
                          {isEditing ? (
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={editData?.severity ?? "medium"}
                              onChange={(e) =>
                                setEditData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        severity: e.target
                                          .value as SeverityLevel,
                                      }
                                    : prev,
                                )
                              }
                              sx={{ mt: 1 }}
                            >
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                              <MenuItem value="critical">Critical</MenuItem>
                            </TextField>
                          ) : (
                            <Typography>{incident.severity}</Typography>
                          )}
                        </Grid>

                        {isEditing && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ fontWeight: 600 }}>
                              Status
                            </Typography>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={editData?.status ?? "identified"}
                              onChange={(e) =>
                                setEditData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        status: e.target.value as IncidentStatus,
                                      }
                                    : prev,
                                )
                              }
                              sx={{ mt: 1 }}
                            >
                              <MenuItem value="identified">Identified</MenuItem>
                              <MenuItem value="processing">Processing</MenuItem>
                              <MenuItem value="resolved">Resolved</MenuItem>
                            </TextField>
                          </Grid>
                        )}
                      </Grid>

                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Typography sx={{ fontWeight: 600 }}>
                            Created on
                          </Typography>
                          <Typography>
                            {formatDate(incident.created_at)}
                          </Typography>
                        </Grid>
                        {incident.resolved_at && (
                          <Grid size={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Resolved
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {formatDate(incident.resolved_at)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
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
                        startIcon={<Send />}
                      >
                        Post
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
                <Card variant="outlined">
                  <CardHeader
                    title={
                      <Typography variant="h6">Incident Timeline</Typography>
                    }
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
                                    onClick={() =>
                                      handleDeleteUpdate(update.id)
                                    }
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
              </Stack>
            ) : (
              <Typography textAlign="center" py={10}>
                Could not load incident details.
              </Typography>
            )}
          </Container>
        </Box>
      )}
      <DeleteDialog
        open={Boolean(deleteTarget)}
        handleClose={() => setDeleteTarget(null)}
        title="Delete Incident?"
        message={`Do you want to delete ${incident?.title} ?  This action cannot be undone.`}
        handleDelete={handleDelete}
      />
    </Box>
  );
}
