import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import { ItemDetail } from "@/components/ItemDetail";
import { DonationItem } from "@/lib/data";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockItem: DonationItem = {
  id: "item-1",
  title: "Sofa bonito",
  description: "Sofa de 3 lugares em bom estado",
  categoryId: "furniture",
  condition: "good",
  imageUrl: "",
  location: "Porto Alegre, RS",
  pickupDates: "Seg a Sex",
  pickupTimes: "18h-20h",
  contactName: "Maria",
  contactPhone: "(51) 99999-0000",
  contactEmail: "maria@test.com",
  status: "available",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  userId: "other-user-id",
  interests: [],
};

function renderItem(item = mockItem) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ItemDetail item={item} />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  mockNavigate.mockReset();
});

describe("Registro de interesse", () => {
  it("registra interesse com sucesso e navega", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response);

    renderItem();

    await user.click(screen.getByText("Tenho interesse"));

    await user.type(screen.getByLabelText("Seu nome"), "Joao");
    await user.type(screen.getByLabelText("E-mail para contato"), "joao@test.com");
    await user.type(screen.getByLabelText("Seu telefone"), "(51) 91111-1111");

    await user.click(screen.getByRole("button", { name: "Reservar item" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/browse");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/bens/item-1/interest"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("exibe erro quando API falha ao registrar interesse", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: false, message: "Erro interno" }),
    } as Response);

    renderItem();

    await user.click(screen.getByText("Tenho interesse"));

    await user.type(screen.getByLabelText("Seu nome"), "Joao");
    await user.type(screen.getByLabelText("E-mail para contato"), "joao@test.com");
    await user.type(screen.getByLabelText("Seu telefone"), "(51) 91111-1111");

    await user.click(screen.getByRole("button", { name: "Reservar item" }));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe("Marcacao como doado", () => {
  it("marca item como doado quando eh owner", async () => {
    const user = userEvent.setup();

    // Simula usuario logado como dono do item
    localStorage.setItem("token", "fake-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "owner-1", name: "Maria", email: "maria@test.com" })
    );

    const ownerItem: DonationItem = {
      ...mockItem,
      userId: "owner-1",
      interests: [{ name: "Joao", phone: "(51) 91111-1111", email: "joao@test.com" }],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response);

    render(
      <MemoryRouter>
        <AuthProvider>
          <ItemDetail item={ownerItem} />
        </AuthProvider>
      </MemoryRouter>
    );

    // Espera o AuthProvider hidratar do localStorage
    await waitFor(() => {
      expect(screen.getByText("Marcar como doado")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Marcar como doado"));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/browse");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/bens/item-1/status"),
      expect.objectContaining({ method: "PATCH" })
    );
  });
});
