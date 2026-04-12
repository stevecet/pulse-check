import {
  IconButton,
  Typography,
  Toolbar,
  Box,
  AppBar,
  Avatar,
} from "@mui/material";
import { Launch } from "@mui/icons-material";
import { deepOrange } from "@mui/material/colors";

export default function NavBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
          >
            <Avatar sx={{ bgcolor: deepOrange[500] }}>S</Avatar>
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Steveceto
          </Typography>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, mr: 1 }}
            >
              GitHub
            </Typography>
            <Launch />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
