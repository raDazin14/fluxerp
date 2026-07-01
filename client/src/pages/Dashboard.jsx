import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import PageLoading from "../components/PageLoading";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    total_products: 0,
    total_customers: 0,
    total_sales: 0,
    total_revenue: 0,
    low_stock_products: [],
  });

  const [financial, setFinancial] = useState({
    total_revenue: 0,
    total_cost: 0,
    gross_profit: 0,
    profit_margin: 0,
    sales: [],
  });

  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

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

  function resetDashboard() {
    setDashboard({
      total_products: 0,
      total_customers: 0,
      total_sales: 0,
      total_revenue: 0,
      low_stock_products: [],
    });

    setFinancial({
      total_revenue: 0,
      total_cost: 0,
      gross_profit: 0,
      profit_margin: 0,
      sales: [],
    });
  }

  async function loadDashboard() {
    try {
      setLoading(true);

      const companyId = getCompanyId();

      if (!companyId) {
        resetDashboard();
        return;
      }

      const [dashboardResponse, financialResponse] = await Promise.all([
        api.get(`/dashboard?company_id=${companyId}`),
        api.get(`/financial?company_id=${companyId}`),
      ]);

      setDashboard(dashboardResponse.data);
      setFinancial(financialResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      showToast("error", "Erro ao carregar o dashboard.");
      resetDashboard();
    } finally {
      setLoading(false);
    }
  }

  const sales = useMemo(() => {
    return Array.isArray(financial.sales) ? financial.sales : [];
  }, [financial.sales]);

  const lowStockProducts = useMemo(() => {
    return Array.isArray(dashboard.low_stock_products)
      ? dashboard.low_stock_products
      : [];
  }, [dashboard.low_stock_products]);

  const ticketAverage = useMemo(() => {
    if (Number(dashboard.total_sales) <= 0) {
      return 0;
    }

    return Number(financial.total_revenue || 0) / Number(dashboard.total_sales);
  }, [dashboard.total_sales, financial.total_revenue]);

  const recentSales = useMemo(() => {
    return [...sales].slice(0, 5);
  }, [sales]);

  const bestSale = useMemo(() => {
    if (sales.length === 0) {
      return null;
    }

    return [...sales].sort(
      (a, b) => Number(b.revenue || 0) - Number(a.revenue || 0)
    )[0];
  }, [sales]);

  const businessStatus = useMemo(() => {
    const margin = Number(financial.profit_margin || 0);
    const lowStockCount = lowStockProducts.length;

    if (Number(dashboard.total_sales) === 0) {
      return {
        title: "Comece registrando vendas",
        text: "Assim que as vendas entrarem, o painel mostra lucro, ticket médio e desempenho.",
        type: "neutral",
      };
    }

    if (margin >= 30 && lowStockCount === 0) {
      return {
        title: "Operação saudável",
        text: "Sua margem está boa e o estoque não possui alertas críticos agora.",
        type: "success",
      };
    }

    if (lowStockCount > 0) {
      return {
        title: "Atenção ao estoque",
        text: `${lowStockCount} produto(s) estão abaixo do mínimo e podem afetar próximas vendas.`,
        type: "warning",
      };
    }

    return {
      title: "Acompanhe sua margem",
      text: "Continue monitorando custo, lucro bruto e ticket médio para melhorar o resultado.",
      type: "neutral",
    };
  }, [dashboard.total_sales, financial.profit_margin, lowStockProducts.length]);

  useEffect(() => {
    loadDashboard();

    function handleCompanyChanged() {
      loadDashboard();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <PageLoading
          title="Carregando dashboard"
          text="Buscando faturamento, vendas, estoque e indicadores da empresa..."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-hero-premium">
        <div className="dashboard-hero-content">
          <span className="dashboard-kicker">Visão geral do negócio</span>
          <h1>Dashboard</h1>
          <p>
            Acompanhe faturamento, lucro, vendas, clientes e alertas de estoque
            em um painel único.
          </p>

          <div className="dashboard-hero-actions">
            <span className={`status-pill ${businessStatus.type}`}>
              {businessStatus.title}
            </span>
            <span className="date-pill">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
        </div>

        <div className="dashboard-hero-panel">
          <span>Resultado bruto</span>
          <strong>{money(financial.gross_profit)}</strong>
          <small>
            Margem de {Number(financial.profit_margin || 0).toFixed(2)}%
          </small>

          <div className="hero-mini-chart">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>
      </div>

      <div className="dashboard-metrics-grid">
        <div className="metric-card-premium featured">
          <div className="metric-topline">
            <span>Faturamento</span>
            <div className="metric-icon metric-revenue"></div>
          </div>
          <h2>{money(financial.total_revenue)}</h2>
          <p>Total vendido na empresa selecionada</p>
        </div>

        <div className="metric-card-premium">
          <div className="metric-topline">
            <span>Lucro bruto</span>
            <div className="metric-icon metric-profit"></div>
          </div>
          <h2 className="positive">{money(financial.gross_profit)}</h2>
          <p>Faturamento menos custo</p>
        </div>

        <div className="metric-card-premium">
          <div className="metric-topline">
            <span>Custo</span>
            <div className="metric-icon metric-cost"></div>
          </div>
          <h2 className="warning">{money(financial.total_cost)}</h2>
          <p>Custo das mercadorias vendidas</p>
        </div>

        <div className="metric-card-premium">
          <div className="metric-topline">
            <span>Ticket médio</span>
            <div className="metric-icon metric-ticket"></div>
          </div>
          <h2>{money(ticketAverage)}</h2>
          <p>Média por venda registrada</p>
        </div>

        <div className="metric-card-premium compact">
          <div className="metric-topline">
            <span>Vendas</span>
            <div className="metric-icon metric-sales"></div>
          </div>
          <h2>{dashboard.total_sales}</h2>
          <p>Pedidos registrados</p>
        </div>

        <div className="metric-card-premium compact">
          <div className="metric-topline">
            <span>Produtos</span>
            <div className="metric-icon metric-products"></div>
          </div>
          <h2>{dashboard.total_products}</h2>
          <p>Itens cadastrados</p>
        </div>

        <div className="metric-card-premium compact">
          <div className="metric-topline">
            <span>Clientes</span>
            <div className="metric-icon metric-customers"></div>
          </div>
          <h2>{dashboard.total_customers}</h2>
          <p>Base de clientes</p>
        </div>

        <div className="metric-card-premium compact danger-card">
          <div className="metric-topline">
            <span>Estoque baixo</span>
            <div className="metric-icon metric-stock-alert"></div>
          </div>
          <h2>{lowStockProducts.length}</h2>
          <p>Produtos em atenção</p>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="card dashboard-panel low-stock-panel">
          <div className="panel-header">
            <div>
              <h2>Produtos com estoque baixo</h2>
              <p>Itens que precisam de reposição ou atenção.</p>
            </div>

            <span className="panel-badge danger">{lowStockProducts.length}</span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="empty-icon success"></div>
              <strong>Estoque sob controle</strong>
              <span>Nenhum produto está abaixo do mínimo agora.</span>
            </div>
          ) : (
            <div className="low-stock-list">
              {lowStockProducts.map((product) => (
                <div className="low-stock-item" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>Mínimo recomendado: {product.min_stock}</span>
                  </div>

                  <div className="stock-counter">
                    <small>Atual</small>
                    <strong>{product.stock_quantity}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card dashboard-panel insights-panel">
          <div className="panel-header">
            <div>
              <h2>Resumo inteligente</h2>
              <p>Leitura rápida do momento da empresa.</p>
            </div>
          </div>

          <div className="business-status-card">
            <div className={`status-dot ${businessStatus.type}`}></div>
            <div>
              <strong>{businessStatus.title}</strong>
              <span>{businessStatus.text}</span>
            </div>
          </div>

          <div className="insight-list-premium">
            <div className="insight-item-premium">
              <span>Margem de lucro</span>
              <strong>{Number(financial.profit_margin || 0).toFixed(2)}%</strong>
            </div>

            <div className="insight-item-premium">
              <span>Melhor venda</span>
              <strong>{bestSale ? money(bestSale.revenue) : money(0)}</strong>
            </div>

            <div className="insight-item-premium">
              <span>Lucro médio/venda</span>
              <strong>
                {dashboard.total_sales > 0
                  ? money(
                      Number(financial.gross_profit || 0) /
                        dashboard.total_sales
                    )
                  : money(0)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card dashboard-panel recent-sales-panel">
        <div className="panel-header">
          <div>
            <h2>Últimas vendas</h2>
            <p>Resumo das movimentações mais recentes.</p>
          </div>

          <span className="panel-badge">{recentSales.length}</span>
        </div>

        {recentSales.length === 0 ? (
          <div className="dashboard-empty-state compact-empty">
            <div className="empty-icon neutral"></div>
            <strong>Nenhuma venda registrada</strong>
            <span>Assim que vender, os resultados aparecem aqui.</span>
          </div>
        ) : (
          <table className="table dashboard-sales-table">
            <thead>
              <tr>
                <th align="left">Venda</th>
                <th align="left">Cliente</th>
                <th align="left">Faturamento</th>
                <th align="left">Lucro</th>
                <th align="left">Data</th>
              </tr>
            </thead>

            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id}>
                  <td>#{sale.id}</td>
                  <td>{sale.customer_name || "Sem cliente"}</td>
                  <td className="dashboard-price">{money(sale.revenue)}</td>
                  <td className="dashboard-profit">{money(sale.profit)}</td>
                  <td>
                    {sale.created_at
                      ? new Date(sale.created_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;