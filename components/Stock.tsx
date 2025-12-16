import React, { useEffect, useState } from 'react';
import { getStock, getPurchaseOrders, updateStockItem, createPurchaseOrder, updatePurchaseOrder } from '../services/mockData';
import { StockItem, PurchaseOrder, PurchaseOrderItem, Role } from '../types';
import { useAuth } from '../App';
import { 
  Package, ShoppingCart, Search, Plus, AlertTriangle, 
  CheckCircle, Clock, Filter, Edit2, Archive, Save, X, ArrowRight, Printer, FileText, Trash2, MapPin, Phone, Mail
} from 'lucide-react';

const Stock: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'orders'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [printPreviewOrder, setPrintPreviewOrder] = useState<PurchaseOrder | null>(null);
  
  // Form Data
  const [newItemData, setNewItemData] = useState<Partial<StockItem>>({
      category: 'Panneaux',
      unit: 'pcs',
      minThreshold: 5
  });
  
  // Order Form Data
  const [newOrderData, setNewOrderData] = useState<Partial<PurchaseOrder>>({
      status: 'pending',
      items: []
  });
  const [tempOrderItem, setTempOrderItem] = useState<PurchaseOrderItem>({
      itemName: '',
      quantity: 1,
      unit: 'pcs'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    getStock().then(setItems);
    getPurchaseOrders().then(setOrders);
  };

  const handleUpdateQuantity = async (item: StockItem, newQty: number) => {
      if (newQty < 0) return;
      const updated = { ...item, quantity: newQty };
      await updateStockItem(updated);
      setItems(items.map(i => i.id === item.id ? updated : i));
  };

  const handleSaveItem = async () => {
      const itemToSave = editingItem 
        ? { ...editingItem, ...newItemData } 
        : { id: `s${Date.now()}`, ...newItemData } as StockItem;
      
      await updateStockItem(itemToSave);
      loadData();
      setIsModalOpen(false);
      setEditingItem(null);
      setNewItemData({ category: 'Panneaux', unit: 'pcs', minThreshold: 5 });
  };

  const handleAddTempItemToOrder = () => {
      if (!tempOrderItem.itemName || tempOrderItem.quantity <= 0) return;
      
      setNewOrderData({
          ...newOrderData,
          items: [...(newOrderData.items || []), tempOrderItem]
      });
      setTempOrderItem({ itemName: '', quantity: 1, unit: 'pcs' });
  };

  const handleRemoveTempItem = (index: number) => {
      const updatedItems = [...(newOrderData.items || [])];
      updatedItems.splice(index, 1);
      setNewOrderData({ ...newOrderData, items: updatedItems });
  };

  const handleCreateOrder = async () => {
      if (!newOrderData.items || newOrderData.items.length === 0) {
          alert("Veuillez ajouter au moins un article à la commande.");
          return;
      }
      await createPurchaseOrder({
          ...newOrderData,
          requestedBy: user?.name
      });
      loadData();
      setIsOrderModalOpen(false);
      setNewOrderData({ status: 'pending', items: [] });
  };

  const handleReceiveOrder = async (order: PurchaseOrder) => {
      const itemCount = order.items.length;
      if (!window.confirm(`Confirmer la réception de la commande (${itemCount} articles) ?`)) return;

      // 1. Update Order
      const updatedOrder = { 
          ...order, 
          status: 'received' as const, 
          dateReceived: new Date().toISOString().split('T')[0] 
      };
      await updatePurchaseOrder(updatedOrder);

      // 2. Try to auto-update stock for ALL items
      let updatedCount = 0;
      for (const orderItem of order.items) {
          const matchingItem = items.find(i => i.name.toLowerCase() === orderItem.itemName.toLowerCase());
          if (matchingItem) {
              await updateStockItem({
                  ...matchingItem,
                  quantity: matchingItem.quantity + orderItem.quantity
              });
              updatedCount++;
          }
      }

      alert(`Commande reçue. ${updatedCount}/${itemCount} articles mis à jour en stock automatiquement.`);
      loadData();
  };

  const handlePrintOrder = (order: PurchaseOrder) => {
      setPrintPreviewOrder(order);
      // Wait for the modal to render, then print
      setTimeout(() => {
          window.print();
      }, 500);
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'Panneaux': return 'bg-orange-100 text-orange-800';
          case 'Quincaillerie': return 'bg-blue-100 text-blue-800';
          case 'Finition': return 'bg-purple-100 text-purple-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  return (
    <div className="space-y-6">
      {/* Styles for Printing */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { visibility: hidden; }
          #print-preview-modal {
            visibility: visible;
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: white;
            height: 100vh;
            width: 100vw;
            overflow-y: auto;
          }
          #print-preview-modal * {
            visibility: visible;
          }
          #print-preview-content {
            margin: 0;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            width: 100%;
            max-width: 210mm;
            min-height: 100%;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {activeTab === 'stock' ? <Package className="text-blue-600" /> : <ShoppingCart className="text-blue-600" />}
            {activeTab === 'stock' ? 'Gestion de Stock' : 'Achats & Commandes'}
        </h2>
        
        <div className="flex bg-gray-200 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stock' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
                Stock
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
                Commandes
            </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher article, catégorie..."
                            className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => {
                            setEditingItem(null);
                            setNewItemData({ category: 'Panneaux', unit: 'pcs', minThreshold: 5 });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        <span>Ajouter Article</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emplacement</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        {item.quantity <= item.minThreshold && (
                                            <span className="inline-flex items-center text-xs text-red-600 font-medium mt-1">
                                                <AlertTriangle size={12} className="mr-1" /> Stock faible (Min: {item.minThreshold})
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.location || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                            >-</button>
                                            <span className={`font-mono font-medium w-12 text-center ${item.quantity <= item.minThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                                                {item.quantity} {item.unit}
                                            </span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                            >+</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => {
                                                setEditingItem(item);
                                                setNewItemData(item);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}

      {activeTab === 'orders' && (
          <div className="space-y-6">
              <div className="flex justify-end">
                <button 
                    onClick={() => {
                        setNewOrderData({ status: 'pending', items: [] });
                        setIsOrderModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Nouvelle Commande</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map(order => (
                      <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col relative group hover:border-blue-300 transition-colors">
                          {/* Print Button - Always visible now */}
                          <button 
                              onClick={() => handlePrintOrder(order)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-all"
                              title="Imprimer le bon de commande"
                          >
                              <Printer size={20} />
                          </button>

                          <div className="flex justify-between items-start mb-4 pr-10">
                              <div>
                                  <h3 className="font-bold text-gray-900 text-lg">
                                      {order.items.length > 0 ? order.items[0].itemName : 'Commande Vide'}
                                      {order.items.length > 1 && <span className="text-sm font-normal text-gray-500 ml-1">(+ {order.items.length - 1} autres)</span>}
                                  </h3>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                      {order.items.slice(0, 3).map((it, idx) => (
                                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                              {it.quantity} {it.unit || ''}
                                          </span>
                                      ))}
                                      {order.items.length > 3 && <span className="text-xs text-gray-400">...</span>}
                                  </div>
                              </div>
                              
                          </div>
                          
                          <div className="flex-1 space-y-3 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between border-b border-gray-200 pb-2">
                                  <span>Statut:</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                    order.status === 'received' ? 'bg-green-100 text-green-700' :
                                    order.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                      {order.status === 'ordered' ? 'Commandé' : 
                                       order.status === 'received' ? 'Reçu' : 'En attente'}
                                  </span>
                              </div>
                              <div className="flex justify-between">
                                  <span>Demandé par:</span>
                                  <span className="font-medium text-gray-900">{order.requestedBy}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span>Date:</span>
                                  <span>{order.dateCreated}</span>
                              </div>
                              {order.supplier && (
                                <div className="flex justify-between">
                                    <span>Fournisseur:</span>
                                    <span className="font-medium text-gray-900">{order.supplier}</span>
                                </div>
                              )}
                          </div>

                          <div className="pt-2 flex justify-between items-center gap-2">
                              {order.status !== 'received' && (user?.role === Role.Admin || user?.role === Role.Atelier) ? (
                                  <div className="flex gap-2 w-full">
                                      {order.status === 'pending' && (
                                          <button 
                                            onClick={async () => {
                                                await updatePurchaseOrder({...order, status: 'ordered'});
                                                loadData();
                                            }}
                                            className="flex-1 bg-white border border-blue-200 text-blue-700 py-2 rounded hover:bg-blue-50 text-sm font-medium transition-colors"
                                          >
                                              Commander
                                          </button>
                                      )}
                                      <button 
                                        onClick={() => handleReceiveOrder(order)}
                                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                                      >
                                          <CheckCircle size={16} /> Reçu
                                      </button>
                                  </div>
                              ) : (
                                  <div className="text-xs text-gray-400 italic text-center w-full py-2 bg-gray-50 rounded">
                                      {order.status === 'received' ? `Reçu le ${order.dateReceived}` : 'Action requise par Admin/Atelier'}
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
                  {orders.length === 0 && (
                      <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                          <ShoppingCart className="text-gray-300 mb-3" size={48} />
                          <p className="font-medium">Aucune commande en cours.</p>
                          <p className="text-sm mt-1">Créez une nouvelle commande pour commencer.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingItem ? 'Modifier Article' : 'Nouvel Article'}</h3>
            <div className="space-y-4">
                <input 
                    className="w-full border p-2 rounded" 
                    placeholder="Nom de l'article"
                    value={newItemData.name || ''}
                    onChange={e => setNewItemData({...newItemData, name: e.target.value})}
                />
                <select 
                    className="w-full border p-2 rounded"
                    value={newItemData.category}
                    onChange={e => setNewItemData({...newItemData, category: e.target.value as any})}
                >
                    <option value="Panneaux">Panneaux</option>
                    <option value="Quincaillerie">Quincaillerie</option>
                    <option value="Finition">Finition</option>
                    <option value="Consommable">Consommable</option>
                    <option value="Autre">Autre</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="number"
                        className="w-full border p-2 rounded" 
                        placeholder="Quantité"
                        value={newItemData.quantity || 0}
                        onChange={e => setNewItemData({...newItemData, quantity: parseInt(e.target.value)})}
                    />
                    <input 
                        className="w-full border p-2 rounded" 
                        placeholder="Unité (ex: pcs, L)"
                        value={newItemData.unit || ''}
                        onChange={e => setNewItemData({...newItemData, unit: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <input 
                        type="number"
                        className="w-full border p-2 rounded" 
                        placeholder="Seuil Min."
                        value={newItemData.minThreshold || 0}
                        onChange={e => setNewItemData({...newItemData, minThreshold: parseInt(e.target.value)})}
                    />
                     <input 
                        className="w-full border p-2 rounded" 
                        placeholder="Emplacement"
                        value={newItemData.location || ''}
                        onChange={e => setNewItemData({...newItemData, location: e.target.value})}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                    <button onClick={handleSaveItem} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Enregistrer</button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nouvelle Commande</h3>
            
            <div className="space-y-4 mb-6">
                <input 
                    className="w-full border p-2 rounded" 
                    placeholder="Fournisseur (Nom)"
                    value={newOrderData.supplier || ''}
                    onChange={e => setNewOrderData({...newOrderData, supplier: e.target.value})}
                />
                <textarea 
                    className="w-full border p-2 rounded" 
                    rows={2}
                    placeholder="Adresse Fournisseur"
                    value={newOrderData.supplierAddress || ''}
                    onChange={e => setNewOrderData({...newOrderData, supplierAddress: e.target.value})}
                />
            </div>

            <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Articles ({newOrderData.items?.length || 0})</h4>
                <div className="border rounded-lg overflow-hidden mb-3">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Article</th>
                                <th className="px-3 py-2 text-center">Qté</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {newOrderData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-2">{item.itemName}</td>
                                    <td className="px-3 py-2 text-center">{item.quantity} {item.unit}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button onClick={() => handleRemoveTempItem(index)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!newOrderData.items || newOrderData.items.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="px-3 py-4 text-center text-gray-400 italic">Aucun article ajouté</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Ajouter une ligne</p>
                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-6">
                            <input 
                                className="w-full border p-1.5 rounded text-sm" 
                                placeholder="Article"
                                value={tempOrderItem.itemName}
                                onChange={e => setTempOrderItem({...tempOrderItem, itemName: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2">
                             <input 
                                type="number"
                                className="w-full border p-1.5 rounded text-sm" 
                                placeholder="Qté"
                                value={tempOrderItem.quantity}
                                onChange={e => setTempOrderItem({...tempOrderItem, quantity: parseInt(e.target.value)})}
                            />
                        </div>
                         <div className="col-span-2">
                             <input 
                                className="w-full border p-1.5 rounded text-sm" 
                                placeholder="Unité"
                                value={tempOrderItem.unit}
                                onChange={e => setTempOrderItem({...tempOrderItem, unit: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2">
                            <button 
                                onClick={handleAddTempItemToOrder}
                                className="w-full h-full bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                <button onClick={handleCreateOrder} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Créer Commande</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal / Container */}
      {printPreviewOrder && (
          <div id="print-preview-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
              <div id="print-preview-content" className="bg-white w-[210mm] min-h-[297mm] p-12 shadow-2xl overflow-y-auto relative mx-auto my-4 text-black">
                    <button 
                        onClick={() => setPrintPreviewOrder(null)} 
                        className="no-print absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-gray-600"
                    >
                        <X size={24} />
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="no-print absolute top-4 right-16 bg-blue-600 hover:bg-blue-700 rounded-full p-2 text-white shadow-lg flex items-center gap-2 px-4"
                    >
                        <Printer size={20} /> Imprimer
                    </button>

                    {/* BON DE COMMANDE LAYOUT */}
                    <div className="flex flex-col h-full">
                        {/* HEADER */}
                        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                            <div className="w-1/2">
                                <h1 className="text-3xl font-bold uppercase text-gray-900 tracking-wider">Bon de Commande</h1>
                                <div className="mt-4 space-y-1">
                                    <p className="text-sm text-gray-600">Référence : <span className="font-mono text-black font-bold text-lg">{printPreviewOrder.id.toUpperCase()}</span></p>
                                    <p className="text-sm text-gray-600">Date : <span className="font-medium text-black">{new Date(printPreviewOrder.dateCreated).toLocaleDateString()}</span></p>
                                </div>
                            </div>
                            <div className="w-1/2 text-right">
                                 <div className="flex items-center justify-end gap-3 mb-3">
                                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white font-bold text-xl rounded">MG</div>
                                    <div>
                                        <h2 className="text-xl font-bold uppercase leading-none">Maison Guelmoussi</h2>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest">Menuiserie & Agencement</p>
                                    </div>
                                 </div>
                                 <div className="text-sm text-gray-600 space-y-1 leading-tight">
                                    <p className="flex items-center justify-end gap-2">123 Avenue des FAR, Meknès <MapPin size={12}/></p>
                                    <p className="flex items-center justify-end gap-2">+212 6 61 23 45 67 <Phone size={12}/></p>
                                    <p className="flex items-center justify-end gap-2">contact@maisonguelmoussi.ma <Mail size={12}/></p>
                                 </div>
                            </div>
                        </div>

                        {/* INFO SECTIONS */}
                        <div className="flex justify-between gap-8 mb-10">
                             <div className="w-1/2 bg-gray-50 p-6 rounded-lg border border-gray-100">
                                 <h3 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-widest border-b border-gray-200 pb-2">Fournisseur</h3>
                                 <p className="font-bold text-xl text-gray-900 mb-1">{printPreviewOrder.supplier || 'Fournisseur Inconnu'}</p>
                                 {printPreviewOrder.supplierAddress ? (
                                    <p className="text-sm text-gray-600 whitespace-pre-line">{printPreviewOrder.supplierAddress}</p>
                                 ) : (
                                    <p className="text-sm text-gray-400 italic">Adresse non spécifiée</p>
                                 )}
                             </div>
                             <div className="w-1/2 p-6 rounded-lg border border-gray-200">
                                 <h3 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-widest border-b border-gray-200 pb-2">Expédition</h3>
                                 <div className="space-y-2 text-sm text-gray-600">
                                     <p><span className="font-semibold">Livrer à :</span> Atelier Maison Guelmoussi</p>
                                     <p><span className="font-semibold">Demandé par :</span> {printPreviewOrder.requestedBy}</p>
                                     <p><span className="font-semibold">Date requise :</span> Dès que possible</p>
                                 </div>
                             </div>
                        </div>

                        {/* ITEMS TABLE */}
                        <div className="mb-8">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-t-2 border-b-2 border-gray-900">
                                        <th className="text-left py-3 px-4 font-bold uppercase text-xs text-gray-600 tracking-wider">Désignation</th>
                                        <th className="text-right py-3 px-4 font-bold uppercase text-xs text-gray-600 tracking-wider w-32">Quantité</th>
                                        <th className="text-right py-3 px-4 font-bold uppercase text-xs text-gray-600 tracking-wider w-24">Unité</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {printPreviewOrder.items.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-200">
                                            <td className="py-4 px-4 text-base font-medium text-gray-900">{item.itemName}</td>
                                            <td className="py-4 px-4 text-right font-mono text-lg font-bold text-gray-900">{item.quantity}</td>
                                            <td className="py-4 px-4 text-right text-sm text-gray-600">{item.unit || '-'}</td>
                                        </tr>
                                    ))}
                                    {/* Empty rows filler */}
                                    {Array.from({ length: Math.max(0, 5 - printPreviewOrder.items.length) }).map((_, i) => (
                                        <tr key={`empty-${i}`} className="border-b border-gray-50 h-12"><td></td><td></td><td></td></tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="py-3 px-4 text-right uppercase text-xs text-gray-500">Total Articles</td>
                                        <td className="py-3 px-4 text-right text-gray-900">{printPreviewOrder.items.length}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* INSTRUCTIONS */}
                        <div className="mb-12">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Instructions & Conditions</p>
                            <div className="border border-gray-200 rounded-lg p-4 text-xs text-gray-600 bg-gray-50">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Merci de livrer impérativement avant 17h00.</li>
                                    <li>Le Bon de Livraison (BL) doit obligatoirement accompagner la marchandise.</li>
                                    <li>Paiement à 30 jours fin de mois, sauf accord cadre spécifique.</li>
                                    <li>Toute anomalie doit être signalée sous 24h.</li>
                                </ul>
                            </div>
                        </div>

                        {/* SIGNATURES */}
                        <div className="flex justify-between mt-auto pt-8 border-t border-gray-200">
                            <div className="text-center w-1/3">
                                <p className="font-bold mb-16 text-xs uppercase tracking-widest text-gray-500">Pour Maison Guelmoussi</p>
                                <div className="border-t border-gray-400 w-32 mx-auto"></div>
                                <p className="text-[10px] text-gray-400 mt-1">Signature & Cachet</p>
                            </div>
                            <div className="text-center w-1/3">
                                <p className="font-bold mb-16 text-xs uppercase tracking-widest text-gray-500">Pour le Fournisseur</p>
                                <div className="border-t border-gray-400 w-32 mx-auto"></div>
                                <p className="text-[10px] text-gray-400 mt-1">Lu et approuvé</p>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-8 pt-4 border-t-2 border-gray-100 text-center">
                             <p className="text-[10px] text-gray-400 font-medium">
                                Maison Guelmoussi S.A.R.L - Menuiserie & Agencement - RC: 98765 Meknès - ICE: 1234567890000 - IF: 9876543
                             </p>
                             <p className="text-[10px] text-gray-400">Document généré informatiquement le {new Date().toLocaleString()}</p>
                        </div>
                    </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Stock;