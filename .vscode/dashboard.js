const welcomeHeading = document.getElementById("welcomeHeading");
const welcomeRole = document.getElementById("welcomeRole");
const ordersTableBody = document.getElementById("ordersTableBody");
const ordersMessage = document.getElementById("ordersMessage");
const ordersCount = document.getElementById("ordersCount");
const logoutBtn = document.getElementById("logoutBtn");
const logoutBtnMobile = document.getElementById("logoutBtnMobile");

// Maps your schema's order statuses to the badge styles already
// defined in input.css. "cancelled" has no dedicated style yet,
// so it falls back to the pending (red) look until the team adds one.
const STATUS_STYLES = {
    pending: "status-pending",
    washing: "status-processing",
    drying: "status-processing",
    folding: "status-processing",
    ready: "status-ready",
    completed: "status-completed",
    cancelled: "status-pending",
};

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatCurrency(amount) {
    return "$" + Number(amount).toFixed(2);
}

function renderOrders(orders) {
    ordersTableBody.innerHTML = "";

    if (!orders || orders.length === 0) {
        ordersMessage.textContent = "No orders yet.";
        ordersCount.textContent = "";
        return;
    }

    ordersMessage.textContent = "";
    ordersCount.textContent = orders.length + " total";

    orders.forEach((order) => {
        const badgeClass = STATUS_STYLES[order.status] || "status-pending";

        const row = document.createElement("tr");
        row.className = "border-b border-slate-100";
        row.innerHTML = `
            <td class="py-3 pr-4 font-medium text-slate-700">#${order.id}</td>
            <td class="py-3 pr-4">${order.service_type ?? ""}</td>
            <td class="py-3 pr-4">${order.item_description ?? "-"}</td>
            <td class="py-3 pr-4">${formatCurrency(order.amount)}</td>
            <td class="py-3 pr-4"><span class="status ${badgeClass}">${order.status}</span></td>
            <td class="py-3 pr-4 text-slate-500">${formatDate(order.created_at)}</td>
        `;
        ordersTableBody.appendChild(row);
    });
}

async function initDashboard() {

    // Session guard: bounce back to login if nobody is signed in.
    const { session } = await getCurrentSession();

    if (!session) {
        window.location.href = "index.html";
        return;
    }

    // Load the logged-in user's profile (username, role, etc.)
    const { profile, error: profileError } = await getMyProfile();

    if (profileError || !profile) {
        welcomeHeading.textContent = "Welcome back!";
    } else {
        welcomeHeading.textContent = "Welcome back, " + (profile.full_name || profile.username || "");
        welcomeRole.textContent = "Logged in as " + profile.role;
    }

    // Load orders (RLS decides whether this is "my orders" or "all orders")
    ordersMessage.textContent = "Loading orders...";
    const { orders, error: ordersError } = await getLaundryOrders();

    if (ordersError) {
        ordersMessage.textContent = "Couldn't load orders: " + ordersError;
        return;
    }

    renderOrders(orders);
}

async function handleLogout() {
    await logout();
    window.location.href = "index.html";
}

logoutBtn.addEventListener("click", handleLogout);
logoutBtnMobile.addEventListener("click", handleLogout);

initDashboard();
