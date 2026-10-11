import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, describe, expect, it, vi } from "vitest";
import Book from "./Book";

function renderBook(url = "/book") {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <Book />
      </MemoryRouter>
    </HelmetProvider>
  );
}

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/^Namn/), "Anna Svensson");
  await user.type(screen.getByLabelText(/^E-post/), "anna@example.se");
  await user.selectOptions(screen.getByLabelText(/^Byggplats/), "utomhus");
  await user.selectOptions(screen.getByLabelText(/^Typ av projekt/), "bastu");
  await user.type(screen.getByLabelText(/^Adress/), "Storgatan 1, Kivik");
  await user.type(screen.getByLabelText(/^Projektbeskrivning/), "En utomhusbastu");
  return user;
}

afterEach(() => vi.restoreAllMocks());

describe("Bokningsformuläret", () => {
  it("kräver att integritetsinformationen bekräftas", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    renderBook();
    const user = await fillForm();

    await user.click(screen.getByRole("button", { name: "Skicka förfrågan" }));

    expect(screen.getByRole("checkbox", { name: /integritetspolicyn/ })).toBeInvalid();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("skickar förfrågan och visar tack", async () => {
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
    renderBook();
    const user = await fillForm();

    await user.click(screen.getByRole("checkbox", { name: /integritetspolicyn/ }));
    await user.click(screen.getByRole("button", { name: "Skicka förfrågan" }));

    expect(await screen.findByText(/Tack, din förfrågan är skickad/)).toBeInTheDocument();
    const body = JSON.parse((fetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({ name: "Anna Svensson", project: "bastu", privacyAccepted: true });
  });

  it("förklarar när för många förfrågningar skickats", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 429 }));
    renderBook();
    const user = await fillForm();

    await user.click(screen.getByRole("checkbox", { name: /integritetspolicyn/ }));
    await user.click(screen.getByRole("button", { name: "Skicka förfrågan" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/flera förfrågningar/);
  });
});

describe("bokning från en projektsida", () => {
  it("förifyller beskrivningen och visar vilket projekt det gäller", () => {
    renderBook("/book?projekt=Altan%20med%20pergola");
    expect(screen.getByText("Altan med pergola", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Projektbeskrivning/)).toHaveValue(
      'Jag har sett projektet "Altan med pergola" på hemsidan och vill ha något liknande.\n\n'
    );
  });

  it("lämnar beskrivningen tom utan referens", () => {
    renderBook();
    expect(screen.getByLabelText(/^Projektbeskrivning/)).toHaveValue("");
  });
});
