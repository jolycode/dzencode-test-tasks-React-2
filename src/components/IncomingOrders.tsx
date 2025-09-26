import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Package, Trash2, X, AlertCircle, List, Plus } from 'lucide-react';
import { incomingGroupsAPI, IncomingGroup } from '../services/api';
import { IncomingGroupModal } from './IncomingGroupModal';
import { AddProductModal } from './AddProductModal';

export const IncomingOrders: React.FC = () => {
  const [incomingGroups, setIncomingGroups] = useState<IncomingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; groupName: string | null }>({
    isOpen: false,
    groupName: null
  });
  const [deleting, setDeleting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchIncomingGroups();
  }, [currentPage]);

  const fetchIncomingGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await incomingGroupsAPI.getIncomingGroups({
        page: currentPage,
        limit: itemsPerPage
      });
      
      setIncomingGroups(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incoming groups');
      console.error('Error fetching incoming groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (groupName: string) => {
    setDeleteModal({ isOpen: true, groupName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.groupName) return;
    
    setDeleting(true);
    try {
      const result = await incomingGroupsAPI.deleteGroup(deleteModal.groupName);
        const response = await incomingGroupsAPI.getIncomingGroups({
        page: currentPage,
        limit: itemsPerPage
      });
      
      setIncomingGroups(response.data);
      setPagination(response.pagination);
      if (response.data.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      setDeleteModal({ isOpen: false, groupName: null });
      
      console.log(`Deleted: ${deleteModal.groupName}`, result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
      console.error('Error deleting group:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, groupName: null });
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
  };

  const handleAddModalSuccess = () => {
    fetchIncomingGroups();
  };

  const handleGroupClick = (groupName: string) => {
    setSelectedGroup(groupName);
  };

  const handleCloseModal = () => {
    setSelectedGroup(null);
  };

  const handleProductDeleted = () => {
    fetchIncomingGroups();
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

  const PriceDisplay = ({ prices }: { prices: IncomingGroup['prices'] }) => {
    return (
      <div className="space-y-1 min-w-0">
        {prices.totalUSD > 0 && (
          <div className="text-sm font-medium text-gray-900 truncate" title={`$${prices.totalUSD.toLocaleString()}`}>
            ${prices.totalUSD.toLocaleString()}
          </div>
        )}
        {prices.totalUAH > 0 && (
          <div className="text-sm font-medium text-gray-600 truncate" title={`${prices.totalUAH.toLocaleString()} ₴`}>
            {prices.totalUAH.toLocaleString()} ₴
          </div>
        )}
        {prices.totalUSD === 0 && prices.totalUAH === 0 && (
          <div className="text-sm text-gray-400">-</div>
        )}
      </div>
    );
  };

  const DeleteModal = () => {
    if (!deleteModal.isOpen) return null;

    const group = incomingGroups.find(g => g.incomingGroup === deleteModal.groupName);

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
              Вы уверены, что хотите удалить эту группу прихода и все связанные продукты?
            </p>
            {deleteModal.groupName && (
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900 truncate" title={deleteModal.groupName}>
                  {deleteModal.groupName}
                </p>
                {group && (
                  <p className="text-sm text-gray-600 mt-1">
                    Продуктов в группе: {group.itemCount}
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-red-600 mt-2">
              Это действие нельзя отменить. Все продукты в этой группе будут удалены.
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
      <span className="ml-2 text-gray-600">Загрузка прихода...</span>
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
                Приходы / {pagination.totalItems}
              </h2>
              <button
                onClick={handleAddClick}
                className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full transition-colors duration-200"
                title="Добавить товар в приход"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>


        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner />
          ) : incomingGroups.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Приход не найден</p>
            </div>
          ) : (
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="min-w-0 w-1/3 max-w-xs px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Приход
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Количество продуктов
                  </th>
                  <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Общая стоимость
                  </th>
                  <th className="w-8 px-2 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomingGroups.map((group, index) => (
                  <tr 
                    key={`${group.incomingGroup}-${index}`} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleGroupClick(group.incomingGroup)}
                    title={`${group.incomingGroup} - Нажмите для просмотра продуктов`}
                  >
                    <td className="px-4 py-4 max-w-xs min-w-0">
                      <div className="min-w-0 -ml-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {group.incomingGroup}
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
                    <td className="px-4 py-4 w-32">
                      <PriceDisplay prices={group.prices} />
                    </td>
                    <td className="px-2 py-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(group.incomingGroup);
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Удалить группу прихода и все связанные продукты"
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
      <IncomingGroupModal 
        isOpen={selectedGroup !== null}
        onClose={handleCloseModal}
        groupName={selectedGroup || ''}
        onProductDeleted={handleProductDeleted}
      />
      <AddProductModal 
        isOpen={showAddModal}
        onClose={handleAddModalClose}
        onSuccess={handleAddModalSuccess}
      />
    </div>
  );
};