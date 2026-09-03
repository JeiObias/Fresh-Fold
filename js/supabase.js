// =========================
// Fresh Fold - Supabase Client
// =========================
// This file sets up the Supabase connection and exposes helper
// functions that index.html and dashboard.html can call.
//
// IMPORTANT: Only the anon (public) key belongs here. Never put the
// service_role key in this file or any browser-loaded code.

// Load the Supabase JS library from CDN in your HTML BEFORE this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = "https://ezrdhlxwjaibpwkajtxp.supabase.co"; // bare project URL only - no /rest/v1
const SUPABASE_ANON_KEY = "sb_publishable_-6T-u3HUYJKEmATeJOUJVQ_e2EZmsfk";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// AUTH: LOGIN BY USERNAME
// =========================
// Your schema stores usernames separately from Supabase Auth (which
// only knows emails). So login is a two-step process:
//   1. Look up the email tied to this username via the get_login_email RPC
//   2. Sign in with that email + the password the user typed
async function loginWithUsername(username, password) {
  const { data: email, error: lookupError } = await supabaseClient.rpc(
    "get_login_email",
    { p_username: username }
  );

  if (lookupError || !email) {
    return { error: "Username not found or account inactive." };
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

// =========================
// AUTH: SIGN UP
// =========================
// Self-service registration. Safe to call from the browser with the
// anon key - Supabase's signUp() does not require the service_role key.
// The username/full_name get passed as user metadata, which your
// handle_new_user trigger reads to create the matching profiles row.
async function signUpNewUser({ fullName, username, email, password }) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        must_change_password: false, // they just chose their own password
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

// =========================
// AUTH: LOGOUT
// =========================
async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  return { error: error ? error.message : null };
}

// =========================
// AUTH: GET CURRENT SESSION
// =========================
async function getCurrentSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  return { session: data?.session ?? null, error: error?.message ?? null };
}

// =========================
// PROFILE: GET MY PROFILE
// =========================
// Uses the my_profile() function from the schema, which returns
// role, must_change_password, username, etc. for the logged-in user.
async function getMyProfile() {
  const { data, error } = await supabaseClient.rpc("my_profile");
  if (error) {
    return { error: error.message };
  }
  return { profile: data };
}

// =========================
// LAUNDRY ORDERS: LIST
// =========================
// RLS already restricts results: customers see only their own orders,
// staff/admin/superadmin see everything.
async function getLaundryOrders() {
  const { data, error } = await supabaseClient
    .from("laundry_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }
  return { orders: data };
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
}) {
  const { data, error } = await supabaseClient
    .from("laundry_orders")
    .insert([
      {
        customer_id,
        service_type,
        item_description,
        weight_kg,
        amount,
        notes,
      },
    ])
    .select();

  if (error) {
    return { error: error.message };
  }
  return { order: data?.[0] };
}

// =========================
// LAUNDRY ORDERS: UPDATE STATUS
// =========================
// Staff/admin/superadmin only - enforced by RLS policy.
async function updateOrderStatus(orderId, newStatus) {
  const { data, error } = await supabaseClient
    .from("laundry_orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .select();

  if (error) {
    return { error: error.message };
  }
  return { order: data?.[0] };
}

// =========================
// LAUNDRY ORDERS: DELETE
// =========================
// Admin/superadmin only - enforced by RLS policy.
async function deleteOrder(orderId) {
  const { error } = await supabaseClient
    .from("laundry_orders")
    .delete()
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
