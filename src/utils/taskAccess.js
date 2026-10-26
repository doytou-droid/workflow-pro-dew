export function canCreate(role) {
  return role === 'admin' || role === 'staff'
}

export function canModify(task, role, uid, profile) {
  if (role === 'admin') return true
  if (role === 'staff') {
    const isOwner = task.ownerUid === uid
    const isAssignee = profile && (
      task.assignee === profile.name || 
      task.assignee === profile.displayName
    )
    return isOwner || isAssignee
  }
  return false
}