// =========================================================
// Fresh Fold - User Dashboard JavaScript
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const welcomeHeading =
        document.getElementById("welcomeHeading");

    const welcomeRole =
        document.getElementById("welcomeRole");

    const profileUsername =
        document.getElementById("profileUsername");

    const dropdownUsername =
        document.getElementById("dropdownUsername");

    const userUsername =
        document.getElementById("userUsername");

    const userEmail =
        document.getElementById("userEmail");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const ordersTableBody =
        document.getElementById("ordersTableBody");

    const ordersMessage =
        document.getElementById("ordersMessage");

    const ordersCount =
        document.getElementById("ordersCount");

    const laundryOrderForm =
        document.getElementById("laundryOrderForm");

    const serviceType =
        document.getElementById("serviceType");

    const itemDescription =
        document.getElementById("itemDescription");

    const weightKg =
        document.getElementById("weightKg");

    const orderAmount =
        document.getElementById("orderAmount");

    const pickupDate =
        document.getElementById("pickupDate");

    const pickupTime =
        document.getElementById("pickupTime");

    const deliveryDate =
        document.getElementById("deliveryDate");

    const deliveryTime =
        document.getElementById("deliveryTime");

    const paymentMethod =
        document.getElementById("paymentMethod");

    const orderNotes =
        document.getElementById("orderNotes");

    const orderFormMessage =
        document.getElementById("orderFormMessage");

    const createOrderBtn =
        document.getElementById("createOrderBtn");

    const weightLabel =
        document.getElementById("weightLabel");


    // =====================================================
    // SERVICE PRICES
    // =====================================================

    const SERVICE_PRICES = {
        "Wash & Fold": 50,
        "Wash & Dry": 60,
        "Dry Cleaning": 150,
        "Ironing": 30
    };


    // =====================================================
    // CURRENT SESSION
    // =====================================================

    let currentSession = null;


    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    function formatCurrency(amount) {

        const value = Number(amount);

        if (Number.isNaN(value)) {
            return "₱0.00";
        }

        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        }).format(value);

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(dateValue) {

        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

    }


    // =====================================================
    // FORMAT TIME
    // =====================================================

    function formatTime(timeValue) {

        if (!timeValue) {
            return "—";
        }

        const parts =
            String(timeValue).split(":");

        if (parts.length < 2) {
            return timeValue;
        }

        let hour =
            parseInt(parts[0], 10);

        const minute =
            parts[1];

        if (Number.isNaN(hour)) {
            return timeValue;
        }

        const period =
            hour >= 12 ? "PM" : "AM";

        hour =
            hour % 12 || 12;

        return `${hour}:${minute} ${period}`;

    }


    // =====================================================
    // FORMAT PICKUP / DELIVERY
    // =====================================================

    function formatSchedule(date, time) {

        if (!date && !time) {
            return "—";
        }

        if (date && time) {

            return `
                <div class="leading-tight">
                    <div>${formatDate(date)}</div>
                    <div class="text-xs text-slate-400 mt-1">
                        ${formatTime(time)}
                    </div>
                </div>
            `;

        }

        if (date) {
            return formatDate(date);
        }

        return formatTime(time);

    }


    // =====================================================
    // STATUS BADGE
    // =====================================================

    function getStatusBadge(status) {

        const normalizedStatus =
            String(status || "Pending")
                .toLowerCase()
                .trim();


        if (normalizedStatus === "completed") {

            return `
                <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    <i class="fa-solid fa-circle-check"></i>
                    Completed
                </span>
            `;

        }


        if (normalizedStatus === "processing") {

            return `
                <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    <i class="fa-solid fa-spinner"></i>
                    Processing
                </span>
            `;

        }


        if (normalizedStatus === "ready") {

            return `
                <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    <i class="fa-solid fa-box"></i>
                    Ready
                </span>
            `;

        }


        if (
            normalizedStatus === "cancelled" ||
            normalizedStatus === "canceled"
        ) {

            return `
                <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    <i class="fa-solid fa-circle-xmark"></i>
                    Cancelled
                </span>
            `;

        }


        return `
            <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                <i class="fa-solid fa-clock"></i>
                Pending
            </span>
        `;

    }


    // =====================================================
    // DISPLAY MESSAGE
    // =====================================================

    function showFormMessage(message, type = "error") {

        if (!orderFormMessage) {
            return;
        }

        orderFormMessage.classList.remove(
            "hidden",
            "bg-red-50",
            "text-red-700",
            "border-red-200",
            "bg-emerald-50",
            "text-emerald-700",
            "border-emerald-200"
        );


        orderFormMessage.classList.add(
            "border"
        );


        if (type === "success") {

            orderFormMessage.classList.add(
                "bg-emerald-50",
                "text-emerald-700",
                "border-emerald-200"
            );

        } else {

            orderFormMessage.classList.add(
                "bg-red-50",
                "text-red-700",
                "border-red-200"
            );

        }


        orderFormMessage.textContent =
            message;

    }


    // =====================================================
    // HIDE MESSAGE
    // =====================================================

    function hideFormMessage() {

        if (!orderFormMessage) {
            return;
        }

        orderFormMessage.classList.add(
            "hidden"
        );

        orderFormMessage.textContent = "";

    }


    // =====================================================
    // DISPLAY USER PROFILE
    // =====================================================

    function displayUserProfile(
        profile,
        session
    ) {

        const metadata =
            session?.user?.user_metadata || {};


        let username =
            profile?.username ||
            metadata.username ||
            session?.user?.email?.split("@")[0] ||
            "User";


        const email =
            session?.user?.email ||
            profile?.email ||
            "No email";


        if (profileUsername) {
            profileUsername.textContent =
                username;
        }


        if (dropdownUsername) {
            dropdownUsername.textContent =
                username;
        }


        if (userUsername) {
            userUsername.textContent =
                username;
        }


        if (userEmail) {
            userEmail.textContent =
                email;
        }


        if (welcomeHeading) {

            welcomeHeading.innerHTML = `
                Welcome,
                <span class="text-cyan-300">
                    ${escapeHtml(username)}
                </span>
            `;

        }


        if (welcomeRole) {

            welcomeRole.textContent =
                "Manage your laundry orders and enjoy convenient Fresh Fold services.";

        }

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;

    }


    // =====================================================
    // RENDER ORDERS
    // =====================================================

    function renderOrders(orders) {

        if (!ordersTableBody) {
            return;
        }


        if (!Array.isArray(orders) || orders.length === 0) {

            ordersTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="px-5 py-12 text-center text-slate-400"
                    >
                        <div class="flex flex-col items-center">
                            <i class="fa-solid fa-box-open text-3xl mb-3 text-slate-300"></i>

                            <p class="font-medium">
                                No laundry orders yet.
                            </p>

                            <p class="text-xs mt-1">
                                Create your first laundry order above.
                            </p>
                        </div>
                    </td>
                </tr>
            `;


            if (ordersCount) {
                ordersCount.textContent = "0";
            }

            return;

        }


        if (ordersCount) {
            ordersCount.textContent =
                orders.length;
        }


        ordersTableBody.innerHTML =
            orders.map(order => {

                const orderId =
                    order.id ?? "—";

                const service =
                    order.service_type ?? "—";

                const item =
                    order.item_description ?? "—";

                const amount =
                    formatCurrency(order.amount);

                const pickup =
                    formatSchedule(
                        order.pickup_date,
                        order.pickup_time
                    );

                const delivery =
                    formatSchedule(
                        order.delivery_date,
                        order.delivery_time
                    );

                const payment =
                    order.payment_method ?? "—";

                const status =
                    getStatusBadge(order.status);


                return `
                    <tr class="order-row">

                        <td class="px-5 py-4">
                            <span class="font-semibold text-slate-700">
                                #${escapeHtml(orderId)}
                            </span>
                        </td>


                        <td class="px-5 py-4">
                            <span class="font-medium text-slate-800">
                                ${escapeHtml(service)}
                            </span>
                        </td>


                        <td class="px-5 py-4">
                            <span class="text-slate-600">
                                ${escapeHtml(item)}
                            </span>
                        </td>


                        <td class="px-5 py-4">
                            <span class="font-bold text-cyan-600">
                                ${amount}
                            </span>
                        </td>


                        <td class="px-5 py-4 text-sm text-slate-600">
                            ${pickup}
                        </td>


                        <td class="px-5 py-4 text-sm text-slate-600">
                            ${delivery}
                        </td>


                        <td class="px-5 py-4">
                            <span class="text-sm font-medium text-slate-700">
                                ${escapeHtml(payment)}
                            </span>
                        </td>


                        <td class="px-5 py-4">
                            ${status}
                        </td>

                    </tr>
                `;

            }).join("");

    }


    // =====================================================
    // LOAD ORDERS
    // =====================================================

    async function loadOrders() {

        if (!ordersTableBody) {
            return;
        }


        ordersTableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="px-5 py-10 text-center text-slate-400"
                >
                    <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                    Loading orders...
                </td>
            </tr>
        `;


        if (ordersMessage) {
            ordersMessage.textContent = "";
        }


        const result =
            await getLaundryOrders();


        if (result?.error) {

            ordersTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="px-5 py-10 text-center"
                    >
                        <div class="text-red-500">
                            <i class="fa-solid fa-circle-exclamation text-2xl mb-2"></i>

                            <p class="font-semibold">
                                Unable to load orders
                            </p>

                            <p class="text-xs mt-1 text-slate-500">
                                ${escapeHtml(result.error)}
                            </p>
                        </div>
                    </td>
                </tr>
            `;


            if (ordersCount) {
                ordersCount.textContent = "0";
            }

            return;

        }


        renderOrders(
            result?.orders || []
        );

    }


    // =====================================================
    // CALCULATE ORDER AMOUNT
    // =====================================================

    function calculateAmount() {

        if (
            !serviceType ||
            !weightKg ||
            !orderAmount
        ) {
            return;
        }


        const service =
            serviceType.value;

        const quantity =
            parseFloat(weightKg.value) || 0;

        const price =
            SERVICE_PRICES[service] || 0;

        const amount =
            quantity * price;


        orderAmount.value =
            amount > 0
                ? amount.toFixed(2)
                : "";


        if (weightLabel) {

            if (
                service === "Dry Cleaning" ||
                service === "Ironing"
            ) {

                weightLabel.textContent =
                    "Quantity / Number of Items";

                weightKg.step = "1";

                weightKg.min = "1";

            } else {

                weightLabel.textContent =
                    "Weight (kg)";

                weightKg.step = "0.1";

                weightKg.min = "0.1";

            }

        }

    }


    // =====================================================
    // SET MINIMUM DATES
    // =====================================================

    function setMinimumDates() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(now.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(now.getDate())
                .padStart(2, "0");


        const today =
            `${year}-${month}-${day}`;


        if (pickupDate) {
            pickupDate.min = today;
        }


        if (deliveryDate) {
            deliveryDate.min = today;
        }


        if (pickupDate && deliveryDate) {

            pickupDate.addEventListener(
                "change",
                () => {

                    if (
                        pickupDate.value
                    ) {

                        deliveryDate.min =
                            pickupDate.value;

                        if (
                            deliveryDate.value &&
                            deliveryDate.value <
                            pickupDate.value
                        ) {

                            deliveryDate.value =
                                pickupDate.value;

                        }

                    } else {

                        deliveryDate.min =
                            today;

                    }

                }
            );

        }

    }


    // =====================================================
    // CREATE LAUNDRY ORDER
    // =====================================================

    async function handleCreateOrder(event) {

        event.preventDefault();


        if (!currentSession?.user?.id) {

            showFormMessage(
                "Your session has expired. Please log in again.",
                "error"
            );

            return;

        }


        if (!laundryOrderForm) {
            return;
        }


        const service =
            serviceType?.value?.trim();

        const item =
            itemDescription?.value?.trim();

        const quantity =
            parseFloat(weightKg?.value);

        const amount =
            parseFloat(orderAmount?.value);

        const pickupDateValue =
            pickupDate?.value;

        const pickupTimeValue =
            pickupTime?.value;

        const deliveryDateValue =
            deliveryDate?.value;

        const deliveryTimeValue =
            deliveryTime?.value;

        const paymentValue =
            paymentMethod?.value;

        const notesValue =
            orderNotes?.value?.trim() || null;


        // =================================================
        // VALIDATION
        // =================================================

        if (!service) {

            showFormMessage(
                "Please select a laundry service.",
                "error"
            );

            return;

        }


        if (!item) {

            showFormMessage(
                "Please enter the item description.",
                "error"
            );

            return;

        }


        if (
            Number.isNaN(quantity) ||
            quantity <= 0
        ) {

            showFormMessage(
                "Please enter a valid weight or quantity.",
                "error"
            );

            return;

        }


        if (
            Number.isNaN(amount) ||
            amount <= 0
        ) {

            showFormMessage(
                "Please select a service and enter the weight or quantity.",
                "error"
            );

            return;

        }


        if (!pickupDateValue) {

            showFormMessage(
                "Please select a pick-up date.",
                "error"
            );

            return;

        }


        if (!pickupTimeValue) {

            showFormMessage(
                "Please select a pick-up time.",
                "error"
            );

            return;

        }


        if (!deliveryDateValue) {

            showFormMessage(
                "Please select a delivery date.",
                "error"
            );

            return;

        }


        if (!deliveryTimeValue) {

            showFormMessage(
                "Please select a delivery time.",
                "error"
            );

            return;

        }


        if (
            deliveryDateValue <
            pickupDateValue
        ) {

            showFormMessage(
                "Delivery date cannot be earlier than the pick-up date.",
                "error"
            );

            return;

        }


        if (!paymentValue) {

            showFormMessage(
                "Please select a payment method.",
                "error"
            );

            return;

        }


        // =================================================
        // BUTTON LOADING
        // =================================================

        if (createOrderBtn) {

            createOrderBtn.disabled = true;

            createOrderBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creating Order...
            `;

        }


        hideFormMessage();


        try {

            const result =
                await createLaundryOrder({

                    customer_id:
                        currentSession.user.id,

                    service_type:
                        service,

                    item_description:
                        item,

                    weight_kg:
                        quantity,

                    amount:
                        amount,

                    notes:
                        notesValue,

                    pickup_date:
                        pickupDateValue,

                    pickup_time:
                        pickupTimeValue,

                    delivery_date:
                        deliveryDateValue,

                    delivery_time:
                        deliveryTimeValue,

                    payment_method:
                        paymentValue

                });


            if (result?.error) {

                showFormMessage(
                    result.error,
                    "error"
                );

                return;

            }


            showFormMessage(
                "Laundry order created successfully!",
                "success"
            );


            laundryOrderForm.reset();


            if (orderAmount) {
                orderAmount.value = "";
            }


            if (weightLabel) {

                weightLabel.textContent =
                    "Weight / Quantity";

            }


            // Reload orders
            await loadOrders();


            // Automatically go to order history
            setTimeout(() => {

                const ordersSection =
                    document.getElementById("orders");

                if (ordersSection) {

                    ordersSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }, 300);


        } catch (error) {

            console.error(
                "Create order error:",
                error
            );


            showFormMessage(
                error?.message ||
                "Something went wrong while creating the order.",
                "error"
            );

        } finally {

            if (createOrderBtn) {

                createOrderBtn.disabled = false;

                createOrderBtn.innerHTML = `
                    <i class="fa-solid fa-plus"></i>
                    Create Order
                `;

            }

        }

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    async function handleLogout() {

        if (!logoutBtn) {
            return;
        }


        const originalText =
            logoutBtn.innerHTML;


        logoutBtn.disabled = true;

        logoutBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Logging out...
        `;


        try {

            const result =
                await logout();


            if (result?.error) {

                console.error(
                    "Logout error:",
                    result.error
                );


                alert(
                    "Unable to logout: " +
                    result.error
                );


                logoutBtn.disabled = false;

                logoutBtn.innerHTML =
                    originalText;

                return;

            }


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Something went wrong while logging out."
            );


            logoutBtn.disabled = false;

            logoutBtn.innerHTML =
                originalText;

        }

    }


    // =====================================================
    // AUTHENTICATION + DASHBOARD INITIALIZATION
    // =====================================================

    async function initDashboard() {

        try {

            // ---------------------------------------------
            // CHECK SESSION
            // ---------------------------------------------

            const sessionResult =
                await getCurrentSession();


            if (
                sessionResult?.error ||
                !sessionResult?.session
            ) {

                window.location.href =
                    "index.html";

                return;

            }


            currentSession =
                sessionResult.session;


            // ---------------------------------------------
            // LOAD PROFILE
            // ---------------------------------------------

            const profileResult =
                await getMyProfile();


            if (profileResult?.error) {

                console.warn(
                    "Profile loading error:",
                    profileResult.error
                );

                // We can still display data
                // using Auth metadata.

                displayUserProfile(
                    null,
                    currentSession
                );

            } else {

                displayUserProfile(
                    profileResult.profile,
                    currentSession
                );

            }


            // ---------------------------------------------
            // LOAD ORDERS
            // ---------------------------------------------

            await loadOrders();

        } catch (error) {

            console.error(
                "Dashboard initialization error:",
                error
            );


            if (ordersMessage) {

                ordersMessage.textContent =
                    "Unable to initialize dashboard.";

            }

        }

    }


    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    if (serviceType) {

        serviceType.addEventListener(
            "change",
            calculateAmount
        );

    }


    if (weightKg) {

        weightKg.addEventListener(
            "input",
            calculateAmount
        );

    }


    if (laundryOrderForm) {

        laundryOrderForm.addEventListener(
            "submit",
            handleCreateOrder
        );

    }


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            handleLogout
        );

    }


    // =====================================================
    // START DASHBOARD
    // =====================================================

    setMinimumDates();

    calculateAmount();

    initDashboard();

});