// src/routes/routes.jsx
import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import CollectionsPage from "../pages/CollectionsPage";
import PointsPage from "../pages/PointsPage";
import SnapshotsPage from "../pages/SnapshotsPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    // Wrap the whole app layout in ProtectedRoute so every child route is protected.
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <CollectionsPage /> },
      { path: "/collections", element: <CollectionsPage /> },
      { path: "/collections/:collectionName/points", element: <PointsPage /> },
      {
        path: "/collections/:collectionName/snapshots",
        element: <SnapshotsPage />,
      },
    ],
  },
]);

export default router;
