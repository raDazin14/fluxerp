import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    description: "",
    sku: "",
    barcode: "",
    cost_price: "",
    sale_price: "",
    stock_quantity: "",
    min_stock: "",
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
      category_id: "",
      description: "",
      sku: "",
      barcode: "",
      cost_price: "",
      sale_price: "",
      stock_quantity: "",
      min_stock: "",
    });
  }

  function openCreateModal() {
    const companyId = getCompanyId();

    if (!companyId) {
      showToast("error", "Selecione uma empresa antes de cadastrar produto.");
      return;
    }

    setEditingProduct(null);
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      category_id: product.category_id || "",
      description: product.description || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      cost_price: product.cost_price || "",
      sale_price: product.sale_price || "",
      stock_quantity: product.stock_quantity || "",
      min_stock: product.min_stock || "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
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

  async function loadCategories() {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        setCategories([]);
        return;
      }

      const response = await api.get(`/categories?company_id=${companyId}`);
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const companyId = getCompanyId();

      if (!companyId) {
        showToast("error", "Selecione uma empresa antes de salvar produto.");
        return;
      }

      if (!form.name.trim()) {
        showToast("error", "Informe o nome do produto.");
        return;
      }

      const payload = {
        company_id: Number(companyId),
        category_id: form.category_id ? Number(form.category_id) : null,
        name: form.name.trim(),
        description: form.description.trim(),
        sku: form.sku.trim(),
        barcode: form.barcode.trim(),
        cost_price: Number(form.cost_price || 0),
        sale_price: Number(form.sale_price || 0),
        stock_quantity: Number(form.stock_quantity || 0),
        min_stock: Number(form.min_stock || 0),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        showToast("success", "Produto atualizado com sucesso.");
      } else {
        await api.post("/products", payload);
        showToast("success", "Produto cadastrado com sucesso.");
      }

      closeModal();
      loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      showToast(
        "error",
        error.response?.data?.message || "Erro ao salvar produto."
      );
    }
  }

  function handleDelete(product) {
    setProductToDelete(product);
  }

  async function confirmDeleteProduct() {
    if (!productToDelete) {
      return;
    }

    try {
      await api.delete(`/products/${productToDelete.id}`);

      setProductToDelete(null);
      await loadProducts();

      showToast("success", "Produto excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);

      showToast(
        "error",
        error.response?.data?.message ||
          "Erro ao excluir produto. Ele pode estar vinculado a uma venda."
      );
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();

    function handleCompanyChanged() {
      closeModal();
      loadProducts();
      loadCategories();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  return (
    <Layout>
      <div className="products-header">
        <div>
          <h1 className="page-title">Produtos</h1>
          <p className="page-subtitle">
            Cadastre, visualize e organize seus produtos por categoria.
          </p>
        </div>

        <div className="products-actions">
          <span className="badge">{products.length} produtos</span>

          <button className="btn-primary" onClick={openCreateModal}>
            + Novo produto
          </button>
        </div>
      </div>

      <div className="card products-list">
        <div className="products-list-header">
          <h2>Lista de produtos</h2>
          <span className="badge">Estoque atual</span>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">Nenhum produto cadastrado ainda.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th align="left">Produto</th>
                <th align="left">Categoria</th>
                <th align="left">SKU</th>
                <th align="left">Venda</th>
                <th align="left">Estoque</th>
                <th align="left">Mínimo</th>
                <th align="right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-name">{product.name}</div>
                    <div className="product-description">
                      {product.description || "Sem descrição"}
                    </div>
                  </td>

                  <td>
                    {product.category_name ? (
                      <span className="category-pill">
                        {product.category_name}
                      </span>
                    ) : (
                      <span className="category-empty">Sem categoria</span>
                    )}
                  </td>

                  <td>{product.sku || "-"}</td>

                  <td className="price">
                    {Number(product.sale_price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>

                  <td>
                    <span className="stock-pill">{product.stock_quantity}</span>
                  </td>

                  <td>{product.min_stock}</td>

                  <td align="right">
                    <button
                      className="action-button"
                      onClick={() => openEditModal(product)}
                    >
                      Editar
                    </button>{" "}

                    <button
                      className="action-button danger"
                      onClick={() => handleDelete(product)}
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
                <h2>{editingProduct ? "Editar produto" : "Novo produto"}</h2>
                <p>
                  {editingProduct
                    ? "Atualize as informações deste produto."
                    : "Adicione um novo item ao catálogo da empresa."}
                </p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="product-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nome</label>
                    <input
                      placeholder="Ex: Café arábica"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoria</label>
                    <select
                      value={form.category_id}
                      onChange={(e) =>
                        setForm({ ...form, category_id: e.target.value })
                      }
                    >
                      <option value="">Sem categoria</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full">
                    <label>Descrição</label>
                    <input
                      placeholder="Ex: Café premium 250g"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>SKU</label>
                    <input
                      placeholder="CAF-001"
                      value={form.sku}
                      onChange={(e) =>
                        setForm({ ...form, sku: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Código de barras</label>
                    <input
                      placeholder="789000000001"
                      value={form.barcode}
                      onChange={(e) =>
                        setForm({ ...form, barcode: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Preço de custo</label>
                    <input
                      placeholder="0,00"
                      type="number"
                      step="0.01"
                      value={form.cost_price}
                      onChange={(e) =>
                        setForm({ ...form, cost_price: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Preço de venda</label>
                    <input
                      placeholder="0,00"
                      type="number"
                      step="0.01"
                      value={form.sale_price}
                      onChange={(e) =>
                        setForm({ ...form, sale_price: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Estoque</label>
                    <input
                      placeholder="0"
                      type="number"
                      value={form.stock_quantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stock_quantity: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Estoque mínimo</label>
                    <input
                      placeholder="0"
                      type="number"
                      value={form.min_stock}
                      onChange={(e) =>
                        setForm({ ...form, min_stock: e.target.value })
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
                  {editingProduct ? "Salvar alterações" : "Salvar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon danger"></div>

            <h2>Excluir produto?</h2>

            <p>
              Você está prestes a excluir{" "}
              <strong>{productToDelete.name}</strong>. Essa ação não poderá ser
              desfeita.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setProductToDelete(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteProduct}
              >
                Excluir produto
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Products;