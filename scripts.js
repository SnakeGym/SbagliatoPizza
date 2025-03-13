let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function moveSlide(step) {
    currentSlide = (currentSlide + step + slides.length) % slides.length;
    showSlide(currentSlide);
}

setInterval(() => moveSlide(1), 5000); // Cambia cada 5 segundos

let cart = {}; // To store cart items

function updateQuantity(button, change) {
    // Encuentra el input relacionado
    const quantityInput = button.parentElement.querySelector('.quantity-input');
    const currentQuantity = parseInt(quantityInput.value, 10) || 0; // Si no es un número, tomar 0

    const newQuantity = currentQuantity + change;
    quantityInput.value = newQuantity;

    // Si la cantidad es mayor que 0, actualizamos el carrito
    const itemName = button.closest('.menu-item').querySelector('h3').textContent;
    const priceText = button.closest('.menu-item').querySelector('p strong').nextSibling.nodeValue.trim();
    const price = parseFloat(priceText.replace('$', '').replace(',', ''));

    if (newQuantity > 0) {
        cart[itemName] = { price, quantity: newQuantity };
    } else {
        // Si la cantidad es 0, mostramos el botón de eliminar
        cart[itemName].quantity = 0;
    }

    // Actualizamos el carrito en la vista
    updateCartSummary();
}

function openCart() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const modalTotal = document.getElementById('cart-modal-total');

    // Ocultar el cartel "Ver tu pedido"
    const orderSummary = document.getElementById('cart-summary');
    if (orderSummary) {
        orderSummary.style.display = 'none'; 
    }

    // Limpiar los elementos del carrito
    cartItems.innerHTML = '';

    let total = 0;

    for (const [name, { price, quantity }] of Object.entries(cart)) {
        const listItem = document.createElement('li');

        // Aquí no reemplazamos los botones "+" y "-" al llegar a 0, solo agregamos la X al lado
        listItem.innerHTML = `
            <span>${name} x</span>
            <div class="quantity-box">
                <button class="quantity-btn" onclick="modifyCartQuantity('${name}', -1)">-</button>
                <input type="number" class="quantity-input" value="${quantity}" onchange="updateItemQuantity('${name}', this.value)">
                <button class="quantity-btn" onclick="modifyCartQuantity('${name}', 1)">+</button>
                
                <!-- La X solo aparece cuando la cantidad es 0 -->
                ${quantity === 0 ? `<span class="remove-btn" onclick="removeFromCart('${name}')">✖</span>` : ''}
            </div>
            <span>$${(price * quantity).toFixed(2)}</span>
        `;

        cartItems.appendChild(listItem);
        total += price * quantity;
    }

    modalTotal.textContent = total.toFixed(2);
    modal.classList.remove('hidden');
    modal.classList.add('visible');
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('visible');
    modal.classList.add('hidden');

    const orderSummary = document.getElementById('cart-summary');
    if (orderSummary) {
        orderSummary.style.display = 'block'; 
    }
}

function updateCartSummary() {
    const cartTotal = document.getElementById('cart-total');
    let total = 0;

    for (const { price, quantity } of Object.values(cart)) {
        total += price * quantity;
    }

    cartTotal.textContent = total.toFixed(2);
}

function sendOrderToWhatsApp() {
    let name = document.getElementById("name").value.trim();
    let method = document.querySelector('input[name="method"]:checked').value;
    let comments = document.getElementById("comments").value.trim();
    let total = document.getElementById("cart-modal-total").innerText;

    let productList = "";
    for (const [itemName, { price, quantity }] of Object.entries(cart)) {
        productList += `• ${itemName} x ${quantity} $${(price * quantity).toFixed(2)}\n`;
    }

    let phoneNumber = "5491172044728";
    let message = `Hola!! Quisiera hacer un pedido:\n\n` +
                  ` Nombre: ${name}\n` +
                  ` Método de entrega: ${method}\n` +
                  ` Comentarios: ${comments}\n` +
                  ` Productos:\n${productList}\n` +
                  ` Total: $${total}\n`;

    let encodedMessage = encodeURIComponent(message);
    let whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
}

function modifyCartQuantity(itemName, change) {
    if (!cart[itemName]) return;

    cart[itemName].quantity = Math.max(0, cart[itemName].quantity + change);
    openCart();
    updateCartSummary();
}

function updateItemQuantity(itemName, newQuantity) {
    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 0) {
        alert('La cantidad debe ser un número mayor o igual a 0.');
        return;
    }

    if (cart[itemName]) {
        cart[itemName].quantity = quantity;
    }

    openCart();
    updateCartSummary();
}

function removeFromCart(itemName) {
    // Eliminar el artículo del carrito
    delete cart[itemName];

    // Reabrir el carrito después de eliminar el artículo
    openCart();
    updateCartSummary();
}
