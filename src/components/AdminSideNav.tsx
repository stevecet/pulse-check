import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button, Stack } from "@mui/material";
import { Add, BarChart, BugReport, Dashboard } from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

const drawerWidth = 240;

export default function ResponsiveDrawer() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  interface Item {
    name: string;
    icon: React.ReactElement;
    link: string;
  }

  const sideItems: Item[] = [
    {
      name: "Dashboard",
      icon: <BarChart />,
      link: "/admin",
    },
    {
      name: "Incidents",
      icon: <BugReport />,
      link: "/admin/incidents",
    },
    {
      name: "New Incident",
      icon: <Add />,
      link: "/admin/incidents/new",
    },
    {
      name: "Components",
      icon: <Dashboard />,
      link: "/admin/components",
    },
  ];

  const drawer = (
    <div>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Admin Panel
        </Typography>
        <Typography variant="body2"> steveceto@gmail.com </Typography>
      </Box>
      <Divider />
      <List sx={{ mx: 1 }}>
        {sideItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.link)}
              sx={{
                ...(location.pathname === item.link && {
                  bgcolor: "#0a1628",
                  color: "white",
                }),
                "&:hover": { backgroundColor: "black", color: "white" },
              }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Stack
        spacing={1}
        sx={{
          position: "fixed",
          bottom: 10,
          "& .MuiButton-root": { textTransform: "none", ml: 2 },
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          sx={{ color: "#0a1628", borderColor: "gray" }}
          onClick={() => navigate("/")}
        >
          Back to Main Dashboard
        </Button>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={async () => {
            navigate("/");
            await supabase.auth.signOut();

            localStorage.clear();
            sessionStorage.clear();
          }}
        >
          Sign Out
        </Button>
      </Stack>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          slotProps={{
            root: {
              keepMounted: true,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Outlet />
    </Box>
  );
}
