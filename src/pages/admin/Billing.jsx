import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdmin } from '../../context/AdminContext';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, Download, Plus, Receipt } from 'lucide-react';

export const Billing = () => {
  const { finances, addTransaction } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ amount: '', type: 'income', description: '' });

  // Simple stats
  const totalIncome = finances.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = finances.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpense;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    addTransaction({
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description
    });
    setFormData({ amount: '', type: 'income', description: '' });
    setIsAdding(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="h2 mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>Финансы</h1>
          <p className="text-secondary text-lg">Управление транзакциями, прибылью и расходами клуба</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" style={{ border: '1px solid var(--color-border)', gap: '8px' }}>
            <Download size={18} /> Экспорт PDF
          </Button>
          <Button variant="primary" onClick={() => setIsAdding(!isAdding)} style={{ gap: '8px' }}>
            <Plus size={18} /> Новая запись
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="mb-12 animate-up" style={{ border: '1px solid var(--color-primary)' }}>
          <h4 className="h4 mb-8">Добавить транзакцию</h4>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
            <div style={{ flex: 1, width: '100%' }}>
              <Input 
                label="Сумма (₸)" 
                type="number" 
                required 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
              />
            </div>
            <div style={{ flex: 1, width: '100%' }} className="input-group">
              <label className="input-label">Тип</label>
              <select 
                className="input-field"
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="income">Доход (+)</option>
                <option value="expense">Расход (-)</option>
              </select>
            </div>
            <div style={{ flex: 2, width: '100%' }}>
              <Input 
                label="Описание" 
                placeholder="Оплата абонемента: Иванов" 
                required 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <Button variant="primary" type="submit" style={{ height: '48px', minWidth: '160px' }}>Сохранить</Button>
          </form>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <Card style={{ borderLeft: '6px solid var(--color-success)', padding: '32px' }} className="card-hover">
          <div className="flex justify-between items-start mb-6">
            <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: 'var(--color-success)', borderRadius: '16px' }}>
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-success bg-green-50 px-3 py-1 rounded-full">+12.5%</span>
          </div>
          <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-2">Общий доход</p>
          <h3 className="h2">{totalIncome.toLocaleString()} ₸</h3>
        </Card>

        <Card style={{ borderLeft: '6px solid var(--color-error)', padding: '32px' }} className="card-hover">
          <div className="flex justify-between items-start mb-6">
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: 'var(--color-error)', borderRadius: '16px' }}>
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-bold text-danger bg-red-50 px-3 py-1 rounded-full">+4.2%</span>
          </div>
          <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-2">Общий расход</p>
          <h3 className="h2">{totalExpense.toLocaleString()} ₸</h3>
        </Card>

        <Card style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '32px' }} className="card-hover shadow-primary">
          <div className="flex justify-between items-start mb-6">
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '16px' }}>
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ opacity: 0.8 }}>Чистая прибыль</p>
          <h3 className="h2">{profit.toLocaleString()} ₸</h3>
        </Card>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        <Card style={{ padding: '32px' }} className="card-hover">
          <h4 className="text-sm font-bold uppercase text-slate-400 tracking-widest mb-10">Динамика выручки</h4>
          {finances.transactions.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-muted text-sm border-2 border-dashed rounded-2xl">
              Нет данных для анализа
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '240px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
              {[
                { label: 'Доходы', val: totalIncome > 0 ? 100 : 0, color: 'var(--color-primary)' },
                { label: 'Расходы', val: totalIncome > 0 ? (totalExpense / totalIncome) * 100 : (totalExpense > 0 ? 100 : 0), color: 'var(--color-error)' }
              ].map((bar, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '60px', 
                    height: `${Math.min(100, bar.val)}%`, 
                    backgroundColor: bar.color, 
                    borderRadius: '12px 12px 4px 4px',
                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                  <span className="text-[10px] text-muted font-bold uppercase">{bar.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ padding: 0 }} className="card-hover">
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Транзакции</h4>
            <Receipt size={18} className="text-slate-300" />
          </div>
          <div style={{ padding: '8px' }}>
            {finances.transactions.length === 0 ? (
              <p className="p-8 text-center text-muted text-sm">Транзакций пока нет.</p>
            ) : (
              finances.transactions.map(t => (
                <div key={t.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '16px', 
                  padding: '16px 24px', 
                  borderRadius: '16px',
                  transition: 'background-color 0.2s'
                }} className="hover:bg-slate-50">
                  <div style={{ 
                    width: 36, height: 36, 
                    backgroundColor: t.type === 'income' ? '#dcfce7' : '#fee2e2', 
                    color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-error)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="text-sm font-bold text-slate-800">{t.description}</p>
                    <p className="text-[10px] text-muted font-medium">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-bold text-sm ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount} ₸
                  </p>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.02)' }}>
            <button className="btn-link text-xs uppercase tracking-widest">История операций</button>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
