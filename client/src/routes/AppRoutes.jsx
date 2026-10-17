import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import AppShell from "../layouts/AppShell.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import History from "../pages/History.jsx";
import Home from "../pages/Home.jsx";
import ImportPdf from "../pages/ImportPdf.jsx";
import InterviewRoom from "../pages/InterviewRoom.jsx";
import Login from "../pages/Login.jsx";
import MyQuestions from "../pages/MyQuestions.jsx";
import NotFound from "../pages/NotFound.jsx";
import Register from "../pages/Register.jsx";
import Review from "../pages/Review.jsx";
import AdminRoute from "./AdminRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <Home /> },
              { path: "history", element: <History /> },
              {
                element: <AdminRoute />,
                children: [
                  { path: "my-questions", element: <MyQuestions /> },
                  { path: "pdf-import", element: <ImportPdf /> },
                ],
              },
            ],
          },
          { path: "interview/:id", element: <InterviewRoom /> },
          { path: "interview/:id/review", element: <Review /> },
        ],
      },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
