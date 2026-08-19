import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import AuthLayout from "./components/layouts/auth";
import MainLayout from "./components/layouts/main";
import Bookings from "./pages/Bookings";
import Resources from "./pages/Resources";
import PrivateRoute from "./components/layouts/PrivateRoute";

const token = localStorage.getItem("token");

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Navigate to={token ? "/app/resources" : "/auth/login"} replace />
    ),
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Login /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/app",
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="resources" replace /> },
          { path: "resources", element: <Resources /> },
          { path: "bookings", element: <Bookings /> },
        ],
      },
    ],
  },
]);

export default routes;
