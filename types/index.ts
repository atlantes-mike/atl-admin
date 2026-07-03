// The signed-in internal admin. Unlike a travel-desk advisor, an admin is
// cross-tenant (no enterprise) and must carry the atlantes_admin role.
export type Admin = {
  id: string
  name: string
  email: string
  roles: string[]
}
