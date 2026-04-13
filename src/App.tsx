import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/public/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Incident from "./pages/admin/Incident";
import IncidentDetail from "./pages/admin/IncidentDetails";
import CreateIncident from "./pages/admin/CreateIncident";
import Components from "./pages/admin/Components";
import AuthScreen from "./pages/auth/AuthScreen";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { LoadingState } from "./components/LoadingState";
import { useAuth } from "./hooks/useAuth";
import { DataProvider } from "./provider/DataProvider";

const theme = createTheme({
  typography: {
    fontFamily: "Barlow, sans-serif",
  },
  palette: {
    primary: {
      main: "#0a1628",
    },
    background: {
      default: "#F8F8F8",
    },
  },
});

function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading..." />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Router>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<Dashboard />} />
            </Route>

            <Route
              path="/auth"
              element={user ? <Navigate to="/admin" /> : <AuthScreen />}
            />

            {role === "admin" || role === "contributor" ? (
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/incidents" element={<Incident />} />
                <Route
                  path="/admin/incidents/:id"
                  element={<IncidentDetail />}
                />
                <Route
                  path="/admin/incidents/new"
                  element={<CreateIncident />}
                />
                <Route path="/admin/components" element={<Components />} />
              </Route>
            ) : (
              <Route path="/admin/*" element={<Navigate to="/auth" />} />
            )}

            <Route path="*" element={<Navigate to="/not-found" />} />
          </Routes>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
