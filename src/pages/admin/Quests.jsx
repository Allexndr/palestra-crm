import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Target, CheckCircle, Clock, X, Trophy, Swords, Medal } from 'lucide-react';

export const Quests = () => {
  const { quests, addQuest, removeQuest, approveQuest, members } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardPoints: 50,
    type: 'training' // training, discipline, social
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addQuest(formData);
    setIsAdding(false);
    setFormData({ title: '', description: '', rewardPoints: 50, type: 'training' });
  };

  const pendingCompletions = quests.flatMap(q => 
    (q.completions || [])
      .filter(c => c.status === 'pending')
      .map(c => ({ ...c, questId: q.id, questTitle: q.title }))
  );

  return (
    <div className="animate-fade-in pb-20">
      <div className="admin-page-header">
        <div className="page-title-block">
          <h1 className="h1">Квесты и Задания</h1>
          <p className="text-secondary font-medium">Управляйте игровыми целями для учеников</p>
        </div>
        <Button variant="primary" onClick={() => setIsAdding(true)} style={{ borderRadius: '16px', gap: '8px' }}>
          <Plus size={18} /> Создать квест
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-8 animate-up border-2 border-primary shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="h4">Новое задание</h3>
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Заголовок квеста" 
                placeholder="Пример: 100 отжиманий за вечер" 
                required 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
              <Input 
                label="Награда (XP)" 
                type="number" 
                required 
                value={formData.rewardPoints} 
                onChange={e => setFormData({...formData, rewardPoints: Number(e.target.value)})} 
              />
              <div className="input-group">
                <label className="input-label">Категория</label>
                <select 
                  className="input-field" 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="training">Тренировка</option>
                  <option value="discipline">Дисциплина</option>
                  <option value="social">Социальное</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Описание (что нужно сделать)</label>
              <textarea 
                className="input-field min-h-[100px]" 
                required
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Опишите условия выполнения квеста..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Отмена</Button>
              <Button variant="primary" type="submit">Опубликовать квест</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="flex flex-col gap-6">
          <h3 className="h4 flex items-center gap-2"><Target size={20} className="text-primary" /> Активные квесты</h3>
          <div className="grid grid-cols-1 gap-4">
            {quests.length === 0 ? (
              <Card className="text-center py-12 text-slate-400">
                <Target size={48} className="mx-auto mb-4 opacity-20" />
                <p>Пока нет активных заданий</p>
              </Card>
            ) : (
              quests.map(quest => (
                <Card key={quest.id} className="flex flex-col gap-4 border-none shadow-xl shadow-slate-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${
                        quest.type === 'training' ? 'bg-indigo-50 text-primary' : 
                        quest.type === 'discipline' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {quest.type === 'training' ? <Swords size={20} /> : 
                         quest.type === 'discipline' ? <Medal size={20} /> : <Target size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{quest.title}</h4>
                        <p className="text-xs text-muted font-medium uppercase tracking-widest">{quest.type === 'training' ? 'Тренировка' : quest.type === 'discipline' ? 'Дисциплина' : 'Особое'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-black">+{quest.rewardPoints} XP</span>
                       <button onClick={() => removeQuest(quest.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all border-none bg-transparent cursor-pointer"><X size={16}/></button>
                    </div>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">{quest.description}</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-50 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                      <CheckCircle size={14} className="text-emerald-500" /> {quest.completions?.filter(c => c.status === 'approved').length || 0} выполнено
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                      <Clock size={14} className="text-amber-500" /> {quest.completions?.filter(c => c.status === 'pending').length || 0} на проверке
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="h4 flex items-center gap-2"><Clock size={20} className="text-amber-500" /> Проверка выполнений</h3>
          <div className="flex flex-col gap-4">
            {pendingCompletions.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                 <p className="text-slate-400 font-bold text-sm">Новых запросов нет</p>
              </div>
            ) : (
              pendingCompletions.map((comp, idx) => {
                const student = members.find(m => m.id === comp.studentId);
                return (
                  <Card key={`${comp.questId}-${idx}`} className="border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">
                        {student?.firstName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{student?.firstName} {student?.lastName}</p>
                        <p className="text-[10px] text-muted font-bold uppercase">{comp.questTitle}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Button 
                         variant="primary" 
                         size="sm" 
                         className="w-full" 
                         style={{ fontSize: '11px', padding: '10px' }}
                         onClick={() => approveQuest(comp.questId, comp.studentId)}
                       >
                         Подтвердить
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="w-full text-rose-500" 
                         style={{ fontSize: '11px', padding: '10px' }}
                       >
                         Отклонить
                       </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
