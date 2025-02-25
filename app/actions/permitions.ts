// /app/actions/permissions.ts
export type UserRole = 'coord_geral' | 'coord_regional' | 'presidente' | 'admin';

const permissions: Record<UserRole, RegExp[]> = {
  admin:[
    /^\/$/,
    /^\/cadastro(\/[^\/]+)?$/,
    /^\/resumo\/coordenador(\/[^\/]+)?$/,
    /^\/resumo\/coordenador(\/[^\/]+)?\/credenciais$/,
    /^\/resumo\/alianca(\/[^\/]+)?$/,
    /^\/pessoas(\/[^\/]+)?$/,
  ],
  coord_geral: [
    /^\/$/,
    /^\/cadastro(\/[^\/]+)?$/,
    /^\/resumo\/coordenador(\/[^\/]+)?$/,
    /^\/resumo\/coordenador(\/[^\/]+)?\/credenciais$/,
    /^\/resumo\/alianca$(\/[^\/]+)?$/
  ],
  coord_regional: [
    /^\/$/,
    /^\/cadastro(\/[^\/]+)?$/,
    /^\/resumo\/coordenador(\/[^\/]+)?$/,
    /^\/resumo\/coordenador(\/[^\/]+)?\/credenciais$/

  ],
  presidente: [
    /^\/$/,
    /^\/cadastro(\/[^\/]+)?$/
  ],
};

const initialPage: Record<UserRole, string> ={
  admin: '/resumo/alianca',
  coord_geral: '/resumo/alianca',
  coord_regional: '/resumo/coordenador',
  presidente: '/cadastro'
}

export function getInitialPage(userRole: UserRole, scope: string | undefined){
  let pagePath = initialPage[userRole]

  let path;
  if(scope != undefined){
    path = `${pagePath}/${scope}`
  }else{
    path = pagePath
  }

  return path
}

export function canAccessPage(userRole: UserRole, pagePath: string): boolean {
  
  console.log("userRole", userRole)
  
  const allowedPages = permissions[userRole];
  return allowedPages.some((pattern) => pattern.test(pagePath));
}
