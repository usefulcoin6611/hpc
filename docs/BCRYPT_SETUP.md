# Bcrypt Setup (Optional)

Jika ingin menggunakan password encryption dengan bcrypt, ikuti langkah berikut:

## Install Python

1. Download Python dari https://www.python.org/downloads/
2. Install dengan opsi "Add Python to PATH"
3. Restart Command Prompt

## Install bcrypt

```bash
npm install bcrypt @types/bcrypt
```

## Update auth-utils.ts

Tambahkan import bcrypt:

```typescript
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const SALT_ROUNDS = 10

// Password utilities dengan encryption
export class PasswordUtils {
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS)
      return await bcrypt.hash(password, salt)
    } catch (error) {
      throw new Error(`Failed to hash password: ${error}`)
    }
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      throw new Error(`Failed to compare password: ${error}`)
    }
  }
}
```

## Update Database Schema

Ubah field `password` menjadi `password_hash`:

```sql
ALTER TABLE users RENAME COLUMN password TO password_hash;
```

## Update API Routes

Ubah semua referensi dari `password` ke `password_hash` di API routes. 