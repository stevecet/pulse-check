import { Box, Typography } from "@mui/material";
import { Warning, Error, Handyman } from "@mui/icons-material";

interface Event {
  name: string;
  status: string;
}

export function EventCard({ event }: { readonly event: Event }) {
  const getIcon = () => {
    switch (event.status) {
      case "maintenance":
        return <Handyman sx={{ color: "#1976d2" }} />;
      case "incident":
        return <Warning color="warning" />;
      case "outage":
        return <Error color="error" />;
    }
  };

  const getMessage = () => {
    switch (event.status) {
      case "maintenance":
        return `${event.name} is currently under maintenance`;
      case "incident":
        return `${event.name} is experiencing issues`;
      case "outage":
        return `${event.name} is currently down`;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {getIcon()}
      <Typography>{getMessage()}</Typography>
    </Box>
  );
}
