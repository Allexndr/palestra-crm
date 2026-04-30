import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, ShoppingBag, Filter, ShoppingCart, Check, X, Package, Clock, User, Phone, Tag, Zap } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { uploadBlobFile } from '../../lib/blobClient';
import { LockedFeature } from '../../components/admin/LockedFeature';

export const Shop = () => {
  const { products, categories, orders, addProduct, updateProduct, removeProduct, updateOrderStatus, placeOrder } = useShop();
  const { user, members, canUseFeature, getUpgradeMessage, updateMemberXP, activeChildId } = useAdmin();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  
  const [activeTab, setActiveTab] = useState(isAdmin ? 'products' : 'browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Защита',
    description: '',
    image: '',
    stock: 10,
    isPointsOnly: false
  });

  if (!canUseFeature('shop')) {
    return (
      <LockedFeature
        title="Магазин клуба подключается отдельно"
        description={getUpgradeMessage('feature', 'Магазин клуба')}
        onConfigure={() => navigate('/admin/settings')}
      />
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsAdding(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', category: 'Защита', description: '', image: '', stock: 10, isPointsOnly: false });
  };

  const handleProductImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadBlobFile(file, 'products');
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      alert(error.message || 'Не удалось загрузить изображение');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsAdding(true);
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowConfirm(true);
  };

  const handlePlaceOrder = (product) => {
    const studentId = user?.role === 'parent' ? activeChildId : user?.id;
    const student = members.find(m => m.id === studentId);

    if (product.isPointsOnly) {
      if (!student) {
        alert('Выберите ученика для покупки за баллы');
        return;
      }
      if ((student.xp || 0) < Number(product.price)) {
        alert(`Недостаточно Neks! У вас ${(student.xp || 0)}, а нужно ${product.price}`);
        return;
      }
      // Deduct XP
      updateMemberXP(studentId, -Number(product.price));
      alert('Покупка за Neks успешна! Заберите товар у администратора.');
    } else {
      alert('Заказ успешно оформлен! Админ свяжется с вами для уточнения деталей.');
    }

    const order = {
      productId: product.id,
      productName: product.name,
      price: product.price,
      isPointsOnly: product.isPointsOnly,
      customerName: user?.name || 'Гость',
      customerPhone: user?.phone || 'Не указан',
      memberId: studentId,
    };
    placeOrder(order);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="admin-page-header">
        <div className="page-title-block page-title-block--row">
          <h1 className="h1">Магазин клуба</h1>
          <p className="text-secondary font-medium">Экипировка, защита и фирменный мерч Palestra</p>
        </div>

        <div className="admin-page-actions">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all border-none cursor-pointer ${activeTab === 'products' ? 'bg-white text-primary shadow-sm' : 'bg-transparent text-secondary'}`}
                >Товары</button>
                <button 
                  onClick={() => setActiveTab('orders')} 
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all border-none cursor-pointer ${activeTab === 'orders' ? 'bg-white text-primary shadow-sm' : 'bg-transparent text-secondary'}`}
                >Заказы ({orders.filter(o => o.status === 'pending').length})</button>
              </>
            )}
            <button 
              onClick={() => setActiveTab('browse')} 
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all border-none cursor-pointer ${activeTab === 'browse' ? 'bg-white text-primary shadow-sm' : 'bg-transparent text-secondary'}`}
            >Витрина</button>
          </div>
          {isAdmin && activeTab === 'products' && (
            <Button variant="primary" onClick={() => { setIsAdding(true); setEditingProduct(null); }} style={{ borderRadius: '16px', gap: '8px' }}>
              <Plus size={18} /> Добавить товар
            </Button>
          )}
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="flex-1 relative">
           <input 
             type="text" 
             placeholder="Поиск по названию..." 
             className="w-full bg-white border-2 border-slate-100 focus:border-primary px-6 py-4 rounded-3xl outline-none transition-all font-medium text-slate-700 shadow-sm"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-4 rounded-3xl font-bold text-sm whitespace-nowrap transition-all border-none cursor-pointer ${selectedCategory === 'all' ? 'bg-primary text-white shadow-lg shadow-indigo-100' : 'bg-white text-secondary border border-slate-100 hover:border-slate-300'}`}
          >Все</button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-4 rounded-3xl font-bold text-sm whitespace-nowrap transition-all border-none cursor-pointer ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-indigo-100' : 'bg-white text-secondary border border-slate-100 hover:border-slate-300'}`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {isAdding && isAdmin && (
        <Card className="mb-12 animate-up shadow-2xl border-2 border-primary">
           <div className="flex justify-between items-center mb-8">
             <h3 className="h4">{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h3>
             <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
           </div>
           <form onSubmit={handleAddProduct} className="flex flex-col gap-8">
             <div className="admin-form-grid">
               <Input label="Название" placeholder="Перчатки Boxing Pro" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               <Input label="Цена (₸)" isCurrency required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
               <div className="input-group">
                 <label className="input-label">Категория</label>
                 <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                   {categories.map(c => <option key={c}>{c}</option>)}
                 </select>
               </div>
               <div className="input-group">
                 <label className="input-label">Изображение товара</label>
                 <input className="input-field" type="file" accept="image/*" onChange={handleProductImageUpload} />
                 {isUploadingImage && <p className="text-xs text-muted mt-2">Загрузка в Blob...</p>}
                 {formData.image && <p className="text-xs text-primary mt-2">Изображение загружено</p>}
               </div>
               <Input label="Остаток на складе" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
               <div className="flex items-center gap-2 mt-4">
                 <input 
                   type="checkbox" 
                   id="isPointsOnly"
                   checked={formData.isPointsOnly}
                   onChange={e => setFormData({...formData, isPointsOnly: e.target.checked})}
                 />
                 <label htmlFor="isPointsOnly" className="text-xs font-bold text-slate-700">Продажа за Neks (баллы)</label>
               </div>
             </div>
             <div className="input-group">
               <label className="input-label">Описание</label>
               <textarea 
                 className="input-field min-h-[100px]" 
                 value={formData.description} 
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 placeholder="Краткое описание товара..."
               />
             </div>
             <div className="flex justify-end gap-4 pt-6 border-t">
               <Button variant="ghost" onClick={() => setIsAdding(false)}>Отмена</Button>
               <Button variant="primary" type="submit">{editingProduct ? 'Сохранить изменения' : 'Создать товар'}</Button>
             </div>
           </form>
        </Card>
      )}

      {activeTab === 'products' && (
        <div className="admin-card-grid">
          {filteredProducts.map(product => (
            <Card key={product.id} className="p-0 overflow-hidden card-hover group h-full flex flex-col">
               <div style={{ height: '240px', backgroundColor: 'var(--color-bg)', position: 'relative', overflow: 'hidden' }}>
                 {product.image ? (
                   <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={product.name} />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">
                     <Package size={64} />
                   </div>
                 )}
                 <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(product)} className="p-2.5 bg-white rounded-xl shadow-lg border-none text-slate-700 hover:text-primary cursor-pointer"><ShoppingCart size={18}/></button>
                    <button onClick={() => confirmDelete(product)} className="p-2.5 bg-white rounded-xl shadow-lg border-none text-slate-700 hover:text-rose-600 cursor-pointer"><X size={18}/></button>
                 </div>
                 <div className="absolute top-4 left-4">
                   <div className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm border border-white/20">
                     {product.category}
                   </div>
                 </div>
               </div>
               <div className="p-6 flex-1 flex flex-col">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.name}</h3>
                   <span className={`font-black text-xl ${product.isPointsOnly ? 'text-amber-500 flex items-center gap-1' : 'text-primary'}`}>
                     {product.isPointsOnly && <Zap size={18} fill="currentColor" />}
                     {Number(product.price).toLocaleString()} {product.isPointsOnly ? 'N' : '₸'}
                   </span>
                 </div>
                 <p className="text-secondary text-sm mb-6 line-clamp-2">{product.description || 'Нет описания'}</p>
                 <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase">
                      <Clock size={14} /> Склад: <span className={product.stock < 5 ? 'text-rose-500' : 'text-emerald-500'}>{product.stock} шт</span>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => startEdit(product)} className="p-2.5 bg-indigo-50 text-primary rounded-xl border-none font-bold text-xs hover:bg-indigo-100 transition-all cursor-pointer">Редактировать</button>
                   </div>
                 </div>
               </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="admin-card-grid">
          {filteredProducts.map(product => (
            <Card key={product.id} className="p-0 overflow-hidden card-hover h-full flex flex-col border-none shadow-xl shadow-slate-100">
               <div style={{ height: '280px', backgroundColor: 'var(--color-bg)', position: 'relative' }}>
                 {product.image ? (
                   <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={product.name} />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                     <ShoppingBag size={80} />
                   </div>
                 )}
                 <div className="absolute top-6 left-6">
                   <div className="px-4 py-2 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                     {product.category}
                   </div>
                 </div>
               </div>
               <div className="p-8 flex-1 flex flex-col">
                 <h3 className="h4 mb-2">{product.name}</h3>
                 <p className="text-secondary text-sm mb-8 leading-relaxed line-clamp-3">{product.description || 'Уточните характеристики у администратора вашего филиала.'}</p>
                 
                 <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">{product.isPointsOnly ? 'Стоимость в Neks' : 'Стоимость'}</p>
                     <p className={`text-2xl font-black ${product.isPointsOnly ? 'text-amber-500 flex items-center gap-2' : 'text-slate-900'}`} style={{ fontFamily: 'var(--font-family-display)' }}>
                       {product.isPointsOnly && <Zap size={24} fill="currentColor" />}
                       {Number(product.price).toLocaleString()} <span className="text-sm font-bold">{product.isPointsOnly ? 'N' : '₸'}</span>
                     </p>
                   </div>
                   <button 
                     onClick={() => handlePlaceOrder(product)}
                     className="px-8 py-4 bg-primary hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 transform hover:-translate-y-1 cursor-pointer border-none"
                   >
                     Заказать <ShoppingBag size={18} />
                   </button>
                 </div>
               </div>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <ShoppingBag size={64} className="mx-auto text-slate-200 mb-6" />
               <h3 className="h4 text-slate-400">Товары не найдены</h3>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="flex flex-col gap-6">
          {orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => (
            <Card key={order.id} className="p-8 border-none shadow-xl shadow-slate-100 animate-up">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1">
                   <div className="flex items-center gap-4 mb-6">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' ? 'В обработке' : order.status === 'completed' ? 'Завершен' : 'Отменен'}
                      </div>
                      <span className="text-xs font-bold text-muted">ID: {order.id}</span>
                      <span className="text-xs font-bold text-muted">• {new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                         <Package size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-slate-900 mb-1">{order.productName}</h4>
                        <p className={`font-black text-lg ${order.isPointsOnly ? 'text-amber-500 flex items-center gap-1' : 'text-primary'}`}>
                          {order.isPointsOnly && <Zap size={18} fill="currentColor" />}
                          {Number(order.price).toLocaleString()} {order.isPointsOnly ? 'N' : '₸'}
                        </p>
                      </div>
                   </div>
                </div>

                <div className="lg:w-1/3 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                      <User size={16} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{order.customerName}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{order.customerPhone}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-3 justify-center">
                   {order.status === 'pending' && (
                     <>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 border-none cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check size={18} /> Выдано
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-6 py-3 bg-white text-rose-500 border-2 border-rose-100 hover:border-rose-200 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <X size={18} /> Отменить
                        </button>
                     </>
                   )}
                </div>
              </div>
            </Card>
          ))}
          {orders.length === 0 && (
             <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <Clock size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">Заказов пока нет</p>
             </div>
          )}
        </div>
      )}

      {showConfirm && (
        <ConfirmModal 
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => { removeProduct(productToDelete.id); setShowConfirm(false); }}
          title="Удалить товар?"
          message={`Вы уверены, что хотите навсегда удалить "${productToDelete?.name}" из магазина?`}
          confirmText="Удалить"
          variant="danger"
        />
      )}
    </div>
  );
};
