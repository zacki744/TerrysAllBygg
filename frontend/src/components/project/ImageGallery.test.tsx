import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";
import ImageGallery from "./ImageGallery";

// jsdom saknar <dialog>-metoderna
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

const IMAGES = ["/uploads/projects/a.webp", "/uploads/projects/b.webp", "/uploads/projects/c.webp"];

describe("ImageGallery", () => {
  it("bläddrar med knappar och markerar aktuell bild", async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={IMAGES} title="Altan" />);

    expect(screen.getByText("Bild 1 av 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Nästa bild" }));
    expect(screen.getByText("Bild 2 av 3")).toBeInTheDocument();

    const current = screen.getAllByRole("button", { name: "Visa bild 2" });
    current.forEach((b) => expect(b).toHaveAttribute("aria-current", "true"));

    await user.click(screen.getByRole("button", { name: "Föregående bild" }));
    await user.click(screen.getByRole("button", { name: "Föregående bild" }));
    expect(screen.getByText("Bild 3 av 3")).toBeInTheDocument();   // runt till sista
  });

  it("öppnar helskärm med tangentbordet och stänger igen", async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={IMAGES} title="Altan" />);

    const opener = screen.getByRole("button", { name: /Visa i helskärm/ });
    opener.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("img", { name: "Altan, bild 1 av 3" })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("img", { name: "Altan, bild 2 av 3" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Stäng helskärm" }));
    expect(screen.queryByRole("img", { name: /Altan, bild/ })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("visar inga bläddringsknappar för en enda bild", () => {
    render(<ImageGallery images={[IMAGES[0]]} title="Bänk" />);
    expect(screen.queryByRole("button", { name: "Nästa bild" })).not.toBeInTheDocument();
  });
});
