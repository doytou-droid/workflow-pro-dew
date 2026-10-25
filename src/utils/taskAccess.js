export function canCreate(role) {
  return role === 'admin' || role === 'staff'
}

export function canModify(task, role, uid) {
  return role === 'admin' || (role === 'staff' && task.ownerUid === uid)
}
