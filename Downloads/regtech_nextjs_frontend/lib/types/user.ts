export interface User {
  id: string
  email: string
  name: string
  clientId: string
  tenantName?: string
  roles: string[]
  isSystemAdmin: boolean
  isServiceManager: boolean
  isTenantAdmin: boolean
}

export interface AuthUser extends User {
  firstName?: string
  lastName?: string
  phone?: string
  status: "active" | "inactive" | "suspended"
  emailVerified: boolean
  lastLogin?: Date
}
