import { Card, Stack } from "@mui/material";
import React from "react";
import { Outlet } from "react-router";

const AuthLayout: React.FC = () => {
  return (
    <Stack
      sx={{
        width: "100vw",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
      direction="row"
    >
      <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3, width: "40%" }}>
        <Outlet />
      </Card>
    </Stack>
  );
};

export default AuthLayout;
