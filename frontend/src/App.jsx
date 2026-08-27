import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import SheetPage from "./pages/SheetPage";
import RoadmapPage from "./pages/RoadmapPage";
import CalendarPage from "./pages/CalendarPage";
import RevisionPage from "./pages/RevisionPage";
import CollectionPage from "./pages/CollectionPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return <AuthProvider><Routes>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route element={<MainLayout/>}>
        <Route path="/" element={<DashboardPage/>}/>
        <Route path="/sheet" element={<SheetPage/>}/>
        <Route path="/roadmap" element={<RoadmapPage/>}/>
        <Route path="/calendar" element={<CalendarPage/>}/>
        <Route path="/revision" element={<RevisionPage/>}/>
        <Route path="/saved" element={<CollectionPage type="saved"/>}/>
        <Route path="/important" element={<CollectionPage type="important"/>}/>
        <Route path="/profile" element={<ProfilePage/>}/>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></AuthProvider>;
}
