import React, { useEffect } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import type { Slot } from "../../api";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  createBookingThunk,
  fetchInitialDataThunk,
  fetchSlotsAndBookingsThunk,
  setAlertInfo,
  setSelectedResourceId,
  setSelectedUserId,
  setTargetDate,
  setUserTimezone,
} from "../../store/bookingSlice";

const COMMON_TIMEZONES = [
  { label: "UTC (Coordinated Universal Time)", value: "UTC" },
  { label: "Asia/Kolkata (IST - India)", value: "Asia/Kolkata" },
  { label: "Europe/London (GMT/BST - UK)", value: "Europe/London" },
  { label: "America/New_York (EST/EDT - US East)", value: "America/New_York" },
  { label: "Asia/Tokyo (JST - Japan)", value: "Asia/Tokyo" },
  { label: "America/Los_Angeles (PST/PDT - US West)", value: "America/Los_Angeles" },
];

const Bookings: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    resources,
    users,
    selectedResourceId,
    selectedUserId,
    targetDate,
    userTimezone,
    slots,
    bookings,
    loading,
    bookingLoading,
    alertInfo,
  } = useAppSelector((state) => state.booking);

  // Load initial resources and users into Redux
  useEffect(() => {
    dispatch(fetchInitialDataThunk());
  }, [dispatch]);

  // Refresh slots and confirmed bookings for the selected resource
  const handleRefreshSlotsAndBookings = () => {
    if (selectedResourceId) {
      dispatch(
        fetchSlotsAndBookingsThunk({
          resourceId: selectedResourceId,
          date: targetDate,
          timezone: userTimezone,
        })
      );
    }
  };

  useEffect(() => {
    if (selectedResourceId) {
      dispatch(
        fetchSlotsAndBookingsThunk({
          resourceId: selectedResourceId,
          date: targetDate,
          timezone: userTimezone,
        })
      );
    }
  }, [dispatch, selectedResourceId, targetDate, userTimezone]);

  const handleBookSlot = async (slot: Slot) => {
    if (!selectedUserId) {
      dispatch(
        setAlertInfo({
          severity: "warning",
          message: "Please select a user to complete the booking.",
        })
      );
      return;
    }

    const actionResult = await dispatch(
      createBookingThunk({
        resourceId: selectedResourceId,
        userId: selectedUserId,
        startTime: slot.startTimeUtc,
        endTime: slot.endTimeUtc,
        slotDisplayStart: slot.displayStart,
      })
    );

    if (createBookingThunk.fulfilled.match(actionResult)) {
      handleRefreshSlotsAndBookings();
    }
  };

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Clean Page Title Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Bookings
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshSlotsAndBookings}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Refresh Schedule
          </Button>
        </Box>

        {/* Alert Notification */}
        {alertInfo && (
          <Alert
            severity={alertInfo.severity}
            onClose={() => dispatch(setAlertInfo(null))}
            sx={{ borderRadius: 2, fontSize: "0.95rem" }}
          >
            {alertInfo.message}
          </Alert>
        )}

        {/* Controls Panel */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "#334155" }}>
            Booking Controls
          </Typography>
          <Grid container spacing={2}>
            {/* Resource Selector */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="resource-select-label">Select Resource</InputLabel>
                <Select
                  labelId="resource-select-label"
                  label="Select Resource"
                  value={selectedResourceId}
                  onChange={(e) => dispatch(setSelectedResourceId(e.target.value))}
                >
                  {resources.map((res) => (
                    <MenuItem key={res.id} value={res.id}>
                      {res.name} ({res.timezone})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* User Selector */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="user-select-label">Booking User</InputLabel>
                <Select
                  labelId="user-select-label"
                  label="Booking User"
                  value={selectedUserId}
                  onChange={(e) => dispatch(setSelectedUserId(e.target.value))}
                >
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Target Date Picker */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Target Date"
                format="DD/MM/YYYY"
                value={targetDate ? dayjs(targetDate, "YYYY-MM-DD") : null}
                onChange={(newValue) => {
                  if (newValue && newValue.isValid()) {
                    dispatch(setTargetDate(newValue.format("YYYY-MM-DD")));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </Grid>

            {/* Viewing Timezone Selector */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="tz-select-label">Viewing Timezone</InputLabel>
                <Select
                  labelId="tz-select-label"
                  label="Viewing Timezone"
                  value={userTimezone}
                  onChange={(e) => dispatch(setUserTimezone(e.target.value))}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <MenuItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Selected Resource Summary */}
        {selectedResource && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#f1f5f9", border: "1px solid #e2e8f0" }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <LocationIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedResource.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Native Resource Timezone: <strong>{selectedResource.timezone}</strong> | Viewing slots in <strong>{userTimezone}</strong>
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Available Slots Section */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}>
            Bookable Time Slots ({slots.length})
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CircularProgress />
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Loading available time slots...
              </Typography>
            </Box>
          ) : slots.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Typography variant="body1" color="text.secondary">
                No open availability windows for <strong>{targetDate}</strong> on this resource's schedule.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {slots.map((slot, idx) => (
                <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      borderColor: slot.isBooked ? "#e2e8f0" : "#cbd5e1",
                      backgroundColor: slot.isBooked ? "#f8fafc" : "#ffffff",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: slot.isBooked ? "#cbd5e1" : "#3b82f6",
                        boxShadow: slot.isBooked ? "none" : 2,
                      },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <TimeIcon fontSize="small" color={slot.isBooked ? "disabled" : "primary"} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {slot.displayStart} - {slot.displayEnd}
                            </Typography>
                          </Stack>
                          <Chip
                            size="small"
                            label={slot.isBooked ? "BOOKED" : "AVAILABLE"}
                            color={slot.isBooked ? "default" : "success"}
                            variant={slot.isBooked ? "filled" : "outlined"}
                          />
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          UTC: {new Date(slot.startTimeUtc).toISOString().substring(11, 16)} - {new Date(slot.endTimeUtc).toISOString().substring(11, 16)} Z
                        </Typography>

                        {slot.isBooked && slot.booking && (
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
                            <Avatar sx={{ width: 22, height: 22, fontSize: "0.75rem" }}>
                              {slot.booking.userName.charAt(0)}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Booked by: {slot.booking.userName}
                            </Typography>
                          </Stack>
                        )}

                        <Button
                          fullWidth
                          size="small"
                          variant={slot.isBooked ? "outlined" : "contained"}
                          color="primary"
                          disabled={slot.isBooked || bookingLoading === slot.startTimeUtc}
                          onClick={() => handleBookSlot(slot)}
                          sx={{ mt: 1, borderRadius: 2 }}
                        >
                          {bookingLoading === slot.startTimeUtc
                            ? "Booking..."
                            : slot.isBooked
                            ? "Slot Taken"
                            : "Book Slot"}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Confirmed Bookings Log */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}>
            Confirmed Bookings Log ({bookings.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {bookings.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No confirmed bookings recorded yet for this resource.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {bookings.map((b) => (
                <Paper
                  key={b.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {b.user?.name || "User"} ({b.user?.email})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Resource: {b.resource?.name} | Start: {new Date(b.startTime).toUTCString()} | End: {new Date(b.endTime).toUTCString()}
                    </Typography>
                  </Box>
                  <Chip size="small" label="CONFIRMED" color="primary" />
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};

export default Bookings;
