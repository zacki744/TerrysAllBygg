import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "./useFetch";
import { ApiError } from "../lib/api";

const respond = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

afterEach(() => vi.restoreAllMocks());

describe("useFetch", () => {
  it("laddar och returnerar data", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => respond(200, [{ id: "1" }]));
    const { result } = renderHook(() => useFetch<{ id: string }[]>("/api/projects"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: "1" }]);
  });

  it("ger ApiError med status vid fel och kan försöka igen", async () => {
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => respond(500, {}))
      .mockImplementationOnce(() => respond(200, { ok: true }));

    const { result } = renderHook(() => useFetch<{ ok: boolean }>("/api/x"));
    await waitFor(() => expect(result.current.error).toBeInstanceOf(ApiError));
    expect((result.current.error as ApiError).status).toBe(500);

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("hämtar inget när url är null", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useFetch(null));
    expect(result.current.loading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
