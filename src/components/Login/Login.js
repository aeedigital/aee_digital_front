// src/components/Login.js
import React, {
  useState
} from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

import styles from './Login.module.css';

const Login = () => {
 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {

      console.log("VAI CHAMAR")

      // const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
      const response = await axios.get(`http://162.214.123.133:5000/passes?fields=user,pass&user=${username}&pass=${password}`);

      
      console.log(response.data[0])

      if (response.data[0]) {
        setSuccess(true);
        setError('');
      } else {
        setSuccess(false);
        setError('Invalid username or password');
      }
    } catch (err) {
      setSuccess(false);
      setError('Error connecting to the server');
    }
  };



return(
    <Container className={styles.titulo}>
    <h2>CADASTRO ANUAL AEE</h2>
    <h5>
      Seja bem-vindo à página de cadastro das casas espíritas filiadas à Aliança Espírita Evangélica!<br /><br />
      Com o usuário e senha de sua Casa Espírita recebida do seu coordenador regional, você poderá acessar a página do cadastro e atualizar os dados!<br /><br />
      Ficou com dúvidas? Entre em contato com o coordenador de sua regional, ou fale com a Secretaria da Aliança (alianca@alianca.org.br // WhatsApp <b>11 3105-5894</b>).
    </h5>
    <Form onSubmit = { handleSubmit } style = { styles.form } >
      <Form.Group controlId="formUsername">
                <Form.Control
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange = { (e) => setUsername(e.target.value) }
                />
      </Form.Group>

      <Form.Group controlId="formPassword">
              <Form.Control
                type="password"
                placeholder="Senha"
                value = {password}
                onChange = { (e) => setPassword(e.target.value) }
              />
      </Form.Group>
      {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>Login successful!</p>}
      <Button variant="success" size="lg" type="submit" block> Acessar </Button>
    
    </Form>
    </Container>
);
}

export default Login;
