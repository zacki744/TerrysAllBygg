import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrollar till toppen av sidan vid varje route-ändring.
 * Krävs eftersom React Router inte gör detta automatiskt.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}