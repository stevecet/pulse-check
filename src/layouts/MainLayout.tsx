import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import NavBar from "../components/Navbar";

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          color: "black",
          backgroundColor: "#f4f5ff",
        }}
      >
        <NavBar />
        <Outlet />
      </Box>
    </Box>
  );
}