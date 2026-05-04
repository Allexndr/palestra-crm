import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Users, User, Phone, MapPin, Eye, ArrowRight } from 'lucide-react';

export const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, members, locations } = useAdmin();
  const { t } = useTranslation();
  
  const group = groups.find(g => g.id === id);

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="h3 mb-4">{t('groups.detail.not_found')}</h2>
        <Button variant="primary" onClick={() => navigate('/admin/groups')}>{t('groups.detail.back_btn')}</Button>
      </div>
    );
  }

  const location = locations.find(l => l.id === group.locationId);
  const groupMembers = members.filter(m => m.groupId === group.id);
  const studentCount = groupMembers.length;

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header admin-page-header--center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/groups')} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div className="page-title-block page-title-block--row">
            <h1 className="h2">
              {group.name}
            </h1>
            <p className="text-secondary">{group.sport} • {studentCount} {t('common.res_members')}</p>
          </div>
        </div>
        <Link to={`/admin/groups/${id}/edit`}>
          <Button variant="outline">{t('groups.detail.settings_btn')}</Button>
        </Link>
      </div>

      <div className="admin-detail-grid admin-detail-grid--sidebar-first">
        <div className="flex flex-col gap-6">
          <Card style={{ padding: 'var(--space-6)' }}>
            <h3 className="h5 mb-4 border-b pb-2">{t('groups.detail.info_title')}</h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{t('groups.coach_label')}</p>
                <div className="flex items-center gap-2 font-bold text-slate-800"><User size={16} className="text-primary"/> {group.coach || t('groups.form.no_coach')}</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{t('groups.location_label')}</p>
                <div className="flex items-center gap-2 font-bold text-slate-800"><MapPin size={16} className="text-primary"/> {location?.name || t('common.all_branches')}</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{t('groups.capacity_progress')}</p>
                <div className="mb-1 text-sm font-bold">{t('groups.capacity_values', { current: studentCount, max: group.maxCapacity || 20 })}</div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(studentCount / (group.maxCapacity || 20)) * 100}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="h4 flex items-center gap-2"><Users className="text-primary"/> {t('groups.detail.composition_title')}</h3>
            <span className="badge badge-primary">{studentCount} чел.</span>
          </div>
          
          <div className="divide-y">
            {groupMembers.map(m => (
              <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {m.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-secondary flex items-center gap-2">
                      <span>{t(`members.skills.${m.skillLevel?.toLowerCase() || 'none'}`)}</span> • 
                      <span>Тариф: {m.plan}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-secondary flex items-center gap-2 hidden md-flex"><Phone size={14}/>{m.phone}</div>
                  <button onClick={() => navigate(`/admin/members/${m.id}`)} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-indigo-50 rounded-lg cursor-pointer">
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            ))}

            {groupMembers.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <Users size={48} className="text-slate-200 mb-4" />
                <h4 className="text-lg font-bold text-slate-700 mb-2">{t('groups.detail.empty_title')}</h4>
                <p className="text-secondary mb-6">{t('groups.detail.empty_desc')}</p>
                <Button variant="outline" onClick={() => navigate('/admin/members/new')}>{t('members.add_btn')}</Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
