const defaultSiteUrl = "https://www.aliancadigital.org.br";

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

type CentroCredential = {
  name: string;
  user?: string;
  pass?: string;
};

interface RegionalCredentialMessageParams {
  regionalName?: string;
  centros: CentroCredential[];
  siteUrl?: string;
  coordinator?: {
    user?: string;
    pass?: string;
  };
}

export function getRegionalCredentialMessage({
  regionalName,
  centros,
  siteUrl = defaultSiteUrl,
  coordinator,
}: RegionalCredentialMessageParams) {
  const centrosComCredenciais = centros.filter((c) => c.user && c.pass);

  const header = "Olá! Chegou a hora de fazer o cadastro anual dos centros.";

  const coordenadorLinha =
    coordinator?.user && coordinator?.pass
      ? `*Credenciais do coordenador da regional:* usuario: *${coordinator.user}* | senha: *${coordinator.pass}*`
      : undefined;

  const intro =
    "Aqui estão todas as credenciais de acesso dos centros que você é responsável.";

  const instrucoes = [
    "Compartilhe com o responsável pelo cadastro de cada centro e instrua a seguir os seguintes passos:",
    "",
    "1. Acessar o site https://www.aliancadigital.org.br",
    "2. Fazer login com o usuário e senha que vai receber",
    "3. Realizar o cadastro do centro",
    "4. Enviar sua resposta ao final.",
  ];

  const centroLinhas = centrosComCredenciais.map(
    (c) => `• ${c.name}: usuario: *${c.user}* | senha: *${c.pass}*`
  );

  return [
    header,
    " ",
    coordenadorLinha,
    coordenadorLinha ? " " : undefined,
    intro,
    "",
    ...instrucoes,
    "",
    "Lista de centros com usuario e senha:",
    ...centroLinhas,
    "",
    "Use com cuidado e não compartilhe sem autorização.",
    "Qualquer dúvida, estamos aqui para ajudar.",
  ]
    .filter(Boolean)
    .join("\n");
}
