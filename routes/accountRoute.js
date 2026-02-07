const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountsController = require("../controllers/accountsController")

// Route to build the login view when "My Account" is clicked
router.get("/", utilities.handleErrors(accountsController.buildLogin))

// Export the router
module.exports = router
