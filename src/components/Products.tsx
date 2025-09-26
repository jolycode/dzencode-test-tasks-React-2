import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Trash2, X, AlertCircle } from 'lucide-react';
import { productsAPI, Product } from '../services/api';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSpecification, setSelectedSpecification] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: number | null }>({
    isOpen: false,
    productId: null
  });
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSpecifications, setAvailableSpecifications] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await productsAPI.getFilters();
        setAvailableTypes(['all', ...response.data.types]);
        setAvailableSpecifications(['all', ...response.data.specifications]);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await productsAPI.getProducts({
          type: selectedType === 'all' ? undefined : selectedType,
          specification: selectedSpecification === 'all' ? undefined : selectedSpecification,
          page: currentPage,
          limit: itemsPerPage
        });
        
        setProducts(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedType, selectedSpecification, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedSpecification]);

  const handleDeleteClick = (productId: number) => {
    setDeleteModal({ isOpen: true, productId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) return;
    
    setDeleting(true);
    try {
      await productsAPI.deleteProduct(deleteModal.productId);
      
      const response = await productsAPI.getProducts({
        type: selectedType === 'all' ? undefined : selectedType,
        specification: selectedSpecification === 'all' ? undefined : selectedSpecification,
        page: currentPage,
        limit: itemsPerPage
      });
      
      setProducts(response.data);
      setPagination(response.pagination);
      
      if (response.data.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      setDeleteModal({ isOpen: false, productId: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      console.error('Error deleting product:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productId: null });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatProductDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    
    const day = date.getDate().toString().padStart(2, '0');
    const monthShort = months[date.getMonth()];
    const monthNumber = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return {
      shortMonth: `${day}/${monthShort}/${year}`,
      numeric: `${day}/${monthNumber}/${year}`,
    };
  };

  const getAllPrices = (prices: any[]) => {
    const usdPrice = prices.find(p => p.symbol === 'USD');
    const uahPrice = prices.find(p => p.symbol === 'UAH');
    
    return {
      usd: usdPrice ? `$${usdPrice.value.toLocaleString()}` : null,
      uah: uahPrice ? `${uahPrice.value.toLocaleString()} ₴` : null,
      defaultCurrency: prices.find(p => p.isDefault)?.symbol || 'USD'
    };
  };

  const getStatusBadge = (isNew: number) => {
    return isNew ? 'новый' : 'б/у';
  };

  const getStatusColor = (status: string) => {
    return status === 'в ремонте' ? 'bg-gray-900' : 'bg-yellow-400';
  };

  const getStatusTextColor = (status: string) => {
    return status === 'в ремонте' ? 'text-gray-900' : 'text-yellow-600';
  };

  const ProductImage = ({ product }: { product: any }) => {
    const [imageError, setImageError] = useState(false);
    
    if (imageError || !product.photo) {
      return (
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Monitor className="w-6 h-6 text-blue-600" />
        </div>
      );
    }
    
    return (
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={product.photo}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  };

  const PriceDisplay = ({ prices }: { prices: any[] }) => {
    const { usd, uah, defaultCurrency } = getAllPrices(prices);
    
    return (
      <div className="space-y-1 min-w-0">
        {usd && (
          <div className={`text-sm font-medium truncate ${defaultCurrency === 'USD' ? 'text-gray-900' : 'text-gray-600'}`} title={usd}>
            {usd}
          </div>
        )}
        {uah && (
          <div className={`text-sm font-medium truncate ${defaultCurrency === 'UAH' ? 'text-gray-900' : 'text-gray-600'}`} title={uah}>
            {uah}
          </div>
        )}
      </div>
    );
  };

  const DeleteModal = () => {
    if (!deleteModal.isOpen) return null;

    const product = products.find(p => p.id === deleteModal.productId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Подтверждение удаления</h3>
            <button
              onClick={handleDeleteCancel}
              className="text-gray-400 hover:text-gray-600"
              disabled={deleting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Вы уверены, что хотите удалить этот продукт?
            </p>
            {product && (
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900 truncate" title={product.title}>{product.title}</p>
                <p className="text-sm text-gray-600">SN {product.serialNumber}</p>
              </div>
            )}
            <p className="text-sm text-red-600 mt-2">
              Это действие нельзя отменить.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleDeleteCancel}
              disabled={deleting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
            >
              {deleting ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Загрузка продуктов...</span>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <ErrorMessage />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Продукты / {pagination.totalItems}
              </h2>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Категория:</span>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    disabled={loading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'Все' : type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Спецификация:</span>
                  <select
                    value={selectedSpecification}
                    onChange={(e) => setSelectedSpecification(e.target.value)}
                    disabled={loading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {availableSpecifications.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec === 'all' ? 'Все' : spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Продукты не найдены</p>
            </div>
          ) : (
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-2 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                    Статус
                  </th>
                  <th className="w-16 px-2 py-3"></th>
                  <th className="min-w-0 w-1/4 max-w-xs px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Наименование и спецификация
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Гарантия
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус продукта
                  </th>
                  <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Состояние
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Стоимость
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип-Группа
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Приход
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата добавления
                  </th>
                  <th className="w-8 px-2 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-4 text-center">
                      <div className="flex justify-center">
                        <div 
                          className={`w-3 h-3 rounded-full ${getStatusColor(product.status)}`}
                          title={product.status}
                        ></div>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <ProductImage product={product} />
                    </td>
                    <td className="px-4 py-4 max-w-xs min-w-0">
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate" title={product.title}>
                          {product.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate" title={`SN ${product.serialNumber}`}>
                          SN {product.serialNumber}
                        </p>
                        {product.specification && (
                          <p className="text-xs text-gray-600 mt-1 truncate" title={product.specification}>
                            {product.specification}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 w-32">
                      <div className="text-xs text-gray-600">
                        {product.guarantee.start && product.guarantee.end ? (
                          <div className="space-y-1">
                            <div className="flex items-center min-w-0">
                              <span className="text-gray-500">с</span>
                              <span className="ml-1 truncate" title={formatDate(product.guarantee.start)}>
                                {formatDate(product.guarantee.start)}
                              </span>
                            </div>
                            <div className="flex items-center min-w-0">
                              <span className="text-gray-500">до</span>
                              <span className="ml-1 truncate" title={formatDate(product.guarantee.end)}>
                                {formatDate(product.guarantee.end)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Не указана</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 w-24">
                      <span className={`text-sm font-medium truncate block ${getStatusTextColor(product.status)}`} title={product.status}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-20">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 truncate">
                          {getStatusBadge(product.isNew)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-24">
                      <PriceDisplay prices={product.price} />
                    </td>
                    <td className="px-4 py-4 w-32 max-w-32">
                      <p className="text-sm text-gray-900 truncate" title={product.type || ''}>
                        {product.type || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 w-32 max-w-32">
                      <p className="text-sm text-gray-900 truncate" title={product.username || ''}>
                        {product.username || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 w-32 max-w-32">
                      <p className="text-sm text-gray-900 truncate" title={product.incomingGroup || ''}>
                        {product.incomingGroup || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 w-32">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="truncate" title={formatProductDate(product.date).shortMonth}>
                          {formatProductDate(product.date).shortMonth}
                        </div>
                        <div className="truncate" title={formatProductDate(product.date).numeric}>
                          {formatProductDate(product.date).numeric}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <button 
                        onClick={() => handleDeleteClick(product.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Удалить продукт"
                        disabled={deleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Страница {pagination.currentPage} из {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Назад
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let page;
                  if (pagination.totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    page = pagination.totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`px-3 py-1 text-sm font-medium rounded disabled:opacity-50 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages || loading}
                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <DeleteModal />
    </div>
  );
};