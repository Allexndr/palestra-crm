import React from 'react';
import { Card } from '../ui/Card';
import { Rocket, Shield, Zap, Users, Star, CheckCircle } from 'lucide-react';

export const Onboarding = () => {
  const steps = [
    {
      title: 'Настройте свой клуб',
      desc: 'Создайте филиалы, добавьте тренеров и настройте свои уникальные тарифы-конструкторы.',
      icon: <Zap className="text-primary" size={24} />,
      color: 'bg-indigo-50'
    },
    {
      title: 'Оформите учеников',
      desc: 'Используйте нашу умную анкету для быстрой регистрации атлетов и их родителей.',
      icon: <Users className="text-primary" size={24} />,
      color: 'bg-indigo-50'
    },
    {
      title: 'Запустите Лигу',
      desc: 'Превратите тренировки в игру! Начисляйте баллы за посещаемость и достижения.',
      icon: <Star className="text-primary" size={24} />,
      color: 'bg-indigo-50'
    },
    {
      title: 'Управляйте финансами',
      desc: 'Следите за оплатами, расходами и прибылью в реальном времени через удобные дашборды.',
      icon: <Shield className="text-primary" size={24} />,
      color: 'bg-indigo-50'
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="h1 mb-6" style={{ fontFamily: 'var(--font-family-display)' }}>Как работает Palestra?</h2>
          <p className="text-secondary text-xl">Мы продумали каждый шаг, чтобы вы могли сосредоточиться на тренировках, а не на бумажной волоките.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          {steps.map((step, idx) => (
            <Card key={idx} className="card-hover border-none shadow-none text-center p-8">
              <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm`}>
                {step.icon}
              </div>
              <h3 className="h4 mb-4">{step.title}</h3>
              <p className="text-secondary leading-relaxed">{step.desc}</p>
              <div className="mt-8 flex justify-center">
                <div className="w-8 h-1 bg-slate-100 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-20 bg-slate-900 text-white p-12 border-none relative overflow-hidden">
          <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
             <Rocket size={300} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h3 className="h2 mb-6">Готовы масштабировать свой клуб?</h3>
              <p className="text-slate-400 text-lg mb-8">Присоединяйтесь к десяткам клубов, которые уже автоматизировали свои процессы с помощью нашей RPG-системы.</p>
              <div className="flex flex-wrap gap-6">
                 {['Автоматизация оплат', 'RPG-геймификация', 'Умное расписание'].map(f => (
                   <div key={f} className="flex items-center gap-2 text-sm font-bold">
                     <CheckCircle size={18} className="text-success" /> {f}
                   </div>
                 ))}
              </div>
            </div>
            <button className="px-10 py-5 bg-primary hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1">
              Начать бесплатно
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
};
