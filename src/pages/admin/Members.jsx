import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus, Trash2, Edit2, Eye } from 'lucide-react';

export const Members = () => {
  const navigate = useNavigate();
  const { members, removeMember, user, selectedLocationId, groups, coaches, fixBlobUrl } = useAdmin();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const isCoach = user?.role === 'coach';
  const [searchTerm, setSearchTerm] = useState('');
  const [memberToDelete, setMemberToDelete] = useState(null);

  const currentCoach = coaches.find(c => c.name === user?.name || c.email === user?.email);
  const myGroupIds = groups.filter(g => g.coachId === currentCoach?.id).map(g => g.id);

  const filteredMembers = members.filter(m => {
    const fullName = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          (m.phone && m.phone.includes(searchTerm));
    const matchesLocation = selectedLocationId === 'all' || m.locationId === selectedLocationId;
    
    if (isCoach) {
      return matchesSearch && matchesLocation && myGroupIds.includes(m.groupId);
    }
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2 mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>
            {isAdmin ? t('members.title') : 'Мои ученики'}
          </h1>
          <p className="text-secondary text-lg">
            {isAdmin ? t('members.subtitle') : 'Список учеников в ваших группах'}
          </p>
        </div>
        <Link to="/admin/members/new">
          <Button variant="primary" style={{ gap: '8px' }}>
            <Plus size={18} /> {t('members.add_btn')}
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-slate-100" style={{ padding: 'var(--space-8)' }}>
        <div className="mb-10 relative group">
          <input 
            type="text" 
            placeholder={t('members.placeholder_search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '20px', 
              borderRadius: '20px', 
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            className="focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5 outline-none"
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '800px' }}>
            <thead>
              <tr>
                <th className="pb-4 px-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{t('members.table_member')}</th>
                <th className="pb-4 px-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{t('members.table_contacts')}</th>
                <th className="pb-4 px-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{t('members.table_plan')}</th>
                <th className="pb-4 px-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="before:block before:h-2">
              {filteredMembers.map(member => (
                <tr key={member.id} className="bg-white hover:bg-slate-50 transition-all group shadow-sm">
                  <td className="py-5 px-6 rounded-l-2xl border-y border-l border-slate-50">
                    <div className="flex items-center gap-4">
                      <div style={{ width: 44, height: 44, borderRadius: '14px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', overflow: 'hidden' }}>
                        {member.avatar ? (
                          <img src={fixBlobUrl(member.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          member.firstName?.charAt(0) || '?'
                        )}
                      </div>
                      <span className="font-bold text-slate-900 text-base">{member.firstName || ''} {member.lastName || ''}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 border-y border-slate-50 text-slate-600 font-bold">{member.phone || '—'}</td>
                  <td className="py-5 px-6 border-y border-slate-50">
                    <div className="flex items-center gap-3">
                      <span style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800' }}>
                        {groups.find(g => g.id === member.groupId)?.name || 'Нет группы'}
                      </span>
                      <span className="text-slate-400 font-medium">/</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                        {member.plan || 'Не выбран'}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right rounded-r-2xl border-y border-r border-slate-50">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="action-btn-pill" title="Смотреть профиль" onClick={() => navigate(`/admin/members/${member.id}`)}>
                        <Eye size={18} />
                      </button>
                      {isAdmin && (
                        <button className="action-btn-pill" title="Редактировать" onClick={() => navigate(`/admin/members/${member.id}/edit`)}>
                          <Edit2 size={18} />
                        </button>
                      )}
                      {isAdmin && (
                        <button className="action-btn-pill action-btn-pill--danger" title="Удалить" onClick={() => setMemberToDelete(member)}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-secondary">
              <p>{t('members.no_members')}</p>
            </div>
          )}
        </div>
      </Card>
      
      <ConfirmModal 
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete) removeMember(memberToDelete.id);
        }}
        title="Удалить ученика"
        message={`Вы действительно хотите удалить ученика "${memberToDelete?.firstName} ${memberToDelete?.lastName}"? Все связанные с ним данные будут потеряны.`}
        confirmText="Удалить навсегда"
        variant="danger"
      />
    </div>
  );
};
