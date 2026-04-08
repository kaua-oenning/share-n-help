import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import { LoginModal } from "@/components/LoginModal";

// Helper component to trigger login modal
function OpenModalButton() {
  const { setLoginModalOpen } = useAuth();
  return <button onClick={() => setLoginModalOpen(true)}>Abrir login</button>;
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <OpenModalButton />
      <LoginModal />
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("Login", () => {
  it("faz login com sucesso e armazena token", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        token: "fake-jwt-token",
        user: { id: "1", name: "Maria", email: "maria@test.com" },
      }),
    } as Response);

    renderWithAuth();

    await user.click(screen.getByText("Abrir login"));

    await user.type(screen.getByLabelText("E-mail"), "maria@test.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-jwt-token");
    });
  });

  it("exibe erro quando credenciais sao invalidas", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Credenciais inválidas." }),
    } as Response);

    renderWithAuth();

    await user.click(screen.getByText("Abrir login"));
    await user.type(screen.getByLabelText("E-mail"), "wrong@test.com");
    await user.type(screen.getByLabelText("Senha"), "wrong");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
    });
  });
});

describe("Cadastro de usuario", () => {
  it("cria conta e armazena token", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        token: "new-jwt-token",
        user: { id: "2", name: "Joao", email: "joao@test.com" },
      }),
    } as Response);

    renderWithAuth();

    await user.click(screen.getByText("Abrir login"));
    await user.click(screen.getByText("Não tem uma conta? Cadastre-se."));

    await user.type(screen.getByLabelText("Nome"), "Joao");
    await user.type(screen.getByLabelText("E-mail"), "joao@test.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("new-jwt-token");
    });
  });
});
