module.exports = function userAdminManager(pool) {
    async function getSales(
        product_type_id = 0,
        order_from = "",
        order_to = "",
        Limit = 5
      ) {
        let limitText = Limit > 0 ? ` LIMIT ${Limit} ` : "  ";
    
        const result = await pool.query(
          `SELECT
          product_type.name product_type,
          product.product_name, 
          SUM(user_order_product.sub_total) total_Sale,
          SUM(user_order_product.product_quantity) qty
        FROM product
        INNER JOIN product_type on product_type.id = product.product_type_id
        INNER JOIN user_order_product on product.id = user_order_product.product_id
        INNER JOIN user_order on user_order.id = user_order_product.order_id
        WHERE ($1=0 OR ($1 <> 0 AND product_type_id =$1))
        AND ($2 ='' OR ($2 <> '' AND TO_TIMESTAMP($2,'YYYY-MM-DD HH:MI:SS') <= order_date))
        AND ($3 ='' OR ($3 <> '' AND TO_TIMESTAMP($3,'YYYY-MM-DD HH:MI:SS') >= order_date))
        GROUP BY product_type.name, product.product_name
        
        order by total_sale DESC,qty DESC ${limitText}`,
          [product_type_id, order_from, order_to]
        );
    
        return result.rows;
      }
    async function getOrderStatus(order_from = "", order_to = "", Limit = 5) {
        let limitText = Limit > 0 ? ` LIMIT ${Limit} ` : "  ";
        const result = await pool.query(
        `SELECT
      product_type.name product_type,
      product.product_name, 
      SUM(user_order_product.sub_total) total_Sale,
      SUM(user_order_product.product_quantity) qty
    FROM product
    INNER JOIN product_type on product_type.id = product.product_type_id
    INNER JOIN user_order_product on product.id = user_order_product.product_id
    INNER JOIN user_order on user_order.id = user_order_product.order_id
    WHERE ($1=0 OR ($1 <> 0 AND product_type_id =$1))
    AND ($2 ='' OR ($2 <> '' AND TO_TIMESTAMP($2,'YYYY-MM-DD HH:MI:SS') <= order_date))
    AND ($3 ='' OR ($3 <> '' AND TO_TIMESTAMP($3,'YYYY-MM-DD HH:MI:SS') >= order_date))
    GROUP BY product_type.name, product.product_name
    
    order by total_sale DESC,qty DESC ${limitText}`,
      [product_type_id, order_from, order_to]
      );

    return result.rows;
  }

  return {
    
    getSales,
    getOrderStatus,
  };
};