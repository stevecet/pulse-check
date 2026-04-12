import { Box, Typography } from "@mui/material";

export const Header = ({
  heading,
  message,
}: {
  heading: string;
  message: string;
}) => {
  return (
    <Box sx={{ my: 4, }}>
      <Typography variant="h4" noWrap component="div" sx={{ fontWeight: 600, letterSpacing: 2 }}>
        {heading}
      </Typography>
      <Typography variant="body1" noWrap component="div">
        {message}
      </Typography>
    </Box>
  );
};
