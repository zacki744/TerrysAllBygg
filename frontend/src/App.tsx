import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthService } from "./lib/auth";

// ── Public pages ───────────────────────────────────────────
import Home       from "./pages/Home";
import About      from "./pages/About";
import Book       from "./pages/Book";
import Snickerier from "./pages/Snickerier";
import Snickeri   from "./pages/Snickeri";
import Projects   from "./pages/Projects";
import NotFound   from "./pages/NotFound";

// ── Admin pages ────────────────────────────────────────────
import AdminLogin    from "./pages/admin/AdminLogin";
import AcceptInvite  from "./pages/admin/AcceptInvite";
import Dashboard     from "./pages/admin/Dashboard";
import Users         from "./pages/admin/Users";
import ProjectsNew   from "./pages/admin/ProjectsNew";
import ProjectsEdit  from "./pages/admin/ProjectsEdit";
import SnickeriNew   from "./pages/admin/snickerierNew";
import SnickeriEdit  from "./pages/admin/snickerierEdit";

const ResetPassword = lazy(() => import("./pages/admin/ResetPassword"));

// ── Auth guard ─────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"           element={<Home />} />
        <Route path="/about"      element={<About />} />
        <Route path="/book"       element={<Book />} />
        <Route path="/snickerier" element={<Snickerier />} />
        <Route path="/snickeri"   element={<Snickeri />} />
        <Route path="/projects"   element={<Projects />} />

        {/* ── Admin — public ── */}
        <Route path="/admin/login"          element={<AdminLogin />} />
        <Route path="/admin/accept-invite"  element={<AcceptInvite />} />
        <Route path="/admin/reset-password" element={
          <Suspense fallback={null}><ResetPassword /></Suspense>
        } />

        {/* ── Admin — protected ── */}
        <Route path="/admin" element={
          <RequireAuth><Dashboard /></RequireAuth>
        } />
        <Route path="/admin/users" element={
          <RequireAuth><Users /></RequireAuth>
        } />
        <Route path="/admin/projects/new" element={
          <RequireAuth><ProjectsNew /></RequireAuth>
        } />
        <Route path="/admin/projects/edit" element={
          <RequireAuth><ProjectsEdit /></RequireAuth>
        } />
        <Route path="/admin/snickerier/new" element={
          <RequireAuth><SnickeriNew /></RequireAuth>
        } />
        <Route path="/admin/snickerier/edit" element={
          <RequireAuth><SnickeriEdit /></RequireAuth>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}