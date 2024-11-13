// cart.js
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.updateCartCount();
    }

    
    removeItem(productName) {
        this.items = this.items.filter(item => item.name !== productName);
        this.saveCart();
        this.updateCartCount();
        this.updateCartUI();
    }

    updateQuantity(productName, quantity) {
        const item = this.items.find(item => item.name === productName);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(productName);
            }
        }
        this.saveCart();
        this.updateCartCount();
        this.updateCartUI();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Update the updateCartCount method in the ShoppingCart class
updateCartCount() {
    const cartCount = this.items.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Remove existing animation
        cartCountElement.classList.remove('bump');
        
        // Trigger reflow to restart animation
        void cartCountElement.offsetWidth;
        
        // Add animation class
        cartCountElement.classList.add('bump');
        
        // Hide count if zero
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// Update the addItem method to scroll to top of modal
addItem(product) {
    const existingItem = this.items.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        this.items.push({
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }
    
    this.saveCart();
    this.updateCartCount();
    this.updateCartUI();
    
    // Scroll modal to top when new item is added
    const cartContent = document.querySelector('.cart-modal-content');
    if (cartContent) {
        cartContent.scrollTop = 0;
    }
}

    calculateTotal() {
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price.replace('$', ''));
            return total + (price * item.quantity);
        }, 0).toFixed(2);
    }

    updateCartUI() {
        const cartModal = document.querySelector('.cart-modal');
        if (!cartModal) return;

        const cartContent = cartModal.querySelector('.cart-content');
        cartContent.innerHTML = '';

        if (this.items.length === 0) {
            cartContent.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            this.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Price: ${item.price}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="quantity-input">
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                    <button class="remove-item">×</button>
                `;
                cartContent.appendChild(itemElement);

                // Add event listeners for quantity controls
                const quantityInput = itemElement.querySelector('.quantity-input');
                const minusBtn = itemElement.querySelector('.minus');
                const plusBtn = itemElement.querySelector('.plus');
                const removeBtn = itemElement.querySelector('.remove-item');

                minusBtn.addEventListener('click', () => {
                    const newQuantity = parseInt(quantityInput.value) - 1;
                    this.updateQuantity(item.name, newQuantity);
                });

                plusBtn.addEventListener('click', () => {
                    const newQuantity = parseInt(quantityInput.value) + 1;
                    this.updateQuantity(item.name, newQuantity);
                });

                quantityInput.addEventListener('change', (e) => {
                    this.updateQuantity(item.name, e.target.value);
                });

                removeBtn.addEventListener('click', () => {
                    this.removeItem(item.name);
                });
            });

            // Add total
            const totalElement = document.createElement('div');
            totalElement.className = 'cart-total';
            totalElement.innerHTML = `
                <h3>Total: $${this.calculateTotal()}</h3>
                <button class="btn checkout-btn">Proceed to Checkout</button>
            `;
            cartContent.appendChild(totalElement);
        }
    }
}

// Initialize cart functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add cart icon and modal to the DOM
    const cartIconContainer = document.querySelector('.fa-cart-shopping').parentElement;
    cartIconContainer.innerHTML += '<span class="cart-count">0</span>';

    const cartModal = document.createElement('div');
    cartModal.className = 'cart-modal';
    cartModal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-header">
                <h2>Shopping Cart</h2>
                <button class="close-cart">×</button>
            </div>
            <div class="cart-content"></div>
        </div>
    `;
    document.body.appendChild(cartModal);

    // Initialize shopping cart
    const cart = new ShoppingCart();

    // Add event listeners for cart interaction
    document.querySelectorAll('.btn-white').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productElement = this.closest('.product');
            const product = {
                name: productElement.querySelector('.product-name').textContent,
                price: productElement.querySelector('.product-details p:last-child').textContent.split('-')[1].trim(),
                image: productElement.querySelector('.main-image img').src
            };
            cart.addItem(product);
            
            // Show success message
            const message = document.createElement('div');
            message.className = 'success-message';
            message.textContent = `Added ${product.name} to cart!`;
            document.body.appendChild(message);
            setTimeout(() => message.remove(), 2000);
        });
    });

    // Cart modal toggle
    const cartIcon = document.querySelector('.fa-cart-shopping');
    const closeCart = document.querySelector('.close-cart');

    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
        cart.updateCartUI();
    });

    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
});