import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Stock.css";

function Stock() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movementType, setMovementType] = useState("entry");

  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    reason: "",
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
      product_id: "",
      quantity: "",
      reason: "",
    });
  }

  function openModal(type) {
    const companyId = getCompanyId();

    if (!companyId) {
      showToast("error", "Selecione uma empresa antes de movimentar estoque.");
      return;
    }

    setMovementType(type);
    resetForm();
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    resetForm();
  }

  async function loadProducts() {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        setProducts([]);
        return;
      }

      const response = await api.get(`/products?company_id=${companyId}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  }

  async function loadMovements() {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        setMovements([]);
        return;
      }

      const response = await api.get(`/stock/movements?company_id=${companyId}`);
      setMovements(response.data);
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);
    }
  }

  async function loadStockData() {
    await Promise.all([loadProducts(), loadMovements()]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const companyId = getCompanyId();

      if (!companyId) {
        showToast("error", "Selecione uma empresa antes de movimentar estoque.");
        return;
      }

      if (!form.product_id) {
        showToast("error", "Selecione um produto.");
        return;
      }

      if (!form.quantity || Number(form.quantity) <= 0) {
        showToast("error", "Informe uma quantidade maior que zero.");
        return;
      }

      const endpoint =
        movementType === "entry" ? "/stock/entry" : "/stock/exit";

      await api.post(endpoint, {
        company_id: Number(companyId),
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        reason: form.reason,
      });

      showToast(
        "success",
        movementType === "entry"
          ? "Entrada de estoque registrada com sucesso."
          : "Saída de estoque registrada com sucesso."
      );

      closeModal();
      loadStockData();
    } catch (error) {
      console.error("Erro ao movimentar estoque:", error);
      showToast(
        "error",
        error.response?.data?.message || "Erro ao movimentar estoque."
      );
    }
  }

  useEffect(() => {
    loadStockData();

    function handleCompanyChanged() {
      closeModal();
      loadStockData();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  return (
    <Layout>
      <div className="stock-header">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="page-subtitle">
            Controle entradas, saídas e acompanhe o histórico dos produtos.
          </p>
        </div>

        <div className="stock-actions">
          <button className="btn-secondary" onClick={() => openModal("exit")}>
            - Saída
          </button>

          <button className="btn-primary" onClick={() => openModal("entry")}>
            + Entrada
          </button>
        </div>
      </div>

      <div className="card stock-list">
        <div className="stock-list-header">
          <h2>Histórico de estoque</h2>
          <span className="badge">{movements.length} movimentações</span>
        </div>

        {movements.length === 0 ? (
          <div className="empty-state">
            Nenhuma movimentação registrada ainda.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th align="left">Tipo</th>
                <th align="left">Produto</th>
                <th align="left">Quantidade</th>
                <th align="left">Motivo</th>
                <th align="left">Data</th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td>
                    <span className={`movement-type ${movement.type}`}>
                      {movement.type === "entry" ? "Entrada" : "Saída"}
                    </span>
                  </td>

                  <td>
                    <strong>{movement.product_name}</strong>
                  </td>

                  <td
                    className={
                      movement.type === "entry"
                        ? "quantity-entry"
                        : "quantity-exit"
                    }
                  >
                    {movement.type === "entry" ? "+" : "-"}
                    {movement.quantity}
                  </td>

                  <td>{movement.reason || "-"}</td>

                  <td>
                    {movement.created_at
                      ? new Date(movement.created_at).toLocaleDateString(
                          "pt-BR"
                        )
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>
                  {movementType === "entry"
                    ? "Entrada de estoque"
                    : "Saída de estoque"}
                </h2>
                <p>
                  {movementType === "entry"
                    ? "Adicione unidades ao estoque de um produto."
                    : "Remova unidades do estoque de um produto."}
                </p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="product-form">
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Produto</label>
                    <select
                      value={form.product_id}
                      onChange={(e) =>
                        setForm({ ...form, product_id: e.target.value })
                      }
                    >
                      <option value="">Selecione um produto</option>

                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — Estoque: {product.stock_quantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantidade</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="1"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group full">
                    <label>Motivo</label>
                    <input
                      placeholder={
                        movementType === "entry"
                          ? "Ex: Compra de mercadoria"
                          : "Ex: Perda, ajuste ou retirada"
                      }
                      value={form.reason}
                      onChange={(e) =>
                        setForm({ ...form, reason: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>

                <button className="btn-primary" type="submit">
                  Confirmar {movementType === "entry" ? "entrada" : "saída"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Stock;