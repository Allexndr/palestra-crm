import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Save, MapPin, Building, Phone, Globe } from 'lucide-react';

export const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { locations, addLocation, updateLocation } = useAdmin();

  const isEditing = !!id;
  const existingLocation = isEditing ? locations.find(l => l.id === id) : null;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    isActive: true
  });

  useEffect(() => {
    if (isEditing && existingLocation) {
      setFormData(existingLocation);
    }
  }, [isEditing, existingLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      alert('Пожалуйста, заполните основные поля');
      return;
    }

    if (isEditing) {
      updateLocation(id, formData);
    } else {
      addLocation(formData);
    }
    navigate('/admin/locations');
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/admin/locations')} 
            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border shadow-sm hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="h2 mb-1">
              {isEditing ? 'Настройки филиала' : 'Новый филиал'}
            </h1>
            <p className="text-secondary font-medium">Конфигурация тренировочной локации</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <Card className="p-10 shadow-xl border-none">
          <div className="flex flex-col gap-12">
            {/* Basic Info */}
            <div>
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-primary"></span> Основная информация
              </h3>
              <div className="admin-form-grid">
                <Input 
                  label="Название филиала" 
                  placeholder="Центральный зал / ТРЦ Арена" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                <Input 
                  label="Контактный телефон" 
                  type="tel" 
                  placeholder="+7 (777) 000 00 00" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
            </div>

            {/* Location Info */}
            <div>
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-primary"></span> Адрес и геопозиция
              </h3>
              <div className="flex flex-col gap-6">
                <Input 
                  label="Полный адрес" 
                  placeholder="г. Алматы, ул. Абая 10, блок Б, 3 этаж" 
                  required 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>
            </div>

            {/* Status */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
               <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Статус локации</h4>
                    <p className="text-xs text-slate-500">Активные филиалы доступны для записи и расписания</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
               </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex justify-between items-center">
            <button 
              type="button" 
              onClick={() => navigate('/admin/locations')} 
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
            >
              Отмена
            </button>
            <Button variant="primary" type="submit" className="gap-3 px-12 h-14 shadow-lg shadow-primary/20">
              <Save size={20} /> {isEditing ? 'Сохранить изменения' : 'Создать локацию'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
