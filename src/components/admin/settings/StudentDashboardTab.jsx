import React from 'react';
import { Card } from '../../ui/Card';
import { Sparkles, LayoutList, CheckCircle, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { STUDENT_WIDGET_CATALOG } from '../../../context/AdminContext';
import { useTranslation } from '../../../context/LanguageContext';

export function StudentDashboardTab({
  studentDashboardPool,
  studentDashboardLayout,
  toggleStudentPoolWidget,
  moveStudentWidget,
  toggleStudentWidget,
  showNotification,
}) {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="h4 flex items-center gap-3 mb-2"><Sparkles className="text-primary" /> {t('settings.student_constructor.title')}</h3>
        <p className="text-secondary text-sm">{t('settings.student_constructor.subtitle')}</p>
      </div>

      <div className="admin-card-grid mb-10" style={{ paddingBottom: '4px' }}>
        {STUDENT_WIDGET_CATALOG.map(widget => {
          const isActive = studentDashboardPool.includes(widget.id);
          return (
            <Card
              key={widget.id}
              onClick={() => {
                if (!studentDashboardPool.includes(widget.id) && studentDashboardPool.length >= 7) {
                  showNotification({ title: t('common.error'), message: t('settings.student_constructor.limit_error') || 'Максимальный пул — 7 виджетов', type: 'error' });
                  return;
                }
                toggleStudentPoolWidget(widget.id);
              }}
              style={{
                cursor: 'pointer',
                border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: isActive ? 'var(--color-primary-soft)' : 'white',
                transition: 'all 0.2s ease',
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className={`font-bold ${isActive ? 'text-primary' : 'text-slate-800'}`}>{widget.label}</h5>
                {isActive && <CheckCircle size={16} className="text-primary" />}
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">{widget.desc}</p>
            </Card>
          );
        })}
      </div>

      <div className="pt-8 border-t">
        <div className="mb-8">
          <h3 className="h4 flex items-center gap-3"><LayoutList className="text-primary" /> {t('settings.student_constructor.default_title')}</h3>
          <p className="text-secondary text-sm mt-1">{t('settings.student_constructor.default_desc')}</p>
        </div>

        <div className="flex flex-col gap-3">
          {studentDashboardLayout.filter(w => studentDashboardPool.includes(w.id)).map((widget, index, arr) => {
            const catalogInfo = STUDENT_WIDGET_CATALOG.find(c => c.id === widget.id);
            return (
              <div key={widget.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${widget.visible ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-dashed border-slate-200 opacity-60'}`}>
                <div className="flex items-center gap-5">
                  <div className="flex flex-col gap-1">
                    <button disabled={index === 0} onClick={() => moveStudentWidget(widget.id, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-20 border-none bg-transparent cursor-pointer">
                      <ArrowUp size={14} />
                    </button>
                    <button disabled={index === arr.length - 1} onClick={() => moveStudentWidget(widget.id, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-20 border-none bg-transparent cursor-pointer">
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <div>
                    <p className={`font-bold ${widget.visible ? 'text-slate-800' : 'text-slate-400'}`}>{catalogInfo?.label || widget.id}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">{t('settings.student_constructor.position_label')} #{index + 1}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStudentWidget(widget.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${widget.visible ? 'bg-indigo-50 text-primary' : 'bg-slate-200 text-slate-500'}`}
                >
                  {widget.visible
                    ? <div className="flex items-center gap-2"><Eye size={12} /> {t('settings.student_constructor.visible')}</div>
                    : <div className="flex items-center gap-2"><EyeOff size={12} /> {t('settings.student_constructor.hidden')}</div>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
