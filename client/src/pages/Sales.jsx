import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Sales.css";

function Sales() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [cart, setCart] = useState([]);

  function getCompanyId() {
    return localStorage.getItem("selectedCompanyId");
  }

  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function dateBR(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function showToast(type, message) {
    window.dispatchEvent(
      new CustomEvent("appToast", {
        detail: { type, message },
      })
    );
  }

  function resetSaleForm() {
    setCustomerId("");
    setPaymentMethod("PIX");
    setSelectedProductId("");
    setQuantity(1);
    setCart([]);
  }

  async function loadData() {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        setProducts([]);
        setCustomers([]);
        setSales([]);
        return;
      }

      const [productsResponse, customersResponse, salesResponse] =
        await Promise.all([
          api.get(`/products?company_id=${companyId}`),
          api.get(`/customers?company_id=${companyId}`),
          api.get(`/sales?company_id=${companyId}`),
        ]);

      setProducts(productsResponse.data);
      setCustomers(customersResponse.data);
      setSales(salesResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados de vendas:", error);
      showToast("error", "Erro ao carregar dados de vendas.");
    }
  }

  function addToCart() {
    const companyId = getCompanyId();

    if (!companyId) {
      showToast("error", "Selecione uma empresa antes de vender.");
      return;
    }

    if (!selectedProductId) {
      showToast("error", "Selecione um produto.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      showToast("error", "Informe uma quantidade válida.");
      return;
    }

    const product = products.find(
      (item) => item.id === Number(selectedProductId)
    );

    if (!product) {
      showToast("error", "Produto não encontrado.");
      return;
    }

    if (Number(product.stock_quantity) < Number(quantity)) {
      showToast("error", "Quantidade maior que o estoque disponível.");
      return;
    }

    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + Number(quantity);

      if (newQuantity > Number(product.stock_quantity)) {
        showToast(
          "error",
          "Quantidade total no carrinho passa do estoque disponível."
        );
        return;
      }

      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      showToast("success", "Quantidade atualizada no carrinho.");
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          sale_price: Number(product.sale_price),
          quantity: Number(quantity),
          stock_quantity: Number(product.stock_quantity),
        },
      ]);

      showToast("success", "Produto adicionado ao carrinho.");
    }

    setSelectedProductId("");
    setQuantity(1);
  }

  function removeFromCart(productId) {
    setCart(cart.filter((item) => item.product_id !== productId));
    showToast("success", "Produto removido do carrinho.");
  }

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + item.sale_price * item.quantity;
    }, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  }, [cart]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;

    return products.find((product) => product.id === Number(selectedProductId));
  }, [products, selectedProductId]);

  async function finishSale() {
    const companyId = getCompanyId();

    if (!companyId) {
      showToast("error", "Selecione uma empresa antes de finalizar venda.");
      return;
    }

    if (cart.length === 0) {
      showToast("error", "Adicione pelo menos um produto ao carrinho.");
      return;
    }

    try {
      await api.post("/sales", {
        company_id: Number(companyId),
        customer_id: customerId ? Number(customerId) : null,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      showToast("success", "Venda finalizada com sucesso.");

      resetSaleForm();
      loadData();
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      showToast(
        "error",
        error.response?.data?.message || "Erro ao finalizar venda."
      );
    }
  }

  useEffect(() => {
    loadData();

    function handleCompanyChanged() {
      resetSaleForm();
      loadData();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  return (
    <Layout>
      <div className="sales-page">
        <div className="sales-hero">
          <div>
            <span className="sales-kicker">PDV FluxERP</span>
            <h1 className="page-title">Vendas</h1>
            <p className="page-subtitle">
              Registre vendas, calcule o total e baixe o estoque automaticamente.
            </p>
          </div>

          <div className="sales-hero-panel">
            <small>Total em andamento</small>
            <strong>{money(total)}</strong>
            <span>{totalItems} item(ns) no carrinho</span>
          </div>
        </div>

        <div className="sales-grid">
          <div className="card sale-card">
            <div className="sale-card-header">
              <div>
                <h2>Nova venda</h2>
                <p>Escolha cliente, pagamento e adicione produtos.</p>
              </div>

              <span className="sale-step">01</span>
            </div>

            <div className="sale-form-section">
              <div className="form-group">
                <label>Cliente</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Venda sem cliente</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Forma de pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="PIX">PIX</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="sale-product-box">
              <div className="sale-product-header">
                <div>
                  <h3>Adicionar produto</h3>
                  <p>Selecione um item disponível no estoque.</p>
                </div>
              </div>

              <div className="sale-form-grid">
                <div className="form-group">
                  <label>Produto</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
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
                  <label>Qtd.</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
              </div>

              {selectedProduct && (
                <div className="selected-product-preview">
                  <div>
                    <strong>{selectedProduct.name}</strong>
                    <span>Estoque disponível: {selectedProduct.stock_quantity}</span>
                  </div>

                  <strong>{money(selectedProduct.sale_price)}</strong>
                </div>
              )}

              <button className="btn-primary add-cart-button" onClick={addToCart}>
                Adicionar ao carrinho
              </button>
            </div>
          </div>

          <div className="card sale-card cart-card">
            <div className="sale-card-header">
              <div>
                <h2>Carrinho</h2>
                <p>Confira os itens antes de finalizar.</p>
              </div>

              <span className="sale-step">02</span>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state">Nenhum item no carrinho.</div>
            ) : (
              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.product_id}>
                    <div className="cart-item-main">
                      <strong>{item.name}</strong>
                      <span>
                        {item.quantity} x {money(item.sale_price)}
                      </span>
                    </div>

                    <div className="cart-item-side">
                      <strong>{money(item.sale_price * item.quantity)}</strong>

                      <button
                        className="cart-remove"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="total-box">
              <span>Total da venda</span>
              <h2>{money(total)}</h2>

              <div className="total-details">
                <small>{cart.length} produto(s)</small>
                <small>{totalItems} unidade(s)</small>
              </div>
            </div>

            <button className="btn-primary finish-sale-button" onClick={finishSale}>
              Finalizar venda
            </button>
          </div>
        </div>

        <div className="card sales-history">
          <div className="sales-history-header">
            <div>
              <h2>Histórico de vendas</h2>
              <p>Últimas vendas registradas na empresa selecionada.</p>
            </div>

            <span className="badge">{sales.length} vendas</span>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">Nenhuma venda registrada ainda.</div>
          ) : (
            <table className="table sales-table">
              <thead>
                <tr>
                  <th align="left">Venda</th>
                  <th align="left">Cliente</th>
                  <th align="left">Pagamento</th>
                  <th align="right">Total</th>
                  <th align="left">Data</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <span className="sale-code">#{sale.id}</span>
                    </td>

                    <td>{sale.customer_name || "Sem cliente"}</td>

                    <td>
                      <span className="payment-pill">
                        {sale.payment_method || "-"}
                      </span>
                    </td>

                    <td align="right" className="price">
                      {money(sale.total)}
                    </td>

                    <td>{dateBR(sale.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Sales;
