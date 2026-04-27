import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AlertCircle } from 'lucide-react';

export const BillingFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <Card style={{ maxWidth: 400, textAlign: 'center', padding: '40px' }} className="animate-up shadow-lg border-t-4 border-t-error">
        <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--color-error-soft)', borderRadius: '50%', color: 'var(--color-error)', marginBottom: '24px' }}>
          <AlertCircle size={48} />
        </div>
        <h1 className="h3 mb-4 text-slate-800">Ошибка при оплате</h1>
        <p className="text-muted mb-8">
          К сожалению, платеж {searchParams.get('order_id') ? `(заказ ${searchParams.get('order_id')})` : ''} не был завершен. 
          Возможно, на карте недостаточно средств или банк отклонил операцию.
        </p>
        <Button variant="outline" onClick={() => navigate('/admin/billing')} style={{ width: '100%' }}>
          Вернуться и попробовать снова
        </Button>
      </Card>
    </div>
  );
};
