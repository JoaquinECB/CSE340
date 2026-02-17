// Needed Resources 
const express = require("express")
const router = new express.Router() 
const wishlistController = require("../controllers/wishlistController")
const utilities = require("../utilities/")

// Route to build wishlist view
router.get("/", utilities.checkLogin, utilities.handleErrors(wishlistController.buildWishlist))

// Route to add vehicle to wishlist (AJAX)
router.post(
  "/add",
  utilities.checkLogin,
  utilities.handleErrors(wishlistController.addToWishlist)
)

// Route to remove vehicle from wishlist (AJAX)
router.post(
  "/remove",
  utilities.checkLogin,
  utilities.handleErrors(wishlistController.removeFromWishlist)
)

// Route to check if vehicle is in wishlist (AJAX)
router.get(
  "/check",
  utilities.checkLogin,
  utilities.handleErrors(wishlistController.checkWishlist)
)

module.exports = router
