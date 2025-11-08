import * as bcrypt from "bcryptjs"
import { jwtVerify, SignJWT } from "jose"
import { query } from "./db"
import { v4 as uuidv4 } from "uuid"
import { encryptField, decryptField } from "./encryption"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars-long")

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createJWT(payload: {
  userId: string
  clientId: string
  email: string
  roles: string[]
}): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(secret)
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export const verifyToken = verifyJWT

export async function createUser(
  clientId: string,
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  roleIds: string[],
): Promise<any> {
  try {
    const existingUser: any = await query(`SELECT id FROM tbl_users WHERE email = ? LIMIT 1`, [email])

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      throw new Error("Email already registered")
    }

    const passwordHash = await hashPassword(password)

    const userId = uuidv4()

    const encryptedFirstName = encryptField(firstName)
    const encryptedLastName = encryptField(lastName)

    await query(
      `INSERT INTO tbl_users (id, client_id, email, first_name, last_name, password_hash, first_name_encrypted, last_name_encrypted)
        VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
      [userId, clientId, email, encryptedFirstName, encryptedLastName, passwordHash],
    )

    for (const roleId of roleIds) {
      await query(`INSERT INTO tbl_user_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleId])
    }

    const user: any = await query(
      `SELECT id, email, first_name, last_name, status, first_name_encrypted, last_name_encrypted FROM tbl_users WHERE id = ?`,
      [userId],
    )

    if (Array.isArray(user) && user.length > 0) {
      return {
        ...user[0],
        first_name: decryptField(user[0].first_name),
        last_name: decryptField(user[0].last_name),
      }
    }

    return Array.isArray(user) ? user[0] : user
  } catch (error) {
    console.error("[v0] User creation error:", error)
    throw error
  }
}

export async function findUserByEmail(email: string): Promise<any> {
  try {
    const result = await query(
      `SELECT u.*, 
        u.first_name_encrypted, 
        u.last_name_encrypted,
        GROUP_CONCAT(r.role_name) as roles
        FROM tbl_users u
        LEFT JOIN tbl_user_roles ur ON u.id = ur.user_id
        LEFT JOIN tbl_roles r ON ur.role_id = r.id
        WHERE u.email = ? AND u.deleted_at IS NULL
        GROUP BY u.id`,
      [email],
    )

    if ((result as any[]).length > 0) {
      const user = (result as any[])[0]

      let firstName = user.first_name
      let lastName = user.last_name

      try {
        // Only decrypt if the flag indicates it's encrypted
        if (user.first_name_encrypted && firstName) {
          firstName = decryptField(firstName) || firstName
        }
        if (user.last_name_encrypted && lastName) {
          lastName = decryptField(lastName) || lastName
        }
      } catch (decryptError) {
        console.error("[v0] Failed to decrypt user fields:", decryptError)
        // Return plaintext names if decryption fails
        firstName = user.first_name || null
        lastName = user.last_name || null
      }

      return {
        ...user,
        first_name: firstName,
        last_name: lastName,
      }
    }

    return null
  } catch (error) {
    console.error("[v0] User lookup error:", error)
    throw error
  }
}

export async function authenticateUser(email: string, password: string): Promise<any> {
  const user = await findUserByEmail(email)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  if (!user.password_hash) {
    throw new Error("Invalid credentials")
  }

  const passwordValid = await verifyPassword(password, user.password_hash)

  if (!passwordValid) {
    throw new Error("Invalid credentials")
  }

  return user
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const result = await query(
    `SELECT DISTINCT r.role_name
      FROM tbl_user_roles ur
      JOIN tbl_roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?`,
    [userId],
  )

  return ((result as any[]) || []).map((r) => r.role_name)
}

export async function verifyAuth(request: Request): Promise<{
  authenticated: boolean
  user?: any
  error?: string
}> {
  try {
    const cookieHeader = request.headers.get("cookie")
    if (!cookieHeader) {
      return { authenticated: false, error: "No authentication token" }
    }

    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    const token = cookies["auth-token"]
    if (!token) {
      return { authenticated: false, error: "No authentication token" }
    }

    const payload = await verifyJWT(token)

    const user = await findUserByEmail(payload.email)
    if (!user) {
      return { authenticated: false, error: "User not found" }
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        client_id: user.client_id,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles ? user.roles.split(",") : [],
      },
    }
  } catch (error) {
    console.error("[v0] Auth verification error:", error)
    return { authenticated: false, error: "Invalid authentication token" }
  }
}
