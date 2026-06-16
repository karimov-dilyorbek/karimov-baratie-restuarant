import { menuData } from "./data.js";

const params = new URLSearchParams(window.location.search);
const category = params.get("category");
const items = menuData[category];

const heroSection = document.getElementById("heroSection");
const menuSection = document.getElementById("menuSection");
const menuTitle = document.getElementById("menuTitle");
const grid = document.getElementById("cardsGrid");
const search = document.getElementById("searchInput");
const filter = document.getElementById("countryFilter");
const empty = document.getElementById("emptyState");

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

const orders = JSON.parse(localStorage.getItem("orders")) || [];

function formatPrice(price) {
  return price.toLocaleString("uz-UZ") + " so'm";
}

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

function getOrder(id) {
  return orders.find((o) => o.id === id);
}

function addOrder(item) {
  const existing = getOrder(item.id);

  if (existing) {
    existing.quantity++;
  } else {
    orders.push({
      ...item,
      quantity: 1,
    });
  }
  saveOrders();
  renderSidebar();
  refreshCards();
}

function removeOrder(id) {
  const existing = getOrder(id);

  if (!existing) return;

  if (existing.quantity > 1) {
    existing.quantity--;
  } else {
    const index = orders.findIndex((o) => o.id === id);

    if (index !== -1) {
      orders.splice(index, 1);
    }
  }
  saveOrders();
  renderSidebar();
  refreshCards();
}

function renderSidebar() {
  const ordersList = document.getElementById("ordersList");
  const totalPrice = document.getElementById("totalPrice");

  ordersList.innerHTML = "";

  if (orders.length === 0) {
    ordersList.innerHTML = `
    <p class="text-center text-white/50 mt-10">
      No orders yet
    </p>
  `;
  }

  orders.forEach((order) => {
    const div = document.createElement("div");

    div.className = "flex justify-between items-center border-b border-white/10 pb-3";

    div.innerHTML = `
        <div>
          <h4 class="font-semibold">${order.name}</h4>
          <p class="text-orange-400 text-sm">
            ${formatPrice(order.price)}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button class="minus-btn text-xl">-</button>
          <span>${order.quantity}</span>
          <button class="plus-btn text-xl">+</button>
        </div>
      `;

    div.querySelector(".plus-btn").addEventListener("click", () => {
      addOrder(order);
    });

    div.querySelector(".minus-btn").addEventListener("click", () => {
      removeOrder(order.id);
    });

    ordersList.appendChild(div);
  });

  const total = orders.reduce((sum, order) => sum + order.price * order.quantity, 0);

  totalPrice.textContent = formatPrice(total);
}

function renderCards(list) {
  grid.innerHTML = "";

  if (list.length === 0) {
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.forEach((item) => {
    const template = document.getElementById("cardTemplate");
    const clone = template.content.cloneNode(true);

    const card = clone.querySelector(".card");

    const orderBtn = clone.querySelector(".card-order-btn");
    const counter = clone.querySelector(".card-counter");

    const qty = clone.querySelector(".card-qty");
    const minus = clone.querySelector(".card-minus");
    const plus = clone.querySelector(".card-plus");
    const image = clone.querySelector(".card-img");

    card.dataset.id = item.id;

    image.src = item.image;
    image.alt = item.name;
    image.loading = "lazy";

    clone.querySelector(".card-name").textContent = item.name;
    clone.querySelector(".card-desc").textContent = item.description;

    clone.querySelector(".card-national").textContent = "🌍 " + item.national;

    clone.querySelector(".card-price").textContent = formatPrice(item.price);

    const status = clone.querySelector(".card-status");

    status.textContent = item.available ? "✓ Available" : "✕ Sold out";

    status.classList.add(
      item.available ? "bg-green-500/15" : "bg-red-500/15",

      item.available ? "text-green-400" : "text-red-400",
    );

    const existing = getOrder(item.id);

    if (existing) {
      orderBtn.classList.add("hidden");
      counter.classList.remove("hidden");
      qty.textContent = existing.quantity;
    } else {
      orderBtn.classList.remove("hidden");
      counter.classList.add("hidden");
    }

    if (!item.available) {
      orderBtn.disabled = true;
      orderBtn.classList.add("opacity-50", "cursor-not-allowed");
    }

    orderBtn.addEventListener("click", () => {
      addOrder(item);
    });

    plus.addEventListener("click", () => {
      addOrder(item);
    });

    minus.addEventListener("click", () => {
      removeOrder(item.id);
    });

    grid.appendChild(clone);
  });
}

function refreshCards() {
  const q = search?.value?.trim().toLowerCase() || "";
  const country = filter?.value || "all";

  const filtered = items.filter(
    (item) => item.name.toLowerCase().includes(q) && (country === "all" || item.national === country),
  );

  renderCards(filtered);
}

function applyFilters() {
  refreshCards();
}

if (category) {
  heroSection.classList.add("hidden");
  menuSection.classList.remove("hidden");

  menuTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);

  const countries = [...new Set(items.map((i) => i.national))].sort();

  countries.forEach((country) => {
    const option = document.createElement("option");

    option.value = country;
    option.textContent = country;

    filter.appendChild(option);
  });

  search.addEventListener("input", applyFilters);

  filter.addEventListener("change", applyFilters);

  renderCards(items);
} else {
  heroSection.classList.remove("hidden");
  menuSection.classList.add("hidden");
}

function openSidebar() {
  sidebar.classList.remove("translate-x-full");
  overlay.classList.remove("hidden");
}

function closeSidebar() {
  sidebar.classList.add("translate-x-full");
  overlay.classList.add("hidden");
}

openBtn.addEventListener("click", openSidebar);

closeBtn.addEventListener("click", closeSidebar);

overlay.addEventListener("click", closeSidebar);

const header = document.getElementById("header");

if (category) {
  header.classList.add("bg-black/40", "backdrop-blur-md", "border-b", "border-white/10");
}

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

document.querySelectorAll("#mobileMenu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
  });
});

renderSidebar();
