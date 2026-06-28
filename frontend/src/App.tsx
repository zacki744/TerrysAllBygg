import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthService } from "./lib/auth";
import ScrollToTop from "./components/ScrollToTop";

// ── Public pages ───────────────────────────────────────────
import Home       from "./pages/Home";
import About      from "./pages/About";
import Book       from "./pages/Book";
import Snickerier from "./pages/Snickerier";
import Snickeri   from "./pages/Snickeri";
import Projects   from "./pages/Projects";
import NotFound   from "./pages/NotFound";

// ── Admin pages — lazy loaded (aldrig behövda av publika besökare) ──
const AdminLogin   = lazy(() => import("./pages/admin/AdminLogin"));
const AcceptInvite = lazy(() => import("./pages/admin/AcceptInvite"));
const Dashboard    = lazy(() => import("./pages/admin/Dashboard"));
const Users        = lazy(() => import("./pages/admin/Users"));
const ProjectsNew  = lazy(() => import("./pages/admin/ProjectsNew"));
const ProjectsEdit = lazy(() => import("./pages/admin/ProjectsEdit"));
const SnickeriNew  = lazy(() => import("./pages/admin/snickerierNew"));
const SnickeriEdit = lazy(() => import("./pages/admin/snickerierEdit"));
const ResetPassword = lazy(() => import("./pages/admin/ResetPassword"));

// ── Auth guard ─────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

// ── Gemensam Suspense-wrapper för admin ────────────────────
function AdminPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* ── Public ── */}
        <Route path="/"           element={<Home />} />
        <Route path="/about"      element={<About />} />
        <Route path="/book"       element={<Book />} />
        <Route path="/snickerier" element={<Snickerier />} />
        <Route path="/snickeri"   element={<Snickeri />} />
        <Route path="/projects"   element={<Projects />} />

        {/* ── Admin — public ── */}
        <Route path="/admin/login"         element={<AdminPage><AdminLogin /></AdminPage>} />
        <Route path="/admin/accept-invite" element={<AdminPage><AcceptInvite /></AdminPage>} />
        <Route path="/admin/reset-password" element={<AdminPage><ResetPassword /></AdminPage>} />

        {/* ── Admin — protected ── */}
        <Route path="/admin" element={
          <RequireAuth><AdminPage><Dashboard /></AdminPage></RequireAuth>
        } />
        <Route path="/admin/users" element={
          <RequireAuth><AdminPage><Users /></AdminPage></RequireAuth>
        } />
        <Route path="/admin/projects/new" element={
          <RequireAuth><AdminPage><ProjectsNew /></AdminPage></RequireAuth>
        } />
        <Route path="/admin/projects/edit" element={
          <RequireAuth><AdminPage><ProjectsEdit /></AdminPage></RequireAuth>
        } />
        <Route path="/admin/snickerier/new" element={
          <RequireAuth><AdminPage><SnickeriNew /></AdminPage></RequireAuth>
        } />
        <Route path="/admin/snickerier/edit" element={
          <RequireAuth><AdminPage><SnickeriEdit /></AdminPage></RequireAuth>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}