import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../context/LanguageContext';

export function TeamTab({ user, coaches, navigate, setActiveTab }) {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h3 className="h4 flex items-center gap-3"><Users className="text-primary" /> {t('settings.team.title')}</h3>
        <Button variant="secondary" size="sm" onClick={() => setActiveTab('team_add')}>{t('settings.team.add_staff')}</Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: '14px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-800 truncate">{user?.name || t('settings.team.admin_role')}</p>
                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold shrink-0">{t('settings.team.you_label')}</span>
              </div>
              <p className="text-xs text-secondary mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary shrink-0">{t('settings.team.admin_role')}</span>
        </div>

        {Array.isArray(coaches) && coaches.map(coach => (
          <div key={coach.id} className="flex items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: '14px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                {coach.firstName ? coach.firstName.charAt(0) : (coach.name ? coach.name.charAt(0) : 'T')}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">
                  {coach.firstName ? `${coach.firstName} ${coach.lastName || ''}`.trim() : (coach.name || t('settings.team.coach_role'))}
                </p>
                <p className="text-xs text-secondary mt-0.5 truncate">{coach.email || coach.phone || t('settings.team.no_contacts')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('settings.team.coach_role')}</span>
              <Button variant="ghost" size="sm" className="text-slate-400" onClick={() => navigate('/admin/coaches')}>{t('settings.team.configure')}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
