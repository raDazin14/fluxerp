import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Financial.css";

function Financial() {
  const [financial, setFinancial] = useState({
    total_revenue: 0,
    total_cost: 0,
    gross_profit: 0,
    profit_margin: 0,
    sales: [],
  });

  const [loading, setLoading] = useState(false);

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

  function resetFinancial() {
    setFinancial({
      total_revenue: 0,
      total_cost: 0,
      gross_profit: 0,
      profit_margin: 0,
      sales: [],
    });
  }

  async function loadFinancial() {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        resetFinancial();
        return;
      }

      setLoading(true);

      const response = await api.get(`/financial?company_id=${companyId}`);
      setFinancial(response.data);
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      resetFinancial();

      showToast(
        "error",
        error.response?.data?.message || "Erro ao carregar financeiro."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinancial();

    function handleCompanyChanged() {
      loadFinancial();
    }

    window.addEventListener("companyChanged", handleCompanyChanged);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChanged);
    };
  }, []);

  const totalSales = financial.sales.length;
  const averageTicket =
    totalSales > 0 ? Number(financial.total_revenue) / totalSales : 0;

  const positiveProfit = Number(financial.gross_profit) >= 0;
  const healthyMargin = Number(financial.profit_margin || 0) >= 20;

  return (
    <Layout>
      <div className="financial-page">
        <div className="financial-hero">
          <div>
            <span className="financial-kicker">Central financeira</span>
            <h1 className="page-title">Financeiro</h1>
            <p className="page-subtitle">
              Acompanhe faturamento, custo das mercadorias, lucro bruto e
              margem do seu negócio.
            </p>
          </div>

          <div className="financial-hero-panel">
            <small>Saúde financeira</small>
            <strong>{healthyMargin ? "Boa margem" : "Atenção na margem"}</strong>
            <span>
              Margem atual de{" "}
              {Number(financial.profit_margin || 0).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="financial-grid">
          <div className="card financial-card dark">
            <span className="financial-label">Faturamento</span>
            <h2 className="financial-value">
              {money(financial.total_revenue)}
            </h2>
            <p>Total vendido até agora</p>
          </div>

          <div className="card financial-card">
            <span className="financial-label">Lucro bruto</span>
            <h2
              className={`financial-value ${
                positiveProfit ? "positive" : "negative"
              }`}
            >
              {money(financial.gross_profit)}
            </h2>
            <p>Faturamento menos custo</p>
          </div>

          <div className="card financial-card">
            <span className="financial-label">Custo</span>
            <h2 className="financial-value warning">
              {money(financial.total_cost)}
            </h2>
            <p>Custo das mercadorias vendidas</p>
          </div>

          <div className="card financial-card">
            <span className="financial-label">Margem</span>
            <h2 className="financial-value">
              {Number(financial.profit_margin || 0).toFixed(2)}%
            </h2>
            <p>Percentual de lucro bruto</p>
          </div>

          <div className="card financial-card">
            <span className="financial-label">Vendas</span>
            <h2 className="financial-value">{totalSales}</h2>
            <p>Vendas calculadas no financeiro</p>
          </div>

          <div className="card financial-card">
            <span className="financial-label">Ticket médio</span>
            <h2 className="financial-value">{money(averageTicket)}</h2>
            <p>Média de faturamento por venda</p>
          </div>
        </div>

        <div className="financial-main-grid">
          <div className="card financial-history">
            <div className="financial-history-header">
              <div>
                <h2>Resultado por venda</h2>
                <p>Receita, custo e lucro bruto em cada venda registrada.</p>
              </div>

              <div className="financial-header-actions">
                {loading && <span className="financial-loading">Carregando...</span>}

                <span className="margin-pill">
                  {Number(financial.profit_margin || 0).toFixed(2)}% margem
                </span>
              </div>
            </div>

            {financial.sales.length === 0 ? (
              <div className="empty-state">Nenhuma venda registrada ainda.</div>
            ) : (
              <table className="table financial-table">
                <thead>
                  <tr>
                    <th align="left">Venda</th>
                    <th align="left">Cliente</th>
                    <th align="right">Faturamento</th>
                    <th align="right">Custo</th>
                    <th align="right">Lucro</th>
                    <th align="left">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {financial.sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <span className="sale-code">#{sale.id}</span>
                      </td>

                      <td>{sale.customer_name || "Sem cliente"}</td>

                      <td align="right" className="price">
                        {money(sale.revenue)}
                      </td>

                      <td align="right" className="cost">
                        {money(sale.cost)}
                      </td>

                      <td align="right" className="profit">
                        {money(sale.profit)}
                      </td>

                      <td>{dateBR(sale.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card financial-insights">
            <div className="financial-insights-header">
              <h2>Resumo inteligente</h2>
              <p>Leitura rápida do resultado financeiro.</p>
            </div>

            <div className="financial-insight-list">
              <div className="financial-insight-item">
                <span className="insight-dot revenue"></span>
                <div>
                  <strong>Faturamento total</strong>
                  <p>Seu negócio faturou {money(financial.total_revenue)}.</p>
                </div>
              </div>

              <div className="financial-insight-item">
                <span className="insight-dot cost"></span>
                <div>
                  <strong>Custo das vendas</strong>
                  <p>Você teve {money(financial.total_cost)} em custo.</p>
                </div>
              </div>

              <div className="financial-insight-item">
                <span className="insight-dot profit"></span>
                <div>
                  <strong>Lucro bruto</strong>
                  <p>
                    Resultado atual de {money(financial.gross_profit)} com{" "}
                    {Number(financial.profit_margin || 0).toFixed(2)}% de
                    margem.
                  </p>
                </div>
              </div>

              <div className="financial-insight-box">
                <small>Dica FluxERP</small>
                <strong>
                  {healthyMargin
                    ? "Sua margem está saudável."
                    : "Revise custos e preços de venda."}
                </strong>
                <span>
                  Use a tela de Relatórios para analisar períodos específicos e
                  produtos mais vendidos.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Financial;
