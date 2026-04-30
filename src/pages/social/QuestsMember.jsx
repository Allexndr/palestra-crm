import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Target, Swords, Medal, CheckCircle, Clock, Zap } from 'lucide-react';

export const QuestsMember = () => {
  const { quests, completeQuest, user, activeChildId, members } = useAdmin();
  
  // If parent, use activeChildId, if student, use user.id
  const currentStudentId = user?.role === 'parent' ? activeChildId : user?.id;
  const currentStudent = members.find(m => m.id === currentStudentId);

  if (!currentStudentId) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <Target size={48} className="mx-auto mb-4 text-slate-200" />
        <p className="text-secondary font-bold">Выберите ученика для просмотра квестов</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="h2 mb-2">Доступные квесты</h1>
          <p className="text-secondary font-medium">Выполняйте задания и прокачивайте своего героя!</p>
        </div>
        
        {currentStudent && (
          <div className="flex items-center gap-4 bg-white p-4 rounded-[32px] border shadow-xl shadow-slate-100">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary font-black text-xl border-2 border-white shadow-sm overflow-hidden">
               {currentStudent.avatar ? <img src={currentStudent.avatar} className="w-full h-full object-cover" /> : currentStudent.firstName[0]}
            </div>
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <p className="font-black text-slate-900 text-sm">{currentStudent.firstName} {currentStudent.lastName}</p>
                 <Badge variant="primary" className="text-[9px] h-4">LVL {Math.floor((currentStudent.xp || 0) / 100) + 1}</Badge>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${(currentStudent.xp || 0) % 100}%` }}
                    ></div>
                 </div>
                 <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{currentStudent.xp || 0} XP</span>
               </div>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6">
        {quests.length === 0 ? (
          <Card className="text-center py-20 bg-white/50 border-dashed border-2 border-slate-200">
            <Zap size={64} className="mx-auto mb-6 text-slate-200" />
            <h3 className="h4 text-slate-400">Пока нет активных квестов</h3>
            <p className="text-muted text-sm mt-2">Загляните позже, тренер обязательно что-нибудь придумает!</p>
          </Card>
        ) : (
          quests.map(quest => {
            const myCompletion = quest.completions?.find(c => c.studentId === currentStudentId);
            const isCompleted = myCompletion?.status === 'approved';
            const isPending = myCompletion?.status === 'pending';

            return (
              <Card key={quest.id} className={`p-6 border-none shadow-xl transition-all ${isCompleted ? 'bg-emerald-50/50 shadow-emerald-500/5' : 'bg-white'}`}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-emerald-500 text-white' : 
                    quest.type === 'training' ? 'bg-indigo-50 text-primary' : 
                    quest.type === 'discipline' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {isCompleted ? <CheckCircle size={32} /> : 
                     quest.type === 'training' ? <Swords size={32} /> : 
                     quest.type === 'discipline' ? <Medal size={32} /> : <Target size={32} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-slate-900">{quest.title}</h3>
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">+{quest.rewardPoints} XP</p>
                      </div>
                      {isCompleted && (
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider">Выполнено</span>
                      )}
                      {isPending && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider">На проверке</span>
                      )}
                    </div>
                    <p className="text-secondary text-sm leading-relaxed mb-6">{quest.description}</p>
                    
                    {!isCompleted && !isPending && (
                      <Button 
                        variant="primary" 
                        onClick={() => completeQuest(quest.id, currentStudentId)}
                        className="w-full md:w-auto px-10"
                        style={{ borderRadius: '16px' }}
                      >
                        Я выполнил!
                      </Button>
                    )}
                    {isPending && (
                      <div className="p-4 bg-amber-50 rounded-2xl flex items-center gap-3 text-amber-700 text-sm font-bold">
                        <Clock size={18} /> Ожидайте подтверждения тренером
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <style>{`
        .h2 { font-size: 28px; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; }
      `}</style>
    </div>
  );
};
