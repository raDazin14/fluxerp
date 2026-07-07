import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Purchases.css";

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  const [form, setForm] = useState({
    product_id: "",
    supplier_name: "",
    purchase_date: new Date().toISOString().slice(0, 10),
    quantity: "",
    unit: "UN",
    unit_price: "",
    total_price: "",
    notes: "",
  });

  function getCompanyId() {
    return localStorage.getItem("selectedCompanyId");
  }

  function showToast(type, message) {
    window.dispatchEvent(
      new CustomEvent("appToast", {
        detail: { type, message },
      })
    );
  }

  function resetForm() {
    setForm({
      product_id: "",
      supplier_name: "",
      purchase_date: new Date().toISOString().slice(0, 10),
      quantity: "",
      unit: "UN",
      unit_price: "",
      total_price: "",
      notes: "",
    });
  }

  function openModal() {
    const companyId = getCompanyId();

    if (!companyId) {
      showToast("error", "Selecione uma empresa antes de registrar compra.");
      return;
    }

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

  async function loadPurchases() {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        setPurchases([]);
        return;
      }

      const response = await api.get(`/purchases?company_id=${companyId}`);
      setPurchases(response.data);
    } catch (error) {
      console.error("Erro ao carregar compras:", error);
    }
  }

  async function loadData() {
    await Promise.all([loadProducts(), loadPurchases()]);
  }

  function handleQuantityChange(value) {
    const quantity = Number(value || 0);
    const unitPrice = Number(form.unit_price || 0);

    setForm({
      ...form,
      quantity: value,
      total_price: quantity && unitPrice ? String(quantity * unitPrice) : "",
    });
  }

  function handleUnitPriceChange(value) {
    const quantity = Number(form.quantity || 0);
    const unitPrice = Number(value || 0);

    setForm({
      ...form,
      unit_price: value,
      total_price: quantity && unitPrice ? String(quantity * unitPrice) : "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const companyId = getCompanyId();

      if (!companyId) {
        showToast("error", "Selecione uma empresa antes de registrar compra.");
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

      const payload = {
        company_id: Number(companyId),
        product_id: Number(form.product_id),
        supplier_name: form.supplier_name.trim(),
        purchase_date: form.purchase_date,
        quantity: Number(form.quantity || 0),
        unit: form.unit,
        unit_price: Number(form.unit_price || 0),
        total_price: Number(form.total_price || 0),
        notes: form.notes.trim(),
      };

      await api.post("/purchases", payload);

      showToast("success", "Compra registrada e estoque atualizado.");

      closeModal();
      loadData();
    } catch (error) {
      console.error("Erro ao registrar compra:", error);

      showToast(
        "error",
        error.response?.data?.message || "Erro ao registrar compra."
      );
    }
  }

  async function confirmDeletePurchase() {
    if (!purchaseToDelete) return;

    try {
      await api.delete(`/purchases/${purchaseToDelete.id}`);

      setPurchaseToDelete(null);
      await loadData();

      showToast("success", "Compra excluída e estoque ajustado.");
    } catch (error) {
      console.error("Erro ao excluir compra:", error);

      showToast(
        "error",
        error.response?.data?.message || "Erro ao excluir compra."
      );
    }
  }

  useEffect(() => {
    loadData();

    function handleCompanyChanged() {
      closeModal();
      loadData();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  return (
    <Layout>
      <div className="purchases-header">
        <div>
          <h1 className="page-title">Compras</h1>
          <p className="page-subtitle">
            Registre compras de mercadorias e atualize o estoque automaticamente.
          </p>
        </div>

        <div className="purchases-actions">
          <span className="badge">{purchases.length} compras</span>

          <button className="btn-primary" onClick={openModal}>
            + Nova compra
          </button>
        </div>
      </div>

      <div className="card purchases-list">
        <div className="purchases-list-header">
          <h2>Histórico de compras</h2>
          <span className="badge">Entrada no estoque</span>
        </div>

        {purchases.length === 0 ? (
          <div className="empty-state">Nenhuma compra registrada ainda.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th align="left">Produto</th>
                <th align="left">Fornecedor/Cliente</th>
                <th align="left">Quantidade</th>
                <th align="left">Valor unit.</th>
                <th align="left">Total</th>
                <th align="left">Data</th>
                <th align="right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>
                    <strong>{purchase.product_name}</strong>
                    <div className="purchase-note">
                      {purchase.notes || "Sem observação"}
                    </div>
                  </td>

                  <td>{purchase.supplier_name || "-"}</td>

                  <td>
                    <span className="purchase-quantity">
                      +{Number(purchase.quantity).toLocaleString("pt-BR")}{" "}
                      {purchase.unit || "UN"}
                    </span>
                  </td>

                  <td>
                    {Number(purchase.unit_price || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>

                  <td className="purchase-total">
                    {Number(purchase.total_price || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>

                  <td>
                    {purchase.purchase_date
                      ? new Date(purchase.purchase_date).toLocaleDateString(
                          "pt-BR"
                        )
                      : "-"}
                  </td>

                  <td align="right">
                    <button
                      className="action-button danger"
                      onClick={() => setPurchaseToDelete(purchase)}
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

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Nova compra</h2>
                <p>
                  Registre uma compra para aumentar automaticamente o estoque do
                  produto.
                </p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="purchase-form">
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

                  <div className="form-group full">
                    <label>Fornecedor ou cliente</label>
                    <input
                      placeholder="Ex: João Produtor, Fazenda Boa Vista..."
                      value={form.supplier_name}
                      onChange={(e) =>
                        setForm({ ...form, supplier_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Data da compra</label>
                    <input
                      type="date"
                      value={form.purchase_date}
                      onChange={(e) =>
                        setForm({ ...form, purchase_date: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantidade</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Ex: 30"
                      value={form.quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Unidade</label>
                    <select
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                    >
                      <option value="UN">UN</option>
                      <option value="KG">KG</option>
                      <option value="G">G</option>
                      <option value="L">L</option>
                      <option value="CX">CX</option>
                      <option value="PC">PC</option>
                      <option value="SC">SC</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Valor unitário</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.unit_price}
                      onChange={(e) => handleUnitPriceChange(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Valor total</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.total_price}
                      onChange={(e) =>
                        setForm({ ...form, total_price: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group full">
                    <label>Observação</label>
                    <input
                      placeholder="Ex: Compra de café em kg para torra"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
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
                  Registrar compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {purchaseToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon danger"></div>

            <h2>Excluir compra?</h2>

            <p>
              Essa compra será removida e o estoque de{" "}
              <strong>{purchaseToDelete.product_name}</strong> será reduzido na
              mesma quantidade.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPurchaseToDelete(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeletePurchase}
              >
                Excluir compra
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Purchases;