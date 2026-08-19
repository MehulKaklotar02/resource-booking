import React, { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  MeetingRoom as ResourceIcon,
  Public as TimezoneIcon,
  CalendarMonth as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchInitialDataThunk, setSelectedResourceId } from "../../store/bookingSlice";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const Resources: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resources, loading } = useAppSelector((state) => state.booking);

  useEffect(() => {
    if (resources.length === 0) {
      dispatch(fetchInitialDataThunk());
    }
  }, [dispatch, resources.length]);

  const handleSelectResourceForBooking = (resourceId: string) => {
    dispatch(setSelectedResourceId(resourceId));
    navigate("/app/bookings");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Managed Resources
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b", mt: 0.5 }}>
            View system resources, native operating timezones, and weekly availability schedules.
          </Typography>
        </Box>

        {loading && resources.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress />
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Loading resources...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {resources.map((res) => (
              <Grid key={res.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justify: "space-between",
                    borderColor: "#cbd5e1",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: 4,
                      borderColor: "#2563eb",
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: "#eff6ff",
                            color: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <ResourceIcon />
                        </Paper>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                            {res.name}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "#64748b" }}>
                            <TimezoneIcon sx={{ fontSize: "0.9rem" }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {res.timezone}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>

                      <Divider />

                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#334155" }}>
                            Weekly Availability Window
                          </Typography>
                        </Stack>

                        {res.availabilities && res.availabilities.length > 0 ? (
                          <Stack spacing={0.8}>
                            {res.availabilities.map((avail) => (
                              <Paper
                                key={avail.id}
                                elevation={0}
                                sx={{
                                  p: 1,
                                  px: 1.5,
                                  borderRadius: 2,
                                  bgcolor: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  display: "flex",
                                  justify: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Chip
                                  size="small"
                                  label={DAYS_OF_WEEK[avail.dayOfWeek] || `Day ${avail.dayOfWeek}`}
                                  sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: "#e2e8f0" }}
                                />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                  {avail.startTime} - {avail.endTime}
                                </Typography>
                              </Paper>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No availability schedule configured.
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => handleSelectResourceForBooking(res.id)}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      Book This Resource
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
};

export default Resources;
