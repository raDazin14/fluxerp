import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  function getCompanyId() {
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
      email: "",
      phone: "",
      address: "",
    });

    setEditingCustomer(null);
  }

  async function loadCustomers() {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        setCustomers([]);
        return;
      }

      const response = await api.get(`/customers?company_id=${companyId}`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      showToast("error", "Erro ao carregar clientes.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const companyId = getCompanyId();

    if (!companyId) {
      showToast("error", "Selecione uma empresa antes de cadastrar clientes.");
      return;
    }

    if (!form.name.trim()) {
      showToast("error", "Informe o nome do cliente.");
      return;
    }

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          company_id: companyId,
        });

        showToast("success", "Cliente atualizado com sucesso.");
      } else {
        await api.post("/customers", {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          company_id: companyId,
        });

        showToast("success", "Cliente cadastrado com sucesso.");
      }

      resetForm();
      loadCustomers();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);

      showToast(
        "error",
        error.response?.data?.message || "Erro ao salvar cliente."
      );
    }
  }

  function editCustomer(customer) {
    setEditingCustomer(customer);

    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteCustomer(customer) {
    setCustomerToDelete(customer);
  }

  async function confirmDeleteCustomer() {
    if (!customerToDelete) {
      return;
    }

    try {
      await api.delete(`/customers/${customerToDelete.id}`);

      setCustomerToDelete(null);
      loadCustomers();

      showToast("success", "Cliente excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);

      showToast(
        "error",
        error.response?.data?.message ||
          "Erro ao excluir cliente. Ele pode ter vendas vinculadas."
      );
    }
  }

  useEffect(() => {
    loadCustomers();

    function handleCompanyChanged() {
      resetForm();
      loadCustomers();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  return (
    <Layout>
      <div className="customers-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">
            Cadastre e organize os clientes da empresa selecionada.
          </p>
        </div>

        <div className="customers-actions">
          <span className="badge">{customers.length} clientes</span>
        </div>
      </div>

      <div className="card form-card">
        <h2>{editingCustomer ? "Editar cliente" : "Novo cliente"}</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Nome</label>
            <input
              placeholder="Ex: João Silva"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="cliente@email.com"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              placeholder="Ex: (74) 99999-9999"
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input
              placeholder="Cidade, rua ou referência"
              value={form.address}
              onChange={(event) =>
                setForm({ ...form, address: event.target.value })
              }
            />
          </div>

          <div className="form-actions">
            {editingCustomer && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            )}

            <button className="btn-primary" type="submit">
              {editingCustomer ? "Salvar alterações" : "+ Cadastrar cliente"}
            </button>
          </div>
        </form>
      </div>

      <div className="card customers-list">
        <div className="customers-list-header">
          <h2>Clientes cadastrados</h2>
          <span className="badge">{customers.length}</span>
        </div>

        {customers.length === 0 ? (
          <div className="empty-state">
            Nenhum cliente cadastrado ainda.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th align="left">Nome</th>
                <th align="left">E-mail</th>
                <th align="left">Telefone</th>
                <th align="left">Endereço</th>
                <th align="right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="customer-name">{customer.name}</td>

                  <td className="customer-info">
                    {customer.email || "Sem e-mail"}
                  </td>

                  <td className="customer-phone">
                    {customer.phone || "Sem telefone"}
                  </td>

                  <td className="customer-info">
                    {customer.address || "Sem endereço"}
                  </td>

                  <td align="right">
                    <button
                      className="action-button"
                      type="button"
                      onClick={() => editCustomer(customer)}
                    >
                      Editar
                    </button>

                    <button
                      className="action-button danger"
                      type="button"
                      onClick={() => deleteCustomer(customer)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {customerToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon danger"></div>

            <h2>Excluir cliente?</h2>

            <p>
              Você está prestes a excluir{" "}
              <strong>{customerToDelete.name}</strong>. Essa ação não poderá ser
              desfeita.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCustomerToDelete(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteCustomer}
              >
                Excluir cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Customers;