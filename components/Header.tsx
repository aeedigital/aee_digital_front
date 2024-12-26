import Image from 'next/image'

// components/Header.js
export default function Header() {
    return (
      <header className="cabeçalho">
        <div className="cab-logo">
          <a href="//www.alianca.org.br" target="_blank" rel="noopener noreferrer">
          <Image 
            priority={false} 
            src="/logo-aee2-completo-vetor.png" alt="Logo" />
          </a>
          <div className="cab-menu">
            <ul>
              <li>
                <a className="nav-link" href="/"> Iníci </a>
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
  