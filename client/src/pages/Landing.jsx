import { Link } from "react-router-dom";
import "./Landing.css";

const whatsappLink =
  "https://wa.me/5584981896323?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20testar%20o%20FluxERP%20para%20minha%20empresa.";

function BrandLogo() {
  return (
    <div className="landing-brand">
      <div className="landing-brand-symbol">
        <span></span>
        <span></span>
        <span></span>

        <div className="landing-brand-bars">
          <i></i>
          <i></i>
          <i></i>
        </div>
      </div>

      <div className="landing-brand-text">
        <strong>FluxERP</strong>
        <small>Gestão inteligente</small>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <BrandLogo />
        </Link>

        <nav className="landing-nav">
          <a href="#recursos">Recursos</a>
          <a href="#segmentos">Para quem é</a>
          <a href="#planos">Planos</a>
          <a href="#faq">Dúvidas</a>

          <Link to="/login" className="landing-login">
            Entrar
          </Link>

          <Link to="/register" className="landing-start">
            Começar grátis
          </Link>
        </nav>
      </header>

      <section className="enterprise-hero">
        <div className="enterprise-hero-content">
          <div className="enterprise-badge">
            Plataforma de gestão para pequenos negócios
          </div>

          <h1>
            Gestão simples para vender, controlar estoque e entender seu lucro.
          </h1>

          <p>
            O FluxERP reúne produtos, clientes, vendas, estoque, financeiro e
            relatórios em um só lugar, para você acompanhar sua empresa com mais
            clareza e tomar decisões com segurança.
          </p>

          <div className="enterprise-actions">
            <Link to="/register" className="enterprise-primary">
              Começar teste grátis
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="enterprise-whatsapp"
            >
              Quero testar pelo WhatsApp
            </a>
          </div>

          <div className="enterprise-trust">
            <span>Sem fidelidade</span>
            <span>Teste grátis</span>
            <span>Suporte direto</span>
          </div>
        </div>

        <div className="enterprise-visual">
          <div className="enterprise-dashboard">
            <div className="mock-window">
              <i></i>
              <i></i>
              <i></i>
            </div>

            <div className="enterprise-dashboard-header">
              <div>
                <span>FluxERP Dashboard</span>
                <strong>Resumo da empresa</strong>
              </div>

              <small>Atualizado agora</small>
            </div>

            <div className="enterprise-metrics">
              <div className="enterprise-metric active">
                <span>Faturamento</span>
                <strong>R$ 12.480</strong>
                <small>mês atual</small>
              </div>

              <div className="enterprise-metric">
                <span>Lucro bruto</span>
                <strong>R$ 6.920</strong>
                <small>55,4% margem</small>
              </div>

              <div className="enterprise-metric">
                <span>Estoque baixo</span>
                <strong>4 itens</strong>
                <small>atenção</small>
              </div>
            </div>

            <div className="enterprise-chart">
              <span style={{ height: "45%" }}></span>
              <span style={{ height: "62%" }}></span>
              <span style={{ height: "54%" }}></span>
              <span style={{ height: "74%" }}></span>
              <span style={{ height: "68%" }}></span>
              <span style={{ height: "92%" }}></span>
              <span style={{ height: "80%" }}></span>
            </div>

            <div className="enterprise-table">
              <div>
                <span>Produto</span>
                <span>Estoque</span>
                <span>Status</span>
              </div>

              <div>
                <strong>Café especial</strong>
                <small>18 un.</small>
                <b>Ok</b>
              </div>

              <div>
                <strong>Cappuccino</strong>
                <small>4 un.</small>
                <b className="warning">Repor</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="enterprise-logos">
        <span>Feito para negócios que precisam de controle</span>

        <div>
          <strong>Cafeterias</strong>
          <strong>Mercadinhos</strong>
          <strong>Lojas</strong>
          <strong>Autopeças</strong>
          <strong>Distribuidoras</strong>
        </div>
      </section>

      <section className="enterprise-section" id="recursos">
        <div className="enterprise-section-heading centered">
          <span>Recursos principais</span>
          <h2>
            Controle o essencial da sua empresa em uma plataforma fácil de usar.
          </h2>
          <p>
            Ideal para quem quer deixar caderno, planilhas soltas e controles
            manuais para trás, sem precisar de um sistema difícil.
          </p>
        </div>

        <div className="enterprise-features">
          <div className="enterprise-feature large">
            <div className="feature-number">01</div>
            <h3>Dashboard executivo</h3>
            <p>
              Veja faturamento, lucro bruto, custo, ticket médio, vendas,
              clientes e estoque baixo em uma única tela.
            </p>
          </div>

          <div className="enterprise-feature">
            <div className="feature-number">02</div>
            <h3>Produtos e estoque</h3>
            <p>Cadastre preço, custo, quantidade e estoque mínimo.</p>
          </div>

          <div className="enterprise-feature">
            <div className="feature-number">03</div>
            <h3>Vendas rápidas</h3>
            <p>Registre vendas e baixe o estoque automaticamente.</p>
          </div>

          <div className="enterprise-feature">
            <div className="feature-number">04</div>
            <h3>Clientes</h3>
            <p>Organize os dados dos compradores e histórico do negócio.</p>
          </div>

          <div className="enterprise-feature">
            <div className="feature-number">05</div>
            <h3>Relatórios</h3>
            <p>Analise produtos mais vendidos, pagamentos, receita e lucro.</p>
          </div>
        </div>
      </section>

      <section className="enterprise-section enterprise-split">
        <div>
          <span className="section-label">Operação mais clara</span>
          <h2>Veja o que vende, o que falta e quanto realmente sobra.</h2>
          <p>
            Em poucos cliques, você acompanha faturamento, custo, lucro bruto,
            estoque baixo e desempenho das vendas sem ficar procurando
            informação em vários lugares.
          </p>

          <div className="enterprise-checklist">
            <div>Lucro bruto visível em segundos</div>
            <div>Estoque baixo com alerta</div>
            <div>Vendas e pagamentos organizados</div>
            <div>Relatórios prontos para análise</div>
          </div>
        </div>

        <div className="enterprise-result-card">
          <div className="result-circle">
            <strong>55%</strong>
            <span>margem</span>
          </div>

          <h3>Resumo do mês</h3>

          <div className="result-line">
            <span>Faturamento</span>
            <strong>R$ 12.480</strong>
          </div>

          <div className="result-line">
            <span>Custo</span>
            <strong>R$ 5.560</strong>
          </div>

          <div className="result-line highlight">
            <span>Lucro bruto</span>
            <strong>R$ 6.920</strong>
          </div>
        </div>
      </section>

      <section className="enterprise-section" id="segmentos">
        <div className="enterprise-section-heading centered">
          <span>Para quem é</span>
          <h2>
            Ideal para negócios que vendem produto e precisam controlar estoque.
          </h2>
          <p>
            O FluxERP foi pensado para empresas pequenas que precisam de
            controle simples, rápido e acessível.
          </p>
        </div>

        <div className="segments-grid">
          <div>Cafeterias</div>
          <div>Mercadinhos</div>
          <div>Lojas de roupa</div>
          <div>Autopeças</div>
          <div>Materiais de construção</div>
          <div>Distribuidoras pequenas</div>
        </div>
      </section>

      <section className="enterprise-section how-it-works">
        <div className="enterprise-section-heading">
          <span>Como funciona</span>
          <h2>Da conta criada ao primeiro controle em poucos minutos.</h2>
        </div>

        <div className="workflow-grid">
          <div>
            <strong>1</strong>
            <h3>Crie sua conta</h3>
            <p>Faça o cadastro e acesse o painel do FluxERP.</p>
          </div>

          <div>
            <strong>2</strong>
            <h3>Cadastre sua empresa</h3>
            <p>Informe os dados básicos e comece a usar o sistema.</p>
          </div>

          <div>
            <strong>3</strong>
            <h3>Registre produtos e vendas</h3>
            <p>Controle estoque, clientes, financeiro e relatórios.</p>
          </div>
        </div>
      </section>

      <section className="enterprise-section plans-section" id="planos">
        <div className="enterprise-section-heading centered">
          <span>Planos</span>
          <h2>Teste primeiro. Contrate só se fizer sentido para o seu negócio.</h2>
          <p>
            Durante o beta, empresas convidadas podem testar o FluxERP e ajudar
            a melhorar a plataforma antes do lançamento oficial.
          </p>
        </div>

        <div className="enterprise-plans">
          <div className="enterprise-plan">
            <span>Beta</span>
            <h3>Teste gratuito</h3>
            <strong>R$ 0</strong>
            <p>Para empresas convidadas testarem o sistema.</p>
            <Link to="/register">Começar teste</Link>
          </div>

          <div className="enterprise-plan featured">
            <span>Lançamento</span>
            <h3>Plano inicial</h3>
            <strong>R$ 59/mês</strong>
            <p>Controle de produtos, clientes, vendas, estoque e relatórios.</p>
            <Link to="/register">Criar conta</Link>
          </div>

          <div className="enterprise-plan">
            <span>Futuro</span>
            <h3>Plano Pro</h3>
            <strong>Sob consulta</strong>
            <p>Recursos avançados, automações e relatórios extras.</p>
            <Link to="/register">Entrar na lista</Link>
          </div>
        </div>
      </section>

      <section className="enterprise-section faq-section" id="faq">
        <div className="enterprise-section-heading centered">
          <span>Dúvidas comuns</span>
          <h2>Perguntas antes de começar.</h2>
        </div>

        <div className="faq-grid">
          <div>
            <strong>Preciso instalar algo?</strong>
            <p>Não. O FluxERP funciona online pelo navegador.</p>
          </div>

          <div>
            <strong>Posso testar antes de pagar?</strong>
            <p>Sim. A ideia do beta é testar antes de contratar.</p>
          </div>

          <div>
            <strong>Serve para empresa pequena?</strong>
            <p>Sim. O foco inicial é justamente pequeno negócio.</p>
          </div>

          <div>
            <strong>O estoque baixa sozinho?</strong>
            <p>Sim. Ao registrar uma venda, o estoque do produto é atualizado.</p>
          </div>
        </div>
      </section>

      <section className="enterprise-cta">
        <div>
          <span>Comece agora</span>
          <h2>Comece a organizar sua empresa hoje, sem complicação.</h2>
          <p>
            Crie sua conta, cadastre sua empresa e veja como fica mais fácil
            acompanhar vendas, estoque, clientes, financeiro e relatórios em um
            só painel.
          </p>

          <div className="enterprise-cta-actions">
            <Link to="/register" className="enterprise-primary">
              Começar teste grátis
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="enterprise-whatsapp"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="enterprise-footer">
        <BrandLogo />

        <div>
          <strong>FluxERP</strong>
          <span>© 2026 — Gestão inteligente para pequenos negócios</span>
        </div>
      </footer>
    </main>
  );
}

export default Landing;