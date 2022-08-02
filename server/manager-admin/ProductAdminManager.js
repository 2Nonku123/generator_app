module.exports = function ProductAdminManager(pool) {
  async function getProductType() {
    const result = await pool.query(`select * from product_type`);
    return result.rows;
  }

  async function getProducts(
    product_type_id,
    orderBy,
    is_not_desc,
    show_outofstock = false
  ) {
    let sortOrder = is_not_desc == false ? "ASC" : "DESC";
    let outOfOrderFilter = show_outofstock ? "AND product.quantity <= 0" : "";

    let constraint = "";
    switch (orderBy) {
      case "date":
        constraint = `ORDER BY product.product_date ${sortOrder}`;
        break;

      case "price":
        constraint = `ORDER BY product.price ${sortOrder}`;
        break;

      case "name":

      default:
        constraint = `ORDER BY product.product_name ${sortOrder}`;
        break;
    }

    const result = await pool.query(
      `SELECT
      product.id, product.product_name, 
      product.price, description, product.quantity, product.available, 
      product.rental_duration, product.rental_duration_type, product.product_image, 
      product_type.name as "product_type",product.product_type_id,is_rentalble
      FROM product
      INNER JOIN product_type ON product.product_type_id = product_type.id
      where product_type.id = $1 ${outOfOrderFilter} ${constraint}`,
      [product_type_id]
    );

    return result.rows;
  }

  async function getProductsSearch(
    search_name,
    orderBy,
    is_not_desc,
    show_outofstock = false
  ) {
    let sortOrder = is_not_desc == false ? "ASC" : "DESC";
    let outOfOrderFilter = show_outofstock ? "AND product.quantity <= 0" : "";

    let constraint = "";
    switch (orderBy) {
      case "date":
        constraint = `ORDER BY product.product_date ${sortOrder}`;
        break;

      case "price":
        constraint = `ORDER BY product.price ${sortOrder}`;
        break;

      case "name":

      default:
        constraint = `ORDER BY product.product_name ${sortOrder}`;
        break;
    }

    const result = await pool.query(
      `SELECT
      product.id, product.product_name, 
      product.price, description, product.quantity, product.available, 
      product.rental_duration, product.rental_duration_type, product.product_image, 
      product_type.name as "product_type",product.product_type_id, is_rentalble
      FROM product
      INNER JOIN product_type ON product.product_type_id = product_type.id
      where lower(product.product_name) LIKE $1 ${outOfOrderFilter} ${constraint}`,
      ["%" + `${search_name.toLowerCase()}` + "%"]
    );

    return result.rows;
  }

  async function getProduct(product_id) {
    const result = await pool.query(
      ` SELECT
    product.id, product.product_name, product.description,
    product.price, product.quantity, product.available, 
    product.rental_duration, product.rental_duration_type, product.product_image, 
    product_type.name as "product_type",
    product.product_type_id,product.product_type_id, is_rentalble
    FROM product
    INNER JOIN product_type ON product.product_type_id = product_type.id
    WHERE product.id = $1 AND product.available = true LIMIT 1`,
      [product_id]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  async function addProduct(iObject) {
    const result = await pool.query(
      `INSERT INTO product(product_name, description, price, quantity, available, is_rentalble, rental_duration, rental_duration_type, product_type_id, product_image) 
		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [
        iObject.product_name,
        iObject.description,
        iObject.price,
        iObject.quantity,
        iObject.available,
        iObject.is_rentalble,
        iObject.rental_duration,
        iObject.rental_duration_type,
        iObject.product_type_id,
        iObject.product_image,
      ]
    );

    return result.rowCount;
  }

  async function updateProduct(iObject) {
    try {
      const result = await pool.query(
        `UPDATE product SET product_name = $1, description = $2, price = $3, quantity = $4, 
      available = $5, is_rentalble = $6, rental_duration = $7, rental_duration_type = $8, 
      product_type_id = $9, product_image = $10, WHERE id = $11`,
        [
          iObject.product_name,
          iObject.description,
          iObject.price,
          iObject.quantity,
          iObject.available,
          iObject.is_rentalble,
          iObject.rental_duration,
          iObject.rental_duration_type,
          iObject.product_type_id,
          iObject.product_image,
          iObject.id,
        ]
      );

      return result.rowCount;
    } catch (ex) {
      console.log(ex);
    }

    return 0;
  }
  async function removeProduct(product_id) {
    const result = await pool.query(`DELETE FROM product WHERE id = $1`, [
      product_id,
    ]);

    return result.rowCount;
  }

  return {
    getProductType,
    getProduct,
    getProducts,
    getProductsSearch,
    addProduct,
    updateProduct,
    removeProduct,
  };
};