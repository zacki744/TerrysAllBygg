import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import Notifier from "./Notifier";
import { confirmAction, notify, resetNotify } from "../../lib/notify";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) { this.removeAttribute("open"); };
});
afterEach(() => act(() => resetNotify()));

describe("Notifier", () => {
  it("visar notiser, fel som alert och resten som status", () => {
    render(<Notifier />);
    act(() => { notify.success("Projektet sparat"); notify.error("Kunde inte radera"); });
    expect(screen.getByRole("status")).toHaveTextContent("Projektet sparat");
    expect(screen.getByRole("alert")).toHaveTextContent("Kunde inte radera");
  });

  it("notisen går att stänga", async () => {
    const user = userEvent.setup();
    render(<Notifier />);
    act(() => { notify.info("Hej"); });
    await user.click(screen.getByRole("button", { name: "Stäng meddelandet" }));
    expect(screen.queryByText("Hej")).not.toBeInTheDocument();
  });

  it("bekräftelsen svarar true vid bekräfta och false vid avbryt", async () => {
    const user = userEvent.setup();
    render(<Notifier />);

    let answer: Promise<boolean>;
    act(() => { answer = confirmAction({ title: "Radera Bänk?", confirmLabel: "Radera", danger: true }); });
    expect(screen.getByText("Radera Bänk?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Radera" }));
    await expect(answer!).resolves.toBe(true);

    act(() => { answer = confirmAction({ title: "Säker?" }); });
    await user.click(screen.getByRole("button", { name: "Avbryt" }));
    await expect(answer!).resolves.toBe(false);
  });
});
