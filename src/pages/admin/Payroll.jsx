import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DollarSign, Calendar, User, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import { formatKzt } from '../../utils/money';

export const Payroll = () => {
  const { coaches, attendance, schedule, addTransaction } = useAdmin();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const payrollData = useMemo(() => {
    const data = coaches.map(coach => {
      // Find all classes led by this coach
      const coachClasses = schedule.filter(s => s.coachId === coach.id);
      const coachClassIds = coachClasses.map(s => s.id);

      // Find attendance records for these classes in the selected month
      const relevantAttendance = attendance.filter(a => {
        const date = new Date(a.date);
        return coachClassIds.includes(a.classId) && 
               date.getMonth() === selectedMonth && 
               date.getFullYear() === selectedYear;
      });

      let totalEarned = 0;
      const rate = Number(coach.salaryRate || 2000);

      relevantAttendance.forEach(a => {
        if (coach.salaryType === 'per_student') {
          totalEarned += a.memberIds.length * rate;
        } else if (coach.salaryType === 'per_session') {
          totalEarned += rate;
        } else {
          // Monthly - handled separately or just shown as is
          totalEarned = rate;
        }
      });

      if (coach.salaryType === 'monthly' && relevantAttendance.length > 0) {
        totalEarned = rate;
      } else if (coach.salaryType === 'monthly' && relevantAttendance.length === 0) {
        totalEarned = 0; // No sessions, no pay? Or just fix.
      }

      return {
        ...coach,
        sessionsCount: relevantAttendance.length,
        studentsCount: relevantAttendance.reduce((acc, a) => acc + a.memberIds.length, 0),
        totalEarned
      };
    });

    return data;
  }, [coaches, attendance, schedule, selectedMonth, selectedYear]);

  const totalPayout = payrollData.reduce((acc, coach) => acc + coach.totalEarned, 0);

  const handlePaySalary = (coach) => {
    if (coach.totalEarned <= 0) return;
    
    const confirmPay = window.confirm(`Выплатить зарплату ${coach.firstName} ${coach.lastName} в размере ${formatKzt(coach.totalEarned)}?`);
    if (confirmPay) {
      addTransaction({
        type: 'expense',
        amount: coach.totalEarned,
        description: `Зарплата: ${coach.firstName} ${coach.lastName} (${months[selectedMonth]})`,
        category: 'Зарплата'
      });
      alert('Выплата зафиксирована в финансах клуба.');
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="admin-page-header">
        <div className="page-title-block page-title-block--row">
          <h1 className="h1">Расчет зарплат</h1>
          <p className="text-secondary font-medium">Автоматический расчет выплат на основе посещаемости</p>
        </div>

        <div className="flex gap-4 items-center bg-white p-2 rounded-2xl border shadow-sm">
           <select 
             className="bg-transparent border-none font-bold text-sm outline-none px-4 py-2 cursor-pointer"
             value={selectedMonth}
             onChange={e => setSelectedMonth(Number(e.target.value))}
           >
             {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
           </select>
           <div className="w-[1px] h-6 bg-slate-200"></div>
           <select 
             className="bg-transparent border-none font-bold text-sm outline-none px-4 py-2 cursor-pointer"
             value={selectedYear}
             onChange={e => setSelectedYear(Number(e.target.value))}
           >
             <option value={2026}>2026</option>
             <option value={2025}>2025</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <Card className="bg-primary text-white border-none shadow-xl shadow-indigo-200">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><DollarSign size={24} /></div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Общий ФОТ за месяц</p>
               <h2 className="text-3xl font-black">{formatKzt(totalPayout)}</h2>
             </div>
           </div>
           <div className="flex items-center gap-2 text-xs font-bold bg-white/10 p-3 rounded-xl border border-white/10">
              <TrendingUp size={14} /> На {payrollData.length} тренеров
           </div>
        </Card>
        
        <Card className="bg-white border-none shadow-xl shadow-slate-100 flex flex-col justify-center">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-primary rounded-2xl flex items-center justify-center"><Calendar size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Проведено тренировок</p>
                <p className="text-2xl font-black text-slate-900">{payrollData.reduce((acc, c) => acc + c.sessionsCount, 0)} сессий</p>
              </div>
           </div>
        </Card>

        <Card className="bg-white border-none shadow-xl shadow-slate-100 flex flex-col justify-center">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><User size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Обучено учеников</p>
                <p className="text-2xl font-black text-slate-900">{payrollData.reduce((acc, c) => acc + c.studentsCount, 0)} чел.</p>
              </div>
           </div>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="h4 flex items-center gap-3"><Clock size={20} className="text-primary" /> Детализация по тренерам</h3>
        
        {payrollData.map(coach => (
          <Card key={coach.id} className="p-8 border-none shadow-xl shadow-slate-100 hover:shadow-indigo-100 transition-all group">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                   {coach.avatar ? <img src={coach.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{coach.firstName[0]}</div>}
                 </div>
                 <div>
                    <h4 className="font-bold text-xl text-slate-900 mb-1">{coach.firstName} {coach.lastName}</h4>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">{coach.specialization}</span>
                      <span className="text-xs text-muted font-medium">Ставка: {formatKzt(coach.salaryRate)} / {coach.salaryType === 'per_session' ? 'сессия' : coach.salaryType === 'per_student' ? 'ученик' : 'месяц'}</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap gap-8 items-center">
                 <div className="text-center min-w-[80px]">
                    <p className="text-[10px] font-bold text-muted uppercase mb-1">Сессии</p>
                    <p className="text-lg font-bold text-slate-700">{coach.sessionsCount}</p>
                 </div>
                 <div className="text-center min-w-[80px]">
                    <p className="text-[10px] font-bold text-muted uppercase mb-1">Ученики</p>
                    <p className="text-lg font-bold text-slate-700">{coach.studentsCount}</p>
                 </div>
                 <div className="text-right min-w-[140px]">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">К выплате</p>
                    <p className="text-2xl font-black text-slate-900">{formatKzt(coach.totalEarned)}</p>
                 </div>
                 <div className="flex gap-3">
                    <Button 
                      variant="primary" 
                      disabled={coach.totalEarned <= 0}
                      onClick={() => handlePaySalary(coach)}
                      className="gap-2 shadow-lg shadow-primary/10"
                      style={{ borderRadius: '14px' }}
                    >
                      <CheckCircle size={18} /> Выплатить
                    </Button>
                 </div>
              </div>
            </div>
          </Card>
        ))}
        
        {payrollData.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
             <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">Нет данных для расчета</p>
          </div>
        )}
      </div>
    </div>
  );
};
