import express from 'express';
import pool from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, specification, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams = [];
    
    if (type && type !== 'all') {
      whereConditions.push('p.type = ?');
      queryParams.push(type);
    }
    
    if (specification && specification !== 'all') {
      whereConditions.push('p.specification = ?');
      queryParams.push(specification);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const productsQuery = `
      SELECT 
        p.id,
        p.serial_number as serialNumber,
        p.is_new as isNew,
        p.status,
        p.photo,
        p.title,
        p.type,
        p.specification,
        p.group_name as groupName,
        p.incoming_group as incomingGroup,
        p.guarantee_start as guaranteeStart,
        p.guarantee_end as guaranteeEnd,
        p.date,
        p.order_id as orderId,
        u.username,
        o.title as orderTitle
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN orders o ON p.order_id = o.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [products] = await pool.execute(productsQuery, queryParams);
    const productIds = products.map(p => p.id);
    let prices = [];
    
    if (productIds.length > 0) {
      const pricesQuery = `
        SELECT product_id, value, symbol, is_default as isDefault
        FROM product_prices 
        WHERE product_id IN (${productIds.map(() => '?').join(',')})
      `;
      
      [prices] = await pool.execute(pricesQuery, productIds);
    }
    const pricesByProduct = prices.reduce((acc, price) => {
      if (!acc[price.product_id]) {
        acc[price.product_id] = [];
      }
      acc[price.product_id].push({
        value: parseFloat(price.value),
        symbol: price.symbol,
        isDefault: Boolean(price.isDefault)
      });
      return acc;
    }, {});
    
    const productsWithPrices = products.map(product => ({
      ...product,
      price: pricesByProduct[product.id] || [],
      guarantee: {
        start: product.guaranteeStart,
        end: product.guaranteeEnd
      }
    }));
    
    let countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    let countParams = whereConditions.length > 0 ? queryParams.slice(0, whereConditions.length) : [];
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: productsWithPrices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

router.get('/filters', async (req, res) => {
  try {
    const [types] = await pool.execute(
      'SELECT DISTINCT type FROM products WHERE type IS NOT NULL ORDER BY type'
    );
    
    const [specifications] = await pool.execute(
      'SELECT DISTINCT specification FROM products WHERE specification IS NOT NULL ORDER BY specification'
    );
    
    const [groups] = await pool.execute(
      'SELECT DISTINCT group_name FROM products WHERE group_name IS NOT NULL ORDER BY group_name'
    );
    
    res.json({
      success: true,
      data: {
        types: types.map(t => t.type),
        specifications: specifications.map(s => s.specification),
        groups: groups.map(g => g.group_name)
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filter options',
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      title,
      type,
      specification,
      serialNumber,
      username,
      isNew,
      status,
      date,
      guaranteeStart,
      guaranteeEnd,
      incomingGroup,
      photo,
      prices
    } = req.body;
    
    if (!title || !type || !serialNumber || !date || !incomingGroup || !username) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, type, serialNumber, date, incomingGroup, username'
      });
    }
    
    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'At least one price must be provided'
      });
    }
    
    const [existingSerial] = await connection.execute(
      'SELECT id FROM products WHERE serial_number = ?',
      [serialNumber]
    );
    
    if (existingSerial.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Product with serial number ${serialNumber} already exists`
      });
    }
    
    let userId = null;
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    } else {
      const [userResult] = await connection.execute(
        'INSERT INTO users (username) VALUES (?)',
        [username]
      );
      userId = userResult.insertId;
    }
      let orderId = null;
    
    const [existingProducts] = await connection.execute(
      'SELECT DISTINCT order_id FROM products WHERE incoming_group = ? AND order_id IS NOT NULL LIMIT 1',
      [incomingGroup]
    );
    
    if (existingProducts.length > 0) {
      orderId = existingProducts[0].order_id;
    } else {
      const orderTitle = `Заказ для группы: ${incomingGroup}`;
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (title, date) VALUES (?, ?)',
        [orderTitle, new Date()]
      );

      orderId = orderResult.insertId;
    }
    
    const defaultGroupName = `${incomingGroup} - ${type}`;
    
    const productQuery = `
      INSERT INTO products (
        title, type, specification, serial_number, user_id, is_new, status, date,
        guarantee_start, guarantee_end, incoming_group, group_name, photo, order_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [productResult] = await connection.execute(productQuery, [
      title,
      type,
      specification || null,
      serialNumber,
      userId,
      isNew,
      status,
      date,
      guaranteeStart || null,
      guaranteeEnd || null,
      incomingGroup,
      defaultGroupName, 
      photo || null,
      orderId
    ]);
    
    const productId = productResult.insertId;
    
    for (const price of prices) {
      if (price.value > 0) {
        await connection.execute(
          'INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES (?, ?, ?, ?)',
          [productId, price.value, price.symbol, price.isDefault]
        );
      }
    }
    
    await connection.execute(
      'INSERT INTO order_products (order_id, product_id) VALUES (?, ?)',
      [orderId, productId]
    );
    
    const [newProduct] = await connection.execute(`
      SELECT 
        p.id,
        p.serial_number as serialNumber,
        p.is_new as isNew,
        p.status,
        p.photo,
        p.title,
        p.type,
        p.specification,
        p.group_name as groupName,
        p.incoming_group as incomingGroup,
        p.guarantee_start as guaranteeStart,
        p.guarantee_end as guaranteeEnd,
        p.date,
        p.order_id as orderId,
        u.username,
        o.title as orderTitle
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE p.id = ?
    `, [productId]);
    
    const [productPrices] = await connection.execute(`
      SELECT value, symbol, is_default as isDefault
      FROM product_prices 
      WHERE product_id = ?
    `, [productId]);
    
    const productData = {
      ...newProduct[0],
      price: productPrices.map(p => ({
        value: parseFloat(p.value),
        symbol: p.symbol,
        isDefault: Boolean(p.isDefault)
      })),
      guarantee: {
        start: newProduct[0].guaranteeStart,
        end: newProduct[0].guaranteeEnd
      }
    };
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: productData
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const productId = parseInt(req.params.id);
    
    const [existing] = await connection.execute(
      'SELECT id, title, serial_number FROM products WHERE id = ?',
      [productId]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await connection.execute(
      'DELETE FROM order_products WHERE product_id = ?',
      [productId]
    );
    
    await connection.execute(
      'DELETE FROM product_prices WHERE product_id = ?',
      [productId]
    );
    
    await connection.execute(
      'DELETE FROM products WHERE id = ?',
      [productId]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        id: productId,
        title: existing[0].title,
        serialNumber: existing[0].serial_number
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

export default router;