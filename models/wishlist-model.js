const pool = require("../database/")

/* ***************************
 *  Add vehicle to wishlist
 * ************************** */
async function addToWishlist(account_id, inv_id) {
  try {
    const sql = "INSERT INTO user_wishlist (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    console.error("addToWishlist error: " + error.message)
    throw error
  }
}

/* ***************************
 *  Remove vehicle from wishlist
 * ************************** */
async function removeFromWishlist(account_id, inv_id) {
  try {
    const sql = "DELETE FROM user_wishlist WHERE account_id = $1 AND inv_id = $2"
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    console.error("removeFromWishlist error: " + error.message)
    throw error
  }
}

/* ***************************
 *  Get all wishlist items for a user
 * ************************** */
async function getWishlistByAccountId(account_id) {
  try {
    const data = await pool.query(
      `SELECT w.*, i.inv_make, i.inv_model, i.inv_year, i.inv_image, i.inv_thumbnail, i.inv_price, i.inv_miles, i.inv_color, c.classification_name
      FROM user_wishlist w
      JOIN inventory i ON w.inv_id = i.inv_id
      JOIN classification c ON i.classification_id = c.classification_id
      WHERE w.account_id = $1
      ORDER BY w.created_at DESC`,
      [account_id]
    )
    return data.rows
  } catch (error) {
    console.error("getWishlistByAccountId error " + error)
    return []
  }
}

/* ***************************
 *  Check if vehicle is in wishlist
 * ************************** */
async function isInWishlist(account_id, inv_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM user_wishlist WHERE account_id = $1 AND inv_id = $2",
      [account_id, inv_id]
    )
    return data.rowCount > 0
  } catch (error) {
    console.error("isInWishlist error: " + error.message)
    throw error
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlistByAccountId,
  isInWishlist
}
