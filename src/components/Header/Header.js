import React from 'react';
import style from './header.module.css'

const Header = () => (
  <header className={style.cabeçalho}>
    <div className={style.cablogo}>
      <a href="//www.alianca.org.br" target="_blank" rel="noopener noreferrer">
        <img src="img/logo-aee2-completo-vetor.png" alt="Logo" />
      </a>
      <div className={style.cabmenu}>
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

export default Header;
