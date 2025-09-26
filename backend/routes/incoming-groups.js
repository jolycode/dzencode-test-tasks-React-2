import express from 'express';
import pool from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const groupsQuery = `
      SELECT 
        p.incoming_group as incomingGroup,
        COUNT(*) as itemCount,
        MIN(p.date) as earliestDate,
        MAX(p.date) as latestDate,
        p.type,
        p.specification,
        GROUP_CONCAT(DISTINCT p.type) as types,
        GROUP_CONCAT(DISTINCT COALESCE(p.specification, '')) as specifications
      FROM products p
      WHERE p.incoming_group IS NOT NULL AND p.incoming_group != ""
      GROUP BY p.incoming_group
      ORDER BY MAX(p.date) DESC
      LIMIT ? OFFSET ?
    `;
    
    const [groups] = await pool.execute(groupsQuery, [parseInt(limit), parseInt(offset)]);

    const groupNames = groups.map(g => g.incomingGroup);
    let groupPrices = [];
    
    if (groupNames.length > 0) {
      const pricesQuery = `
        SELECT 
          p.incoming_group as incomingGroup,
          SUM(CASE WHEN pp.symbol = 'USD' THEN pp.value ELSE 0 END) as totalUSD,
          SUM(CASE WHEN pp.symbol = 'UAH' THEN pp.value ELSE 0 END) as totalUAH,
          COUNT(CASE WHEN pp.symbol = 'USD' THEN 1 END) as usdCount,
          COUNT(CASE WHEN pp.symbol = 'UAH' THEN 1 END) as uahCount
        FROM products p
        LEFT JOIN product_prices pp ON p.id = pp.product_id
        WHERE p.incoming_group IN (${groupNames.map(() => '?').join(',')})
        GROUP BY p.incoming_group
      `;
      
      [groupPrices] = await pool.execute(pricesQuery, groupNames);
    }
    
    const pricesByGroup = groupPrices.reduce((acc, price) => {
      acc[price.incomingGroup] = {
        totalUSD: parseFloat(price.totalUSD) || 0,
        totalUAH: parseFloat(price.totalUAH) || 0,
        usdCount: parseInt(price.usdCount) || 0,
        uahCount: parseInt(price.uahCount) || 0
      };
      return acc;
    }, {});
    
    const groupsWithPrices = groups.map(group => ({
      ...group,
      prices: pricesByGroup[group.incomingGroup] || {
        totalUSD: 0,
        totalUAH: 0,
        usdCount: 0,
        uahCount: 0
      }
    }));
    
    const countQuery = `
      SELECT COUNT(DISTINCT p.incoming_group) as total 
      FROM products p 
      WHERE p.incoming_group IS NOT NULL AND p.incoming_group != ""
    `;
    
    const [countResult] = await pool.execute(countQuery);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: groupsWithPrices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching incoming groups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incoming groups',
      error: error.message
    });
  }
});

router.delete('/:groupName', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const groupName = decodeURIComponent(req.params.groupName);
    const [existingProducts] = await connection.execute(
      'SELECT id, title, serial_number FROM products WHERE incoming_group = ?',
      [groupName]
    );
    
    if (existingProducts.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Incoming group not found or no products in this group'
      });
    }
    
    const productIds = existingProducts.map(p => p.id);
    
    if (productIds.length > 0) {
      const deleteOrderProductsQuery = `
        DELETE FROM order_products 
        WHERE product_id IN (${productIds.map(() => '?').join(',')})
      `;
      await connection.execute(deleteOrderProductsQuery, productIds);
    }
    
    if (productIds.length > 0) {
      const deletePricesQuery = `
        DELETE FROM product_prices 
        WHERE product_id IN (${productIds.map(() => '?').join(',')})
      `;
      await connection.execute(deletePricesQuery, productIds);
    }
    
    await connection.execute(
      'DELETE FROM products WHERE incoming_group = ?',
      [groupName]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Incoming group and all associated products deleted successfully',
      data: {
        groupName: groupName,
        deletedProductsCount: existingProducts.length,
        deletedProducts: existingProducts.map(p => ({
          id: p.id,
          title: p.title,
          serialNumber: p.serial_number
        }))
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting incoming group:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting incoming group',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

export default router;