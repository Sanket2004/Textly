import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UsernamePage from "./pages/UsernamePage";
import useAppStore from "./stores/useStore";
import ProtectedRoute from "./components/ProtectedRoute";
import RoomPage from "./pages/RoomPage";
import Navbar from "./components/Navbar";
import { initNotificationSound } from "./utils/initNotification";
import { useEffect } from "react";
import NotFound from "./pages/not-found";

export default function App() {
  const { username } = useAppStore();

  useEffect(() => {
    initNotificationSound();
  }, []);

  return (
    <>
      <BrowserRouter>
        {username && <Navbar />}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <RoomPage />
              </ProtectedRoute>
            }
          />
          <Route path="/onboarding" element={username ? <Navigate to="/" /> : <UsernamePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
