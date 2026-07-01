import "./PageLoading.css";

function PageLoading({
  title = "Carregando dados",
  text = "Preparando as informações do FluxERP...",
}) {
  return (
    <div className="page-loading">
      <div className="loading-header">
        <div>
          <span className="loading-kicker">FluxERP</span>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>

        <div className="loading-pulse-logo">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="loading-grid">
        <div className="loading-card large">
          <div className="loading-line short"></div>
          <div className="loading-line title"></div>
          <div className="loading-line"></div>
          <div className="loading-chart">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>

        <div className="loading-card">
          <div className="loading-line short"></div>
          <div className="loading-line title"></div>
          <div className="loading-line"></div>
        </div>

        <div className="loading-card">
          <div className="loading-line short"></div>
          <div className="loading-line title"></div>
          <div className="loading-line"></div>
        </div>
      </div>

      <div className="loading-table">
        <div className="loading-row"></div>
        <div className="loading-row"></div>
        <div className="loading-row"></div>
      </div>
    </div>
  );
}

export default PageLoading;