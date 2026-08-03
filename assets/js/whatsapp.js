/*
=========================================================
MK Bags Worlds — WhatsApp Orders
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
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    return new URL(imagePath, window.location.href).href;
}

function getBrandLogoUrl() {
    return getAbsoluteImageUrl("assets/images/icons/logo.png");
}

function buildCardHeader(label) {
    const brand = SITE_CONFIG.brand || "MK Bags World";
    const logoUrl = getBrandLogoUrl();

    return `
        <div style="background:#FFFFFF;padding:20px 18px 16px;border-radius:16px 16px 0 0;text-align:center;border:1px solid #E2E8F0;border-bottom:none;">
            <img src="${logoUrl}" alt="${escapeHtml(brand)}" crossorigin="anonymous"
                style="height:48px;width:auto;max-width:220px;object-fit:contain;display:block;margin:0 auto 12px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.4px;color:#54413B;text-transform:uppercase;margin-bottom:4px;">${escapeHtml(label)}</div>
            <div style="font-size:18px;font-weight:800;color:#0F172A;letter-spacing:-0.2px;">${escapeHtml(brand)}</div>
        </div>
    `;
}

function buildWhatsAppTextSummary(items, total) {
    const brand = SITE_CONFIG.brand || "MK Bags World";
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
    const itemCount = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);

    const itemCards = items.map((item, index) => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:10px;background:#FFFFFF;">
            <div style="width:26px;height:26px;border-radius:50%;background:#54413B;color:#FFFFFF;font-size:12px;font-weight:700;line-height:26px;text-align:center;flex-shrink:0;">
                ${index + 1}
            </div>
            <img src="${getAbsoluteImageUrl(getCartItemImage(item))}" alt="${escapeHtml(item.name)}" crossorigin="anonymous"
                style="width:76px;height:76px;object-fit:cover;border-radius:10px;flex-shrink:0;background:#F8FAFC;border:1px solid #E2E8F0;">
            <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;color:#0F172A;margin-bottom:6px;line-height:1.35;">${escapeHtml(item.name)}</div>
                <div style="font-size:12px;color:#64748B;margin-bottom:3px;">Color: <span style="color:#333438;font-weight:600;">${escapeHtml(item.color || "Default")}</span></div>
                <div style="font-size:12px;color:#64748B;margin-bottom:6px;">Qty: <span style="color:#333438;font-weight:600;">${item.qty}</span> &times; ${formatPrice(item.price)}</div>
                <div style="font-weight:800;font-size:15px;color:#54413B;">${formatPrice(item.price * item.qty)}</div>
            </div>
        </div>
    `).join("");

    return `
        <div style="width:400px;font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:18px;">
            ${buildCardHeader("Order Request")}
            <div style="background:#FFFFFF;padding:16px;border:1px solid #E2E8F0;border-top:3px solid #54413B;border-radius:0 0 16px 16px;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <div style="font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.8px;">
                        Selected Products
                    </div>
                    <div style="font-size:12px;font-weight:700;color:#54413B;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:999px;padding:4px 10px;">
                        ${itemCount} item${itemCount === 1 ? "" : "s"}
                    </div>
                </div>
                ${itemCards}
                <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#0F172A;border-radius:12px;margin-top:6px;">
                    <span style="font-size:14px;font-weight:600;color:#FFFFFF;">Subtotal</span>
                    <span style="font-size:20px;font-weight:800;color:#FFFFFF;">${formatPrice(total)}</span>
                </div>
                <p style="font-size:11px;color:#94A3B8;text-align:center;margin:14px 0 0;line-height:1.5;">
                    Cash on delivery available &bull; Nationwide shipping in Pakistan
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

async function renderCardImage(html) {
    const container = getCaptureContainer();
    container.innerHTML = html;
    const card = container.firstElementChild;
    await waitForImages(card);

    const html2canvas = await loadHtml2Canvas();
    const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#F8FAFC",
        logging: false,
        imageTimeout: 8000
    });

    return new Promise(resolve => canvas.toBlob(resolve, "image/png", 0.95));
}

async function renderOrderCardImage(html) {
    return renderCardImage(html);
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

function buildContactFieldRow(label, value) {
    if (!value) return "";

    return `
        <div style="padding:12px 14px;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:10px;background:#F8FAFC;">
            <div style="font-size:11px;font-weight:700;color:#54413B;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:5px;">${escapeHtml(label)}</div>
            <div style="font-size:14px;color:#0F172A;font-weight:600;line-height:1.5;word-break:break-word;white-space:pre-wrap;">${escapeHtml(value)}</div>
        </div>
    `;
}

function buildContactTextSummary(contact) {
    const brand = SITE_CONFIG.brand || "MK Bags World";
    const fullName = `${contact.firstName} ${contact.lastName}`.trim();
    const lines = [
        `Hello ${brand}!`,
        "",
        "I have a new contact request:",
        "",
        `Name: ${fullName}`,
        `Email: ${contact.email}`,
        `Phone: ${contact.phone}`
    ];

    if (contact.orderNumber) lines.push(`Order: ${contact.orderNumber}`);
    lines.push("", "Message:", contact.message);

    return lines.join("\n");
}

function buildContactCardHTML(contact) {
    const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();

    return `
        <div style="width:400px;font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:18px;">
            ${buildCardHeader("Contact Request")}
            <div style="background:#FFFFFF;padding:16px;border:1px solid #E2E8F0;border-top:3px solid #54413B;border-radius:0 0 16px 16px;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
                <div style="font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">
                    Customer Details
                </div>
                ${buildContactFieldRow("Full Name", fullName)}
                ${buildContactFieldRow("Email", contact.email)}
                ${buildContactFieldRow("Phone", contact.phone)}
                ${buildContactFieldRow("Order Number", contact.orderNumber)}
                ${buildContactFieldRow("Message", contact.message)}
                <p style="font-size:11px;color:#94A3B8;text-align:center;margin:8px 0 0;line-height:1.5;">
                    Sent via MK Bags World website contact form
                </p>
            </div>
        </div>
    `;
}

async function shareCardToWhatsApp({ html, text, filename, cardLabel = "Card" }) {
    const imageBlob = await renderCardImage(html);
    const imageFile = new File([imageBlob], filename, { type: "image/png" });

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
            openWhatsAppText(`${text}\n\n${cardLabel} image copied — paste it in the chat (Ctrl+V).`);
            return;
        } catch (error) {
            // Fall through to download fallback.
        }
    }

    downloadBlob(imageBlob, filename);
    openWhatsAppText(`${text}\n\n${cardLabel} image downloaded — please attach ${filename} in the chat.`);
}

async function shareContactToWhatsApp(contact) {
    const text = buildContactTextSummary(contact);
    const html = buildContactCardHTML(contact);

    await shareCardToWhatsApp({
        html,
        text,
        filename: "mkbagsworld-contact.png",
        cardLabel: "Contact card"
    });
}

async function shareOrderCardToWhatsApp(items, total) {
    const text = buildWhatsAppTextSummary(items, total);
    const html = buildOrderCardHTML(items, total);

    await shareCardToWhatsApp({
        html,
        text,
        filename: "mkbagsworld-order.png",
        cardLabel: "Order card"
    });
}

async function sendWhatsAppOrder(button) {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const btn = button instanceof HTMLElement
        ? button
        : document.querySelector(".whatsapp-checkout-btn");

    if (btn && btn.disabled) return;

    const originalHTML = btn ? btn.innerHTML : "";

    if (btn) {
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
        btn.classList.add("is-loading");
        btn.innerHTML = '<span class="whatsapp-btn-spinner" aria-hidden="true"></span> Generating order...';
    }

    try {
        await shareOrderCardToWhatsApp(cart, getCartTotal());
    } catch (error) {
        console.error(error);
        openWhatsAppText(buildWhatsAppTextSummary(cart, getCartTotal()));
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.removeAttribute("aria-busy");
            btn.classList.remove("is-loading");
            btn.innerHTML = originalHTML;
        }
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
        id: product.id,
        name: product.name,
        color,
        qty,
        price: product.price,
        image: typeof getProductImageForColor === "function"
            ? getProductImageForColor(product, color)
            : product.image
    };

    try {
        await shareOrderCardToWhatsApp([item], product.price * qty);
    } catch (error) {
        console.error(error);
        openWhatsAppText(buildWhatsAppTextSummary([item], product.price * qty));
    }
}
