import React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  CalendarMonth as BookingsIcon,
  MeetingRoom as ResourcesIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const isBookingsActive = location.pathname.includes("/bookings");
  const isResourcesActive = location.pathname.includes("/resources");

  return (
    <Stack
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        overflowY: "auto",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/app/bookings")}
              >
                Resource Booking
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant={isResourcesActive ? "contained" : "text"}
                  startIcon={<ResourcesIcon />}
                  onClick={() => navigate("/app/resources")}
                  sx={{
                    color: isResourcesActive ? "#ffffff" : "#94a3b8",
                    backgroundColor: isResourcesActive ? "#2563eb" : "transparent",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: isResourcesActive ? "#1d4ed8" : "rgba(255,255,255,0.08)",
                      color: "#ffffff",
                    },
                  }}
                >
                  Resources
                </Button>
                <Button
                  variant={isBookingsActive ? "contained" : "text"}
                  startIcon={<BookingsIcon />}
                  onClick={() => navigate("/app/bookings")}
                  sx={{
                    color: isBookingsActive ? "#ffffff" : "#94a3b8",
                    backgroundColor: isBookingsActive ? "#2563eb" : "transparent",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: isBookingsActive ? "#1d4ed8" : "rgba(255,255,255,0.08)",
                      color: "#ffffff",
                    },
                  }}
                >
                  Bookings
                </Button>
              </Stack>
            </Stack>

            <Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: "#cbd5e1",
                  borderColor: "#334155",
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#64748b",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Stack>
  );
};

export default MainLayout;
