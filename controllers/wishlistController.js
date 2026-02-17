const wishlistModel = require("../models/wishlist-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const wishlistCont = {}

/* ***************************
 *  Add vehicle to wishlist
 * ************************** */
wishlistCont.addToWishlist = async function (req, res, next) {
  const { inv_id } = req.body
  
  if (!res.locals.accountData?.account_id) {
    return res.status(401).json({ success: false, message: "User not logged in" })
  }
  
  const account_id = res.locals.accountData.account_id

  if (!inv_id || !Number.isInteger(Number(inv_id)) || Number(inv_id) <= 0) {
    return res.status(400).json({ success: false, message: "Valid Vehicle ID is required" })
  }

  try {
    const result = await wishlistModel.addToWishlist(account_id, inv_id)
    if (result.rowCount > 0) {
      return res.json({ success: true, message: "Added to wishlist" })
    } else {
      return res.status(400).json({ success: false, message: "Could not add to wishlist" })
    }
  } catch (error) {
    console.error("addToWishlist error: " + error.message)
    if (error.constraint === "unique_account_inventory") {
      return res.status(400).json({ success: false, message: "Vehicle already in wishlist" })
    }
    return res.status(500).json({ success: false, message: "Error adding to wishlist" })
  }
}

/* ***************************
 *  Remove vehicle from wishlist
 * ************************** */
wishlistCont.removeFromWishlist = async function (req, res, next) {
  const { inv_id } = req.body
  
  if (!res.locals.accountData?.account_id) {
    return res.status(401).json({ success: false, message: "User not logged in" })
  }
  
  const account_id = res.locals.accountData.account_id

  if (!inv_id || !Number.isInteger(Number(inv_id)) || Number(inv_id) <= 0) {
    return res.status(400).json({ success: false, message: "Valid Vehicle ID is required" })
  }

  try {
    const result = await wishlistModel.removeFromWishlist(account_id, inv_id)
    if (result.rowCount > 0) {
      return res.json({ success: true, message: "Removed from wishlist" })
    }
    return res.status(404).json({ success: false, message: "Item not found in wishlist" })
  } catch (error) {
    console.error("removeFromWishlist error: " + error.message)
    return res.status(500).json({ success: false, message: "Error removing from wishlist" })
  }
}

/* ***************************
 *  Build wishlist view
 * ************************** */
wishlistCont.buildWishlist = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const wishlist = await wishlistModel.getWishlistByAccountId(account_id)
    let nav = await utilities.getNav()

    const grid = await utilities.buildWishlistGrid(wishlist || [])

    res.render("./inventory/wishlist", {
      title: "My Wishlist",
      nav,
      grid,
      wishlist: wishlist || [],
    })
  } catch (error) {
    console.error("buildWishlist error: " + error)
    next(error)
  }
}

/* ***************************
 *  Check if vehicle is in wishlist (for AJAX)
 * ************************** */
wishlistCont.checkWishlist = async function (req, res, next) {
  const { inv_id } = req.query
  
  if (!res.locals.accountData?.account_id) {
    return res.status(401).json({ inWishlist: false })
  }
  
  const account_id = res.locals.accountData.account_id

  if (!inv_id || !Number.isInteger(Number(inv_id)) || Number(inv_id) <= 0) {
    return res.status(400).json({ inWishlist: false })
  }

  try {
    const inWishlist = await wishlistModel.isInWishlist(account_id, inv_id)
    return res.json({ inWishlist })
  } catch (error) {
    console.error("checkWishlist error: " + error.message)
    return res.status(500).json({ inWishlist: false })
  }
}

module.exports = wishlistCont
