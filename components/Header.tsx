// components/Header.js
export default function Header() {
    return (
      <header className="cabeçalho">
        <div className="cab-logo">
          <a href="//www.alianca.org.br" target="_blank" rel="noopener noreferrer">
            <img src="img/logo-aee2-completo-vetor.png" alt="Logo" />
          </a>
          <div className="cab-menu">
            <ul>
              <li>
                <a className="nav-link" href="/"> Início </a>
              </li>
              <li>
                <a className="nav-link" href="/logout"> Sair </a>
              </li>
            </ul>
          </div>
        </div>
      </header>
    );
  }
  