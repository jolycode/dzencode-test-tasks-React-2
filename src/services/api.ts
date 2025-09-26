const API_BASE_URL = 'http://localhost:3001/api';

export interface Product {
  id: number;
  serialNumber: number;
  isNew: number;
  status: string;
  photo?: string;
  title: string;
  type: string;
  specification?: string;
  groupName?: string;
  incomingGroup?: string;
  username?: string;
  orderId?: number;
  guarantee: {
    start: string;
    end: string;
  };
  price: Array<{
    value: number;
    symbol: string;
    isDefault: boolean;
  }>;
  date: string;
  orderTitle?: string;
}

export interface IncomingGroup {
  incomingGroup: string;
  itemCount: number;
  earliestDate: string;
  latestDate: string;
  type: string;
  specification?: string;
  types: string;
  specifications: string;
  prices: {
    totalUSD: number;
    totalUAH: number;
    usdCount: number;
    uahCount: number;
  };
}

export interface TypeGroup {
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

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface IncomingGroupsResponse {
  success: boolean;
  data: IncomingGroup[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface TypeGroupsResponse {
  success: boolean;
  data: TypeGroup[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface FiltersResponse {
  success: boolean;
  data: {
    types: string[];
    specifications: string[];
    groups: string[];
  };
}

export interface CreateProductData {
  title: string;
  type: string;
  specification?: string;
  serialNumber: number;
  username: string;
  isNew: number;
  status: string;
  date: string;
  guaranteeStart?: string;
  guaranteeEnd?: string;
  incomingGroup: string;
  photo?: string;
  prices: Array<{
    value: number;
    symbol: string;
    isDefault: boolean;
  }>;
}

class ProductsAPI {
  async getProducts(params: {
    type?: string;
    specification?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.set('type', params.type);
    if (params.specification) queryParams.set('specification', params.specification);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getFilters(): Promise<FiltersResponse> {
    const response = await fetch(`${API_BASE_URL}/products/filters`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async createProduct(productData: CreateProductData): Promise<{ success: boolean; message: string; data: Product }> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

class IncomingGroupsAPI {
  async getIncomingGroups(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<IncomingGroupsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/incoming-groups?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteGroup(groupName: string): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await fetch(`${API_BASE_URL}/incoming-groups/${encodeURIComponent(groupName)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

class TypeGroupsAPI {
  async getTypeGroups(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<TypeGroupsResponse> {
    const response = await productsAPI.getProducts({ limit: 1000 });
    
    const typeGroups = response.data.reduce((acc, product) => {
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
    
    const { page = 1, limit = 10 } = params;
    const totalItems = groupsArray.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGroups = groupsArray.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedGroups,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    };
  }
}

export const productsAPI = new ProductsAPI();
export const incomingGroupsAPI = new IncomingGroupsAPI();
export const typeGroupsAPI = new TypeGroupsAPI();