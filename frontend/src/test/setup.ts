import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

// jsdom saknar scrollTo (används efter skickat formulär)
window.scrollTo = () => {};
