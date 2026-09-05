'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Spinner, Modal, Button, Form } from 'react-bootstrap'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteUser, readUsers, createUser, updateUser, type User, type UserFormData } from './userStore'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import styles from '../solutions/SolutionsPanel.module.scss'

const PAGE_SIZES = [5, 10, 25, 50]

const UsersPanel = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  })

  // Fetch users with React Query caching
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: readUsers,
  })

  const users = usersData || []

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return users.filter((user) =>
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  }, [users, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleDelete = async (user: User) => {
    const confirmed = await confirmDeleteWithName(user.name)
    if (!confirmed) return

    const result = await deleteUser(user.id)
    if (!result.success) {
      toast.error(result.message)
      return
    }

    queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('User deleted successfully')
  }

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Blank password for editing
        role: user.role
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin'
      })
    }
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingUser) {
      // Update
      const result = await updateUser(editingUser.id, formData)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success('User updated successfully')
    } else {
      // Create
      const result = await createUser(formData)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success('User created successfully')
    }

    setShowModal(false)
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  return (
    <>
      <PageTitle title="User Management" subTitle="Panzer IT" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:users" />
            <h3>Users List</h3>
            <span className={styles.totalBadge}>{users.length}</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.addBtn} onClick={() => handleOpenModal()}>
              <IconifyIcon icon="tabler:plus" />
              Add New User
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <div className={styles.tableControls}>
              <div className={styles.pageSizeWrap}>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value))
                    setPage(1)
                  }}
                  aria-label="Entries per page"
                >
                  {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
                <span>entries per page</span>
              </div>
              <div className={styles.searchWrap}>
                <span>Search:</span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Name, email or role"
                />
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thSort}>#</th>
                    <th className={styles.thSort}>Name</th>
                    <th className={styles.thSort}>Email</th>
                    <th className={styles.thSort}>Role</th>
                    <th className={styles.thCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((user, idx) => (
                      <tr key={user.id}>
                        <td className={styles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                        <td><span className={styles.tdName} style={{ marginBottom: 0 }}>{user.name}</span></td>
                        <td><span className={styles.tdSub}>{user.email}</span></td>
                        <td>
                          <span className={clsx(
                            styles.badge, 
                            user.role === 'admin' ? styles.badgeActive : 
                            user.role === 'manager' ? styles.badgeInfo : 
                            styles.badgeWarning
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.btnEdit}
                              onClick={() => handleOpenModal(user)}
                              title="Edit user"
                            >
                              <IconifyIcon icon="tabler:pencil" />
                            </button>
                            <button
                              type="button"
                              className={styles.btnDelete}
                              onClick={() => handleDelete(user)}
                              title="Delete user"
                            >
                              <IconifyIcon icon="tabler:trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.emptyRow}>
                        <IconifyIcon icon="tabler:users" />
                        <span>No users found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                {filtered.length === 0
                  ? 'No entries'
                  : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)} of ${filtered.length} entries`}
              </span>
              <div className={styles.pageBtns}>
                <button type="button" onClick={() => setPage(1)} disabled={page === 1}>First</button>
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Prev</button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={clsx(page === pageNumber && styles.pageNumActive)}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Next</button>
                <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Enter full name" 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control 
                type="email" 
                required 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                placeholder="Enter email address" 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select 
                value={formData.role} 
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="admin">Administrator (Full Access)</option>
                <option value="manager">Manager (Content Only)</option>
                <option value="author">Author (Own Posts Only)</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                Password
                {editingUser && <span className="text-muted ms-2" style={{ fontSize: '12px' }}>(Leave blank to keep current password)</span>}
              </Form.Label>
              <Form.Control 
                type="password" 
                required={!editingUser}
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                placeholder="Enter secure password" 
                minLength={6}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingUser ? 'Save Changes' : 'Create User'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default UsersPanel
