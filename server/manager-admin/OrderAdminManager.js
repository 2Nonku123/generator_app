
  const { getPool } = require("../module/database");

module.exports = function OrderAdminManager() {
  const pool = getPool();
  async function getOrder(order_id) {
    const result = await pool.query(
      `SELECT
      store_user."id" AS user_id,
      store_user.first_name,
      store_user.lastname,
      TO_CHAR(user_order.order_date,'hh:ii dd Mon yyyy') AS order_date,
      user_order.order_total,
      user_order.order_items,
      user_order.is_delivery,
      user_order."id" AS order_id,
      order_status_id,
      order_status.description AS order_status,
      user_order.delivery_address,
      user_order.order_status_id
      FROM store user
      INNER JOIN user_order ON store_user."id" = user_order.user_id
      INNER JOIN order_status ON order_status."id" =user_order.order_status_id
      WHERE is_cart = false AND user_order.id = $1 LIMIT 1` 
      [order_id]
      );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  async function getOrdersByID(search_id) {
    const result = await pool.query(
      `SELECT 
      store_user."id" AS user_id, 
      store_user.first_name, 
      store_user.lastname, 
      TO_CHAR(user_order.order_date,'hh:ii dd Mon yyyy') AS order_date, 
      user_order.order_total,
      user_order.order_items, 
      user_order.is_delivery, 
      user_order."id" AS order_id, 
      order_status_id,
      order_status.description AS order_status,
      user_order.delivery_address,
      user_order.order_status_id
      FROM store_user
      INNER JOIN user_order ON store_user."id" = user_order.user_id
      INNER JOIN order_status ON order_status."id" = user_order.order_status_id
      WHERE is_cart = false AND user_order."id" = $1`,
      [search_id]
    );

    return result.rows;
  }

  async function getOrdersByName(search_text){
    const search = "%" + search_text.toLowerCase() +"%";
    const result = await pool.query(
      `SELECT
      store_user."id" AS user_id,
      store_user.first_name,
      store_user.lastname,
      TO_CHAR(user_order.order_date,'hh:ii dd Mon yyyy') AS order_date,
      user_order.order_total,
      user_order.order_items,
      user_order.is_delivery,
      user_order."id" AS order_id,
      order_status_id,
      order_status.description AS order_status,
      user_order.delivery_address,
      user_order.order_status_id
      FRFOM store_user
      INNER JOIN user_order ON store_order."id" = user_order.user_id
      INNER JOIN order_status ON order_status."id" = user_order.order_status_id
      WHERE is_cart = false AND ( LOWER(store_user.first_name) LIKE $1 OR LOWER(store_user.lastname) LIKE $2)`,
      [search, search]
    );

    return result.rows;
  }

  async function getOrders(){
    const result = await pool.query(
      `SELECT 
      store_user."id" AS user_id,
      store_user.first_name,
      store_user.lastname,
      TO_CHAR(user_order.order_date,'hh:ii dd Mon yyyy') AS order_date,
      user_order.order_total,
      user_order.order_items,
      user_order.is_delivery,
      user_order."id" AS order_id,
      order_status_id,
      order_status.description AS order_status,
      user_order.delivery_address,
      user_order.order_status_id
      FROM store_user
      INNER JOIN user_order ON store_user."id" = user_order.user_id
      INNER JOIN order_status ON order_status."id" = user_order.order_status-id
      WHERE is_cart = false `
      );
      
      return result.rows;
  }

  async function getOrderProducts(order_id) {
    const result = await pool.query(
      `SELECT
      product."id", 
      product.product_name, 
      product.description,
      user_order_product.product_price, 
      user_order_product.product_quantity, 
      user_order_product.sub_total, 
      user_order_product.date_returned, 
      user_order_product.rental_end_date, 
      user_order_product.rental_start_date, 
      user_order_product.rental_returned, 
      user_order_product.has_rental, 
      product.product_image, 
      product_type.name as product_type
      FROM user_order_product
      INNER JOIN product ON user_order_product.product_id = product."id"
      INNER JOIN product_type ON product.product_type_id = product_type."id"
      WHERE order_id = $1`,
      [order_id]
    );

    return result.rows;
  }

  async function getOrderProduct(order_id, product_id) {
    const result = await pool.query(
      `SELECT
      user_order_product."id", 
      product.product_name,
      product.product_image,
      user_order_product.product_price, 
      user_order_product.product_quantity, 
      user_order_product.sub_total, 
      user_order_product.date_returned, 
      user_order_product.rental_end_date, 
      user_order_product.rental_start_date, 
      user_order_product.rental_returned, 
      user_order_product.has_rental
      FROM user_order_product
      INNER JOIN product ON user_order_product.product_id = product."id"
      INNER JOIN product_type ON product.product_type_id = product_type."id"
      WHERE product_id=$2 AND order_id = $1 LIMIT 1`,
      [order_id, product_id]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  async function addOrderProduct(
    order_id,
    product_id,
    is_rental,
    product_price,
    product_quantity
  ) {
    const total = product_price * product_quantity;
    const result = await pool.query(
      `INSERT INTO user_order_product(order_id,product_id,has_rental,product_price,product_quantity,sub_total) 
      VALUES($1, $2, $3, $4, $5, $6)`,
      [order_id, product_id, is_rental, product_price, product_quantity, total]
    );

    return result.rowCount;
  }

  async function updateOrderProduct(
    order_product_id,
    product_price,
    product_quantity
  ) {
    const total = product_price * product_quantity;
    const result = await pool.query(
      `UPDATE user_order_product SET product_price=$2, product_quantity=$3 , sub_total=$4 
      WHERE id = $1`,
      [order_product_id, product_price, product_quantity, total]
    );

    return result.rowCount;
  }

  async function removeOrderProduct(order_id, product_id) {
    const result = await pool.query(
      `DELETE FROM user_order_product
      WHERE product_id = $2 AND order_id = $1`,
      [order_id, product_id]
    );

    return result.rowCount;
  }

  async function clearOrder(order_id) {
    const result = await pool.query(
      `DELETE FROM user_order_product
      WHERE order_id = $1`,
      [order_id]
    );

    return result.rowCount;
  }

  async function getOrderTotals(order_id) {
    const result = await pool.query(
      `SELECT
      SUM(user_order_product.sub_total) as total_price,
      SUM(user_order_product.product_quantity) as total_quantity
      FROM user_order_product
      WHERE order_id = $1`,
      [order_id]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  async function checkOrderQuantity(order_id) {
    const result = await pool.query(
      `SELECT
        SUM( CASE  
              WHEN product.quantity<user_order_product.product_quantity OR user_order_product.product_quantity < 0 THEN 1 
              ELSE 0
          END  ) as "invalid_products"
      FROM
      user_order_product
      INNER JOIN product ON user_order_product.product_id = product."id"
      WHERE user_order_product.order_id = $1`,
      [order_id]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  async function updateProductQauntity(order_id) {
    const result = await pool.query(
      `UPDATE product
      SET quantity=quantity - order_products.product_quantity
      FROM (SELECT product_id,order_id,product_quantity FROM user_order_product) AS order_products
      WHERE product.id = order_products.product_id AND order_products.order_id = $1;`,
      [order_id]
    );

    return result.rowCount;
  }

  async function updateProductQauntityReverse(order_id) {
    const result = await pool.query(
      `UPDATE product
      SET quantity=quantity + order_products.product_quantity
      FROM (SELECT product_id,order_id,product_quantity FROM user_order_product) AS order_products
      WHERE product.id = order_products.product_id AND order_products.order_id = $1;`,
      [order_id]
    );

    return result.rowCount;
  }

  async function addOrderPayment(amount, method, payment_details, order_id) {
    const result = await pool.query(
      `INSERT INTO user_order_payment(amount,method,payment_details,user_order_id) 
      VALUES($1, $2, $3, $4)`,
      [amount, method, payment_details, order_id]
    );

    return result.rowCount;
  }

  async function clearPayments(order_id) {
    const result = await pool.query(
      `DELETE FROM user_order_payment WHERE user_order_id = $1;`,
      [order_id]
    );

    return result.rowCount;
  }

  async function updateOrder(
    order_total,
    order_items,
    is_delivery,
    delivery_address,
    order_status_id,
    order_id
  ) {
    const result = await pool.query(
      `UPDATE user_order
      SET order_date = CURRENT_TIMESTAMP,
      order_total = $1,
      order_items = $2,
      is_delivery = $3,
      delivery_address = $4,
      order_status_id = $5,
      is_cart = false
      WHERE user_order.id = $6;`,
      [
        order_total,
        order_items,
        is_delivery,
        delivery_address,
        order_status_id,
        order_id,
      ]
    );

    return result.rowCount;
  }

  async function updateOrderStatus(order_status_id, order_id) {
    const result = await pool.query(
      `UPDATE user_order SET order_status_id = $1 WHERE user_order.id = $2;`,
      [order_status_id, order_id]
    );

    return result.rowCount;
  }
  
  async function userOrdered(product_id) {
    const result = await pool.query(
      `SELECT
      COUNT(user_order."id") as "count"
      FROM user_order
      WHERE user_order.user_id = $1 LIMIT 1`,
      [product_id]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  return {
    getOrder,
    getOrders,
    getOrderProducts,
    addOrderPayment,
    getOrderTotals,
    updateOrder,
    getOrderProduct,
    addOrderProduct,
    updateOrderProduct,
    removeOrderProduct,
    clearOrder,
    updateProductQauntity,
    checkOrderQuantity,
    clearPayments,
    updateProductQauntityReverse,
    getOrdersByName,
    getOrdersByID,
    updateOrderStatus,
    userOrdered,
  };
};