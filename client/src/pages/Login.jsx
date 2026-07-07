import { useState } from "react";
import { Activity, BarChart3 } from "lucide-react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function BrandLogo({ className = "" }) {
  return (
    <div className={`brand-logo brand-logo-premium ${className}`}>
      <div className="brand-symbol">
        <Activity className="brand-main-icon" size={28} strokeWidth={2.8} />
        <BarChart3 className="brand-mini-icon" size={15} strokeWidth={3} />
      </div>

      <div className="brand-text">
        <div className="brand-name">FluxERP</div>
        <div className="brand-subtitle">Gestão inteligente</div>
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();

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

  async function handleLogin(event) {
    event.preventDefault();

    if (!email.trim()) {
      showToast("error", "Informe seu e-mail.");
      return;
    }

    if (!password.trim()) {
      showToast("error", "Informe sua senha.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      showToast("success", "Login realizado com sucesso.");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      showToast("error", "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-logo">
          <BrandLogo />
        </div>

        <div className="login-content">
          <div className="login-pill">Sistema SaaS de gestão</div>

          <h2>Controle lucro, vendas e estoque em tempo real.</h2>

          <p>
            Um painel moderno para acompanhar faturamento, custo das mercadorias,
            margem de lucro, clientes, produtos e vendas em um só lugar.
          </p>

          <div className="login-preview">
            <div className="preview-header">
              <div className="preview-dot red"></div>
              <div className="preview-dot yellow"></div>
              <div className="preview-dot green"></div>
            </div>

            <div className="preview-cards">
              <div className="preview-card active">
                <span>Faturamento</span>
                <strong>R$ 12.480</strong>
              </div>

              <div className="preview-card">
                <span>Lucro bruto</span>
                <strong>R$ 6.920</strong>
              </div>

              <div className="preview-card">
                <span>Margem</span>
                <strong>55,4%</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer">© 2026 FluxERP — Gestão inteligente</div>
      </section>

      <section className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-card-badge">Acesso seguro</div>

          <h2>Entrar no painel</h2>
          <p>Acesse sua área de gestão e acompanhe seu negócio.</p>

          <div className="login-form">
            <div className="login-field">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="login-field">
              <label>Senha</label>
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? (
                <span className="login-button-loading">
                  <i></i>
                  Entrando...
                </span>
              ) : (
                "Acessar dashboard"
              )}
            </button>
          </div>

          <Link className="login-create-account-button" to="/register">
            Criar conta grátis
          </Link>

          <div className="login-demo">
            <strong>Acesso protegido</strong>
            <br />
            Seus dados são protegidos e usados apenas para acessar sua conta.
          </div>
        </form>
      </section>

      {toast && (
        <div className={`login-toast ${toast.type}`}>
          <span className="login-toast-icon"></span>

          <div className="login-toast-content">
            <small>{toast.type === "success" ? "Tudo certo" : "Atenção"}</small>
            <strong>{toast.message}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;