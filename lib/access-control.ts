export type UserRole =
  | "admin"
  | "coord_geral"
  | "coord_regional"
  | "presidente"
  | "rootmaster";

export type Ability =
  | "accessHome"
  | "viewAllianceSummary"
  | "viewRegionalSummary"
  | "viewCadastro"
  | "managePeople"
  | "manageCenters"
  | "manageUsers"
  | "manageRegionalCredentials"
  | "manageCadastroPeriod";

const ROLE_PRIORITY: UserRole[] = [
  "rootmaster",
  "admin",
  "coord_geral",
  "coord_regional",
  "presidente",
];

const ROLE_ABILITIES: Record<UserRole, Ability[]> = {
  rootmaster: [
    "accessHome",
    "viewAllianceSummary",
    "viewRegionalSummary",
    "viewCadastro",
    "managePeople",
    "manageCenters",
    "manageRegionalCredentials",
    "manageCadastroPeriod",
  ],
  admin: [
    "accessHome",
    "viewAllianceSummary",
    "viewRegionalSummary",
    "viewCadastro",
    "managePeople",
    "manageCenters",
    "manageUsers",
    "manageRegionalCredentials",
  ],
  coord_geral: [
    "accessHome",
    "viewAllianceSummary",
    "viewRegionalSummary",
    "viewCadastro",
    "managePeople",
    "manageCenters",
    "manageRegionalCredentials",
    "manageCadastroPeriod",
  ],
  coord_regional: [
    "accessHome",
    "viewRegionalSummary",
    "viewCadastro",
    "manageCenters",
    "manageRegionalCredentials",
  ],
  presidente: [
    "accessHome",
    "viewCadastro",
    "manageCenters",
  ],
};

const ROUTE_ABILITIES: Array<{ pattern: RegExp; ability: Ability }> = [
  { pattern: /^\/$/, ability: "accessHome" },
  { pattern: /^\/cadastro/, ability: "viewCadastro" },
  { pattern: /^\/resumo\/alianca/, ability: "viewAllianceSummary" },
  { pattern: /^\/resumo\/coordenador/, ability: "viewRegionalSummary" },
  { pattern: /^\/pessoas/, ability: "managePeople" },
  { pattern: /^\/centros/, ability: "manageCenters" },
  { pattern: /^\/credenciais/, ability: "manageRegionalCredentials" },
  { pattern: /^\/admin\/usuarios/, ability: "manageUsers" },
];

function isUserRole(value: string): value is UserRole {
  return ROLE_PRIORITY.includes(value as UserRole);
}

export function normalizeRoles(roles?: string[] | string): UserRole[] {
  const values = Array.isArray(roles) ? roles : roles ? [roles] : [];
  return values.filter(isUserRole).sort(
    (left, right) => ROLE_PRIORITY.indexOf(left) - ROLE_PRIORITY.indexOf(right)
  );
}

export function getPrimaryRole(roles?: string[] | string): UserRole | undefined {
  return normalizeRoles(roles)[0];
}

export function canAccessAbility(
  roles: string[] | string | undefined,
  ability: Ability
): boolean {
  return normalizeRoles(roles).some((role) => ROLE_ABILITIES[role].includes(ability));
}

export function canAccessPageByRoles(
  roles: string[] | string | undefined,
  pagePath: string
): boolean {
  const route = ROUTE_ABILITIES.find(({ pattern }) => pattern.test(pagePath));
  if (!route) {
    return false;
  }

  return canAccessAbility(roles, route.ability);
}

export function getInitialPageForRoles(
  roles: string[] | string | undefined,
  scope?: string
): string | undefined {
  const primaryRole = getPrimaryRole(roles);
  if (!primaryRole) {
    return undefined;
  }

  if (canAccessAbility(primaryRole, "viewAllianceSummary")) {
    return "/resumo/alianca";
  }

  if (canAccessAbility(primaryRole, "viewRegionalSummary")) {
    return scope ? `/resumo/coordenador?regionalId=${scope}` : "/resumo/coordenador";
  }

  if (canAccessAbility(primaryRole, "viewCadastro")) {
    return scope ? `/cadastro?centroId=${scope}` : "/cadastro";
  }

  return "/";
}
