import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import MainLayout from "../layouts/MainLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import History from "../pages/History.jsx";
import InterviewRoom from "../pages/InterviewRoom.jsx";
import Login from "../pages/Login.jsx";
import NotFound from "../pages/NotFound.jsx";
import Register from "../pages/Register.jsx";
import Review from "../pages/Review.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import MyQuestions from "../pages/MyQuestions.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "history", element: <History /> },
          { path: "interview/:id", element: <InterviewRoom /> },
          { path: "interview/:id/review", element: <Review /> },
          { path: "my-questions", element: <MyQuestions /> },
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
