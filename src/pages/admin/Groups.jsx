import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus, Users, Search, Target, MapPin, User, ArrowRight, Edit2, Trash2 } from 'lucide-react';

export const Groups = () => {
  const navigate = useNavigate();
  const { groups, removeGroup, locations, members, user } = useAdmin();
  const isAdmin = user?.role === 'admin';
  const [groupToDelete, setGroupToDelete] = useState(null);

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">Группы и секции</h1>
          <p className="text-secondary text-lg">Управление тренировочными группами и составом учеников</p>
        </div>
        <Link to="/admin/groups/new">
          <Button variant="primary">
            <Plus size={18} /> Создать группу
          </Button>
        </Link>
      </div>

      <div className="admin-card-grid">
        {groups.map(group => {
          const location = locations.find(l => l.id === group.locationId);
          const groupMembers = members.filter(m => m.groupId === group.id);
          const studentCount = groupMembers.length;
          
          return (
            <Card key={group.id} className="card-hover relative group">
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 p-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-100">
                  <button className="p-2 text-secondary hover:text-primary transition-colors hover:bg-slate-100 rounded" title="Редактировать" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/groups/${group.id}/edit`);
                  }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-secondary hover:text-danger transition-colors hover:bg-red-50 rounded" title="Удалить" onClick={(e) => {
                    e.stopPropagation();
                    setGroupToDelete(group);
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-start mb-6 pt-2">
                <div style={{ padding: '10px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', borderRadius: '12px' }}>
                  <Users size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded text-slate-500">{group.sport}</span>
              </div>
              <h3 className="h4 mb-2">{group.name}</h3>
              
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <User size={14} className="text-muted" /> <span className="font-medium text-slate-700">{group.coach}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <MapPin size={14} className="text-muted" /> <span>{location?.name}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-muted uppercase tracking-wider">Заполненность</span>
                  <span className={studentCount >= (group.maxCapacity || 20) ? 'text-danger' : 'text-primary'}>
                    {studentCount} / {group.maxCapacity || 20}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(studentCount / (group.maxCapacity || 20)) * 100}%`, height: '100%', backgroundColor: studentCount >= (group.maxCapacity || 20) ? 'var(--color-danger)' : 'var(--color-primary)' }} />
                </div>
              </div>

              <Button variant="ghost" style={{ width: '100%', gap: '8px', backgroundColor: '#f8fafc' }} onClick={() => navigate(`/admin/groups/${group.id}`)}>
                Состав и настройки <ArrowRight size={16} />
              </Button>
            </Card>
          );
        })}
        {groups.length === 0 && (
          <div className="col-span-full py-12 text-center text-secondary border-2 border-dashed border-slate-200 rounded-2xl">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-700">Нет созданных групп</p>
            <p className="mb-4">Создайте первую тренировочную группу.</p>
            <Link to="/admin/groups/new">
              <Button variant="primary">Создать группу</Button>
            </Link>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => {
          if (groupToDelete) removeGroup(groupToDelete.id);
        }}
        title="Удалить группу"
        message={`Вы действительно хотите удалить группу "${groupToDelete?.name}"? Все ученики этой группы останутся в базе, но будут отвязаны от группы.`}
        confirmText="Удалить навсегда"
        variant="danger"
      />
    </div>
  );
};
