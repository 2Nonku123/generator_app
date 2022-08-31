
  const { getPool } = require("../module/database");

module.exports = function UserAdminManager() {
  const pool = getPool();
  async function getUsers() {
    const result = await pool.query(
      `SELECT store_user.id, first_name, lastname, user_name, email_address, contact_number, date_registered, user_type_id, locked, locked_date
      ,user_type.description AS user_type 
      FROM store_user 
      INNER JOIN user_type ON store_user.user_type_id = user_type."id" `
    );

    return result.rows;
  }

  async function getUserSearch(search_text) {
    const searchTerm = "%" + `${search_text.toLowerCase()}` + "%";
    const result = await pool.query(
      `SELECT store_user.id, first_name, lastname, user_name, 
      email_address, contact_number, date_registered, user_type_id, locked, locked_date
      ,user_type.description AS user_type
      FROM store_user
      INNER JOIN user_type ON store_user.user_type_id = user_type."id" 
      WHERE lower(first_name) LIKE $1
      OR lower(lastname) LIKE $2
      OR lower(user_name) LIKE $3
      OR lower(email_address) LIKE $4
      OR lower(contact_number) LIKE $5
      OR lower(user_type.description) = $6`,
      [
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        search_text.toLowerCase(),
      ]
    );
    return result.rows;
  }
  async function getUser(user_id) {
    const result = await pool.query(
      `SELECT store_user.id, first_name, lastname, user_name, email_address, contact_number, date_registered, user_type_id, locked, locked_date 
      ,user_type.description AS user_type 
      FROM store_user 
      INNER JOIN user_type ON store_user.user_type_id = user_type."id" 
      WHERE store_user.id = $1 limit 1`,
      [user_id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async function addUser(iObject) {
    const result = await pool.query(
      `INSERT INTO store_user(first_name, lastname, user_name, password, email_address, contact_number, user_type_id) 
      VALUES($1, $2, $3, $4, $5, $6, $7);`,
      [
        iObject.first_name,
        iObject.lastname,
        iObject.user_name,
        iObject.password,
        iObject.email_address,
        iObject.contact_number,
        iObject.user_type_id,
      ]
    );

    return result.rowCount;
  }

  async function updateUser(iObject) {
    const result = await pool.query(
      `UPDATE store_user SET first_name = $1, lastname = $2, user_name = $3, email_address = $4, 
      contact_number = $5, user_type_id = $6, locked = $7 WHERE id = $8`,
      [
        iObject.first_name,
        iObject.lastname,
        iObject.user_name,
        iObject.email_address,
        iObject.contact_number,
        iObject.user_type_id,
        iObject.locked,
        iObject.id,
      ]
    );

    return result.rowCount;
  }

  async function getStats() {
    const result = await pool.query(
      `SELECT
      (SELECT COUNT(store_user.id) FROM store_user) as "user_count", 
      (SELECT COUNT(product.id) FROM product) as "product_count", 
      (SELECT COUNT(user_order.id) FROM user_order) WHERE is_cart = false) as "order_count"`
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async function deleteUser(user_id) {
    const result = await pool.query(`DELETE FROM store_user WHERE id = $1`, [
      user_id,
    ]);

    return result.rowCount;
  }

  async function updateUserPasssword() {}

  return {
    getUser,
    getUserSearch,
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    updateUserPasssword,
    getStats,
  };
};