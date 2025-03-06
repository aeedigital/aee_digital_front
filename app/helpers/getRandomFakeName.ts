function removeAccents(str:string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove diacríticos manualmente
}

export function getRandomFakeName(name:string) {
  const normalizedName = removeAccents(name);
  const nameParts = normalizedName.split(" ");
  const parte1 = nameParts[0];
  const parte2 = nameParts.length > 1 ? nameParts[1] : "";

  // Gerar dois números aleatórios entre 10 e 99
  const num1 = Math.floor(Math.random() * 90) + 10;

  const nomeDeUsuario = `${parte1.substring(0, 3)}${parte2.substring(0, 5)}${num1}`;
  return nomeDeUsuario.toLowerCase();
}