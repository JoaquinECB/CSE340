const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

// Route to build the login view when "My Account" is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to process the registration data
router.post("/register", utilities.handleErrors(accountController.registerAccount))

// Export the router
module.exports = router
