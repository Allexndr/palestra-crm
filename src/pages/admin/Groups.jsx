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
      <div className="flex justify-between items-end mb-12">
        <div className="page-title-block">
          <h1 className="h1 m-0">Группы</h1>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mt-3">Управление секциями и составом</p>
        </div>
        <Link to="/admin/groups/new">
          <button className="px-8 h-12 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
            Создать группу
          </button>
        </Link>
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
                  <button className="action-btn-pill" title="Редактировать" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/groups/${group.id}/edit`);
                  }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn-pill action-btn-pill--danger" title="Удалить" onClick={(e) => {
                    e.stopPropagation();
                    setGroupToDelete(group);
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-black bg-slate-100 px-3 py-1.5 rounded-lg">{group.sport}</span>
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
                  <span className="text-muted">Заполненность</span>
                  <span>{studentCount} / {group.maxCapacity || 20}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${(studentCount / (group.maxCapacity || 20)) * 100}%` }} className="h-full bg-black" />
                </div>
              </div>

              <button 
                onClick={() => navigate(`/admin/groups/${group.id}`)}
                className="w-full h-12 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-slate-50 transition-colors border border-slate-100 rounded-xl"
              >
                Состав и настройки <ArrowRight size={14} />
              </button>
            </Card>
          );
        })}
        {groups.length === 0 && (
          <div className="col-span-full py-16 text-center text-secondary bg-white border border-slate-200 shadow-sm rounded-2xl">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-xl font-bold text-slate-800 mb-2">Нет созданных групп</p>
            <p className="mb-6 text-slate-500">Создайте первую тренировочную группу для вашего клуба.</p>
            <Link to="/admin/groups/new">
              <Button variant="primary" size="lg">Создать группу</Button>
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
