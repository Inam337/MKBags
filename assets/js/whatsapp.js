/*
=========================================================
BagsProMax — WhatsApp Orders
=========================================================
*/

"use strict";

function getAbsoluteImageUrl(imagePath) {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return new URL(imagePath, window.location.href).href;
}

function formatWhatsAppDivider(char = "─", length = 28) {
    return char.repeat(length);
}

function formatWhatsAppProductCard(item, index) {
    const lineTotal = formatPrice(item.price * item.qty);
    const unitPrice = formatPrice(item.price);
    const imageUrl = getAbsoluteImageUrl(item.image);

    return [
        `╭${formatWhatsAppDivider("─")}╮`,
        `│ 📦 *${index}. ${item.name}*`,
        `│`,
        `│ 🎨 Color: _${item.color}_`,
        `│ 🔢 Qty: ${item.qty}  ×  ${unitPrice}`,
        `│ 💰 Total: *${lineTotal}*`,
        imageUrl ? `│ 🖼️ ${imageUrl}` : "",
        `╰${formatWhatsAppDivider("─")}╯`
    ].filter(Boolean).join("\n");
}

function formatWhatsAppOrderSummary(items, total) {
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

    return [
        `╭${formatWhatsAppDivider("─")}╮`,
        `│ 📋 *ORDER SUMMARY*`,
        `│`,
        `│ 🛍️ Items: ${itemCount}`,
        `│ 💳 Subtotal: *${formatPrice(total)}*`,
        `╰${formatWhatsAppDivider("─")}╯`
    ].join("\n");
}

function buildWhatsAppOrderMessage(items, total) {
    const brand = SITE_CONFIG.brand || "BAGSPROMAX";
    const productCards = items.map((item, index) => formatWhatsAppProductCard(item, index + 1));

    return [
        `🛒 *${brand}*`,
        `*New Order Request*`,
        "",
        productCards.join("\n\n"),
        "",
        formatWhatsAppOrderSummary(items, total),
        "",
        "Hello! I would like to proceed with checkout.",
        "Please confirm availability and share payment details. 🙏"
    ].join("\n");
}

function buildWhatsAppSingleProductMessage(product, color, qty = 1) {
    const brand = SITE_CONFIG.brand || "BAGSPROMAX";
    const item = {
        name: product.name,
        color,
        qty,
        price: product.price,
        image: product.image
    };

    return [
        `🛒 *${brand}*`,
        `*Product Inquiry*`,
        "",
        formatWhatsAppProductCard(item, 1),
        "",
        "Hello! I would like to buy this item.",
        "Please confirm availability and share payment details. 🙏"
    ].join("\n");
}

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const message = buildWhatsAppOrderMessage(cart, getCartTotal());
    const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

function buyOnWhatsApp(id) {
    const product = getProductById(id);
    if (!product) return;

    const colorSelect = document.getElementById(`color-${id}`);
    const color = colorSelect ? colorSelect.value : product.defaultColor;
    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
    const message = buildWhatsAppSingleProductMessage(product, color, qty);
    const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}
