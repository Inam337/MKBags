/*
=========================================================
BagsProMax — WhatsApp Orders
=========================================================
*/

"use strict";

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let message = "Hello! I would like to checkout:\n\n";
    cart.forEach(item => {
        message += `- ${item.name} (${item.color}) x${item.qty} = ${formatPrice(item.price * item.qty)}\n`;
    });
    message += `\nSubtotal: ${formatPrice(getCartTotal())}`;

    const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

function buyOnWhatsApp(id) {
    const product = getProductById(id);
    if (!product) return;

    const colorSelect = document.getElementById(`color-${id}`);
    const color = colorSelect ? colorSelect.value : product.defaultColor;
    const message = `Hello! I want to buy:\n\n- ${product.name}\n- Color: ${color}\n- Price: ${formatPrice(product.price)}`;
    const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}
