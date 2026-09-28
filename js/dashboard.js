// =====================================================
// FRESH FOLD - DASHBOARD
// =====================================================

// =====================================================
// ELEMENTS
// =====================================================

const welcomeHeading = document.getElementById("welcomeHeading");
const welcomeRole = document.getElementById("welcomeRole");

const ordersTableBody = document.getElementById("ordersTableBody");
const ordersMessage = document.getElementById("ordersMessage");
const ordersCount = document.getElementById("ordersCount");

const logoutBtn = document.getElementById("logoutBtn");


// =====================================================
// PROFILE ELEMENTS
// =====================================================

const profileUsername = document.getElementById("profileUsername");
const dropdownUsername = document.getElementById("dropdownUsername");
const userUsername = document.getElementById("userUsername");
const userEmail = document.getElementById("userEmail");


// =====================================================
// ORDER STATUS STYLES
// =====================================================

const STATUS_STYLES = {

    pending: "status-pending",

    washing: "status-processing",

    drying: "status-processing",

    folding: "status-processing",

    ready: "status-ready",

    completed: "status-completed",

    cancelled: "status-pending",

};


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(isoString) {

    if (!isoString) {
        return "";
    }

    const date = new Date(isoString);

    return date.toLocaleDateString(undefined, {

        year: "numeric",

        month: "short",

        day: "numeric",

    });

}


// =====================================================
// FORMAT CURRENCY
// =====================================================

function formatCurrency(amount) {

    return "₱" + Number(amount || 0).toFixed(2);

}


// =====================================================
// RENDER ORDERS
// =====================================================

function renderOrders(orders) {

    if (!ordersTableBody) {
        return;
    }

    ordersTableBody.innerHTML = "";


    // No orders

    if (!orders || orders.length === 0) {

        if (ordersMessage) {
            ordersMessage.textContent = "No orders yet.";
        }

        if (ordersCount) {
            ordersCount.textContent = "";
        }

        return;

    }


    // Orders found

    if (ordersMessage) {
        ordersMessage.textContent = "";
    }

    if (ordersCount) {
        ordersCount.textContent = orders.length + " total";
    }


    orders.forEach((order) => {

        const badgeClass =
            STATUS_STYLES[order.status] || "status-pending";


        const row = document.createElement("tr");

        row.className =
            "border-b border-slate-100";


        row.innerHTML = `

            <td class="py-3 pr-4 font-medium text-slate-700">

                #${order.id}

            </td>


            <td class="py-3 pr-4">

                ${order.service_type ?? ""}

            </td>


            <td class="py-3 pr-4">

                ${order.item_description ?? "-"}

            </td>


            <td class="py-3 pr-4">

                ${formatCurrency(order.amount)}

            </td>


            <td class="py-3 pr-4">

                <span class="status ${badgeClass}">

                    ${order.status ?? ""}

                </span>

            </td>


            <td class="py-3 pr-4 text-slate-500">

                ${formatDate(order.created_at)}

            </td>

        `;


        ordersTableBody.appendChild(row);

    });

}


// =====================================================
// DISPLAY USER PROFILE
// =====================================================

function displayUserProfile(profile, session) {

    /*
        Username priority:

        1. profile.username
        2. session.user.user_metadata.username
        3. email username
    */

    let username = "";

    if (profile && profile.username) {

        username = profile.username;

    } else if (
        session &&
        session.user &&
        session.user.user_metadata &&
        session.user.user_metadata.username
    ) {

        username =
            session.user.user_metadata.username;

    } else if (
        session &&
        session.user &&
        session.user.email
    ) {

        username =
            session.user.email.split("@")[0];

    } else {

        username = "User";

    }


    // Get email from Supabase Auth

    let email = "";

    if (
        session &&
        session.user &&
        session.user.email
    ) {

        email = session.user.email;

    }


    // =================================================
    // TOP PROFILE
    // =================================================

    if (profileUsername) {

        profileUsername.textContent =
            username;

    }


    // =================================================
    // DROPDOWN USERNAME
    // =================================================

    if (dropdownUsername) {

        dropdownUsername.textContent =
            username;

    }


    // =================================================
    // USERNAME INFORMATION
    // =================================================

    if (userUsername) {

        userUsername.textContent =
            username;

    }


    // =================================================
    // EMAIL
    // =================================================

    if (userEmail) {

        userEmail.textContent =
            email || "No email available";

    }

}


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

async function initDashboard() {

    try {

        // =================================================
        // CHECK CURRENT LOGIN SESSION
        // =================================================

        const {
            session,
            error: sessionError
        } = await getCurrentSession();


        if (sessionError) {

            console.error(
                "Session error:",
                sessionError
            );

        }


        // =================================================
        // NO LOGIN SESSION
        // =================================================

        if (!session) {

            window.location.href = "index.html";

            return;

        }


        // =================================================
        // GET USER PROFILE
        // =================================================

        const {
            profile,
            error: profileError
        } = await getMyProfile();


        // =================================================
        // DISPLAY PROFILE
        // =================================================

        displayUserProfile(
            profile,
            session
        );


        // =================================================
        // WELCOME MESSAGE
        // =================================================

        if (profileError || !profile) {

            if (welcomeHeading) {

                welcomeHeading.textContent =
                    "Welcome back!";

            }

            if (welcomeRole) {

                welcomeRole.textContent =
                    "";

            }

        } else {

            const displayName =
                profile.full_name ||
                profile.username ||
                "User";


            if (welcomeHeading) {

                welcomeHeading.textContent =
                    "Welcome back, " +
                    displayName;

            }


            if (welcomeRole) {

                welcomeRole.textContent =
                    "Logged in as " +
                    (profile.role || "customer");

            }

        }


        // =================================================
        // LOAD ORDERS
        // =================================================

        if (ordersMessage) {

            ordersMessage.textContent =
                "Loading orders...";

        }


        const {
            orders,
            error: ordersError
        } = await getLaundryOrders();


        if (ordersError) {

            if (ordersMessage) {

                ordersMessage.textContent =
                    "Couldn't load orders: " +
                    ordersError;

            }

            console.error(
                "Orders error:",
                ordersError
            );

            return;

        }


        renderOrders(orders);


    } catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

async function handleLogout() {

    try {

        // Change button text while logging out

        if (logoutBtn) {

            logoutBtn.disabled = true;

            logoutBtn.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Logging out...

            `;

        }


        // Call Supabase logout

        const result = await logout();


        // Check logout error

        if (result && result.error) {

            console.error(
                "Logout error:",
                result.error
            );


            // Restore button

            if (logoutBtn) {

                logoutBtn.disabled = false;

                logoutBtn.innerHTML = `

                    <i class="fa-solid fa-right-from-bracket"></i>

                    Logout

                `;

            }

            alert(
                "Logout failed: " +
                result.error
            );

            return;

        }


        // =================================================
        // SUCCESSFUL LOGOUT
        // =================================================

        window.location.replace("index.html");


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        if (logoutBtn) {

            logoutBtn.disabled = false;

            logoutBtn.innerHTML = `

                <i class="fa-solid fa-right-from-bracket"></i>

                Logout

            `;

        }

    }

}


// =====================================================
// LOGOUT BUTTON EVENT
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        handleLogout
    );

}


// =====================================================
// START DASHBOARD
// =====================================================

initDashboard();