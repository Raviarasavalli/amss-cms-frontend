import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Upload, Building2, Save, IndianRupee, Lock } from 'lucide-react';
import { settingsService } from '../services';
import { useViewer } from '../context/ViewerContext';
import { Button, Field, Input, Textarea, Spinner, Card, SectionHeader } from '../components/ui';
import toast from 'react-hot-toast';
import { useState } from 'react';

const Settings = () => {
  const { isViewer } = useViewer();
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.get().then((r) => r.data.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: settings || {},
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
      if (logoFile) formData.append('logo', logoFile);
      return settingsService.update(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-3xl animate-fade-up">
      <SectionHeader
        title="Organization Settings"
        subtitle="Manage branding, financial year details, and contact info"
      />

      {isViewer && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/20 text-amber-500 text-xs flex items-center gap-2 font-medium">
          <Lock size={14} /> You are in Viewer Mode. Settings modifications are disabled.
        </Card>
      )}

      <form onSubmit={handleSubmit(mutation.mutate)} className="space-y-6">
        {/* Logo Upload Card */}
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
            <Upload size={16} className="text-indigo-500" /> Organization Logo
          </h3>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-500/10 border-2 border-dashed flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ borderColor: 'var(--border)' }}>
              {(logoPreview || settings?.logo) ? (
                <img src={logoPreview || settings?.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={24} style={{ color: 'var(--text-3)' }} />
              )}
            </div>
            <div>
              {!isViewer && (
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  <span className="btn btn-secondary btn-sm inline-flex items-center gap-1.5">
                    <Upload size={14} /> Choose Image
                  </span>
                </label>
              )}
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-3)' }}>
                PNG, JPG up to 5MB. Rendered on official PDF reports.
              </p>
            </div>
          </div>
        </Card>

        {/* Organization Information */}
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
            <Building2 size={16} className="text-indigo-500" /> General Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Organization Name" required>
              <Input {...register('organizationName', { required: true })} disabled={isViewer} placeholder="AMSS Organization" />
            </Field>
            <Field label="Financial Year Format">
              <Input {...register('financialYear')} disabled={isViewer} placeholder="January - December" />
            </Field>
            <Field label="Contact Phone">
              <Input {...register('contactPhone')} disabled={isViewer} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Contact Email">
              <Input {...register('contactEmail')} type="email" disabled={isViewer} placeholder="contact@org.com" />
            </Field>
          </div>
          <Field label="Organization Address">
            <Textarea {...register('address')} disabled={isViewer} placeholder="Full address" rows={2} />
          </Field>
        </Card>

        {/* Financial Configurations */}
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
            <IndianRupee size={16} className="text-indigo-500" /> Currency & Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Currency Symbol">
              <Input {...register('currency')} disabled={isViewer} placeholder="₹" />
            </Field>
            <Field label="Currency Code">
              <Input {...register('currencyCode')} disabled={isViewer} placeholder="INR" />
            </Field>
            <Field label="Default Monthly Contribution (₹)">
              <Input {...register('defaultContributionAmount')} type="number" min={0} disabled={isViewer} placeholder="100" />
            </Field>
          </div>
        </Card>

        {!isViewer && (
          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending} icon={Save}>
              Save Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;
