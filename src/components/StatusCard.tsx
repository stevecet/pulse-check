import { Box, Typography } from "@mui/material";
import {
  CheckCircle,
  Error,
  Handyman,
  ReportProblem,
} from "@mui/icons-material";
import type { Component } from "../lib/types";

export function StatusCard({ item }: Readonly<{ item: Component }>) {
  const getStatusIcon = () => {
    switch (item.status) {
      case "operational":
        return <CheckCircle color="success" fontSize="small" />;
      case "maintenance":
        return <Handyman color="primary" fontSize="small" />;
      case "incident":
        return <ReportProblem color="warning" fontSize="small" />;
      case "outage":
        return <Error color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (item.status) {
      case "operational":
        return "success.main";
      case "maintenance":
        return "primary.main";
      case "incident":
        return "warning.main";
      case "outage":
        return "error.main";
      default:
        return "divider";
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: getBorderColor(),
        borderRadius: 1,
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography fontWeight={500} color={getBorderColor()}>
        {item.name}
      </Typography>

      {getStatusIcon()}
    </Box>
  );
}
