const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors:null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: false, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error('accountLogin error:', error)
    req.flash('notice', 'Access forbidden. Please try again or contact the administrator.')
    res.status(500).render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      account_email,
    })
  }
}

/* ****************************************
 *  Display Account Management View
 * ************************************ */
async function displayAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  // Pass accountData from JWT to view for role-based rendering
  const accountData = res.locals.accountData;
  res.render("account/index", {
    title: "Account Management",
    nav,
    errors: null,
    accountData,
  })
}

/* ****************************************
 *  Build Update Account View
 * ************************************ */
async function buildUpdateAccountView(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const loggedInAccount = res.locals.accountData;
  // Only allow if the user is updating their own account or is an Admin
  if (!loggedInAccount || (loggedInAccount.account_id != account_id && loggedInAccount.account_type !== "Admin")) {
    req.flash("notice", "You do not have permission to update this account.")
    return res.redirect("/account/")
  }
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
 *  Process Account Update
 * ************************************ */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  let { account_firstname, account_lastname, account_email, account_id } = req.body
  account_email = account_email.trim().toLowerCase();
  const loggedInAccount = res.locals.accountData;
  // Only allow if the user is updating their own account or is an Admin
  if (!loggedInAccount || (loggedInAccount.account_id != account_id && loggedInAccount.account_type !== "Admin")) {
    req.flash("notice", "You do not have permission to update this account.")
    return res.redirect("/account/")
  }

  // Check if the new email is already used by another account
  const existingAccount = await accountModel.getAccountByEmail(account_email)
  console.log("existingAccount:", existingAccount, "account_id from form:", account_id);
  if (existingAccount && Number(existingAccount.account_id) !== Number(account_id)) {
    req.flash("notice", "Email exists. Please use a different email")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 *  Process Password Update
 * ************************************ */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  
  // Hash the password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password change.")
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
    })
    return
  }

  const updateResult = await accountModel.updateAccountPassword(parseInt(account_id), hashedPassword)
  
  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account/")
  } else {
    const accountData = await accountModel.getAccountById(parseInt(account_id))
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  }
}

/* ****************************************
 *  Logout
 * ************************************ */
async function logout(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out successfully.")
  res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, displayAccountManagement, buildUpdateAccountView, updateAccount, updatePassword, logout }