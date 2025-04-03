
// Fix the line causing the ReactNode type error by adding string conversion
<TableCell>
  {typeof user.role === 'object' && user.role ? user.role.name : String(user.role)}
</TableCell>
