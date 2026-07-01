import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Categories.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [form, setForm] = useState({
    name: "",
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
    });
  }

  function openCreateModal() {
    const companyId = getCompanyId();

    if (!companyId) {
      showToast("error", "Selecione uma empresa antes de cadastrar categoria.");
      return;
    }

    setEditingCategory(null);
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCategory(null);
    resetForm();
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

      showToast(
        "error",
        error.response?.data?.message || "Erro ao carregar categorias."
      );
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const companyId = getCompanyId();

      if (!companyId) {
        showToast("error", "Selecione uma empresa antes de salvar categoria.");
        return;
      }

      if (!form.name.trim()) {
        showToast("error", "Informe o nome da categoria.");
        return;
      }

      const payload = {
        company_id: Number(companyId),
        name: form.name,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        showToast("success", "Categoria atualizada com sucesso.");
      } else {
        await api.post("/categories", payload);
        showToast("success", "Categoria cadastrada com sucesso.");
      }

      closeModal();
      loadCategories();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);

      showToast(
        "error",
        error.response?.data?.message || "Erro ao salvar categoria."
      );
    }
  }

  function handleDelete(category) {
    setCategoryToDelete(category);
  }

  async function confirmDeleteCategory() {
    if (!categoryToDelete) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryToDelete.id}`);

      setCategoryToDelete(null);
      await loadCategories();

      showToast("success", "Categoria excluída com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);

      showToast(
        "error",
        error.response?.data?.message ||
          "Erro ao excluir categoria. Ela pode estar vinculada a produtos."
      );
    }
  }

  useEffect(() => {
    loadCategories();

    function handleCompanyChanged() {
      closeModal();
      setCategoryToDelete(null);
      loadCategories();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  return (
    <Layout>
      <div className="categories-header">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="page-subtitle">
            Organize seus produtos por grupos e segmentos.
          </p>
        </div>

        <div className="categories-actions">
          <span className="badge">{categories.length} categorias</span>

          <button className="btn-primary" onClick={openCreateModal}>
            + Nova categoria
          </button>
        </div>
      </div>

      <div className="card categories-list">
        <div className="categories-list-header">
          <h2>Lista de categorias</h2>
          <span className="badge">Organização</span>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">Nenhuma categoria cadastrada ainda.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th align="left">Categoria</th>
                <th align="left">Criada em</th>
                <th align="right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="category-name">{category.name}</div>
                  </td>

                  <td>
                    {category.created_at
                      ? new Date(category.created_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>

                  <td align="right">
                    <button
                      className="action-button"
                      onClick={() => openEditModal(category)}
                    >
                      Editar
                    </button>{" "}

                    <button
                      className="action-button danger"
                      onClick={() => handleDelete(category)}
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
                <h2>
                  {editingCategory ? "Editar categoria" : "Nova categoria"}
                </h2>
                <p>
                  {editingCategory
                    ? "Atualize o nome desta categoria."
                    : "Crie uma nova categoria para organizar seus produtos."}
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
                    <label>Nome da categoria</label>
                    <input
                      placeholder="Ex: Roupas, Bebidas, Eletrônicos"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
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
                  {editingCategory ? "Salvar alterações" : "Salvar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon danger"></div>

            <h2>Excluir categoria?</h2>

            <p>
              Você está prestes a excluir{" "}
              <strong>{categoryToDelete.name}</strong>. Essa ação não poderá
              ser desfeita.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCategoryToDelete(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteCategory}
              >
                Excluir categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Categories;
