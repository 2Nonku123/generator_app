module.exports = function userAdminManager(pool) {
    async function getUsers() {
        const result = awaitpool.query(
            `SELECT stire_user.id, first_name, lastname, user_name, email_address, contact_number, date_registered, user_type_id, locked, locked_date
            ,user_type.description AS user_type
            FROM store_user
            INNER JOIN user_type ON store_user.user_type_id = user_type."id" `
        );

        return result.rows
        
    }
return {
    getUsers,
};
};