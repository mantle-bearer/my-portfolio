# Auth And RBAC

Auth is owned by the FastAPI app and stored in PostgreSQL.

- Passwords use Argon2 through `pwdlib`.
- Access and refresh JWTs are stored in httpOnly cookies.
- Mutating requests require `x-csrf-token`.
- Token revocation uses `User.token_version`.
- RBAC uses dependency factories such as `require_permission("users:read")`.
- Password recovery uses short-lived reset JWTs and optional SMTP email.
- Users can update their profile/email, change password, and non-admin users can delete themselves.

Default roles are `admin` and `user`. Users can have multiple roles.

Built-in permissions:

- `users:read`
- `users:write`
- `roles:read`
- `roles:write`
- `items:read`
- `items:write`

Admin users receive all built-in permissions. Regular users receive item permissions for
their own item records.
