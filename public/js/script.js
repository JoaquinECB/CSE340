// Wishlist functionality

// Add to wishlist
function addToWishlist(invId) {
  fetch('/wishlist/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inv_id: invId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const btn = document.querySelector(`.wishlist-btn[data-inv-id="${invId}"]`)
      if (btn) {
        btn.textContent = 'Remove from Wishlist'
        btn.classList.remove('add-wishlist')
        btn.classList.add('remove-wishlist')
        btn.onclick = () => removeFromWishlist(invId)
      }
      showNotification('Added to your wishlist!', 'success')
    } else {
      showNotification(data.message || 'Error adding to wishlist', 'error')
    }
  })
  .catch(error => {
    console.error('Error:', error)
    showNotification('Error adding to wishlist', 'error')
  })
}

// Remove from wishlist
function removeFromWishlist(invId) {
  fetch('/wishlist/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inv_id: invId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const btn = document.querySelector(`.wishlist-btn[data-inv-id="${invId}"]`)
      if (btn) {
        btn.textContent = 'Add to Wishlist'
        btn.classList.remove('remove-wishlist')
        btn.classList.add('add-wishlist')
        btn.onclick = () => addToWishlist(invId)
      }
      const listItem = document.querySelector(`li [data-inv-id="${invId}"]`)?.closest('li')
      if (listItem) {
        listItem.remove()
        const list = document.querySelector('#inv-display')
        if (list && list.children.length === 0) {
          location.reload()
        }
      }
      showNotification('Removed from your wishlist!', 'success')
    } else {
      showNotification(data.message || 'Error removing from wishlist', 'error')
    }
  })
  .catch(error => {
    console.error('Error:', error)
    showNotification('Error removing from wishlist', 'error')
  })
}

// Show notification message
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 16px;
    border-radius: 4px;
    z-index: 1000;
    animation: slideIn 0.3s ease-in-out;
  `
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in-out'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Initialize wishlist buttons on page load
document.addEventListener('DOMContentLoaded', function() {
  const wishlistBtns = document.querySelectorAll('.wishlist-btn')
  wishlistBtns.forEach(btn => {
    const invId = btn.getAttribute('data-inv-id')
    btn.addEventListener('click', function(e) {
      e.preventDefault()
      if (btn.classList.contains('add-wishlist')) {
        addToWishlist(invId)
      } else {
        removeFromWishlist(invId)
      }
    })
  })
  
  const removeButtons = document.querySelectorAll('.remove-wishlist-btn')
  removeButtons.forEach(btn => {
    const invId = btn.getAttribute('data-inv-id')
    btn.addEventListener('click', function(e) {
      e.preventDefault()
      removeFromWishlist(invId)
    })
  })

  if (!document.querySelector('style[data-wishlist]')) {
    const style = document.createElement('style')
    style.setAttribute('data-wishlist', 'true')
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
      .wishlist-btn {
        background-color: #ff6b6b;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        font-size: 14px;
        transition: background-color 0.3s ease;
      }
      .wishlist-btn.add-wishlist { background-color: #ff6b6b; }
      .wishlist-btn.add-wishlist:hover { background-color: #ff5252; }
      .wishlist-btn.remove-wishlist { background-color: #4CAF50; }
      .wishlist-btn.remove-wishlist:hover { background-color: #45a049; }
      .remove-wishlist-btn {
        background-color: #f44336;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        font-size: 14px;
        display: block;
        transition: background-color 0.3s ease;
      }
      .remove-wishlist-btn:hover { background-color: #da190b; }
    `
    document.head.appendChild(style)
  }
})
