import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import { DonationForm } from "@/components/DonationForm";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderForm() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <DonationForm />
      </AuthProvider>
    </MemoryRouter>
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Título do item/), "Sofa");
  await user.type(screen.getByLabelText(/Descrição/), "Descricao");

  // Radix Select: click trigger, then select the option (not the native <option>)
  await user.click(screen.getByRole("combobox"));
  const options = screen.getAllByText("Móveis");
  // Pick the Radix option (role=option), not the native <option>
  const radixOption = options.find((el) => el.closest("[role='option']"));
  await user.click(radixOption ?? options[0]);

  await user.type(screen.getByLabelText(/Local de retirada/), "Porto Alegre");
  await user.type(screen.getByLabelText(/Dias disponíveis/), "Seg");
  await user.type(screen.getByLabelText(/Horários/), "18h");
  await user.type(screen.getByLabelText(/E-mail para contato/), "t@t.com");
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("token", "fake-token");
  vi.restoreAllMocks();
  mockNavigate.mockReset();
});

describe("Cadastro de doacao", () => {
  it("submete formulario com sucesso e navega para /browse", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, id: "abc-123" }),
    } as Response);

    renderForm();
    await fillRequiredFields(user);

    await user.click(screen.getByRole("button", { name: "Cadastrar doação" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/browse");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/bens/salvar"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("exibe erro quando a API falha e nao navega", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: false, message: "Erro interno" }),
    } as Response);

    renderForm();
    await fillRequiredFields(user);

    await user.click(screen.getByRole("button", { name: "Cadastrar doação" }));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("nao submete sem campos obrigatorios", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    renderForm();

    await user.click(screen.getByRole("button", { name: "Cadastrar doação" }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
