const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildVehicleDetail = async function(vehicle, inWishlist = false, isLoggedIn = false){
  if (!vehicle) {
    return '<p class="notice">Sorry, vehicle not found.</p>'
  }
  
  let wishlistButton = ''
  if (isLoggedIn) {
    const buttonText = inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'
    const buttonClass = inWishlist ? 'remove-wishlist' : 'add-wishlist'
    wishlistButton = `<button class="wishlist-btn ${buttonClass}" data-inv-id="${vehicle.inv_id}" title="${buttonText}">${buttonText}</button>`
  }
  
  let detail = `
    <div class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" 
             alt="${vehicle.inv_make} ${vehicle.inv_model}" />
      </div>
      <div class="vehicle-info">
        <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
        
        <p class="price"><strong>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</strong></p>
        
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        
        <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
        
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        
        <p class="description"><strong>Description:</strong><br> ${vehicle.inv_description}</p>
        
        ${wishlistButton}
      </div>
    </div>
  `
  return detail
}

/* **************************************
* Build the classification dropdown list
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
 res.locals.loggedin = 0
 res.locals.accountData = null
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("notice", "Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* **************************************
* Build the wishlist grid view HTML
* ************************************ */
Util.buildWishlistGrid = async function(data){
  let grid = ''
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(item => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ item.inv_id 
      + '" title="View ' + item.inv_make + ' '+ item.inv_model 
      + 'details"><img src="' + item.inv_thumbnail 
      +'" alt="Image of '+ item.inv_make + ' ' + item.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + item.inv_id +'" title="View ' 
      + item.inv_make + ' ' + item.inv_model + ' details">' 
      + item.inv_make + ' ' + item.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(item.inv_price) + '</span>'
      grid += '<button class="remove-wishlist-btn" data-inv-id="' + item.inv_id + '">Remove from Wishlist</button>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">You don\'t have any vehicles in your wishlist yet.</p>'
  }
  return grid
}

Util.checkLogin = (req, res, next) => {
 if (res.locals.loggedin) {
  next()
 } else {
  req.flash("notice", "Please log in.")
  return res.redirect("/account/login")
 }
}

/* ****************************************
 *  Check Account Type (Employee or Admin)
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin && (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
    next()
  } else {
    req.flash("notice", "You do not have permission to access this page.")
    return res.redirect("/account/login")
  }
}

module.exports = Util