import React from 'react';
import { LayoutDashboard, GripVertical, Sparkles } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '../../../context/LanguageContext';

function SortableWidget({ widget, index, toggleWidget }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : (widget.visible ? 1 : 0.6),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col p-6 rounded-[32px] border transition-all ${widget.visible ? 'bg-white border-slate-100 shadow-xl shadow-slate-200/50' : 'bg-slate-50 border-dashed border-slate-200 opacity-60'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all">
          <GripVertical size={24} />
        </div>
        <button
          onClick={() => toggleWidget(widget.id)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${widget.visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}
        >
          {widget.visible ? t('settings.locations.active') : t('settings.student_constructor.hidden')}
        </button>
      </div>
      <div className="mt-auto">
        <div className="w-12 h-12 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mb-4">
          <LayoutDashboard size={24} />
        </div>
        <p className="font-black text-slate-800 text-base leading-tight uppercase tracking-tight">{widget.label}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-2">
          {t('settings.admin_constructor.block_label')} #{index + 1}
        </p>
      </div>
    </div>
  );
}

export function DashboardConstructorTab({ dashboardLayout, setDashboardLayout, toggleWidget }) {
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = dashboardLayout.findIndex(i => i.id === active.id);
      const newIndex = dashboardLayout.findIndex(i => i.id === over.id);
      setDashboardLayout(arrayMove(dashboardLayout, oldIndex, newIndex));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="h4 flex items-center gap-3"><LayoutDashboard className="text-primary" /> {t('settings.admin_constructor.title')}</h3>
          <p className="text-secondary text-sm mt-1">{t('settings.admin_constructor.desc')}</p>
        </div>
      </div>

      <div className="mb-10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={dashboardLayout.map(i => i.id)} strategy={rectSortingStrategy}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              padding: '24px',
              background: '#f8fafc',
              borderRadius: '32px',
              border: '2px dashed #e2e8f0',
            }}>
              {dashboardLayout.map((widget, index) => (
                <SortableWidget key={widget.id} widget={widget} index={index} toggleWidget={toggleWidget} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-12 p-8 bg-indigo-50 rounded-[32px] border border-indigo-100/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <Sparkles size={24} />
          </div>
          <h5 className="font-bold text-slate-800">{t('settings.admin_constructor.personal_title')}</h5>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{t('settings.admin_constructor.personal_desc')}</p>
      </div>
    </div>
  );
}
