import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ImageUploader from "./ImageUploader";

function Harness({ initial, onChange }: { initial: string[]; onChange?: (imgs: string[]) => void }) {
  const [images, setImages] = useState(initial);
  return <ImageUploader images={images} onImagesChange={(i) => { setImages(i); onChange?.(i); }} />;
}

const IMGS = ["/uploads/projects/a.webp", "/uploads/projects/b.webp", "/uploads/projects/c.webp"];
const order = () => screen.getAllByRole("img").map((i) => i.getAttribute("src"));

afterEach(() => vi.restoreAllMocks());

describe("ImageUploader", () => {
  it("flyttar bilder med knapparna och kan göra en bild till omslag", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
    render(<Harness initial={IMGS} />);

    await user.click(screen.getByRole("button", { name: "Flytta bild 1 åt höger" }));
    expect(order()).toEqual(["/uploads/projects/thumbs/b.webp", "/uploads/projects/thumbs/a.webp", "/uploads/projects/thumbs/c.webp"]);

    await user.click(screen.getByRole("button", { name: "Gör bild 3 till omslagsbild" }));
    expect(order()[0]).toBe("/uploads/projects/thumbs/c.webp");
    expect(screen.getByText(/Bild 3 är nu omslagsbild/)).toBeInTheDocument();
  });

  it("första bilden kan inte flyttas åt vänster", async () => {
    const user = userEvent.setup();
    render(<Harness initial={IMGS} />);
    const btn = screen.getByRole("button", { name: "Flytta bild 1 åt vänster" });
    expect(btn).toHaveAttribute("aria-disabled", "true");
    await user.click(btn);
    expect(order()[0]).toBe("/uploads/projects/thumbs/a.webp");
  });

  it("tar bort en bild och ber servern flytta undan filen", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
    render(<Harness initial={IMGS} />);

    await user.click(screen.getByRole("button", { name: "Ta bort bild 2" }));
    expect(order()).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/image/delete", expect.objectContaining({ method: "DELETE" }));
  });

  it("laddar upp filer som dras in och hoppar över filer som inte är bilder", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, path: "/uploads/projects/ny.webp" })));
    const onChange = vi.fn();
    render(<Harness initial={[]} onChange={onChange} />);

    const zone = screen.getByText("Lägg till bilder").closest("div")!;
    const files = [new File(["x"], "altan.jpg", { type: "image/jpeg" }), new File(["x"], "offert.pdf", { type: "application/pdf" })];
    fireEvent.drop(zone, { dataTransfer: { files, types: ["Files"] } });

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(["/uploads/projects/ny.webp"]));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/offert\.pdf: inte en bild/)).toBeInTheDocument();
  });
});
