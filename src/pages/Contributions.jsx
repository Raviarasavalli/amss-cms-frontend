import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, DollarSign, Search, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import { contributionService, memberService } from '../services';
import { useViewer } from '../context/ViewerContext';
import {
  Button, Pagination, Confirm, Modal,
  Field, Select, EmptyState, SkeletonRow, Avatar, Card, SectionHeader, SearchBar, Badge, Spinner
} from '../components/ui';
import { AVAILABLE_YEARS, DEFAULT_YEAR } from '../utils/constants';
import toast from 'react-hot-toast';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const CURRENCY = '₹';

const ContributionForm = ({ contribution, onSuccess, onClose }) => {
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members-all'],
    queryFn: () => memberService.getAllList().then((r) => r.data.data),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      memberId: contribution?.memberId?._id || contribution?.memberId || '',
      year: contribution?.year || DEFAULT_YEAR,
      ...MONTHS.reduce((acc, m) => ({ ...acc, [m]: contribution?.[m] || 0 }), {}),
    },
  });

  const queryClient = useQueryClient();
  const watchedValues = watch(MONTHS);
  const total = watchedValues.reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, year: parseInt(data.year) };
      MONTHS.forEach((m) => { payload[m] = parseFloat(payload[m]) || 0; });
      return contribution
        ? contributionService.update(contribution._id, payload)
        : contributionService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(contribution ? 'Contribution record updated!' : 'Contribution record saved!');
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Operation failed'),
  });

  if (membersLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <form onSubmit={handleSubmit(mutation.mutate)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Select Member" required error={errors.memberId?.message}>
          <Select {...register('memberId', { required: 'Member is required' })} disabled={!!contribution}>
            <option value="">Choose member…</option>
            {(membersData || []).map((m) => (
              <option key={m._id} value={m._id}>#{m.memberNumber} — {m.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Financial Year" required>
          <Select {...register('year', { required: true })} disabled={!!contribution}>
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-1)' }}>Monthly Payments ({CURRENCY})</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {MONTHS.map((month, i) => (
            <div key={month} className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-center" style={{ color: 'var(--text-3)' }}>{MONTH_LABELS[i]}</span>
              <input
                type="number"
                min={0}
                step={0.01}
                {...register(month)}
                className="input text-center text-xs py-1.5 px-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <span className="text-xs font-semibold text-indigo-500">Auto-Calculated Total</span>
        <span className="text-base font-bold text-indigo-500">{CURRENCY}{total.toLocaleString('en-IN')}</span>
      </div>

      <div className="flex gap-2 justify-end pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={mutation.isPending}>Save Contribution</Button>
      </div>
    </form>
  );
};

const Contributions = () => {
  const { isViewer } = useViewer();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editContrib, setEditContrib] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedMobileCards, setExpandedMobileCards] = useState({});

  useEffect(() => {
    if (searchParams.get('action') === 'new' && !isViewer) {
      setEditContrib(null);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, isViewer]);

  const { data, isLoading } = useQuery({
    queryKey: ['contributions', page, year],
    queryFn: () => contributionService.getAll({ page, limit: 30, year }).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contributionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Contribution record deleted');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const rawContributions = data?.data || [];
  const pagination = data?.pagination;

  const contributions = rawContributions.filter((c) =>
    !search || c.memberId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMobileExpand = (id) => {
    setExpandedMobileCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <SectionHeader
        title="Contribution Ledger"
        subtitle={`Monthly ledger for Financial Year ${year}`}
        action={
          <div className="flex gap-2">
            <Select value={year} onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }} className="w-32 font-bold">
              {AVAILABLE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
            {!isViewer && (
              <Button onClick={() => { setEditContrib(null); setModalOpen(true); }} icon={Plus}>
                Add Entry
              </Button>
            )}
          </div>
        }
      />

      {/* Search Filter */}
      <div className="flex gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by member name…"
          className="w-full sm:w-72"
        />
      </div>

      {/* Mobile Member Cards Layout */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="h-4 w-32 skeleton" />
              <div className="h-3 w-24 skeleton" />
            </Card>
          ))
        ) : contributions.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No contribution records"
            description={`No contribution entries found for year ${year}.`}
          />
        ) : (
          contributions.map((c) => {
            const rowTotal = MONTHS.reduce((s, m) => s + (c[m] || 0), 0);
            const isExpanded = expandedMobileCards[c._id];
            return (
              <Card key={c._id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.memberId?.name || 'M'} />
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>{c.memberId?.name}</h4>
                      <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>Member #{c.memberId?.memberNumber || '—'}</p>
                    </div>
                  </div>
                  <Badge status={c.memberId?.status || 'active'} />
                </div>

                <div className="flex items-center justify-between py-2 border-y" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Year {c.year} Total</span>
                  <span className="text-sm font-bold text-emerald-500">{CURRENCY}{rowTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-1 text-xs">
                  {(isExpanded ? MONTHS : MONTHS.slice(0, 4)).map((m, idx) => (
                    <div key={m} className="flex justify-between py-0.5">
                      <span style={{ color: 'var(--text-3)' }}>{MONTH_FULL[idx]}:</span>
                      <span className={c[m] > 0 ? 'font-semibold text-emerald-500' : 'text-slate-400'}>
                        {c[m] > 0 ? `${CURRENCY}${c[m]}` : '₹0'}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => toggleMobileExpand(c._id)}
                  className="text-xs font-semibold text-indigo-500 flex items-center justify-center gap-1 pt-1"
                >
                  {isExpanded ? <>Show Less <ChevronUp size={14} /></> : <>View All 12 Months <ChevronDown size={14} /></>}
                </button>

                {!isViewer && (
                  <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <Button variant="ghost" size="sm" icon={Edit2} onClick={() => { setEditContrib(c); setModalOpen(true); }}>Edit</Button>
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTarget(c)}>Delete</Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Full 12-Month Table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="text-center">{m}</th>
                ))}
                <th className="text-center">Total</th>
                {!isViewer && <th className="text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={isViewer ? 15 : 16} />)
              ) : contributions.length === 0 ? (
                <tr>
                  <td colSpan={isViewer ? 15 : 16}>
                    <EmptyState
                      icon={DollarSign}
                      title="No records found"
                      description={`No contributions recorded for ${year}.`}
                      action={!isViewer && <Button onClick={() => { setEditContrib(null); setModalOpen(true); }} icon={Plus}>Add Contribution</Button>}
                    />
                  </td>
                </tr>
              ) : (
                contributions.map((c) => {
                  const rowTotal = MONTHS.reduce((s, m) => s + (c[m] || 0), 0);
                  return (
                    <tr key={c._id}>
                      <td className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>#{c.memberId?.memberNumber || '—'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={c.memberId?.name || 'M'} size="sm" />
                          <span className="font-semibold text-xs whitespace-nowrap" style={{ color: 'var(--text-1)' }}>
                            {c.memberId?.name}
                          </span>
                        </div>
                      </td>
                      {MONTHS.map((m) => (
                        <td key={m} className={`text-center text-xs whitespace-nowrap ${c[m] > 0 ? 'text-emerald-500 font-medium' : 'text-slate-400'}`}>
                          {c[m] > 0 ? `${CURRENCY}${c[m]}` : '—'}
                        </td>
                      ))}
                      <td className="text-center font-bold text-xs text-amber-500 whitespace-nowrap">
                        {CURRENCY}{rowTotal.toLocaleString('en-IN')}
                      </td>
                      {!isViewer && (
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { setEditContrib(c); setModalOpen(true); }}
                              className="btn btn-ghost btn-icon-sm hover:text-indigo-500"
                              title="Edit Record"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="btn btn-ghost btn-icon-sm hover:text-red-500"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <Pagination
            page={page}
            pages={pagination.pages}
            total={pagination.total}
            limit={30}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Add / Edit Form Modal */}
      {!isViewer && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editContrib ? 'Edit Contribution Record' : 'New Contribution Entry'}
          size="lg"
        >
          <ContributionForm
            contribution={editContrib}
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
          title="Delete Contribution Record"
          message={`Are you sure you want to delete the ${deleteTarget?.year} contribution record for "${deleteTarget?.memberId?.name}"?`}
        />
      )}
    </div>
  );
};

export default Contributions;
