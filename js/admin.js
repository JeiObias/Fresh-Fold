/* =====================================================
   SESSION + ROLE GUARD
   Only staff/admin/superadmin may see this page.
====================================================== */

let currentProfile = null;
let allOrders = [];
let allProfiles = [];

async function guardAndLoad() {

    const { session } = await getCurrentSession();

    if (!session) {
        window.location.href = "index.html";
        return;
    }

    const { profile, error } = await getMyProfile();

    if (error || !profile) {
        window.location.href = "index.html";
        return;
    }

    if (!["staff", "admin", "superadmin"].includes(profile.role)) {
        // Logged in, but not staff/admin/superadmin - send them to
        // the regular customer dashboard instead.
        window.location.href = "dashboard.html";
        return;
    }

    currentProfile = profile;

    await loadAllData();

}

async function loadAllData() {

    const [ordersResult, profilesResult] = await Promise.all([
        getLaundryOrders(),
        getAllProfiles(),
    ]);

    allOrders = ordersResult.orders || [];
    allProfiles = profilesResult.profiles || [];

    updateDashboard();
    renderOrders();
    renderRecentOrders();
    renderCustomers();
    renderPayments();

}

/* =====================================================
   NAME LOOKUP
   laundry_orders only stores customer_id (a UUID) - this maps
   that to a display name using the profiles we already loaded.
====================================================== */

function getCustomerName(customerId) {
    const match = allProfiles.find(p => p.id === customerId);
    if (!match) return "Unknown Customer";
    return match.full_name || match.username || "Unknown Customer";
}

/* =====================================================
   FORMAT MONEY
====================================================== */

function formatMoney(amount) {
    return `₱${Number(amount || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/* =====================================================
   STATUS BADGE
   Maps your schema's statuses (pending/washing/drying/folding/
   ready/completed/cancelled) to the badge styles already defined
   in admin.html's <style> block.
====================================================== */

function getStatusBadge(status) {

    const styleMap = {
        pending: "status-pending",
        washing: "status-washing",
        drying: "status-washing",
        folding: "status-washing",
        ready: "status-ready",
        completed: "status-completed",
        cancelled: "status-cancelled",
    };

    const className = styleMap[status] || "status-pending";
    const label = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Pending";

    return `<span class="status-badge ${className}">${label}</span>`;

}

/* =====================================================
   DASHBOARD OVERVIEW
====================================================== */

function updateDashboard() {

    const customerCount = allProfiles.filter(p => p.role === "customer").length;

    const pendingOrders = allOrders.filter(o => o.status === "pending").length;
    const completedOrders = allOrders.filter(o => o.status === "completed").length;

    const revenue = allOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

    const paid = allOrders.filter(o => o.payment_status === "paid").length;
    const pendingPayments = allOrders.filter(o => o.payment_status !== "paid").length;

    document.getElementById("totalCustomers").textContent = customerCount;
    document.getElementById("totalOrders").textContent = allOrders.length;
    document.getElementById("pendingOrders").textContent = pendingOrders;
    document.getElementById("completedOrders").textContent = completedOrders;
    document.getElementById("totalRevenue").textContent = formatMoney(revenue);

    document.getElementById("paidOrders").textContent = paid;
    document.getElementById("pendingPayments").textContent = pendingPayments;

    document.getElementById("reportTotalOrders").textContent = allOrders.length;
    document.getElementById("reportPendingOrders").textContent = pendingOrders;
    document.getElementById("reportCompletedOrders").textContent = completedOrders;

    calculateSales();

}

/* =====================================================
   SALES REPORT
====================================================== */

function calculateSales() {

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const dailySales = allOrders
        .filter(o => o.created_at && o.created_at.split("T")[0] === today)
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    const monthlySales = allOrders
        .filter(o => {
            if (!o.created_at) return false;
            const date = new Date(o.created_at);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            return month === currentMonth;
        })
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    document.getElementById("dailySales").textContent = formatMoney(dailySales);
    document.getElementById("monthlySales").textContent = formatMoney(monthlySales);

}

/* =====================================================
   ORDER MANAGEMENT
====================================================== */

function renderOrders() {

    const table = document.getElementById("ordersTableBody");
    const empty = document.getElementById("ordersEmpty");

    table.innerHTML = "";

    if (allOrders.length === 0) {
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    allOrders.forEach(order => {

        const row = document.createElement("tr");

        const quantity = order.weight_kg ?? "-";

        row.innerHTML = `
            <td class="px-5 py-4 font-semibold text-blue-600">#${order.id}</td>
            <td class="px-5 py-4">${getCustomerName(order.customer_id)}</td>
            <td class="px-5 py-4">${order.service_type || "-"}</td>
            <td class="px-5 py-4">${quantity} kg</td>
            <td class="px-5 py-4 font-semibold">${formatMoney(order.amount)}</td>
            <td class="px-5 py-4">
                <select
                    class="status-select text-xs border border-slate-200 rounded-lg px-2 py-1"
                    data-order-id="${order.id}">
                    ${["pending", "washing", "drying", "folding", "ready", "completed", "cancelled"]
                        .map(s => `<option value="${s}" ${s === order.status ? "selected" : ""}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`)
                        .join("")}
                </select>
            </td>
        `;

        table.appendChild(row);

    });

    // Wire up status dropdowns to actually update Supabase.
    table.querySelectorAll(".status-select").forEach(select => {
        select.addEventListener("change", async (e) => {
            const orderId = e.target.dataset.orderId;
            const newStatus = e.target.value;
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.error) {
                alert("Couldn't update status: " + result.error);
                return;
            }
            await loadAllData();
        });
    });

}

/* =====================================================
   RECENT ORDERS
====================================================== */

function renderRecentOrders() {

    const table = document.getElementById("recentOrdersBody");
    const empty = document.getElementById("recentOrdersEmpty");

    table.innerHTML = "";

    const recent = [...allOrders].slice(0, 5);

    if (recent.length === 0) {
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    recent.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-5 py-4 font-semibold text-blue-600">#${order.id}</td>
            <td class="px-5 py-4">${getCustomerName(order.customer_id)}</td>
            <td class="px-5 py-4">${order.service_type || "-"}</td>
            <td class="px-5 py-4 font-semibold">${formatMoney(order.amount)}</td>
            <td class="px-5 py-4">${getStatusBadge(order.status)}</td>
        `;
        table.appendChild(row);
    });

}

/* =====================================================
   CUSTOMERS
====================================================== */

function renderCustomers() {

    const table = document.getElementById("customersTableBody");
    const empty = document.getElementById("customersEmpty");

    table.innerHTML = "";

    const customers = allProfiles.filter(p => p.role === "customer");

    if (customers.length === 0) {
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    customers.forEach(customer => {

        const customerOrders = allOrders.filter(o => o.customer_id === customer.id);
        const total = customerOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-5 py-4 font-semibold text-slate-700">${customer.full_name || customer.username}</td>
            <td class="px-5 py-4 text-sm text-slate-500">${customer.email}</td>
            <td class="px-5 py-4">${customerOrders.length}</td>
            <td class="px-5 py-4 font-semibold">${formatMoney(total)}</td>
        `;
        table.appendChild(row);

    });

}

/* =====================================================
   PAYMENTS
====================================================== */

function renderPayments() {

    const table = document.getElementById("paymentsTableBody");
    table.innerHTML = "";

    allOrders.forEach(order => {

        const isPaid = order.payment_status === "paid";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-5 py-4 font-semibold text-blue-600">#${order.id}</td>
            <td class="px-5 py-4">${getCustomerName(order.customer_id)}</td>
            <td class="px-5 py-4 font-semibold">${formatMoney(order.amount)}</td>
            <td class="px-5 py-4">
                <button
                    class="payment-toggle status-badge ${isPaid ? "status-completed" : "status-pending"}"
                    data-order-id="${order.id}"
                    data-currently-paid="${isPaid}">
                    ${isPaid ? "Paid" : "Pending"}
                </button>
            </td>
        `;
        table.appendChild(row);

    });

    // Clicking the badge toggles paid/pending directly in Supabase.
    table.querySelectorAll(".payment-toggle").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const orderId = e.target.dataset.orderId;
            const currentlyPaid = e.target.dataset.currentlyPaid === "true";
            const result = await updateOrderPayment(orderId, {
                paymentStatus: currentlyPaid ? "pending" : "paid",
            });
            if (result.error) {
                alert("Couldn't update payment: " + result.error);
                return;
            }
            await loadAllData();
        });
    });

}

/* =====================================================
   QUICK ACTIONS
====================================================== */

async function addOrder() {

    const customers = allProfiles.filter(p => p.role === "customer");

    if (customers.length === 0) {
        alert("No customers yet - have someone sign up first.");
        return;
    }

    const customerList = customers
        .map((c, i) => `${i + 1}. ${c.full_name || c.username}`)
        .join("\n");

    const choice = prompt(`Pick a customer by number:\n${customerList}`);
    const index = Number(choice) - 1;

    if (!customers[index]) {
        return;
    }

    const serviceType = prompt("Service type (e.g. Wash & Fold):");
    if (!serviceType) return;

    const weight = prompt("Weight in kg (or leave blank):");
    const amount = prompt("Amount (₱):");
    if (!amount) return;

    const result = await createLaundryOrder({
        customer_id: customers[index].id,
        service_type: serviceType,
        weight_kg: weight ? Number(weight) : null,
        amount: Number(amount),
    });

    if (result.error) {
        alert("Couldn't create order: " + result.error);
        return;
    }

    await loadAllData();

}

function addCustomer() {
    window.open("signup.html", "_blank");
}

function updatePrices() {
    alert("Price management needs a prices table in the database, which hasn't been built yet. The prices shown below are still static placeholders.");
}

/* =====================================================
   LOGOUT
====================================================== */

document.getElementById("logoutBtn").addEventListener("click", async function () {

    const confirmLogout = confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    await logout();
    window.location.href = "index.html";

});

/* =====================================================
   INITIALIZE
====================================================== */

guardAndLoad();
