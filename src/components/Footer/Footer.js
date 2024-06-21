import React from 'react';
import style from  './footer.module.css'

const Footer = () => (
  <footer>
    <div className={style.rodape}>
      <div className={style.rodapetexto}>
        <h2>Siga-nos</h2>
      </div>
      <div className={style.rodaperedes}>
        <ul>
          <li>
            <a href="https://www.instagram.com/alianca_espirita_oficial/?igshid=Yzg5MTU1MDY%3D" target="_blank" rel="noopener noreferrer">
              <img src="img/instagram.png" alt="Instagram" />
            </a>
          </li>
          <li>
            <a href="https://www.facebook.com/aliancaespirita/?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer">
              <img src="img/facebook.png" alt="Facebook" />
            </a>
          </li>
        </ul>
      </div>
      <br />
      <p>Aliança Espírita Evangélica</p>
    </div>
  </footer>
);

export default Footer;
