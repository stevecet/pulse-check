import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  Stack,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import { Add, Close, Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import type { Component, ComponentStatus } from "../../lib/types";
import { LoadingState } from "../../components/LoadingState";
import { supabase } from "../../../supabaseClient";
import DeleteDialog from "../../components/DeleteDialog";
import { useAlert } from "../../hooks/useAlert";

export default function Components() {
  const { showAlert } = useAlert();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "operational" as ComponentStatus,
  });

  useEffect(() => {
    const fetchComponents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("components")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching:", error.message);
      } else {
        setComponents(data);
      }
      setLoading(false);
    };

    fetchComponents();
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await supabase
      .from("components")
      .insert([formData])
      .select()
      .single();

    if (error) {
      showAlert("Failed to create component", "error");
    } else {
      showAlert("Component created successfully!", "success");
      setComponents((prev) => [...prev, data]);

      setFormData({ name: "", description: "", status: "operational" });
      setShowForm(false);
    }

    setSubmitting(false);
  };

  const startEditing = (component: Component) => {
    setEditingId(component.id);
    setEditData({ ...component });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleUpdate = async (updatedFields: any) => {
    const { id, name, description, status } = updatedFields;
    if (!name) {
      showAlert("Name is required", "warning");
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase
      .from("components")
      .update({ name, description, status })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setComponents((prev) => prev.map((c) => (c.id === data.id ? data : c)));

      showAlert("Component updated successfully!", "success");
      setEditingId(null);
      setEditData(null);
    } else {
      showAlert(error?.message || "An error occurred", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("components")
      .delete()
      .eq("id", deleteTarget);

    if (error) {
      showAlert("Error deleting component", "error");
      return;
    }
    setComponents((prev) =>
      prev.filter((component) => component.id !== deleteTarget),
    );
    showAlert("Component permanently deleted", "info");
  };

  return (
    <Box sx={{ flexGrow: 1, px: 4 }}>
      <Header
        heading="System Components"
        message="Manage services being monitored"
      />
      <Button
        variant={showForm ? "outlined" : "contained"}
        color={showForm ? "error" : "primary"}
        startIcon={showForm ? <Close /> : <Add />}
        onClick={() => setShowForm(!showForm)}
        sx={{ mb: 3, bgcolor: showForm ? "inherit" : "#0a1628" }}
      >
        {showForm ? "Cancel" : "Add Component"}
      </Button>

      {showForm && (
        <Card
          variant="outlined"
          sx={{ borderColor: "#0a1628", borderWidth: 1, my: 3 }}
        >
          <CardHeader
            title={<Typography variant="h6">Add New Component</Typography>}
          />
          <Divider />
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Name"
                  placeholder="e.g., Payment Gateway"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  placeholder="Describe this component..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />

                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="degraded">Degraded</MenuItem>
                  <MenuItem value="partial_outage">Partial Outage</MenuItem>
                  <MenuItem value="major_outage">Major Outage</MenuItem>
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{ alignSelf: "flex-start", px: 4, bgcolor: "#0a1628" }}
                >
                  {submitting ? "Creating..." : "Create Component"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}
      <Stack spacing={2} marginBottom={3}>
        {loading ? (
          <LoadingState message="Loading components..." />
        ) : (
          <>
            {components.length === 0 ? (
              <Card variant="outlined" sx={{ py: 6, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No components yet. Create one to get started.
                </Typography>
              </Card>
            ) : (
              components.map((component) => (
                <Card
                  key={component.id}
                  variant="outlined"
                  sx={{
                    transition: "0.2s",
                    "&:hover": {
                      borderColor:
                        editingId === component.id ? "divider" : "#0a1628",
                    },
                    mb: 2,
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <Box sx={{ flex: 1 }}>
                        {editingId === component.id ? (
                          <Stack spacing={2}>
                            <TextField
                              size="small"
                              fullWidth
                              label="Component Name"
                              value={editData.name}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  name: e.target.value,
                                })
                              }
                            />
                            <TextField
                              size="small"
                              fullWidth
                              multiline
                              label="Description"
                              value={editData.description}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  description: e.target.value,
                                })
                              }
                            />
                            <TextField
                              select
                              size="small"
                              label="Status"
                              sx={{ width: 200 }}
                              value={editData.status}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  status: e.target.value,
                                })
                              }
                            >
                              <MenuItem value="operational">
                                Operational
                              </MenuItem>
                              <MenuItem value="partial_outage">
                                Partial Outage
                              </MenuItem>
                              <MenuItem value="major_outage">
                                Major Outage
                              </MenuItem>
                              <MenuItem value="degraded">
                                Degraded Performance
                              </MenuItem>
                            </TextField>
                          </Stack>
                        ) : (
                          <>
                            <Typography
                              variant="h6"
                              sx={{ fontSize: "1.1rem", fontWeight: "bold" }}
                            >
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
                            <Chip
                              label={component.status.replace("_", " ")}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 1, textTransform: "capitalize" }}
                            />
                          </>
                        )}
                      </Box>

                      {/* RIGHT SIDE: ACTIONS */}
                      <Stack direction="row" spacing={1}>
                        {editingId === component.id ? (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleUpdate(editData)}
                              sx={{ textTransform: "none" }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              color="inherit"
                              onClick={cancelEditing}
                              sx={{ textTransform: "none" }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => startEditing(component)}
                              sx={{ color: "text.secondary" }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget(component.id)}
                              sx={{ color: "error.main" }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}
      </Stack>
      <DeleteDialog
        open={Boolean(deleteTarget)}
        handleClose={() => setDeleteTarget(null)}
        title="Delete Component?"
        message="This action cannot be undone. All linked incidents will remain but lose this association."
        handleDelete={handleDelete}
      />
    </Box>
  );
}
