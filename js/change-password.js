const changePasswordForm = document.getElementById("changePasswordForm");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");

const newPasswordError = document.getElementById("newPasswordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const generalError = document.getElementById("generalError");

// Guard: if nobody is logged in, send them back to the login page.
// Runs as soon as this script loads.
(async function checkSession() {
    const { session } = await getCurrentSession();
    if (!session) {
        window.location.href = "index.html";
    }
})();

changePasswordForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    newPasswordError.textContent = "";
    confirmPasswordError.textContent = "";
    generalError.textContent = "";

    const pass1 = newPassword.value;
    const pass2 = confirmPassword.value;

    if (!pass1 || pass1.length < 6) {
        newPasswordError.textContent = "Password must be at least 6 characters.";
        newPassword.focus();
        return;
    }

    if (pass1 !== pass2) {
        confirmPasswordError.textContent = "Passwords do not match.";
        confirmPassword.focus();
        return;
    }

    changePasswordBtn.disabled = true;
    const originalText = changePasswordBtn.textContent;
    changePasswordBtn.textContent = "Saving...";

    // Step 1: update the actual login password in Supabase Auth.
    const { error: updateError } = await supabaseClient.auth.updateUser({
        password: pass1,
    });

    if (updateError) {
        changePasswordBtn.disabled = false;
        changePasswordBtn.textContent = originalText;
        generalError.textContent = updateError.message;
        return;
    }

    // Step 2: clear the must_change_password flag on their profile
    // so they aren't sent back here next time they log in.
    const { session } = await getCurrentSession();

    const { error: profileError } = await supabaseClient
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", session.user.id);

    changePasswordBtn.disabled = false;
    changePasswordBtn.textContent = originalText;

    if (profileError) {
        generalError.textContent = profileError.message;
        return;
    }

    window.location.href = "dashboard.html";

});
