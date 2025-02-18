import generator from "generate-password";

export function createRandomPass(length: number): string {
  const newPassword = generator.generate({
            length, // Define o tamanho da senha
            numbers: true, // Inclui números
            uppercase: false, // Define se quer letras maiúsculas
            excludeSimilarCharacters: true, // Evita caracteres parecidos (1 e l, 0 e O)
          });
          return newPassword;
}