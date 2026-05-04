import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus, Users, Target, MapPin, User, ArrowRight, Edit2, Trash2 } from 'lucide-react';

export const Groups = () => {
  const navigate = useNavigate();
  const { groups, removeGroup, locations, members, user } = useAdmin();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const [groupToDelete, setGroupToDelete] = useState(null);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-12">
        <div className="page-title-block">
          <h1 className="h1 m-0">{t('groups.title')}</h1>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mt-3">{t('groups.subtitle')}</p>
        </div>
      </div>

      <div className="admin-card-grid">
        {groups.map(group => {
          const location = locations.find(l => l.id === group.locationId);
          const groupMembers = members.filter(m => m.groupId === group.id);
          const studentCount = groupMembers.length;
          
          return (
            <Card key={group.id} className="card-hover relative group overflow-hidden">
              {isAdmin && (
                <div className="card-actions-float">
                  <button className="action-btn-pill" title={t('common.edit')} onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/groups/${group.id}/edit`);
                  }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn-pill action-btn-pill--danger" title={t('common.delete')} onClick={(e) => {
                    e.stopPropagation();
                    setGroupToDelete(group);
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-slate-100 px-3 py-1.5 rounded-lg">{group.sport}</span>
              </div>
              
              <h3 className="text-lg font-black mb-6">{group.name}</h3>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-secondary">
                  <User size={14} className="text-slate-300" /> <span>{group.coach}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-secondary">
                  <MapPin size={14} className="text-slate-300" /> <span>{location?.name}</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span className="text-muted">{t('groups.capacity_progress')}</span>
                  <span>{t('groups.capacity_values', { current: studentCount, max: group.maxCapacity || 20 })}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${(studentCount / (group.maxCapacity || 20)) * 100}%`, backgroundColor: 'var(--color-primary)' }} className="h-full" />
                </div>
              </div>

              <button 
                onClick={() => navigate(`/admin/groups/${group.id}`)}
                className="w-full h-12 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-slate-50 transition-colors border border-slate-100 rounded-xl cursor-pointer"
              >
                {t('groups.composition_btn')} <ArrowRight size={14} />
              </button>
            </Card>
          );
        })}
        <Card 
          onClick={() => navigate('/admin/groups/new')}
          className="card-hover border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-10 text-center cursor-pointer group bg-slate-50/30"
          style={{ minHeight: '340px' }}
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Plus size={32} className="text-primary" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-800 mb-2">{t('groups.add_btn')}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('groups.add_subtitle')}</p>
        </Card>
      </div>

      <ConfirmModal 
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => {
          if (groupToDelete) removeGroup(groupToDelete.id);
        }}
        title={t('groups.delete_title')}
        message={t('groups.delete_confirm', { name: groupToDelete?.name })}
        confirmText={t('groups.delete_btn')}
        variant="danger"
      />
    </div>
  );
};
