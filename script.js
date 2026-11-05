
// =====================================
// STADIUMMATE - COMPLETE FRONTEND
// =====================================

// QR SCANNER
const scanBtn = document.getElementById("scanBtn");
const qrSection = document.getElementById("qr-section");
const scanResult = document.getElementById("scan-result");
const closeScanner = document.getElementById("closeScanner");

let html5QrCode = null;
let currentSeat = "Not assigned";

scanBtn.addEventListener("click", async () => {
    qrSection.style.display = "block";
    scanResult.textContent = "Starting camera...";

    if (typeof Html5Qrcode === "undefined") {
        scanResult.textContent = "QR library could not load.";
        return;
    }

    try {
        html5QrCode = new Html5Qrcode("reader");

        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            async (decodedText) => {
                scanResult.textContent = "Seat QR detected!";

                const parts = decodedText.split("|");

                if (parts.length >= 5 && parts[0] === "STADIUMMATE") {
                    currentSeat = `${parts[1]} - ${parts[2]} - ${parts[3]} - ${parts[4]}`;
                } else {
                    currentSeat = decodedText;
                }

                scanResult.textContent = "Your seat: " + currentSeat;

                if (html5QrCode) {
                    await html5QrCode.stop();
                    html5QrCode.clear();
                    html5QrCode = null;
                }
            }
        );

        scanResult.textContent = "Point camera at your seat QR code.";
    } catch (error) {
        scanResult.textContent = "Camera error. Check permissions.";
        console.error(error);
    }
});

closeScanner.addEventListener("click", async () => {
    if (html5QrCode) {
        try {
            await html5QrCode.stop();
            html5QrCode.clear();
        } catch (error) {
            console.error(error);
        }
        html5QrCode = null;
    }

    qrSection.style.display = "none";
    scanResult.textContent = "";
});


// PRODUCT CATALOGUE

const products = {
    food: [
        { name: "Classic Burger", price: 149, emoji: "🍔" },
        { name: "Cheese Pizza", price: 199, emoji: "🍕" },
        { name: "French Fries", price: 99, emoji: "🍟" },
        { name: "Veg Sandwich", price: 129, emoji: "🥪" },
        { name: "Popcorn", price: 79, emoji: "🍿" },
        { name: "Hot Dog", price: 159, emoji: "🌭" }
    ],

    beverages: [
        { name: "Mineral Water", price: 30, emoji: "💧" },
        { name: "Cold Coffee", price: 99, emoji: "☕" },
        { name: "Fresh Lemonade", price: 69, emoji: "🍋" },
        { name: "Orange Juice", price: 89, emoji: "🧃" },
        { name: "Cola", price: 60, emoji: "🥤" },
        { name: "Energy Drink", price: 120, emoji: "⚡" }
    ],

    merchandise: [
        { name: "Team Jersey", price: 899, emoji: "👕" },
        { name: "Team Cap", price: 399, emoji: "🧢" },
        { name: "Team Scarf", price: 299, emoji: "🧣" },
        { name: "Fan Wristband", price: 149, emoji: "🎽" },
        { name: "Team Flag", price: 249, emoji: "🚩" },
        { name: "Sports Mug", price: 349, emoji: "🏆" }
    ]
};


// CART AND ORDERS

let cart = [];
let orders = [];

const categories = document.getElementById("categories");
const productSection = document.getElementById("product-section");
const productHeading = document.getElementById("product-heading");
const productList = document.getElementById("product-list");

// Create cart and order tracking sections
productSection.insertAdjacentHTML(
    "beforeend",
    `
    <div id="cart-area" style="margin-top:35px;"></div>
    `
);

document.body.insertAdjacentHTML(
    "beforeend",
    `
    <section id="orders-section" class="categories"
        style="display:none;">
        <h2>📦 My Orders</h2>
        <div id="orders-list"></div>
        <button onclick="closeOrders()">Back to Home</button>
    </section>
    `
);


// OPEN PRODUCT CATEGORIES

function openCategory(category) {
    const selectedProducts = products[category];

    if (!selectedProducts) return;

    categories.style.display = "none";
    document.getElementById("orders-section").style.display = "none";
    productSection.style.display = "block";

    const titles = {
        food: "🍔 Food & Snacks",
        beverages: "🥤 Beverages",
        merchandise: "👕 Team Merchandise"
    };

    productHeading.textContent = titles[category];
    productList.innerHTML = "";

    selectedProducts.forEach((product, index) => {
        productList.innerHTML += `
            <div class="category-card">
                <h3>${product.emoji} ${product.name}</h3>
                <p>Price: ₹${product.price}</p>
                <button onclick="addToCart('${category}', ${index})">
                    Add to Cart
                </button>
            </div>
        `;
    });

    renderCart();
    productSection.scrollIntoView({ behavior: "smooth" });
}


// ADD TO CART

function addToCart(category, index) {
    const product = products[category][index];

    const existing = cart.find(
        item => item.name === product.name
    );

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            category,
            quantity: 1
        });
    }

    renderCart();
}


// DISPLAY CART

function renderCart() {
    const cartArea = document.getElementById("cart-area");

    let total = 0;

    let html = `
        <h2>🛒 Your Shopping Cart</h2>
    `;

    if (cart.length === 0) {
        html += "<p>Your cart is empty.</p>";
    }

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        html += `
            <div class="category-card" style="margin-top:12px;">
                <h3>${item.emoji} ${item.name}</h3>
                <p>₹${item.price} × ${item.quantity}</p>
                <button onclick="changeQuantity(${index}, -1)">−</button>
                <button onclick="changeQuantity(${index}, 1)">+</button>
                <button onclick="removeFromCart(${index})">
                    Remove
                </button>
            </div>
        `;
    });

    html += `
        <h3 style="margin-top:20px;">Total: ₹${total}</h3>
        <p>Delivery seat: ${currentSeat}</p>
        <button onclick="checkout()">Place Order</button>
    `;

    cartArea.innerHTML = html;
}


// CHANGE QUANTITY

function changeQuantity(index, amount) {
    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    renderCart();
}


// REMOVE PRODUCT

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}


// CHECKOUT

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    if (currentSeat === "Not assigned") {
        alert("Please scan your seat QR code before placing an order.");
        return;
    }

    const orderTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const newOrder = {
        id: "SM" + Date.now().toString().slice(-6),
        items: cart.map(item => ({ ...item })),
        total: orderTotal,
        seat: currentSeat,
        status: "Order Placed",
        date: new Date().toLocaleString()
    };

    orders.push(newOrder);
    cart = [];

    alert("Your order has been placed successfully!");

    showOrders();
}


// ORDER TRACKING

function showOrders() {
    categories.style.display = "none";
    productSection.style.display = "none";
    document.getElementById("orders-section").style.display = "block";

    const ordersList = document.getElementById("orders-list");

    if (orders.length === 0) {
        ordersList.innerHTML = "<p>You have no orders yet.</p>";
    } else {
        ordersList.innerHTML = orders.map(order => `
            <div class="category-card" style="margin-bottom:18px;">
                <h3>Order #${order.id}</h3>
                <p><strong>Seat:</strong> ${order.seat}</p>
                <p><strong>Items:</strong></p>
                ${order.items.map(item =>
                    `<p>${item.emoji} ${item.name} × ${item.quantity}</p>`
                ).join("")}
                <h3>Total: ₹${order.total}</h3>
                <p><strong>Status:</strong> ${order.status}</p>
                <p>${order.date}</p>
                <button onclick="advanceOrder('${order.id}')">
                    Simulate Next Delivery Stage
                </button>
            </div>
        `).join("");
    }

    document.getElementById("orders-section")
        .scrollIntoView({ behavior: "smooth" });
}


// SIMULATE DELIVERY PROGRESS

function advanceOrder(orderId) {
    const order = orders.find(item => item.id === orderId);

    if (!order) return;

    const stages = [
        "Order Placed",
        "Accepted by Vendor",
        "Preparing Your Order",
        "Ready for Pickup",
        "Out for Delivery",
        "Delivered to Your Seat"
    ];

    const currentIndex = stages.indexOf(order.status);

    if (currentIndex < stages.length - 1) {
        order.status = stages[currentIndex + 1];
    }

    showOrders();
}


// BACK BUTTONS

function closeCategory() {
    productSection.style.display = "none";
    categories.style.display = "block";
}

function openOrders() {
    showOrders();
}

function closeOrders() {
    document.getElementById("orders-section").style.display = "none";
    categories.style.display = "block";
    categories.scrollIntoView({ behavior: "smooth" });
}
