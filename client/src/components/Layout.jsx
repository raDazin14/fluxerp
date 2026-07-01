import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Layout.css";

function BrandLogo() {
  return (
    <div className="sidebar-brand-logo">
      <div className="brand-symbol sidebar-brand-symbol">
        <div className="flux-shape flux-shape-one"></div>
        <div className="flux-shape flux-shape-two"></div>
        <div className="flux-shape flux-shape-three"></div>

        <div className="brand-bars">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="brand-text sidebar-brand-text">
        <div className="brand-name">FluxERP</div>
        <div className="brand-subtitle">Gestão inteligente</div>
      </div>
    </div>
  );
}

function Layout({ children }) {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [toast, setToast] = useState(null);

  const [selectedCompanyId, setSelectedCompanyId] = useState(
    localStorage.getItem("selectedCompanyId") || ""
  );

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  async function loadCompanies() {
    try {
      const response = await api.get("/companies");
      const companyList = response.data;

      setCompanies(companyList);

      if (companyList.length > 0) {
        const savedCompanyId = localStorage.getItem("selectedCompanyId");

        const savedCompanyExists = companyList.some(
          (company) => String(company.id) === String(savedCompanyId)
        );

        if (savedCompanyId && savedCompanyExists) {
          setSelectedCompanyId(savedCompanyId);
        } else {
          const firstCompanyId = String(companyList[0].id);

          localStorage.setItem("selectedCompanyId", firstCompanyId);
          setSelectedCompanyId(firstCompanyId);

          window.dispatchEvent(new Event("companyChanged"));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  }

  function showAppToast(type, message) {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  function handleCompanyChange(event) {
    const companyId = event.target.value;

    localStorage.setItem("selectedCompanyId", companyId);
    setSelectedCompanyId(companyId);

    window.dispatchEvent(new Event("companyChanged"));

    showAppToast("success", "Empresa alterada com sucesso.");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedCompanyId");

    navigate("/login");
  }

  useEffect(() => {
    loadCompanies();

    function handleAppToast(event) {
      const { type, message } = event.detail;

      showAppToast(type, message);
    }

    window.addEventListener("appToast", handleAppToast);

    return () => {
      window.removeEventListener("appToast", handleAppToast);
    };
  }, []);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <BrandLogo />

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">
            <span className="nav-icon nav-dashboard"></span>
            Dashboard
          </NavLink>

          <NavLink to="/companies">
            <span className="nav-icon nav-companies"></span>
            Empresas
          </NavLink>

          <NavLink to="/products">
            <span className="nav-icon nav-products"></span>
            Produtos
          </NavLink>

          <NavLink to="/customers">
            <span className="nav-icon nav-customers"></span>
            Clientes
          </NavLink>

          <NavLink to="/sales">
            <span className="nav-icon nav-sales"></span>
            Vendas
          </NavLink>

          <NavLink to="/stock">
            <span className="nav-icon nav-stock"></span>
            Estoque
          </NavLink>

          <NavLink to="/categories">
            <span className="nav-icon nav-categories"></span>
            Categorias
          </NavLink>

          <NavLink to="/financial">
            <span className="nav-icon nav-financial"></span>
            Financeiro
          </NavLink>

          <NavLink to="/reports">
            <span className="nav-icon nav-reports"></span>
            Relatórios
          </NavLink>

          <NavLink to="/profile">
            <span className="nav-icon nav-profile"></span>
            Perfil
          </NavLink>
        </nav>

        <div className="sidebar-user-box">
          <div className="sidebar-user-avatar">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>{user?.name || "Usuário"}</strong>
            <span>Conta Ativa</span>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <div className="topbar-kicker">Painel de controle</div>
            <strong>Bem-vindo ao FluxERP</strong>
            <span>Gerencie vendas, estoque, clientes e lucro em tempo real.</span>
          </div>

          <div className="topbar-actions">
            <div className="topbar-date">
              <small>Hoje</small>
              <strong>
                {new Date().toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </div>

            <div className="company-switcher">
              <label>Empresa</label>

              <select value={selectedCompanyId} onChange={handleCompanyChange}>
                {companies.length === 0 ? (
                  <option value="">Nenhuma empresa</option>
                ) : (
                  companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </header>

        <section className="content-area">{children}</section>
      </main>

      {toast && (
        <div className={`app-toast ${toast.type}`}>
          <span className="app-toast-icon"></span>

          <div className="app-toast-content">
            <small>{toast.type === "success" ? "Tudo certo" : "Atenção"}</small>
            <strong>{toast.message}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;