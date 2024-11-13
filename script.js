// script.js
document.addEventListener('DOMContentLoaded', (event) => {
    // Initialize AOS (Animate on Scroll)
    AOS.init();

    // Mobile menu toggle
    const menuButton = document.getElementById('menu');
    const header = document.getElementById('header');
    let headerVisible = false;

    menuButton.addEventListener('click', function() {
        if (headerVisible === false) {
            header.style.height = '270px';
            headerVisible = true;
        } else {
            header.style.height = '50px';
            headerVisible = false;
        }
    });

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.btn-white');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productName = this.closest('.product').querySelector('.product-name').textContent;
            alert(`Added ${productName} to cart!`);
            // Here you would typically update the cart count and possibly show a mini-cart
        });
    });

    // Newsletter subscription
    const subscribeForm = document.querySelector('.sub');
    subscribeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        if (email) {
            alert(`Thank you for subscribing with email: ${email}`);
            this.querySelector('input').value = '';
        } else {
            alert('Please enter a valid email address.');
        }
    });
});