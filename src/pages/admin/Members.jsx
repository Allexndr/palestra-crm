import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus, Search, Trash2, Edit2, Eye } from 'lucide-react';

export const Members = () => {
  const navigate = useNavigate();
  const { members, removeMember, user, selectedLocationId, groups } = useAdmin();
  const isAdmin = user?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [memberToDelete, setMemberToDelete] = useState(null);

  const filteredMembers = members.filter(m => {
    const fullName = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          (m.phone && m.phone.includes(searchTerm));
    const matchesLocation = selectedLocationId === 'all' || m.locationId === selectedLocationId;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-12 flex flex-col md-flex-row justify-between items-start md-items-center gap-6">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2 mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>
            {isAdmin ? 'База учеников' : 'Мои ученики'}
          </h1>
          <p className="text-secondary text-lg">
            {isAdmin ? 'Управление всеми клиентами клуба' : 'Список учеников в ваших группах'}
          </p>
        </div>
        <Link to="/admin/members/new">
          <Button variant="primary" style={{ gap: '8px' }}>
            <Plus size={18} /> Добавить ученика
          </Button>
        </Link>
      </div>

      <Card className="card-hover">
        <div className="mb-8 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Поиск по имени, фамилии или номеру телефона..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px 16px 16px 48px', 
              borderRadius: '16px', 
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-ice-100)',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="pb-6 px-4 text-muted font-bold text-xs uppercase tracking-wider">Ученик</th>
                <th className="pb-6 px-4 text-muted font-bold text-xs uppercase tracking-wider">Контакты</th>
                <th className="pb-6 px-4 text-muted font-bold text-xs uppercase tracking-wider">Тариф</th>
                <th className="pb-6 px-4 text-muted font-bold text-xs uppercase tracking-wider text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }} className="hover:bg-slate-50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                        {member.firstName.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{member.firstName} {member.lastName}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-secondary font-medium">{member.phone || '—'}</td>
                  <td className="py-5 px-4">
                    <div className="flex flex-col gap-1">
                      <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', fontSize: '10px', fontWeight: '800', width: 'fit-content' }}>
                        {groups.find(g => g.id === member.groupId)?.name || 'Нет группы'}
                      </span>
                      <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid var(--color-border)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                        {member.plan || 'Не выбран'}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="icon-btn text-primary hover:bg-indigo-50" title="Смотреть профиль" onClick={() => navigate(`/admin/members/${member.id}`)}>
                        <Eye size={18} />
                      </button>
                      {isAdmin && (
                        <button className="icon-btn text-secondary hover:bg-slate-100" title="Редактировать" onClick={() => navigate(`/admin/members/${member.id}/edit`)}>
                          <Edit2 size={18} />
                        </button>
                      )}
                      {isAdmin && (
                        <button className="icon-btn text-danger hover:bg-red-50" title="Удалить" onClick={() => setMemberToDelete(member)}>
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
              <p>Учеников не найдено.</p>
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
