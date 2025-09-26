import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { productsAPI, incomingGroupsAPI } from '../services/api';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSpecs, setAvailableSpecs] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [groupExists, setGroupExists] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    specification: '',
    serialNumber: '',
    username: '',
    isNew: true,
    status: 'свободен',
    date: new Date().toISOString().split('T')[0],
    guaranteeStart: '',
    guaranteeEnd: '',
    priceUSD: '',
    priceUAH: '',
    incomingGroup: '',
    photo: ''
  });

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [filtersResponse, groupsResponse] = await Promise.all([
            productsAPI.getFilters(),
            incomingGroupsAPI.getIncomingGroups({ limit: 1000 })
          ]);
          
          setAvailableTypes(filtersResponse.data.types);
          setAvailableSpecs(filtersResponse.data.specifications);
          setAvailableGroups(groupsResponse.data.map(group => group.incomingGroup));
        } catch (err) {
          console.error('Error loading data:', err);
          setError('Ошибка загрузки данных');
        }
      };
      
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.incomingGroup.trim()) {
      const exists = availableGroups.includes(formData.incomingGroup.trim());
      setGroupExists(exists);
    } else {
      setGroupExists(false);
    }
  }, [formData.incomingGroup, availableGroups]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Название товара обязательно';
    if (!formData.type.trim()) return 'Тип товара обязателен';
    if (!formData.serialNumber.trim()) return 'Серийный номер обязателен';
    if (!formData.date) return 'Дата обязательна';
    if (!formData.incomingGroup.trim()) return 'Группа прихода обязательна';
    
    if (!formData.priceUSD && !formData.priceUAH) {
      return 'Укажите цену хотя бы в одной валюте';
    }
    
    if (!formData.username.trim()) {
      return 'Имя пользователя обязательно';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const prices = [];
      if (formData.priceUSD) {
        prices.push({
          value: parseFloat(formData.priceUSD),
          symbol: 'USD',
          isDefault: true
        });
      }
      if (formData.priceUAH) {
        prices.push({
          value: parseFloat(formData.priceUAH),
          symbol: 'UAH',
          isDefault: !formData.priceUSD
        });
      }
      
      const productData = {
        title: formData.title.trim(),
        type: formData.type.trim(),
        specification: formData.specification.trim() || undefined,
        serialNumber: parseInt(formData.serialNumber),
        username: formData.username.trim(),
        isNew: formData.isNew ? 1 : 0,
        status: formData.status,
        date: formData.date,
        guaranteeStart: formData.guaranteeStart || undefined,
        guaranteeEnd: formData.guaranteeEnd || undefined,
        incomingGroup: formData.incomingGroup.trim(),
        photo: formData.photo.trim() || undefined,
        prices
      };
      
      await productsAPI.createProduct(productData);
        setFormData({
        title: '',
        type: '',
        specification: '',
        serialNumber: '',
        username: '',
        isNew: true,
        status: 'свободен',
        date: new Date().toISOString().split('T')[0],
        guaranteeStart: '',
        guaranteeEnd: '',
        priceUSD: '',
        priceUAH: '',
        incomingGroup: '',
        photo: ''
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания товара');
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Добавить товар в приход</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                placeholder="Введите название товара"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Серийный номер *
              </label>
              <input
                type="number"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                placeholder="Введите серийный номер"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип *
              </label>
              <input
                type="text"
                list="types"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                placeholder="Введите тип товара"
              />
              <datalist id="types">
                {availableTypes.map(type => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Спецификация
              </label>
              <input
                type="text"
                list="specifications"
                value={formData.specification}
                onChange={(e) => handleInputChange('specification', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                placeholder="Введите спецификацию"
              />
              <datalist id="specifications">
                {availableSpecs.map(spec => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Группа прихода *
              </label>
              <input
                type="text"
                list="groups"
                value={formData.incomingGroup}
                onChange={(e) => handleInputChange('incomingGroup', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  groupExists ? 'border-green-300 bg-green-50' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="Введите группу прихода"
              />
              <datalist id="groups">
                {availableGroups && availableGroups.map(group => (
                  <option key={group} value={group} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя пользователя *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Введите имя пользователя"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Состояние
              </label>
              <select
                value={formData.isNew ? 'new' : 'used'}
                onChange={(e) => handleInputChange('isNew', e.target.value === 'new')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="new">новый</option>
                <option value="used">б/у</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус товара
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="свободен">свободен</option>
                <option value="в ремонте">в ремонте</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Период гарантии
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Начало гарантии</label>
                <input
                  type="date"
                  value={formData.guaranteeStart}
                  onChange={(e) => handleInputChange('guaranteeStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Окончание гарантии</label>
                <input
                  type="date"
                  value={formData.guaranteeEnd}
                  onChange={(e) => handleInputChange('guaranteeEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Стоимость *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Цена в USD</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceUSD}
                  onChange={(e) => handleInputChange('priceUSD', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Цена в UAH</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceUAH}
                  onChange={(e) => handleInputChange('priceUAH', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL фото (необязательно)
            </label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => handleInputChange('photo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="URL фото "
            />
          </div>

          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Создание...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить товар
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};