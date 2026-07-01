import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const token = localStorage.getItem("token");

  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-logo">
          <div className="notfound-symbol">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div>
            <strong>FluxERP</strong>
            <small>Gestão inteligente</small>
          </div>
        </div>

        <div className="notfound-code">404</div>

        <h1>Página não encontrada</h1>

        <p>
          O endereço que você tentou acessar não existe ou foi movido dentro do
          FluxERP.
        </p>

        <div className="notfound-actions">
          <Link className="notfound-primary" to={token ? "/dashboard" : "/login"}>
            {token ? "Voltar ao painel" : "Ir para login"}
          </Link>

          <Link className="notfound-secondary" to="/">
            Ver página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;