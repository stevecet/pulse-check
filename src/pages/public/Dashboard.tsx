import { Box, Button, Container, IconButton, Paper } from "@mui/material";
import { useState } from "react";
import { SubTabs } from "../../components/SubTabs";
import { Cached } from "@mui/icons-material";
import StatusOverview from "../../components/CurrentStatus/StatusOverview";
import ActiveIncidents from "../../components/CurrentStatus/ActiveIncidents";

export default function Dashboard() {
  const [mainTab, setMainTab] = useState("1");
  const [currentSubTab, setCurrentSubTab] = useState("1");
  const [historySubTab, setHistorySubTab] = useState("1");

  const handleMainChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    setMainTab(newValue);
  };

  const handleCurrentSubChange = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    event.preventDefault();
    setCurrentSubTab(newValue);
  };

  const handleHistorySubChange = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    event.preventDefault();
    setHistorySubTab(newValue);
  };
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SubTabs
              value={mainTab}
              onChange={handleMainChange}
              panels={[
                { value: "1", label: "Current Status" },
                { value: "2", label: "History" },
              ]}
            />
            <Box gap={2} sx={{ display: "flex" }}>
              <IconButton aria-label="refresh">
                <Cached />
              </IconButton>
              <Button
                variant="contained"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Contact support
              </Button>
            </Box>
          </Box>

          {mainTab === "1" && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  bgcolor: "#00AA66",
                  color: "white",
                  p: 2,
                  borderRadius: 1,
                  my: 2,
                  textAlign: "center",
                  fontWeight: "medium",
                }}
              >
                All systems operational
              </Box>
              <SubTabs
                value={currentSubTab}
                onChange={handleCurrentSubChange}
                panels={[
                  {
                    value: "1",
                    label: "Status Overview",
                    content: <StatusOverview />,
                  },
                  {
                    value: "2",
                    label: "Active Incidents",
                    content: <ActiveIncidents />,
                  },
                  { value: "3", label: "Active Maintenance" },
                  { value: "4", label: "Scheduled Maintenance" },
                ]}
              />
            </Box>
          )}

          {mainTab === "2" && (
            <Box sx={{ mt: 2 }}>
              <SubTabs
                value={historySubTab}
                onChange={handleHistorySubChange}
                panels={[
                  { value: "1", label: "History Overview" },
                  { value: "2", label: "Past Incidents" },
                  { value: "3", label: "Past Maintenance" },
                  { value: "4", label: "Component History" },
                ]}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
