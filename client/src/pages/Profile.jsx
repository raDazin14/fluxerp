import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  });

  const [selectedCompany, setSelectedCompany] = useState(null);

  function showToast(type, message) {
    window.dispatchEvent(
      new CustomEvent("appToast", {
        detail: { type, message },
      })
    );
  }

  async function loadSelectedCompany() {
    try {
      const selectedCompanyId = localStorage.getItem("selectedCompanyId");

      if (!selectedCompanyId) {
        setSelectedCompany(null);
        return;
      }

      const response = await api.get("/companies");

      const company = response.data.find(
        (item) => String(item.id) === String(selectedCompanyId)
      );

      setSelectedCompany(company || null);
    } catch (error) {
      console.error("Erro ao carregar empresa selecionada:", error);
      setSelectedCompany(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedCompanyId");

    navigate("/login");
  }

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);

    loadSelectedCompany();

    function handleCompanyChanged() {
      loadSelectedCompany();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-hero">
          <div>
            <span className="profile-kicker">Minha conta</span>
            <h1>Perfil</h1>
            <p>
              Veja os dados da sua conta, empresa ativa e informações principais
              do acesso ao FluxERP.
            </p>
          </div>

          <div className="profile-hero-avatar">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card profile-user-card">
            <div className="profile-card-header">
              <div>
                <h2>Dados do usuário</h2>
                <p>Informações usadas para acessar o sistema.</p>
              </div>
            </div>

            <div className="profile-user-main">
              <div className="profile-user-avatar">
                {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user?.name || "Usuário FluxERP"}</strong>
                <span>{user?.email || "E-mail não informado"}</span>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <span>Nome</span>
                <strong>{user?.name || "Não informado"}</strong>
              </div>

              <div className="profile-info-item">
                <span>E-mail</span>
                <strong>{user?.email || "Não informado"}</strong>
              </div>

              <div className="profile-info-item">
                <span>Status</span>
                <strong className="profile-status-active">Conta ativa</strong>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Empresa ativa</h2>
                <p>Empresa selecionada atualmente no painel.</p>
              </div>
            </div>

            <div className="profile-company-box">
              <div className="profile-company-icon"></div>

              <div>
                <strong>
                  {selectedCompany?.name || "Nenhuma empresa selecionada"}
                </strong>
                <span>
                  {selectedCompany
                    ? "Os dados do painel estão usando essa empresa."
                    : "Selecione ou cadastre uma empresa para começar."}
                </span>
              </div>
            </div>

            <button
              className="profile-secondary-button"
              type="button"
              onClick={() => navigate("/companies")}
            >
              Gerenciar empresas
            </button>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Plano atual</h2>
                <p>Controle comercial do FluxERP.</p>
              </div>
            </div>

            <div className="profile-plan-box">
              <span>Plano</span>
              <strong>Teste gratuito</strong>
              <p>
                Ideal para validar o sistema antes de ativar uma assinatura.
              </p>
            </div>

            <button
              className="profile-secondary-button"
              type="button"
              onClick={() =>
                showToast("success", "Área de planos será ativada em breve.")
              }
            >
              Ver planos
            </button>
          </div>

          <div className="profile-card danger">
            <div className="profile-card-header">
              <div>
                <h2>Segurança</h2>
                <p>Gerencie sua sessão atual.</p>
              </div>
            </div>

            <div className="profile-security-box">
              <strong>Sair da conta</strong>
              <span>
                Ao sair, será necessário fazer login novamente para acessar o
                painel.
              </span>
            </div>

            <button
              className="profile-danger-button"
              type="button"
              onClick={handleLogout}
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;