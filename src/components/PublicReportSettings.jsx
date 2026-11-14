import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Globe, Eye, EyeOff, Copy, CheckCircle, ExternalLink,
  ToggleLeft, ToggleRight, Calendar, RefreshCw, Info
} from 'lucide-react';
import { reportService } from '../services';
import { Card, Spinner } from '../components/ui';
import toast from 'react-hot-toast';

const PUBLIC_URL = 'https://amss-cms-frontend.vercel.app/public-reports';

const PublicReportSettings = () => {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['public-report-settings'],
    queryFn: () => reportService.getPublicSettings().then((r) => r.data.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ year, isPublished }) => reportService.togglePublishYear(year, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public-report-settings'] });
      toast.success(`Year ${variables.year} ${variables.isPublished ? 'published' : 'unpublished'} successfully`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Toggle failed'),
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(PUBLIC_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Public report link copied!');
    });
  };

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <Spinner size="lg" />
    </div>
  );

  return (
    <Card className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Globe size={18} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900">Public Report Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Control which annual reports are published to the public shareable link.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span>
          Only published years will be accessible via the public link. Unpublished years are blocked on the backend —
          not just hidden in the UI.
        </span>
      </div>

      {/* Public Link */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Shareable Public Report Link
        </label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-700 overflow-hidden">
            <Globe size={12} className="flex-shrink-0 text-emerald-500" />
            <span className="truncate">{PUBLIC_URL}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            title="Copy link"
          >
            {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={PUBLIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 transition-colors"
            title="Preview public page"
          >
            <ExternalLink size={14} /> Preview
          </a>
        </div>
      </div>

      {/* Year toggles */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Published Years
        </label>
        <div className="space-y-2">
          {settings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No years configured yet.</p>
          ) : (
            settings.map((item) => (
              <div
                key={item.year}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  item.isPublished
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.isPublished ? 'bg-emerald-100' : 'bg-slate-200'
                  }`}>
                    <Calendar size={14} className={item.isPublished ? 'text-emerald-600' : 'text-slate-500'} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Year {item.year}</div>
                    {item.isPublished && item.publishedAt ? (
                      <div className="text-xs text-emerald-600 font-medium">
                        Published {new Date(item.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">Not published</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status badge */}
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    item.isPublished
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {item.isPublished ? 'Published' : 'Private'}
                  </span>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleMutation.mutate({ year: item.year, isPublished: !item.isPublished })}
                    disabled={toggleMutation.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      item.isPublished
                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {toggleMutation.isPending ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : item.isPublished ? (
                      <><EyeOff size={12} /> Unpublish</>
                    ) : (
                      <><Eye size={12} /> Publish</>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default PublicReportSettings;
