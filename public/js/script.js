// Wishlist functionality
const WISHLIST_PENDING = new Set()

// Generic wishlist toggle function
async function toggleWishlist(invId, action) {
  if (WISHLIST_PENDING.has(invId)) return
  
  WISHLIST_PENDING.add(invId)
  const btn = document.querySelector(`.wishlist-btn[data-inv-id="${invId}"]`)
  const originalText = btn?.textContent
  
  if (btn) {
    btn.disabled = true
    btn.textContent = action === 'add' ? 'Adding...' : 'Removing...'
  }

  try {
    const endpoint = action === 'add' ? '/wishlist/add' : '/wishlist/remove'
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inv_id: invId })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success) {
      if (btn) {
        const newAction = action === 'add' ? 'remove' : 'add'
        btn.textContent = action === 'add' ? 'Remove from Wishlist' : 'Add to Wishlist'
        btn.classList.toggle('add-wishlist')
        btn.classList.toggle('remove-wishlist')
      }

      if (action === 'remove') {
        const listItem = document.querySelector(`li [data-inv-id="${invId}"]`)?.closest('li')
        if (listItem) {
          listItem.remove()
          const list = document.querySelector('#inv-display')
          if (list && list.children.length === 0) {
            setTimeout(() => location.reload(), 500)
          }
        }
      }

      showNotification(
        action === 'add' ? 'Added to your wishlist!' : 'Removed from your wishlist!',
        'success'
      )
    } else {
      showNotification(data.message || `Error ${action === 'add' ? 'adding to' : 'removing from'} wishlist`, 'error')
      if (btn) btn.textContent = originalText
    }
  } catch (error) {
    console.error(`Wishlist ${action} error:`, error)
    showNotification(`Error ${action === 'add' ? 'adding to' : 'removing from'} wishlist`, 'error')
    if (btn) btn.textContent = originalText
  } finally {
    if (btn) btn.disabled = false
    WISHLIST_PENDING.delete(invId)
  }
}

// Add to wishlist
function addToWishlist(invId) {
  toggleWishlist(invId, 'add')
}

// Remove from wishlist
function removeFromWishlist(invId) {
  toggleWishlist(invId, 'remove')
}

// Show notification message
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    info: '#2196F3'
  }
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${colors[type] || colors.info};
    color: white;
    padding: 16px;
    border-radius: 4px;
    z-index: 1000;
    animation: slideIn 0.3s ease-in-out;
    max-width: 300px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `
  
  document.body.appendChild(notification)
  
  const removeTimeout = setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in-out'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
  
  notification.addEventListener('click', () => {
    clearTimeout(removeTimeout)
    notification.style.animation = 'slideOut 0.3s ease-in-out'
    setTimeout(() => notification.remove(), 300)
  })
}

// Initialize wishlist buttons on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeWishlistButtons()
  injectWishlistStyles()
})

function initializeWishlistButtons() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const invId = btn.getAttribute('data-inv-id')
    btn.addEventListener('click', handleWishlistClick)
  })

  document.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
    const invId = btn.getAttribute('data-inv-id')
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      removeFromWishlist(invId)
    })
  })
}

function handleWishlistClick(e) {
  e.preventDefault()
  const invId = this.getAttribute('data-inv-id')
  const action = this.classList.contains('add-wishlist') ? 'add' : 'remove'
  toggleWishlist(invId, action)
}

function injectWishlistStyles() {
  if (document.querySelector('style[data-wishlist]')) return

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
      transition: background-color 0.3s ease, opacity 0.3s ease;
      font-weight: 500;
    }
    .wishlist-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .wishlist-btn.add-wishlist { background-color: #ff6b6b; }
    .wishlist-btn.add-wishlist:hover:not(:disabled) { background-color: #ff5252; }
    .wishlist-btn.remove-wishlist { background-color: #4CAF50; }
    .wishlist-btn.remove-wishlist:hover:not(:disabled) { background-color: #45a049; }
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
      transition: background-color 0.3s ease, opacity 0.3s ease;
      font-weight: 500;
    }
    .remove-wishlist-btn:hover { background-color: #da190b; }
    .remove-wishlist-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `
  document.head.appendChild(style)
}
