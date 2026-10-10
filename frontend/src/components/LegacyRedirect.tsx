// src/components/LegacyRedirect.tsx
// ── Gamla länkar (/projects?id=…, /snickeri?id=…) → nya sökvägar ──
// Behålls så att länkar som redan delats eller indexerats fortsätter fungera.

import { Navigate, useSearchParams } from "react-router-dom";
import NotFound from "../pages/NotFound";

interface LegacyRedirectProps {
  toPath: (id: string) => string;
}

export default function LegacyRedirect({ toPath }: LegacyRedirectProps) {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return <NotFound />;
  return <Navigate to={toPath(id)} replace />;
}
