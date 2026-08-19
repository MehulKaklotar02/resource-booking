import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormikProvider, useFormik } from "formik";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearAuthError, loginThunk } from "../../store/authSlice";
import { LoginValidationSchema } from "../../utils/validation";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error: errorMessage } = useAppSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: "admin_resourcebooking@yopmail.com",
      password: "Test@1234",
    },
    validationSchema: LoginValidationSchema,
    onSubmit: async (values) => {
      dispatch(clearAuthError());
      const resultAction = await dispatch(
        loginThunk({
          email: values.email,
          password: values.password,
        })
      );

      if (loginThunk.fulfilled.match(resultAction)) {
        navigate("/app/resources");
      }
    },
  });

  const { values, errors, touched, setFieldValue, handleSubmit } = formik;

  const handleQuickFillDemo = () => {
    setFieldValue("email", "admin_resourcebooking@yopmail.com");
    setFieldValue("password", "Test@1234");
  };

  return (
    <Stack spacing={3} sx={{ alignItems: "center" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>
        Login
      </Typography>

      {/* Demo Credentials Note */}
      <Alert
        severity="info"
        sx={{
          width: "100%",
          borderRadius: 2,
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          💡 Demo Credentials Note:
        </Typography>
        <Typography variant="body2" component="div">
          <strong>Email:</strong> admin_resourcebooking@yopmail.com<br />
          <strong>Password:</strong> Test@1234
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={handleQuickFillDemo}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}
          >
            Fill Demo Credentials
          </Button>
        </Box>
      </Alert>

      {errorMessage && (
        <Alert severity="error" sx={{ width: "100%", borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <FormikProvider value={formik}>
        <Stack
          component="form"
          onSubmit={handleSubmit}
          sx={{ gap: 2.5, width: "100%" }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label="Email Address"
            type="email"
            value={values.email}
            onChange={(e) => setFieldValue("email", e.target.value)}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Password"
            type="password"
            value={values.password}
            onChange={(e) => setFieldValue("password", e.target.value)}
            error={touched.password && Boolean(errors.password)}
            helperText={touched.password && errors.password}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{
              borderRadius: 2,
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </Stack>
      </FormikProvider>
    </Stack>
  );
};

export default Login;
