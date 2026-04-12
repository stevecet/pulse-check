import { Box, CircularProgress, Typography } from "@mui/material";

export const LoadingState = ({ message = "Loading..." }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 10,
      width: "100%",
    }}
  >
    <CircularProgress size={40} thickness={4} sx={{ color: "#0a1628" }} />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
);
