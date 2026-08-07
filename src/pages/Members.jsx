import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2, Users, Phone, Mail, MapPin,
  Filter, MoreVertical, Eye, Calendar, DollarSign
} from 'lucide-react';
import { memberService } from '../services';
import { useViewer } from '../context/ViewerContext';
import {
  Badge, Button, Pagination, Confirm, Modal,
  Field, Input, Select, Textarea, EmptyState, SkeletonRow, Avatar, Card, SectionHeader, SearchBar
} from '../components/ui';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CURRENCY = '₹';

const MemberForm = ({ member, onSuccess, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: member || { status: 'active' },
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => member
      ? memberService.update(member._id, data)
      : memberService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success(member ? 'Member updated successfully!' : 'Member created successfully!');
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Operation failed'),
  });

  return (
    <form onSubmit={handleSubmit(mutation.mutate)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" required error={errors.name?.message}>
          <Input {...register('name', { required: 'Name is required' })} placeholder="Full name" error={!!errors.name} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input {...register('phone')} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input {...register('email')} type="email" placeholder="member@example.com" />
        </Field>
        <Field label="Status" required>
          <Select {...register('status', { required: true })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
        <Field label="Joining Date">
          <Input {...register('joiningDate')} type="date" />
        </Field>
      </div>
      <Field label="Address">
        <Textarea {...register('address')} placeholder="Full address" />
      </Field>
      <Field label="Notes">
        <Textarea {...register('notes')} placeholder="Additional notes..." />
      </Field>
      <div className="flex gap-2 justify-end pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={mutation.isPending}>
          {member ? 'Update Member' : 'Create Member'}
        </Button>
      </div>
    </form>
  );
};

const Members = () => {
  const { isViewer } = useViewer();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('memberNumber');
  const [order, setOrder] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Sync query params for action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new' && !isViewer) {
      setEditMember(null);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, isViewer]);

  const { data, isLoading } = useQuery({
    queryKey: ['members', page, search, statusFilter, sortBy, order],
    queryFn: () => memberService.getAll({ page, limit: 10, search, status: statusFilter, sortBy, order }).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => memberService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member deleted');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const members = data?.data || [];
  const pagination = data?.pagination;

  const handleEdit = (m) => { setEditMember(m); setModalOpen(true); };
  const handleAdd = () => { setEditMember(null); setModalOpen(true); };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <SectionHeader
        title="Member Directory"
        subtitle={`${pagination?.total || 0} registered members`}
        action={
          !isViewer && (
            <Button onClick={handleAdd} icon={Plus}>
              Add Member
            </Button>
          )
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Search by name, email, phone…"
          className="flex-1"
        />

        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-36"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>

          <Select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [sb, ord] = e.target.value.split('-');
              setSortBy(sb); setOrder(ord);
            }}
            className="w-40"
          >
            <option value="memberNumber-asc"># Lowest</option>
            <option value="memberNumber-desc"># Highest</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </Select>
        </div>
      </div>

      {/* Mobile Card Layout (Visible on Small Screens) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-3 w-20 skeleton" />
                </div>
              </div>
            </Card>
          ))
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members found"
            description="No members match your criteria."
          />
        ) : (
          members.map((m) => (
            <Card key={m._id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="lg" />
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>{m.name}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>Member #{m.memberNumber}</p>
                  </div>
                </div>
                <Badge status={m.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                {m.phone && (
                  <div className="flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
                    <Phone size={12} className="text-indigo-500" /> {m.phone}
                  </div>
                )}
                {m.email && (
                  <div className="flex items-center gap-1.5 truncate" style={{ color: 'var(--text-2)' }}>
                    <Mail size={12} className="text-indigo-500" /> <span className="truncate">{m.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                  <Calendar size={12} /> Joined: {m.joiningDate ? format(new Date(m.joiningDate), 'MMM yyyy') : '—'}
                </div>
              </div>

              {!isViewer && (
                <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleEdit(m)}>Edit</Button>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTarget(m)}>Delete</Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Desktop / Tablet Table (Hidden on Mobile) */}
      <Card className="hidden md:block overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Contact Details</th>
                <th className="hidden lg:table-cell">Address</th>
                <th>Joined</th>
                <th className="text-center">Status</th>
                {!isViewer && <th className="text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={isViewer ? 6 : 7} />)
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={isViewer ? 6 : 7}>
                    <EmptyState
                      icon={Users}
                      title="No members found"
                      description={search ? 'Try clearing search filters.' : 'Add your first member to get started.'}
                      action={!search && !isViewer && <Button onClick={handleAdd} icon={Plus}>Add Member</Button>}
                    />
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id}>
                    <td className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>#{m.memberNumber}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{m.name}</p>
                          {m.notes && <p className="text-[11px] truncate max-w-xs" style={{ color: 'var(--text-3)' }}>{m.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col text-xs gap-0.5" style={{ color: 'var(--text-2)' }}>
                        {m.phone && <span className="flex items-center gap-1.5"><Phone size={11} className="text-indigo-500" />{m.phone}</span>}
                        {m.email && <span className="flex items-center gap-1.5"><Mail size={11} className="text-indigo-500" />{m.email}</span>}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell text-xs" style={{ color: 'var(--text-2)' }}>
                      {m.address ? (
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <MapPin size={11} className="flex-shrink-0 text-slate-400" />
                          <span className="truncate">{m.address}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {m.joiningDate ? format(new Date(m.joiningDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="text-center">
                      <Badge status={m.status} />
                    </td>
                    {!isViewer && (
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(m)}
                            className="btn btn-ghost btn-icon-sm hover:text-indigo-500"
                            title="Edit Member"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(m)}
                            className="btn btn-ghost btn-icon-sm hover:text-red-500"
                            title="Delete Member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <Pagination
            page={page}
            pages={pagination.pages}
            total={pagination.total}
            limit={10}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Add / Edit Modal */}
      {!isViewer && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editMember ? 'Edit Member' : 'Add New Member'}
          size="lg"
        >
          <MemberForm
            member={editMember}
            onSuccess={() => setModalOpen(false)}
            onClose={() => setModalOpen(false)}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      {!isViewer && (
        <Confirm
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          loading={deleteMutation.isPending}
          title="Delete Member"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated contribution records will also be permanently removed.`}
        />
      )}
    </div>
  );
};

export default Members;
