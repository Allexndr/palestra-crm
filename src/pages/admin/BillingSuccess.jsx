import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const BillingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchClubState } = useAdmin();

  useEffect(() => {
    // В реальном приложении здесь можно дёрнуть API, чтобы обновить контекст:
    // fetchClubState();
  }, [fetchClubState]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <Card style={{ maxWidth: 400, textAlign: 'center', padding: '40px' }} className="animate-up shadow-lg border-t-4 border-t-success">
        <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--color-success-soft)', borderRadius: '50%', color: 'var(--color-success)', marginBottom: '24px' }}>
          <CheckCircle size={48} />
        </div>
        <h1 className="h3 mb-4 text-slate-800">Оплата прошла успешно!</h1>
        <p className="text-muted mb-8">
          Заказ {searchParams.get('order_id') || 'подтвержден'}. Ваш тариф активирован. Спасибо, что выбираете Palestra CRM!
        </p>
        <Button variant="primary" onClick={() => navigate('/admin/billing')} style={{ width: '100%' }}>
          Вернуться к финансам
        </Button>
      </Card>
    </div>
  );
};
