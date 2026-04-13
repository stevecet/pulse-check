import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Divider,
  Stack,
  FormLabel,
  FormControl,
} from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IncidentStatus, SeverityLevel } from "../../lib/types";
import { Header } from "../../components/Header";
import { LoadingState } from "../../components/LoadingState";
import { useAlert } from "../../hooks/useAlert";
import { incidentService } from "../../services/incidentService";
import { useData } from "../../hooks/useData";

type CreateIncidentFormData = {
  title: string;
  description: string;
  status: IncidentStatus;
  severity: SeverityLevel;
  impact_estimate: string;
  components: string[];
};

const initialFormData: CreateIncidentFormData = {
  title: "",
  description: "",
  status: "identified",
  severity: "medium",
  impact_estimate: "",
  components: [],
};

export default function CreateIncident() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { components, refreshIncidents } = useData();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] =
    useState<CreateIncidentFormData>(initialFormData);



  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { components: selectedComponents, ...incidentData } = formData;
      const newIncident = await incidentService.create(incidentData as any);

      if (selectedComponents && selectedComponents.length > 0) {
        try {
          await incidentService.addComponents(newIncident.id, selectedComponents);
          showAlert("Incident created successfully!", "success");
        } catch (junctionError: any) {
          console.error("Error linking components:", junctionError.message);
          showAlert(
            "Incident created, but components failed to link.",
            "warning",
          );
        }
      } else {
        showAlert("Incident created successfully!", "success");
      }

      await refreshIncidents();
      setFormData(initialFormData);
    } catch (incidentError: any) {
      showAlert(incidentError.message || "Failed to create incident", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComponent = (componentId: string) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.includes(componentId)
        ? prev.components.filter((id) => id !== componentId)
        : [...prev.components, componentId],
    }));
  };
  return (
    <Box sx={{ flexGrow: 1, px: 4, mb: 5 }}>
      <Header
        heading="Create Incident"
        message="Report a new system incident"
      />

      <Card variant="outlined">
        <CardHeader
          title={<Typography variant="h6">Incident Details</Typography>}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        />
        <CardContent sx={{ pt: 3 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>
              <TextField
                fullWidth
                label="Title"
                placeholder="e.g., Database connection timeout"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as IncidentStatus,
                      }))
                    }
                  >
                    <MenuItem value="identified">Identified</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Severity"
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        severity: e.target.value as SeverityLevel,
                      }))
                    }
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Impact Estimate"
                placeholder="e.g., 500 users affected"
                value={formData.impact_estimate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    impact_estimate: e.target.value,
                  }))
                }
              />

              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{ mb: 1, fontWeight: "bold", fontSize: "0.875rem" }}
                >
                  Affected Components
                </FormLabel>
                {false ? (
                  <LoadingState message="Loading Components..." />
                ) : (
                  <FormGroup>
                    {components.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No components available
                      </Typography>
                    ) : (
                      <Grid container>
                        {components.map((component) => (
                          <Grid size={4} key={component.id}>
                            <FormControlLabel
                              key={component.id}
                              control={
                                <Checkbox
                                  checked={formData.components.includes(
                                    component.id,
                                  )}
                                  onChange={() => toggleComponent(component.id)}
                                />
                              }
                              label={component.name}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </FormGroup>
                )}
              </FormControl>

              <Divider />

              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{ px: 4 }}
                >
                  {submitting ? "Creating..." : "Create Incident"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{
                    color: "text.primary",
                    borderColor: "divider",
                    "&:hover": { borderColor: "text.primary" },
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
