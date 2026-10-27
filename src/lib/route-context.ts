/** SOF member workspace (authenticated program area). */
export function isSofSecurePath(pathname: string): boolean {
  return pathname === "/sof-solutions/secure" || pathname.startsWith("/sof-solutions/secure/");
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Routes that skip heavy platform effects (cursor, boot screen, mutation observer). */
export function isLightPortalPath(pathname: string): boolean {
  return isSofSecurePath(pathname) || isAdminPath(pathname);
}
