import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus, MapPin, Edit2, Trash2, ArrowRight, Phone, Navigation } from 'lucide-react';

export const Locations = () => {
  const navigate = useNavigate();
  const { locations, removeLocation, user } = useAdmin();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const [locationToDelete, setLocationToDelete] = useState(null);

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">{t('settings.locations.title')}</h1>
          <p className="text-secondary text-lg">{t('settings.locations.subtitle')}</p>
        </div>
        {isAdmin && (
          <Link to="/admin/locations/new">
            <Button variant="primary">
              <Plus size={18} /> {t('settings.locations.add_btn')}
            </Button>
          </Link>
        )}
      </div>

      <div className="tariff-res-grid">
        {locations.map(location => (
          <article key={location.id} className="tariff-res-card hover:border-primary transition-all">
            <div className="tariff-res-card__head">
              <div className="w-12 h-12 text-white rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                <MapPin size={24} />
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button 
                    className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg"
                    onClick={() => navigate(`/admin/locations/${location.id}/edit`)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg"
                    onClick={() => setLocationToDelete(location)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-xl font-black mt-4 mb-2">{location.name}</h3>
            
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-start gap-2 text-xs font-bold text-slate-500">
                <Navigation size={14} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{location.address || t('settings.locations.address_not_specified')}</span>
              </div>
              {location.phone && (
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <Phone size={14} className="shrink-0" />
                  <span>{location.phone}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-dashed border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${location.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {location.isActive ? t('settings.locations.active') : t('settings.locations.inactive')}
                </span>
              </div>
              <button 
                onClick={() => navigate(`/admin/locations/${location.id}/edit`)}
                className="p-2 bg-slate-50 rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}

        {locations.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <MapPin size={40} />
            </div>
            <h3 className="h3 mb-2">{t('settings.locations.no_locations')}</h3>
            <p className="text-secondary mb-8 max-w-md mx-auto">{t('settings.locations.no_locations_desc')}</p>
            <Link to="/admin/locations/new">
              <Button variant="primary" size="lg">{t('settings.locations.add_btn')}</Button>
            </Link>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!locationToDelete}
        onClose={() => setLocationToDelete(null)}
        onConfirm={() => {
          if (locationToDelete) removeLocation(locationToDelete.id);
          setLocationToDelete(null);
        }}
        title={t('settings.locations.delete_title')}
        message={t('settings.locations.delete_confirm', { name: locationToDelete?.name })}
        confirmText={t('settings.locations.delete_btn')}
        variant="danger"
      />
    </div>
  );
};
