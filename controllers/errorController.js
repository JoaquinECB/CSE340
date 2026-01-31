const errorCont = {}

/* ***************************
 *  Trigger intentional error
 * ************************** */
errorCont.triggerError = async function (req, res, next) {
  // Intentionally throw an error
  const error = new Error('Intentional 500 error triggered for testing purposes')
  error.status = 500
  throw error
}

module.exports = errorCont