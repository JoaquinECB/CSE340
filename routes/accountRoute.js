const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

// Route to build the login view when "My Account" is clicked
router.get("/", utilities.handleErrors(accountController.buildLogin))

// Export the router
module.exports = router
