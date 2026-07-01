import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Companies.css";

function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const [form, setForm] = useState({
    name: "",
    document: "",
    phone: "",
    address: "",
  });

  function getSelectedCompanyId() {
    return localStorage.getItem("selectedCompanyId");
  }

  function showToast(type, message) {
    window.dispatchEvent(
      new CustomEvent("appToast", {
        detail: {
          type,
          message,
        },
      })
    );
  }

  function resetForm() {
    setForm({
      name: "",
      document: "",
      phone: "",
      address: "",
    });

    setEditingCompany(null);
  }

  async function loadCompanies() {
    try {
      const response = await api.get("/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      showToast("error", "Erro ao carregar empresas.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast("error", "Informe o nome da empresa.");
      return;
    }

    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany.id}`, {
          name: form.name.trim(),
          document: form.document.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        });

        showToast("success", "Empresa atualizada com sucesso.");
      } else {
        const isFirstCompany = companies.length === 0;

        const response = await api.post("/companies", {
          name: form.name.trim(),
          document: form.document.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        });

        const newCompany = response.data;

        localStorage.setItem("selectedCompanyId", String(newCompany.id));
        window.dispatchEvent(new Event("companyChanged"));

        if (isFirstCompany) {
          showToast(
            "success",
            "Empresa cadastrada. Você já pode começar a usar o painel."
          );

          setTimeout(() => {
            navigate("/dashboard");
          }, 800);
        } else {
          showToast("success", "Empresa cadastrada e selecionada com sucesso.");
        }
      }

      resetForm();
      loadCompanies();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);

      showToast(
        "error",
        error.response?.data?.message || "Erro ao salvar empresa."
      );
    }
  }

  function editCompany(company) {
    setEditingCompany(company);

    setForm({
      name: company.name || "",
      document: company.document || "",
      phone: company.phone || "",
      address: company.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteCompany(company) {
    const selectedCompanyId = getSelectedCompanyId();

    if (String(company.id) === String(selectedCompanyId)) {
      showToast("error", "Você não pode excluir a empresa selecionada agora.");
      return;
    }

    setCompanyToDelete(company);
  }

  async function confirmDeleteCompany() {
    if (!companyToDelete) {
      return;
    }

    try {
      await api.delete(`/companies/${companyToDelete.id}`);

      setCompanyToDelete(null);
      loadCompanies();

      showToast("success", "Empresa excluída com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);

      showToast(
        "error",
        error.response?.data?.message ||
          "Erro ao excluir empresa. Ela pode ter dados vinculados."
      );
    }
  }

  function selectCompany(companyId) {
    localStorage.setItem("selectedCompanyId", String(companyId));
    window.dispatchEvent(new Event("companyChanged"));
    loadCompanies();
    showToast("success", "Empresa selecionada com sucesso.");
  }

  useEffect(() => {
    loadCompanies();

    function handleCompanyChanged() {
      loadCompanies();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  return (
    <Layout>
      <div className="companies-header">
        <div>
          <h1 className="page-title">Empresas</h1>
          <p className="page-subtitle">
            Cadastre sua empresa para começar a usar produtos, clientes, vendas,
            estoque, financeiro e relatórios.
          </p>
        </div>

        <span className="badge">{companies.length} empresas</span>
      </div>

      {companies.length === 0 && (
        <div className="companies-onboarding">
          <div className="companies-onboarding-icon"></div>

          <div>
            <span>Primeiro passo</span>
            <strong>Cadastre sua primeira empresa</strong>
            <p>
              Para começar no FluxERP, adicione o nome da empresa ao lado. Depois
              disso, você já poderá cadastrar produtos, clientes e registrar
              vendas.
            </p>
          </div>
        </div>
      )}

      <div className="companies-grid">
        <div className="card company-form-card">
          <h2>{editingCompany ? "Editar empresa" : "Nova empresa"}</h2>
          <p>
            {editingCompany
              ? "Atualize os dados da empresa selecionada."
              : companies.length === 0
              ? "Essa será a empresa principal usada no seu painel."
              : "Adicione uma empresa para separar produtos, clientes e vendas."}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome da empresa</label>
              <input
                placeholder="Ex: Café Iraquara"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>CPF/CNPJ</label>
              <input
                placeholder="Ex: 00.000.000/0001-00"
                value={form.document}
                onChange={(e) =>
                  setForm({ ...form, document: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                placeholder="Ex: (74) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Endereço</label>
              <input
                placeholder="Cidade, rua ou referência"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            </div>

            <div className="company-form-actions">
              {editingCompany && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              )}

              <button className="btn-primary" type="submit">
                {editingCompany
                  ? "Salvar alterações"
                  : companies.length === 0
                  ? "Cadastrar primeira empresa"
                  : "+ Cadastrar empresa"}
              </button>
            </div>
          </form>
        </div>

        <div className="card companies-list-card">
          <div className="companies-list-header">
            <h2>Empresas cadastradas</h2>
            <span className="badge">
              {companies.length === 0 ? "Comece aqui" : "Selecione uma"}
            </span>
          </div>

          {companies.length === 0 ? (
            <div className="companies-empty-premium">
              <div className="companies-empty-icon"></div>
              <strong>Nenhuma empresa cadastrada</strong>
              <p>
                Preencha o formulário ao lado para criar sua primeira empresa e
                liberar o uso do painel.
              </p>

              <div className="companies-empty-steps">
                <span>1. Empresa</span>
                <span>2. Produtos</span>
                <span>3. Vendas</span>
              </div>
            </div>
          ) : (
            <div className="companies-list">
              {companies.map((company) => {
                const isSelected =
                  String(company.id) === String(getSelectedCompanyId());

                return (
                  <div
                    className={`company-item ${
                      isSelected ? "company-item-active" : ""
                    }`}
                    key={company.id}
                  >
                    <div className="company-item-main">
                      <div>
                        <strong>{company.name}</strong>

                        {isSelected && (
                          <span className="current-company-pill">
                            Empresa atual
                          </span>
                        )}
                      </div>

                      <span>{company.document || "Sem documento"}</span>
                      <small>{company.phone || "Sem telefone"}</small>
                    </div>

                    <div className="company-item-actions">
                      {!isSelected && (
                        <button
                          className="action-button"
                          onClick={() => selectCompany(company.id)}
                        >
                          Selecionar
                        </button>
                      )}

                      <button
                        className="action-button"
                        onClick={() => editCompany(company)}
                      >
                        Editar
                      </button>

                      <button
                        className="action-button danger"
                        onClick={() => deleteCompany(company)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {companyToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon danger"></div>

            <h2>Excluir empresa?</h2>

            <p>
              Você está prestes a excluir <strong>{companyToDelete.name}</strong>.
              Essa ação não poderá ser desfeita.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCompanyToDelete(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteCompany}
              >
                Excluir empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Companies;