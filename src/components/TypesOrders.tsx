import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Package, X, AlertCircle, List } from 'lucide-react';
import { productsAPI, Product } from '../services/api';
import { TypesGroupModal } from './TypesGroupModal';

interface TypeGroup {
  type: string;
  itemCount: number;
  earliestDate: string;
  latestDate: string;
  prices: {
    totalUSD: number;
    totalUAH: number;
    usdCount: number;
    uahCount: number;
  };
  specifications: string[];
}

export const TypesOrders: React.FC = () => {
  const [typeGroups, setTypeGroups] = useState<TypeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1
  });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchTypeGroups();
  }, [currentPage]);

  const fetchTypeGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsAPI.getProducts({ limit: 1000 });
      const allProducts = response.data;
      const typeGroups = allProducts.reduce((acc, product) => {
        if (!product.type) return acc;
        
        if (!acc[product.type]) {
          acc[product.type] = {
            type: product.type,
            products: [],
            specifications: new Set()
          };
        }
        
        acc[product.type].products.push(product);
        if (product.specification) {
          acc[product.type].specifications.add(product.specification);
        }
        
        return acc;
      }, {} as Record<string, { type: string; products: Product[]; specifications: Set<string> }>);
      
      const groupsArray = Object.values(typeGroups).map(group => {
        const dates = group.products.map(p => new Date(p.date));
        const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        let totalUSD = 0;
        let totalUAH = 0;
        let usdCount = 0;
        let uahCount = 0;
        
        group.products.forEach(product => {
          product.price.forEach(price => {
            if (price.symbol === 'USD') {
              totalUSD += price.value;
              usdCount++;
            } else if (price.symbol === 'UAH') {
              totalUAH += price.value;
              uahCount++;
            }
          });
        });
        
        return {
          type: group.type,
          itemCount: group.products.length,
          earliestDate: earliestDate.toISOString(),
          latestDate: latestDate.toISOString(),
          prices: {
            totalUSD,
            totalUAH,
            usdCount,
            uahCount
          },
          specifications: Array.from(group.specifications)
        };
      });
      
      groupsArray.sort((a, b) => {
        if (b.itemCount !== a.itemCount) {
          return b.itemCount - a.itemCount;
        }
        return a.type.localeCompare(b.type);
      });
      
      const totalItems = groupsArray.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedGroups = groupsArray.slice(startIndex, endIndex);
      
      setTypeGroups(paginatedGroups);
      setPagination({
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch type groups');
      console.error('Error fetching type groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeClick = (typeName: string) => {
    setSelectedType(typeName);
  };

  const handleCloseModal = () => {
    setSelectedType(null);
  };

  const handleProductDeleted = () => {
    fetchTypeGroups();
  };

  const formatDateSimple = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateWithMonth = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
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
      <span className="ml-2 text-gray-600">Загрузка типов...</span>
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
                Группы по типам / {pagination.totalItems}
              </h2>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner />
          ) : typeGroups.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Группы типов не найдены</p>
            </div>
          ) : (
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="min-w-0 w-1/3 max-w-xs px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип продукта
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Количество продуктов
                  </th>
                  <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {typeGroups.map((group, index) => (
                  <tr 
                    key={`${group.type}-${index}`} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleTypeClick(group.type)}
                    title={`${group.type} - Нажмите для просмотра продуктов`}
                  >
                    <td className="px-4 py-4 max-w-xs min-w-0">
                      <div className="min-w-0 -ml-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate" title={group.type}>
                          {group.type}
                        </h4>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-32">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <List className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <div>{group.itemCount}</div>
                          <div className="text-xs text-gray-500">продукта</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-48">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="truncate" title={formatDateSimple(group.latestDate)}>
                            {formatDateSimple(group.latestDate)}
                          </span>
                        </div>
                        <div>
                          <span className="truncate text-xs" title={formatDateWithMonth(group.latestDate)}>
                            {formatDateWithMonth(group.latestDate)}
                          </span>
                        </div>
                      </div>
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
      
      <TypesGroupModal 
        isOpen={selectedType !== null}
        onClose={handleCloseModal}
        typeName={selectedType || ''}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
};