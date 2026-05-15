import React from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../context/LanguageContext';

export function NotificationsTab({ automations, updateAutomationConfig }) {
  const { t } = useTranslation();

  const items = [
    { id: 'birthday', title: t('settings.notifications.leads_title'),   desc: t('settings.notifications.leads_desc') },
    { id: 'billing',  title: t('settings.notifications.billing_title'), desc: t('settings.notifications.billing_desc') },
    { id: 'trial',    title: t('settings.notifications.trial_title'),   desc: t('settings.notifications.trial_desc') },
    { id: 'reports',  title: t('settings.notifications.reports_title'), desc: t('settings.notifications.reports_desc') },
  ];

  const configObj = automations?.config || { birthday: true, billing: true, trial: false, reports: true };

  return (
    <div className="animate-fade-in">
      <h3 className="h4 mb-8 flex items-center gap-3"><Bell className="text-primary" /> {t('settings.notifications.title')}</h3>

      <div className="flex flex-col gap-4">
        {items.map(item => {
          const isChecked = configObj[item.id] !== false;
          return (
            <label key={item.id} className="flex items-center justify-between p-6 bg-white rounded-[24px] border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group">
              <div className="flex-1">
                <p className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-xs text-secondary">{item.desc}</p>
              </div>
              <div className={`w-14 h-7 rounded-full p-1 transition-all duration-500 ${isChecked ? 'bg-primary shadow-lg shadow-indigo-100' : 'bg-slate-100'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-500 shadow-md flex items-center justify-center ${isChecked ? 'translate-x-7' : 'translate-x-0'}`}>
                  {isChecked && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                </div>
              </div>
              <input type="checkbox" className="hidden" checked={isChecked} onChange={e => updateAutomationConfig(item.id, e.target.checked)} />
            </label>
          );
        })}
      </div>

      <div className="mt-16 p-8 bg-slate-900 text-white rounded-[32px] border-none flex items-center justify-between overflow-hidden relative group">
        <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700">
          <MessageSquare size={160} fill="white" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">{t('settings.notifications.tg_integration')}</p>
          <h4 className="font-bold text-xl mb-2">{t('settings.notifications.tg_link_title')}</h4>
          <p className="text-sm opacity-60">{t('settings.notifications.tg_link_desc')}</p>
        </div>
        <Button variant="primary" className="relative z-10 bg-indigo-500 border-none hover:bg-indigo-400 px-8 h-12 rounded-xl font-bold">
          {t('settings.notifications.tg_connect_btn')}
        </Button>
      </div>
    </div>
  );
}
