import { useEffect, useMemo, useState } from "react";
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

  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({
    total_expenses: 0,
    paid_expenses: 0,
    pending_expenses: 0,
    total_incomes: 0,
    paid_incomes: 0,
    pending_incomes: 0,
  });

  const [loading, setLoading] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const [form, setForm] = useState({
    description: "",
    category: "",
    amount: "",
    status: "pending",
    due_date: "",
    paid_at: "",
    notes: "",
  });

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

  function resetTransactions() {
    setTransactions([]);
    setTransactionSummary({
      total_expenses: 0,
      paid_expenses: 0,
      pending_expenses: 0,
      total_incomes: 0,
      paid_incomes: 0,
      pending_incomes: 0,
    });
  }

  function resetForm() {
    setForm({
      description: "",
      category: "",
      amount: "",
      status: "pending",
      due_date: "",
      paid_at: "",
      notes: "",
    });
  }

  function openCreateExpenseModal() {
    const companyId = getCompanyId();

    if (!companyId) {
      showToast("error", "Selecione uma empresa antes de lançar despesa.");
      return;
    }

    setEditingTransaction(null);
    resetForm();
    setExpenseModalOpen(true);
  }

  function openEditExpenseModal(transaction) {
    setEditingTransaction(transaction);

    setForm({
      description: transaction.description || "",
      category: transaction.category || "",
      amount: transaction.amount || "",
      status: transaction.status || "pending",
      due_date: transaction.due_date
        ? String(transaction.due_date).slice(0, 10)
        : "",
      paid_at: transaction.paid_at ? String(transaction.paid_at).slice(0, 10) : "",
      notes: transaction.notes || "",
    });

    setExpenseModalOpen(true);
  }

  function closeExpenseModal() {
    setExpenseModalOpen(false);
    setEditingTransaction(null);
    resetForm();
  }

  async function loadFinancial() {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        resetFinancial();
        resetTransactions();
        return;
      }

      setLoading(true);

      const [financialResponse, transactionsResponse, summaryResponse] =
        await Promise.all([
          api.get(`/financial?company_id=${companyId}`),
          api.get(`/financial-transactions?company_id=${companyId}&type=expense`),
          api.get(`/financial-transactions/summary?company_id=${companyId}`),
        ]);

      setFinancial(financialResponse.data);
      setTransactions(transactionsResponse.data);
      setTransactionSummary(summaryResponse.data);
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      resetFinancial();
      resetTransactions();

      showToast(
        "error",
        error.response?.data?.message || "Erro ao carregar financeiro."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitExpense(event) {
    event.preventDefault();

    try {
      const companyId = getCompanyId();

      if (!companyId) {
        showToast("error", "Selecione uma empresa antes de salvar despesa.");
        return;
      }

      if (!form.description.trim()) {
        showToast("error", "Informe a descrição da despesa.");
        return;
      }

      if (!form.amount || Number(form.amount) <= 0) {
        showToast("error", "Informe um valor válido.");
        return;
      }

      const payload = {
        company_id: Number(companyId),
        type: "expense",
        status: form.status,
        description: form.description.trim(),
        category: form.category.trim(),
        amount: Number(form.amount || 0),
        due_date: form.due_date || null,
        paid_at: form.status === "paid" ? form.paid_at || null : null,
        notes: form.notes.trim(),
      };

      if (editingTransaction) {
        await api.put(`/financial-transactions/${editingTransaction.id}`, payload);
        showToast("success", "Despesa atualizada com sucesso.");
      } else {
        await api.post("/financial-transactions", payload);
        showToast("success", "Despesa lançada com sucesso.");
      }

      closeExpenseModal();
      await loadFinancial();
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      showToast(
        "error",
        error.response?.data?.message || "Erro ao salvar despesa."
      );
    }
  }

  async function markExpenseAsPaid(transaction) {
    try {
      await api.patch(`/financial-transactions/${transaction.id}/pay`);
      showToast("success", "Despesa marcada como paga.");
      await loadFinancial();
    } catch (error) {
      console.error("Erro ao marcar despesa como paga:", error);
      showToast(
        "error",
        error.response?.data?.message || "Erro ao marcar como pago."
      );
    }
  }

  async function confirmDeleteTransaction() {
    if (!transactionToDelete) return;

    try {
      await api.delete(`/financial-transactions/${transactionToDelete.id}`);

      setTransactionToDelete(null);
      showToast("success", "Despesa excluída com sucesso.");

      await loadFinancial();
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      showToast(
        "error",
        error.response?.data?.message || "Erro ao excluir despesa."
      );
    }
  }

  useEffect(() => {
    loadFinancial();

    function handleCompanyChanged() {
      closeExpenseModal();
      setTransactionToDelete(null);
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

  const totalExpenses = Number(transactionSummary.total_expenses || 0);
  const paidExpenses = Number(transactionSummary.paid_expenses || 0);
  const pendingExpenses = Number(transactionSummary.pending_expenses || 0);
  const netResult = Number(financial.gross_profit || 0) - totalExpenses;
  const cashResult = Number(financial.gross_profit || 0) - paidExpenses;

  const positiveProfit = netResult >= 0;
  const healthyMargin = Number(financial.profit_margin || 0) >= 20;

  const pendingCount = useMemo(() => {
    return transactions.filter((transaction) => transaction.status === "pending")
      .length;
  }, [transactions]);

  return (
    <Layout>
      <div className="financial-page">
        <div className="financial-hero">
          <div>
            <span className="financial-kicker">Central financeira</span>
            <h1 className="page-title">Financeiro</h1>
            <p className="page-subtitle">
              Acompanhe faturamento, lucro, despesas pagas, contas a pagar e o
              resultado real do negócio.
            </p>
          </div>

          <div className="financial-hero-actions">
            <button className="btn-primary" onClick={openCreateExpenseModal}>
              + Nova despesa
            </button>

            <div className="financial-hero-panel">
              <small>Saúde financeira</small>
              <strong>
                {positiveProfit ? "Resultado positivo" : "Atenção no resultado"}
              </strong>
              <span>
                Resultado após despesas: <b>{money(netResult)}</b>
              </span>
            </div>
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
                Number(financial.gross_profit || 0) >= 0 ? "positive" : "negative"
              }`}
            >
              {money(financial.gross_profit)}
            </h2>
            <p>Faturamento menos custo</p>
          </div>

          <div className="card financial-card">
            <span className="financial-label">Despesas totais</span>
            <h2 className="financial-value negative">{money(totalExpenses)}</h2>
            <p>Todas as despesas lançadas</p>
          </div>

          <div className="card financial-card">
            <span className="financial-label">A pagar</span>
            <h2 className="financial-value warning">{money(pendingExpenses)}</h2>
            <p>{pendingCount} despesa(s) pendente(s)</p>
          </div>

          <div className="card financial-card">
            <span className="financial-label">Pago</span>
            <h2 className="financial-value positive">{money(paidExpenses)}</h2>
            <p>Despesas já pagas</p>
          </div>

          <div className="card financial-card dark">
            <span className="financial-label">Resultado final</span>
            <h2
              className={`financial-value ${
                positiveProfit ? "positive-light" : "negative-light"
              }`}
            >
              {money(netResult)}
            </h2>
            <p>Lucro bruto menos despesas</p>
          </div>
        </div>

        <div className="financial-main-grid">
          <div className="card financial-history">
            <div className="financial-history-header">
              <div>
                <h2>Despesas</h2>
                <p>Controle contas pagas, contas a pagar e vencimentos.</p>
              </div>

              <div className="financial-header-actions">
                {loading && <span className="financial-loading">Carregando...</span>}

                <span className="margin-pill">
                  {money(pendingExpenses)} a pagar
                </span>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-state">Nenhuma despesa lançada ainda.</div>
            ) : (
              <table className="table financial-table">
                <thead>
                  <tr>
                    <th align="left">Descrição</th>
                    <th align="left">Categoria</th>
                    <th align="right">Valor</th>
                    <th align="left">Situação</th>
                    <th align="left">Vencimento</th>
                    <th align="left">Pagamento</th>
                    <th align="right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <strong className="transaction-title">
                          {transaction.description}
                        </strong>
                        {transaction.notes && (
                          <span className="transaction-note">
                            {transaction.notes}
                          </span>
                        )}
                      </td>

                      <td>{transaction.category || "-"}</td>

                      <td align="right" className="cost">
                        {money(transaction.amount)}
                      </td>

                      <td>
                        {transaction.status === "paid" ? (
                          <span className="status-pill paid">Pago</span>
                        ) : (
                          <span className="status-pill pending">A pagar</span>
                        )}
                      </td>

                      <td>{dateBR(transaction.due_date)}</td>

                      <td>{dateBR(transaction.paid_at)}</td>

                      <td align="right">
                        {transaction.status !== "paid" && (
                          <button
                            className="mini-action success"
                            onClick={() => markExpenseAsPaid(transaction)}
                          >
                            Pagar
                          </button>
                        )}

                        <button
                          className="mini-action"
                          onClick={() => openEditExpenseModal(transaction)}
                        >
                          Editar
                        </button>

                        <button
                          className="mini-action danger"
                          onClick={() => setTransactionToDelete(transaction)}
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
                  <strong>Despesas pagas</strong>
                  <p>Você já pagou {money(paidExpenses)} em despesas.</p>
                </div>
              </div>

              <div className="financial-insight-item">
                <span className="insight-dot pending"></span>
                <div>
                  <strong>Contas a pagar</strong>
                  <p>Ainda existem {money(pendingExpenses)} pendentes.</p>
                </div>
              </div>

              <div className="financial-insight-item">
                <span className="insight-dot profit"></span>
                <div>
                  <strong>Resultado final</strong>
                  <p>
                    Após todas as despesas, o resultado é {money(netResult)}.
                  </p>
                </div>
              </div>

              <div className="financial-insight-box">
                <small>Dica FluxERP</small>
                <strong>
                  {healthyMargin
                    ? "Sua margem bruta está saudável."
                    : "Revise custos, preços e despesas."}
                </strong>
                <span>
                  Resultado de caixa considerando somente despesas pagas:{" "}
                  {money(cashResult)}.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card financial-history">
          <div className="financial-history-header">
            <div>
              <h2>Resultado por venda</h2>
              <p>Receita, custo e lucro bruto em cada venda registrada.</p>
            </div>

            <div className="financial-header-actions">
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

        {expenseModalOpen && (
          <div className="modal-overlay">
            <div className="modal financial-modal">
              <div className="modal-header">
                <div>
                  <h2>{editingTransaction ? "Editar despesa" : "Nova despesa"}</h2>
                  <p>
                    Lance despesas pagas ou contas a pagar da empresa selecionada.
                  </p>
                </div>

                <button className="modal-close" onClick={closeExpenseModal}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitExpense}>
                <div className="financial-form">
                  <div className="form-grid financial-form-grid">
                    <div className="form-group">
                      <label>Descrição</label>
                      <input
                        placeholder="Ex: Aluguel, energia, fornecedor..."
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Categoria</label>
                      <input
                        placeholder="Ex: Fixo, fornecedor, imposto..."
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={form.amount}
                        onChange={(e) =>
                          setForm({ ...form, amount: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Situação</label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        <option value="pending">A pagar</option>
                        <option value="paid">Pago</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Vencimento</label>
                      <input
                        type="date"
                        value={form.due_date}
                        onChange={(e) =>
                          setForm({ ...form, due_date: e.target.value })
                        }
                      />
                    </div>

                    {form.status === "paid" && (
                      <div className="form-group">
                        <label>Data de pagamento</label>
                        <input
                          type="date"
                          value={form.paid_at}
                          onChange={(e) =>
                            setForm({ ...form, paid_at: e.target.value })
                          }
                        />
                      </div>
                    )}

                    <div className="form-group full">
                      <label>Observação</label>
                      <input
                        placeholder="Observações opcionais"
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
                    onClick={closeExpenseModal}
                  >
                    Cancelar
                  </button>

                  <button className="btn-primary" type="submit">
                    {editingTransaction ? "Salvar alterações" : "Salvar despesa"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {transactionToDelete && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <div className="confirm-icon danger"></div>

              <h2>Excluir despesa?</h2>

              <p>
                Você está prestes a excluir{" "}
                <strong>{transactionToDelete.description}</strong>. Essa ação não
                poderá ser desfeita.
              </p>

              <div className="confirm-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setTransactionToDelete(null)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn-danger"
                  onClick={confirmDeleteTransaction}
                >
                  Excluir despesa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Financial;
