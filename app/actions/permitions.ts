// /app/actions/permissions.ts
export type UserRole = 'coord_geral' | 'coord_regional' | 'presidente';

const permissions: Record<UserRole, RegExp[]> = {
  coord_geral: [/^\/$/, /^\/summary(\/[^\/]+)?$/, /^\/summary_coord(\/[^\/]+)?$/, /^\/summary_alianca$/],
  coord_regional: [/^\/$/, /^\/summary(\/[^\/]+)?$/, /^\/summary_coord(\/[^\/]+)?$/],
  presidente: [/^\/$/, /^\/summary(\/[^\/]+)?$/],
};

const initialPage: Record<UserRole, string> ={
  coord_geral: '/summary_alianca',
  coord_regional: '/summary_coord',
  presidente: '/summary'
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
  const allowedPages = permissions[userRole];
  return allowedPages.some((pattern) => pattern.test(pagePath));
}
