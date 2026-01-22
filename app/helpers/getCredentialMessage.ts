const defaultSiteUrl = "http://162.214.123.133:3000/";

interface CredentialMessageParams {
  user: string;
  pass: string;
  siteUrl?: string;
}

export function getCredentialMessage({
  user,
  pass,
  siteUrl = defaultSiteUrl,
}: CredentialMessageParams) {
  return [
    "Olá! Chegou a hora de fazer o cadastro anual dos centros.",
    "",
    `É só seguir esse passo a passo:`,
    "",
    "Estamos trabalhando para melhorar a segurança e a experiência de uso, mas por enquanto, use as credenciais abaixo:",
    "",
    `• Acesse o site a seguir:  ${siteUrl}`,
    `• Entre com login ${user} e a senha: ${pass}`,
    "",
    "Importante: não compartilhar a senha com outras pessoas",
    "Qualquer dúvida, estamos aqui para te ajudar.",
  ].join("\n");
}
