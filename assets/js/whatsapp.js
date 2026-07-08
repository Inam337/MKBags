/*
=========================================================
BagsProMax — WhatsApp Orders
=========================================================
*/

"use strict";

let html2canvasPromise = null;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getAbsoluteImageUrl(imagePath) {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return new URL(imagePath, window.location.href).href;
}

function buildWhatsAppTextSummary(items, total) {
    const brand = SITE_CONFIG.brand || "BAGSPROMAX";
    const lines = [
        `Hello! I would like to checkout from *${brand}*:`,
        ""
    ];

    items.forEach((item, index) => {
        lines.push(
            `${index + 1}. ${item.name}`,
            `   Color: ${item.color} | Qty: ${item.qty} | ${formatPrice(item.price * item.qty)}`
        );
    });

    lines.push("", `Subtotal: ${formatPrice(total)}`, "", "Please confirm availability and payment details.");
    return lines.join("\n");
}

function buildOrderCardHTML(items, total) {
    const brand = SITE_CONFIG.brand || "BAGSPROMAX";
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

    const itemCards = items.map(item => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:10px;background:#FFFFFF;">
            <img src="${getAbsoluteImageUrl(item.image)}" alt="${escapeHtml(item.name)}" crossorigin="anonymous"
                style="width:72px;height:72px;object-fit:cover;border-radius:8px;flex-shrink:0;background:#F1F5F9;">
            <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;color:#0F172A;margin-bottom:4px;line-height:1.3;">${escapeHtml(item.name)}</div>
                <div style="font-size:12px;color:#64748B;margin-bottom:2px;">Color: <span style="color:#0F172A;font-weight:600;">${escapeHtml(item.color)}</span></div>
                <div style="font-size:12px;color:#64748B;">Qty: ${item.qty} &times; ${formatPrice(item.price)}</div>
                <div style="font-weight:700;font-size:15px;color:#2563EB;margin-top:6px;">${formatPrice(item.price * item.qty)}</div>
            </div>
        </div>
    `).join("");

    return `
        <div style="width:380px;font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:20px;">
            <div style="background:linear-gradient(135deg,#0F172A 0%,#1E293B 100%);color:#FFFFFF;padding:18px 16px;border-radius:14px 14px 0 0;text-align:center;">
                <div style="font-size:11px;letter-spacing:1.5px;opacity:0.85;margin-bottom:4px;">ORDER REQUEST</div>
                <div style="font-size:22px;font-weight:800;letter-spacing:0.5px;">${escapeHtml(brand)}</div>
            </div>
            <div style="background:#FFFFFF;padding:16px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 14px 14px;box-shadow:0 8px 24px rgba(15,23,42,0.1);">
                <div style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">
                    ${itemCount} item${itemCount === 1 ? "" : "s"} in cart
                </div>
                ${itemCards}
                <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;margin-top:4px;">
                    <span style="font-size:14px;font-weight:600;color:#0F172A;">Subtotal</span>
                    <span style="font-size:20px;font-weight:800;color:#2563EB;">${formatPrice(total)}</span>
                </div>
                <p style="font-size:11px;color:#94A3B8;text-align:center;margin:14px 0 0;line-height:1.5;">
                    Shipping &amp; taxes calculated at checkout
                </p>
            </div>
        </div>
    `;
}

function getCaptureContainer() {
    let container = document.getElementById("whatsapp-order-capture");
    if (!container) {
        container = document.createElement("div");
        container.id = "whatsapp-order-capture";
        container.setAttribute("aria-hidden", "true");
        container.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;";
        document.body.appendChild(container);
    }
    return container;
}

function waitForImages(root) {
    const images = [...root.querySelectorAll("img")];
    return Promise.all(images.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

function loadHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (html2canvasPromise) return html2canvasPromise;

    html2canvasPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        script.onload = () => resolve(window.html2canvas);
        script.onerror = () => reject(new Error("Failed to load html2canvas"));
        document.head.appendChild(script);
    });

    return html2canvasPromise;
}

async function renderOrderCardImage(html) {
    const container = getCaptureContainer();
    container.innerHTML = html;
    const card = container.firstElementChild;
    await waitForImages(card);

    const html2canvas = await loadHtml2Canvas();
    const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F8FAFC",
        logging: false
    });

    return new Promise(resolve => canvas.toBlob(resolve, "image/png", 0.95));
}

function openWhatsAppText(text) {
    const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

async function shareOrderCardToWhatsApp(items, total) {
    const text = buildWhatsAppTextSummary(items, total);
    const html = buildOrderCardHTML(items, total);
    const imageBlob = await renderOrderCardImage(html);
    const imageFile = new File([imageBlob], "bagspromax-order.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
            text,
            files: [imageFile]
        });
        return;
    }

    if (navigator.clipboard && window.ClipboardItem) {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": imageBlob })
            ]);
            openWhatsAppText(`${text}\n\nOrder card image copied — paste it in the chat (Ctrl+V).`);
            return;
        } catch (error) {
            // Fall through to download fallback.
        }
    }

    downloadBlob(imageBlob, "bagspromax-order.png");
    openWhatsAppText(`${text}\n\nOrder card image downloaded — please attach bagspromax-order.png in the chat.`);
}

async function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        await shareOrderCardToWhatsApp(cart, getCartTotal());
    } catch (error) {
        console.error(error);
        openWhatsAppText(buildWhatsAppTextSummary(cart, getCartTotal()));
    }
}

async function buyOnWhatsApp(id) {
    const product = getProductById(id);
    if (!product) return;

    const colorSelect = document.getElementById(`color-${id}`);
    const color = colorSelect ? colorSelect.value : product.defaultColor;
    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

    const item = {
        name: product.name,
        color,
        qty,
        price: product.price,
        image: product.image
    };

    try {
        await shareOrderCardToWhatsApp([item], product.price * qty);
    } catch (error) {
        console.error(error);
        openWhatsAppText(buildWhatsAppTextSummary([item], product.price * qty));
    }
}
