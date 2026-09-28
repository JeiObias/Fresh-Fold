// =========================
// Fresh Fold - Supabase Client
// =========================

const SUPABASE_URL =
    "https://ezrdhlxwjaibpwkajtxp.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_-6T-u3HUYJKEmATeJOUJVQ_e2EZmsfk";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// =========================
// AUTH: LOGIN
// =========================

async function loginWithUsername(username, password) {

    const { data: email, error: lookupError } =
        await supabaseClient.rpc(
            "get_login_email",
            {
                p_username: username
            }
        );

    if (lookupError || !email) {

        return {
            error: "Username not found or account inactive."
        };

    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {

        return {
            error: error.message
        };

    }

    return {
        data
    };

}


// =========================
// AUTH: SIGN UP
// =========================

async function signUpNewUser({
    fullName,
    username,
    email,
    password
}) {

    const { data, error } =
        await supabaseClient.auth.signUp({

            email,
            password,

            options: {

                data: {
                    username,
                    full_name: fullName,
                    must_change_password: false
                }

            }

        });

    if (error) {

        return {
            error: error.message
        };

    }

    return {
        data
    };

}


// =========================
// AUTH: LOGOUT
// =========================

async function logout() {

    const { error } =
        await supabaseClient.auth.signOut();

    return {
        error: error
            ? error.message
            : null
    };

}


// =========================
// AUTH: SESSION
// =========================

async function getCurrentSession() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    return {
        session: data?.session ?? null,
        error: error?.message ?? null
    };

}


// =========================
// PROFILE
// =========================

async function getMyProfile() {

    const { data, error } =
        await supabaseClient.rpc("my_profile");

    if (error) {

        return {
            error: error.message
        };

    }

    return {
        profile: data
    };

}


// =========================
// LAUNDRY ORDERS: LIST
// =========================

async function getLaundryOrders() {

    const { data, error } =
        await supabaseClient
            .from("laundry_orders")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        return {
            error: error.message
        };

    }

    return {
        orders: data
    };

}


// =========================
// LAUNDRY ORDERS: CREATE
// =========================

async function createLaundryOrder({

    customer_id,
    service_type,
    item_description,
    weight_kg,
    amount,
    notes,
    pickup_date,
    pickup_time,
    delivery_date,
    delivery_time,
    payment_method

}) {

    const { data, error } =
        await supabaseClient
            .from("laundry_orders")
            .insert([{

                customer_id,

                service_type,

                item_description,

                weight_kg,

                amount,

                notes,

                pickup_date,

                pickup_time,

                delivery_date,

                delivery_time,

                payment_method

            }])
            .select()
            .single();

    if (error) {

        return {
            error: error.message
        };

    }

    return {
        order: data
    };

}


// =========================
// UPDATE STATUS
// =========================

async function updateOrderStatus(
    orderId,
    newStatus
) {

    const { data, error } =
        await supabaseClient
            .from("laundry_orders")
            .update({
                status: newStatus
            })
            .eq("id", orderId)
            .select()
            .single();

    if (error) {

        return {
            error: error.message
        };

    }

    return {
        order: data
    };

}


// =========================
// DELETE ORDER
// =========================

async function deleteOrder(orderId) {

    const { error } =
        await supabaseClient
            .from("laundry_orders")
            .delete()
            .eq("id", orderId);

    if (error) {

        return {
            error: error.message
        };

    }

    return {
        success: true
    };

}