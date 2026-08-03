/*
=========================================================
MK Bags World — Cart
=========================================================
*/

"use strict";

let cart = JSON.parse(localStorage.getItem("bagspromax_cart")) || [];

function saveCart() {
    localStorage.setItem("bagspromax_cart", JSON.stringify(cart));
}

function getCartKey(id, color) {
    return `${id}-${color}`;
}

function getCartItemImage(item) {
    const product = typeof getProductById === "function" ? getProductById(item.id) : null;
    if (!product) return item.image || "";

    if (typeof getProductImageForColor === "function") {
        return getProductImageForColor(product, item.color) || product.image;
    }

    return product.image || item.image || "";
}

function addToCart(id, color, qty) {
    const product = getProductById(id);
    if (!product || !isProductAvailable(product)) return;

    const selectedColor = color || product.defaultColor;
    const quantity = Math.max(1, Number(qty) || 1);
    const key = getCartKey(product.id, selectedColor);
    const existing = cart.find(item => getCartKey(item.id, item.color) === key);
    const image = getCartItemImage({ id: product.id, color: selectedColor, image: product.image });

    if (existing) {
        existing.qty += quantity;
        existing.image = image;
        existing.name = product.name;
        existing.price = product.price;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image,
            color: selectedColor,
            qty: quantity
        });
    }

    saveCart();
    updateCartUI();

    const offcanvas = document.getElementById("cartOffcanvas");
    if (offcanvas && typeof bootstrap !== "undefined") {
        bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
    }
}

function removeFromCart(id, color) {
    const key = getCartKey(id, color);
    cart = cart.filter(item => getCartKey(item.id, item.color) !== key);
    saveCart();
    updateCartUI();
}

function updateCartQty(id, color, delta) {
    const key = getCartKey(id, color);
    const item = cart.find(i => getCartKey(i.id, i.color) === key);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(id, color);
        return;
    }

    saveCart();
    updateCartUI();
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartTitleCount = document.getElementById("cartTitleCount");
    const cartItems = document.getElementById("cartItems");
    const cartFooter = document.getElementById("cartFooter");
    const grandTotal = document.getElementById("grandTotal");

    const itemCount = getCartItemCount();
    const total = getCartTotal();

    if (cartCount) cartCount.textContent = itemCount;
    if (cartTitleCount) cartTitleCount.textContent = itemCount;
    if (grandTotal) grandTotal.textContent = formatPrice(total);

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty-state">
                <p>Your cart is empty</p>
                <a href="products.html" class="continue-shopping" data-bs-dismiss="offcanvas">Continue Shopping</a>
            </div>`;
        if (cartFooter) cartFooter.classList.add("d-none");
        return;
    }

    if (cartFooter) cartFooter.classList.remove("d-none");

    cartItems.innerHTML = cart.map(item => {
        const product = typeof getProductById === "function" ? getProductById(item.id) : null;
        const image = getCartItemImage(item);
        const fallbackImage = (product && product.image) || item.image || "";
        const safeColor = String(item.color || "").replace(/'/g, "\\'");

        return `
        <div class="cart-drawer-item">
            <img src="${image}"
                alt="${item.name}"
                class="cart-drawer-thumb product-image"
                loading="lazy"
                data-default-image="${fallbackImage}"
                onerror="this.onerror=null;this.src=this.dataset.defaultImage||'';">
            <div class="cart-drawer-details">
                <div class="cart-drawer-top">
                    <div>
                        <h6>${item.name}</h6>
                        <span class="cart-drawer-color">Color: ${item.color}</span>
                    </div>
                    <button type="button" class="cart-remove-btn" onclick="removeFromCart(${item.id}, '${safeColor}')" aria-label="Remove item">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="cart-drawer-bottom">
                    <div class="qty-control">
                        <button type="button" onclick="updateCartQty(${item.id}, '${safeColor}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button type="button" onclick="updateCartQty(${item.id}, '${safeColor}', 1)">+</button>
                    </div>
                    <span class="cart-drawer-price">${formatPrice(item.price)}</span>
                </div>
            </div>
        </div>`;
    }).join("");

    // Keep stored cart images in sync with catalog product images.
    let cartNeedsSave = false;
    cart.forEach(item => {
        const resolved = getCartItemImage(item);
        if (resolved && item.image !== resolved) {
            item.image = resolved;
            cartNeedsSave = true;
        }
    });
    if (cartNeedsSave) saveCart();
}

function getProductQty(id) {
    const input = document.getElementById(`qty-${id}`);
    return input ? Math.max(1, parseInt(input.value, 10) || 1) : 1;
}

function changeProductQty(id, delta) {
    const input = document.getElementById(`qty-${id}`);
    if (!input) return;
    input.value = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
}

function addProductFromCard(id) {
    const product = getProductById(id);
    if (!product || !isProductAvailable(product)) return;

    const colorSelect = document.getElementById(`color-${id}`);
    const color = colorSelect ? colorSelect.value : product.defaultColor;
    addToCart(id, color, getProductQty(id));
}
