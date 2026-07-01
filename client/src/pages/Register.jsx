import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function BrandLogo() {
  return (
    <div className="register-brand-logo">
      <div className="register-brand-symbol">
        <div className="register-flux-shape register-flux-shape-one"></div>
        <div className="register-flux-shape register-flux-shape-two"></div>
        <div className="register-flux-shape register-flux-shape-three"></div>

        <div className="register-brand-bars">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="register-brand-text">
        <div className="register-brand-name">FluxERP</div>
        <div className="register-brand-subtitle">Gestão inteligente</div>
      </div>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(type, message) {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  async function handleRegister(event) {
    event.preventDefault();

    if (!name.trim()) {
      showToast("error", "Informe seu nome.");
      return;
    }

    if (!email.trim()) {
      showToast("error", "Informe seu e-mail.");
      return;
    }

    if (!password.trim()) {
      showToast("error", "Informe sua senha.");
      return;
    }

    if (password.length < 6) {
      showToast("error", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      localStorage.removeItem("selectedCompanyId");

      showToast("success", "Conta criada. Agora cadastre sua empresa.");

      setTimeout(() => {
        navigate("/companies");
      }, 600);
    } catch (err) {
      console.error("Erro ao criar conta:", err);

      showToast(
        "error",
        err.response?.data?.message || "Erro ao criar conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <section className="register-left">
        <div className="register-logo">
          <BrandLogo />
        </div>

        <div className="register-content">
          <div className="register-pill">Comece grátis</div>

          <h2>Crie sua conta e organize sua empresa em poucos minutos.</h2>

          <p>
            Cadastre sua empresa, produtos, clientes e comece a acompanhar
            vendas, estoque, faturamento e lucro em tempo real.
          </p>

          <div className="register-preview">
            <div className="register-preview-header">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="register-preview-list">
              <div>
                <strong>01</strong>
                <span>Crie sua conta</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Cadastre sua empresa</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Controle vendas e estoque</span>
              </div>
            </div>
          </div>
        </div>

        <div className="register-footer">
          © 2026 FluxERP — Gestão inteligente
        </div>
      </section>

      <section className="register-right">
        <form className="register-card" onSubmit={handleRegister}>
          <div className="register-card-badge">Nova conta</div>

          <h2>Criar conta</h2>
          <p>Preencha os dados abaixo para acessar o FluxERP.</p>

          <div className="register-form">
            <div className="register-field">
              <label>Nome</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="register-field">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="register-field">
              <label>Senha</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button className="register-button" type="submit" disabled={loading}>
              {loading ? (
                <span className="register-button-loading">
                  <i></i>
                  Criando conta...
                </span>
              ) : (
                "Criar minha conta"
              )}
            </button>
          </div>

          <div className="register-login-link">
            Já tem conta? <Link to="/login">Entrar agora</Link>
          </div>
        </form>
      </section>

      {toast && (
        <div className={`register-toast ${toast.type}`}>
          <span className="register-toast-icon"></span>

          <div className="register-toast-content">
            <small>{toast.type === "success" ? "Tudo certo" : "Atenção"}</small>
            <strong>{toast.message}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;