import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import PageLoading from "../components/PageLoading";
import api from "../services/api";
import "./Reports.css";

function Reports() {
  const [report, setReport] = useState({
    summary: {
      total_sales: 0,
      total_revenue: 0,
      total_cost: 0,
      gross_profit: 0,
      profit_margin: 0,
      average_ticket: 0,
    },
    sales: [],
    payments: [],
    top_products: [],
    daily: [],
  });

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
  });

  const [loading, setLoading] = useState(true);

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

  function resetReport() {
    setReport({
      summary: {
        total_sales: 0,
        total_revenue: 0,
        total_cost: 0,
        gross_profit: 0,
        profit_margin: 0,
        average_ticket: 0,
      },
      sales: [],
      payments: [],
      top_products: [],
      daily: [],
    });
  }

  async function loadReports() {
    try {
      setLoading(true);

      const companyId = getCompanyId();

      if (!companyId) {
        resetReport();
        return;
      }

      const params = new URLSearchParams();
      params.append("company_id", companyId);

      if (filters.start_date) {
        params.append("start_date", filters.start_date);
      }

      if (filters.end_date) {
        params.append("end_date", filters.end_date);
      }

      const response = await api.get(`/reports?${params.toString()}`);
      setReport(response.data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      showToast(
        "error",
        error.response?.data?.message || "Erro ao carregar relatórios."
      );
      resetReport();
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFilters({
      start_date: "",
      end_date: "",
    });
  }

  function handlePrint() {
    document.title = "Relatório FluxERP";
    window.print();
  }

  useEffect(() => {
    loadReports();

    function handleCompanyChanged() {
      loadReports();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  const summary = report.summary || {};

  if (loading) {
    return (
      <Layout>
        <PageLoading
          title="Carregando relatórios"
          text="Buscando vendas, faturamento, lucro, pagamentos e produtos mais vendidos..."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="reports-page">
        <div className="reports-hero">
          <div>
            <span className="reports-kicker">Central de análise</span>
            <h1 className="page-title">Relatórios</h1>
            <p className="page-subtitle">
              Acompanhe faturamento, lucro, vendas, formas de pagamento e
              produtos mais vendidos.
            </p>
          </div>

          <div className="reports-hero-actions">
            <button className="btn-secondary" onClick={handlePrint}>
              Imprimir
            </button>

            <button className="btn-primary" onClick={loadReports}>
              Atualizar
            </button>
          </div>
        </div>

        <div className="card reports-filter-card">
          <div className="reports-filter-title">
            <div>
              <h2>Filtrar período</h2>
              <p>Escolha uma data inicial e final para analisar as vendas.</p>
            </div>
          </div>

          <div className="reports-filters">
            <div className="form-group">
              <label>Data inicial</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Data final</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
              />
            </div>

            <div className="reports-filter-buttons">
              <button className="btn-secondary" onClick={clearFilters}>
                Limpar
              </button>

              <button className="btn-primary" onClick={loadReports}>
                Aplicar filtro
              </button>
            </div>
          </div>
        </div>

        <div className="reports-grid">
          <div className="card report-metric dark">
            <span>Faturamento</span>
            <strong>{money(summary.total_revenue)}</strong>
            <small>Total vendido no período</small>
          </div>

          <div className="card report-metric">
            <span>Lucro bruto</span>
            <strong className="positive">{money(summary.gross_profit)}</strong>
            <small>Faturamento menos custo</small>
          </div>

          <div className="card report-metric">
            <span>Custo</span>
            <strong className="warning">{money(summary.total_cost)}</strong>
            <small>Custo das mercadorias</small>
          </div>

          <div className="card report-metric">
            <span>Vendas</span>
            <strong>{summary.total_sales || 0}</strong>
            <small>Quantidade de vendas</small>
          </div>

          <div className="card report-metric">
            <span>Ticket médio</span>
            <strong>{money(summary.average_ticket)}</strong>
            <small>Média por venda</small>
          </div>

          <div className="card report-metric">
            <span>Margem</span>
            <strong>{Number(summary.profit_margin || 0).toFixed(2)}%</strong>
            <small>Margem de lucro</small>
          </div>
        </div>

        <div className="reports-main-grid">
          <div className="card reports-section">
            <div className="reports-section-header">
              <div>
                <h2>Produtos mais vendidos</h2>
                <p>Ranking dos produtos com maior saída.</p>
              </div>
            </div>

            {report.top_products.length === 0 ? (
              <div className="empty-state">
                Nenhum produto vendido neste período.
              </div>
            ) : (
              <div className="reports-ranking">
                {report.top_products.map((product, index) => (
                  <div className="ranking-item" key={product.id}>
                    <div className="ranking-position">{index + 1}</div>

                    <div className="ranking-content">
                      <strong>{product.name}</strong>
                      <span>
                        {Number(product.quantity_sold)} unidade(s) vendida(s)
                      </span>
                    </div>

                    <div className="ranking-money">
                      <strong>{money(product.revenue)}</strong>
                      <span>{money(product.profit)} lucro</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card reports-section">
            <div className="reports-section-header">
              <div>
                <h2>Formas de pagamento</h2>
                <p>Resumo por método usado nas vendas.</p>
              </div>
            </div>

            {report.payments.length === 0 ? (
              <div className="empty-state">Nenhum pagamento encontrado.</div>
            ) : (
              <div className="payment-list">
                {report.payments.map((payment) => (
                  <div className="payment-item" key={payment.payment_method}>
                    <div>
                      <strong>{payment.payment_method}</strong>
                      <span>{payment.quantity} venda(s)</span>
                    </div>

                    <strong>{money(payment.revenue)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card reports-section reports-sales-section">
          <div className="reports-section-header">
            <div>
              <h2>Vendas no período</h2>
              <p>Lista detalhada com receita, custo e lucro.</p>
            </div>

            <span className="badge">{report.sales.length} vendas</span>
          </div>

          {report.sales.length === 0 ? (
            <div className="empty-state">Nenhuma venda encontrada.</div>
          ) : (
            <table className="table reports-table">
              <thead>
                <tr>
                  <th align="left">Data</th>
                  <th align="left">Cliente</th>
                  <th align="left">Pagamento</th>
                  <th align="right">Receita</th>
                  <th align="right">Custo</th>
                  <th align="right">Lucro</th>
                </tr>
              </thead>

              <tbody>
                {report.sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{dateBR(sale.created_at)}</td>
                    <td>{sale.customer_name || "Cliente não informado"}</td>
                    <td>{sale.payment_method || "Não informado"}</td>
                    <td align="right">{money(sale.revenue)}</td>
                    <td align="right">{money(sale.cost)}</td>
                    <td align="right" className="profit-cell">
                      {money(sale.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card reports-section reports-daily-section">
          <div className="reports-section-header">
            <div>
              <h2>Resumo diário</h2>
              <p>Faturamento e lucro agrupados por dia.</p>
            </div>
          </div>

          {report.daily.length === 0 ? (
            <div className="empty-state">Nenhum resumo diário encontrado.</div>
          ) : (
            <div className="daily-list">
              {report.daily.map((day) => (
                <div className="daily-item" key={day.day}>
                  <div>
                    <strong>{dateBR(day.day)}</strong>
                    <span>{day.total_sales} venda(s)</span>
                  </div>

                  <div>
                    <strong>{money(day.revenue)}</strong>
                    <span>{money(day.profit)} lucro</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Reports;