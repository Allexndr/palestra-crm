import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../../context/NotificationContext';
import { Plus, Trash2, Edit2, Eye, Copy } from 'lucide-react';

export const Members = () => {
  const navigate = useNavigate();
  const { members, removeMember, user, selectedLocationId, groups, coaches, fixBlobUrl } = useAdmin();
  const { t } = useTranslation();
  const { showNotification, confirm } = useNotifications();
  const isAdmin = user?.role === 'admin';
  const isCoach = user?.role === 'coach';
  const [searchTerm, setSearchTerm] = useState('');

  const currentCoach = (Array.isArray(coaches) ? coaches : []).find(c => c.name === user?.name || c.email === user?.email);
  const myGroupIds = (Array.isArray(groups) ? groups : []).filter(g => g.coachId === currentCoach?.id).map(g => g.id);

  const filteredMembers = (Array.isArray(members) ? members : []).filter(m => {
    const fullName = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          (m.phone && m.phone.includes(searchTerm));
    const matchesLocation = selectedLocationId === 'all' || m.locationId === selectedLocationId;
    
    if (isCoach) {
      return matchesSearch && matchesLocation && (myGroupIds || []).includes(m.groupId);
    }
    return matchesSearch && matchesLocation;
  });

  const MemberActions = ({ member }) => (
    <div className="flex gap-2">
      <button className="action-btn-pill" title={t('coaches.form.copy_creds')} onClick={() => {
        const text = `Login: ${member.login || member.email}\nPassword: ${member.password || '123456'}`;
        navigator.clipboard.writeText(text);
        showNotification({ message: t('common.success'), type: 'success' });
      }}><Copy size={16} /></button>
      <button className="action-btn-pill" title={t('members.view_profile')} onClick={() => navigate(`/admin/members/${member.id}`)}>
        <Eye size={16} />
      </button>
      {isAdmin && (
        <button className="action-btn-pill" title={t('common.edit')} onClick={() => navigate(`/admin/members/${member.id}/edit`)}>
          <Edit2 size={16} />
        </button>
      )}
      {isAdmin && (
        <button className="action-btn-pill action-btn-pill--danger" title={t('common.delete')} onClick={async () => {
          const ok = await confirm({ title: t('members.delete_title'), message: t('members.delete_confirm', { name: `${member.firstName} ${member.lastName}` }), confirmText: t('members.delete_btn'), variant: 'danger' });
          if (ok) { removeMember(member.id); showNotification({ message: t('common.success'), type: 'success' }); }
        }}><Trash2 size={16} /></button>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2 mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>
            {isAdmin ? t('members.title') : t('members.coach_title')}
          </h1>
          <p className="text-secondary text-lg">
            {isAdmin ? t('members.subtitle') : t('members.coach_subtitle')}
          </p>
        </div>
        <Link to="/admin/members/new">
          <Button variant="primary" style={{ gap: '8px', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> {t('members.add_btn')}
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-slate-100" style={{ padding: 'var(--space-4)' }}>
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder={t('members.placeholder_search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '14px',
              border: '1.5px solid var(--color-border)', backgroundColor: 'var(--color-bg)',
              fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s ease', boxSizing: 'border-box'
            }}
            className="focus:border-primary focus:bg-white outline-none"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-10 text-secondary">
            <p>{t('members.no_members')}</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="members-mobile-list">
              {filteredMembers.map(member => (
                <div key={member.id} className="members-mobile-card" onClick={() => navigate(`/admin/members/${member.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', flexShrink: 0, overflow: 'hidden' }}>
                      {member.avatar ? <img src={fixBlobUrl(member.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.firstName?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.firstName} {member.lastName}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, marginTop: 2 }}>
                        {member.phone || '—'} · {(groups || []).find(g => g.id === member.groupId)?.name || t('members.no_group')}
                      </p>
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <MemberActions member={member} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="members-desktop-table">
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                <thead>
                  <tr>
                    <th className="pb-3 px-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{t('members.table_member')}</th>
                    <th className="pb-3 px-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{t('members.table_contacts')}</th>
                    <th className="pb-3 px-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{t('members.table_plan')}</th>
                    <th className="pb-3 px-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="bg-white hover:bg-slate-50 transition-all group shadow-sm">
                      <td className="py-4 px-4 rounded-l-2xl border-y border-l border-slate-50">
                        <div className="flex items-center gap-3">
                          <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', overflow: 'hidden' }}>
                            {member.avatar ? <img src={fixBlobUrl(member.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.firstName?.charAt(0) || '?'}
                          </div>
                          <span className="font-bold text-slate-900">{member.firstName || ''} {member.lastName || ''}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 border-y border-slate-50 text-slate-600 font-bold text-sm">{member.phone || '—'}</td>
                      <td className="py-4 px-4 border-y border-slate-50">
                        <div className="flex items-center gap-2">
                          <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800' }}>
                            {(groups || []).find(g => g.id === member.groupId)?.name || t('members.no_group')}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{member.plan || t('members.no_plan')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right rounded-r-2xl border-y border-r border-slate-50">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MemberActions member={member} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
