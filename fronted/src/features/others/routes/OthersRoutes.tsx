import { Navigate, type RouteObject } from "react-router-dom";
import { Help } from "../pages";

export const othersRoutes: RouteObject[] = [
  {
    path: "ayuda",
    element: <Help />,
  },
  {
    path: "*",
    element: <Navigate to="/otros" replace />,
  },
];
