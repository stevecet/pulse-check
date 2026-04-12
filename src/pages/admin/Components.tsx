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
  Pagination,
  InputAdornment,
} from "@mui/material";
import { Add, Close, Delete, Edit, Search } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import type { Component, ComponentStatus } from "../../lib/types";
import { LoadingState } from "../../components/LoadingState";
import DeleteDialog from "../../components/DeleteDialog";
import { useAlert } from "../../hooks/useAlert";
import { componentService } from "../../services/componentService";

type ComponentFormData = {
  name: string;
  description: string;
  status: ComponentStatus;
};

const initialFormData: ComponentFormData = {
  name: "",
  description: "",
  status: "operational",
};

export default function Components() {
  const { showAlert } = useAlert();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Component> | null>(null);
  const [formData, setFormData] = useState<ComponentFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

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

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await componentService.create(formData);
      setComponents((prev) => [...prev, data]);
      showAlert("Component created successfully!", "success");
      setFormData(initialFormData);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating component:", error);
      showAlert("Failed to create component", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (component: Component) => {
    setEditingId(component.id);
    setEditData({ ...component });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleUpdate = async (updatedFields: Partial<Component> | null) => {
    if (!updatedFields?.id) {
      showAlert("Missing component details", "warning");
      return;
    }
    const { id, name, description, status } = updatedFields;
    if (!name) {
      showAlert("Name is required", "warning");
      return;
    }
    setSubmitting(true);

    try {
      const data = await componentService.update(id, {
        name,
        description,
        status,
      });
      setComponents((prev) => prev.map((c) => (c.id === data.id ? data : c)));

      showAlert("Component updated successfully!", "success");
      setEditingId(null);
      setEditData(null);
    } catch (error) {
      console.error("Error creating component:", error);
      showAlert("An error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await componentService.delete(deleteTarget);
      setComponents((prev) =>
        prev.filter((component) => component.id !== deleteTarget),
      );
      showAlert("Component permanently deleted", "info");
    } catch (error) {
      console.error("Error creating component:", error);
      showAlert("Error deleting component", "error");
    }
    setDeleteTarget(null);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredComponents = components.filter((component) => {
    if (!normalizedQuery) return true;
    return (
      component.name.toLowerCase().includes(normalizedQuery) ||
      (component.description ?? "").toLowerCase().includes(normalizedQuery) ||
      component.status.toLowerCase().includes(normalizedQuery)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredComponents.length / pageSize),
  );
  const paginatedComponents = filteredComponents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <Box sx={{ flexGrow: 1, px: 4 }}>
      <Header
        heading="System Components"
        message="Manage services being monitored"
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 3,
        }}
      >
        <Button
          variant={showForm ? "outlined" : "contained"}
          color={showForm ? "error" : "primary"}
          startIcon={showForm ? <Close /> : <Add />}
          onClick={() => setShowForm(!showForm)}
          sx={{ bgcolor: showForm ? "inherit" : "#0a1628" }}
        >
          {showForm ? "Cancel" : "Add Component"}
        </Button>

        <TextField
          fullWidth
          size="small"
          label="Search components"
          placeholder="Search by name, description, or status"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 520 }}
        />
      </Box>

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
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as ComponentStatus,
                    }))
                  }
                >
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="incident">Incident</MenuItem>
                  <MenuItem value="outage">Outage</MenuItem>
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
            {components.length === 0 && (
              <Card variant="outlined" sx={{ py: 6, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No components yet. Create one to get started.
                </Typography>
              </Card>
            )}
            {filteredComponents.length === 0 ? (
              <Card variant="outlined" sx={{ py: 6, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No components match your search.
                </Typography>
              </Card>
            ) : (
              paginatedComponents.map((component) => (
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
                              value={editData?.name ?? ""}
                              onChange={(e) =>
                                setEditData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        name: e.target.value,
                                      }
                                    : prev,
                                )
                              }
                            />
                            <TextField
                              size="small"
                              fullWidth
                              multiline
                              label="Description"
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
                            />
                            <TextField
                              select
                              size="small"
                              label="Status"
                              sx={{ width: 200 }}
                              value={editData?.status ?? "operational"}
                              onChange={(e) =>
                                setEditData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        status: e.target
                                          .value as ComponentStatus,
                                      }
                                    : prev,
                                )
                              }
                            >
                              <MenuItem value="operational">
                                Operational
                              </MenuItem>
                              <MenuItem value="maintenance">
                                Maintenance
                              </MenuItem>
                              <MenuItem value="incident">Incident</MenuItem>
                              <MenuItem value="outage">Outage</MenuItem>
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
      {!loading && filteredComponents.length > pageSize && (
        <Stack alignItems="end" sx={{ mb: 3 }}>
          <Pagination
            count={totalPages}
            page={Math.min(page, totalPages)}
            onChange={(_event, value) => setPage(value)}
            shape="rounded"
            sx={{ color: "#0a1628" }}
          />
        </Stack>
      )}
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
