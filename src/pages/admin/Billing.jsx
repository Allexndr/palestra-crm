import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, Download, Plus, Receipt } from 'lucide-react';
import { LockedFeature } from '../../components/admin/LockedFeature';

import { PageLoader } from '../../components/ui/PageLoader';

export const Billing = () => {
  const { finances, addTransaction, canUseFeature, getUpgradeMessage, subscription } = useAdmin();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ amount: '', type: 'income', description: '' });

  if (!finances || !subscription) return <PageLoader />;

  const handlePayTariff = () => {
    navigate('/admin/settings');
  };

  const isStarter = subscription?.plan === 'starter';

  // Simple stats
  const transactions = finances?.transactions || [];
  const totalIncome = transactions
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
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">{t('billing.title')}</h1>
          <p className="text-secondary text-lg">{t('billing.subtitle')}</p>
        </div>
        <div className="admin-page-actions">
          <Button variant="ghost" style={{ border: '1px solid var(--color-border)', gap: '8px' }}>
            <Download size={18} /> {t('billing.export_pdf')}
          </Button>
          <Button variant="primary" onClick={() => setIsAdding(!isAdding)} style={{ gap: '8px' }}>
            <Plus size={18} /> {t('billing.new_record')}
          </Button>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-6 flex items-center gap-3">
          <span className="w-8 h-[2px] bg-primary"></span> {t('billing.subscription_title')}
        </h2>
        <Card style={{ padding: '40px', border: 'none' }} className="shadow-2xl bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h3 className="h3 m-0">{isStarter ? t('billing.plan_starter') : t('billing.plan_growth')}</h3>
                <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {t('billing.active_status')}
                </span>
              </div>
              <p className="text-sm text-secondary font-medium">
                {isStarter 
                  ? t('billing.starter_desc')
                  : t('billing.expires_at', { date: new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'kk-KZ') })}
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              {isStarter ? (
                <Button variant="primary" className="shadow-lg shadow-primary/20 px-10 h-14" onClick={() => navigate('/admin/settings/billing')}>
                  {t('billing.upgrade_btn')}
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="h-14 font-bold border" onClick={() => navigate('/admin/settings/billing')}>
                    {t('billing.pro_settings')}
                  </Button>
                  <Button variant="primary" className="shadow-lg shadow-primary/20 px-10 h-14">
                    {t('billing.extend_sub')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      <h2 className="text-sm font-bold uppercase text-slate-400 tracking-widest mb-4 mt-12">{t('billing.club_finances')}</h2>
      {!canUseFeature('finance') ? (
        <LockedFeature
          title={t('billing.finance_locked_title')}
          description={getUpgradeMessage('feature', t('billing.title'))}
          onConfigure={() => handlePayTariff('pro', 15000)}
        />
      ) : (
        <>
          {isAdding && (
        <Card className="admin-section-card animate-up" style={{ border: '1px solid var(--color-primary)' }}>
          <h4 className="h4 mb-8">{t('billing.add_transaction')}</h4>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
            <div style={{ flex: 1, width: '100%' }}>
              <Input 
                label={t('billing.amount_label')} 
                type="number" 
                required 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
              />
            </div>
            <div style={{ flex: 1, width: '100%' }} className="input-group">
              <label className="input-label">{t('billing.type_label')}</label>
              <select 
                className="input-field"
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="income">{t('billing.income')}</option>
                <option value="expense">{t('billing.expense')}</option>
              </select>
            </div>
            <div style={{ flex: 2, width: '100%' }}>
              <Input 
                label={t('billing.description_label')} 
                placeholder={t('billing.description_placeholder')} 
                required 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <Button variant="primary" type="submit" style={{ height: '48px', minWidth: '160px' }}>{t('common.save')}</Button>
          </form>
        </Card>
      )}

      <div className="admin-stats-grid">
        <Card style={{ borderLeft: '6px solid var(--color-success)', padding: '32px' }} className="card-hover">
          <div className="flex justify-between items-start mb-6">
            <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: 'var(--color-success)', borderRadius: '16px' }}>
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-success bg-green-50 px-3 py-1 rounded-full">+12.5%</span>
          </div>
          <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-2">{t('billing.total_income')}</p>
          <h3 className="h2">{totalIncome.toLocaleString()} ₸</h3>
        </Card>

        <Card style={{ borderLeft: '6px solid var(--color-error)', padding: '32px' }} className="card-hover">
          <div className="flex justify-between items-start mb-6">
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: 'var(--color-error)', borderRadius: '16px' }}>
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-bold text-danger bg-red-50 px-3 py-1 rounded-full">+4.2%</span>
          </div>
          <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-2">{t('billing.total_expense')}</p>
          <h3 className="h2">{totalExpense.toLocaleString()} ₸</h3>
        </Card>

        <Card style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '32px' }} className="card-hover shadow-primary">
          <div className="flex justify-between items-start mb-6">
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '16px' }}>
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ opacity: 0.8 }}>{t('billing.net_profit')}</p>
          <h3 className="h2">{profit.toLocaleString()} ₸</h3>
        </Card>
      </div>

      <div className="admin-two-column">
        <Card style={{ padding: '32px' }} className="card-hover">
          <h4 className="text-sm font-bold uppercase text-slate-400 tracking-widest mb-10">{t('billing.revenue_dynamics')}</h4>
          {finances.transactions.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-muted text-sm border-2 border-dashed rounded-2xl">
              {t('billing.no_data_analysis')}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '240px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
              {[
                { label: t('billing.income'), val: totalIncome > 0 ? 100 : 0, color: 'var(--color-primary)' },
                { label: t('billing.expense'), val: totalIncome > 0 ? (totalExpense / totalIncome) * 100 : (totalExpense > 0 ? 100 : 0), color: 'var(--color-error)' }
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
            <h4 className="text-sm font-bold uppercase text-slate-400 tracking-widest">{t('billing.transactions')}</h4>
            <Receipt size={18} className="text-slate-300" />
          </div>
          <div style={{ padding: '8px' }}>
            {finances.transactions.length === 0 ? (
              <p className="p-8 text-center text-muted text-sm">{t('billing.no_transactions')}</p>
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
                    <p className="text-[10px] text-muted font-medium">{new Date(t.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'kk-KZ')}</p>
                  </div>
                  <p className={`font-bold text-sm ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount} ₸
                  </p>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.02)' }}>
            <button className="btn-link text-xs uppercase tracking-widest">{t('billing.op_history')}</button>
          </div>
        </Card>
      </div>
      </>
      )}

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
