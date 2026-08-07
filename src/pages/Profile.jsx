import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useViewer } from '../context/ViewerContext';
import { Button, Field, Input, Card, SectionHeader, Avatar, Badge } from '../components/ui';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { isViewer } = useViewer();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const { register: registerPwd, handleSubmit: handlePwdSubmit, formState: { errors: pwdErrors }, reset: resetPwd } = useForm();

  const profileMutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      return authService.updateProfile(formData);
    },
    onSuccess: ({ data }) => {
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const pwdMutation = useMutation({
    mutationFn: (data) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      resetPwd();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Password change failed'),
  });

  return (
    <div className="space-y-6 max-w-2xl animate-fade-up">
      <SectionHeader
        title="My Account"
        subtitle="Manage your profile information and authentication settings"
      />

      {/* Account Info Card */}
      <Card className="p-6 flex items-center gap-5">
        <Avatar name={user?.name || 'A'} size="lg" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>{user?.name}</h2>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{user?.email}</p>
          <div className="flex gap-2 mt-1">
            <Badge status={user?.role || 'admin'} />
            {isViewer && <Badge status="viewer" label="Viewer Active" />}
          </div>
        </div>
      </Card>

      {/* Update Profile Card */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <User size={16} className="text-indigo-500" /> Personal Information
        </h3>
        <form onSubmit={handleProfileSubmit(profileMutation.mutate)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required error={profileErrors.name?.message}>
              <Input {...registerProfile('name', { required: 'Name is required' })} disabled={isViewer} placeholder="Your name" />
            </Field>
            <Field label="Email Address" required error={profileErrors.email?.message}>
              <Input
                {...registerProfile('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                type="email"
                disabled={isViewer}
                placeholder="your@email.com"
              />
            </Field>
          </div>
          {!isViewer && (
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={profileMutation.isPending} icon={Save}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Change Password Card */}
      {!isViewer && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
            <Lock size={16} className="text-indigo-500" /> Change Password
          </h3>
          <form onSubmit={handlePwdSubmit(pwdMutation.mutate)} className="space-y-4">
            <Field label="Current Password" required error={pwdErrors.currentPassword?.message}>
              <div className="relative">
                <Input
                  {...registerPwd('currentPassword', { required: 'Current password is required' })}
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
            <Field label="New Password" required error={pwdErrors.newPassword?.message}>
              <div className="relative">
                <Input
                  {...registerPwd('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password (min 6 chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" loading={pwdMutation.isPending} icon={Lock}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Profile;
