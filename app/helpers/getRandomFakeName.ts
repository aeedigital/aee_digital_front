export function getRandomFakeName(name: string) {
  const nameParts = name.split(" ")
  const parte1 = nameParts[0];
  const parte2 = nameParts.length > 1 ? nameParts[1] : ""

  // gerar dois números aleatórios entre 10 e 99
  var num1 = Math.floor(Math.random() * 90) + 10;


  const nomeDeUsuario = `${parte1.substring(0, 3)}${parte2.substring(0, 5)}${num1}`;
  return nomeDeUsuario.toLowerCase();
}