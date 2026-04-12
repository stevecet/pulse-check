import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";

interface TabPanelItem {
  value: string;
  content?: React.ReactNode;
  label?: string;
}

interface SubTabsProps {
  value: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
  panels: TabPanelItem[];
}

export function SubTabs({ value, onChange, panels }: Readonly<SubTabsProps>) {
  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList
          onChange={onChange}
          sx={{
            "& .MuiTab-root": { textTransform: "none" },
          }}
        >
          {panels.map((panel) => (
            <Tab key={panel.value} label={panel.label} value={panel.value} />
          ))}
        </TabList>
      </Box>

      {panels.map((panel) => (
        <TabPanel key={panel.value} value={panel.value}>
          {panel.content}
        </TabPanel>
      ))}
    </TabContext>
  );
}
