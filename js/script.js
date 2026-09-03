const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

const username = document.getElementById("username");
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");

const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");

// SHOW / HIDE PASSWORD

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");

    } else {

        password.type = "password";

        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");

    }

});

// LOGIN

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    // Clear previous errors
    usernameError.textContent = "";
    passwordError.textContent = "";

    const user = username.value.trim();
    const pass = password.value;

    // USERNAME VALIDATION

    if (!user) {

        usernameError.textContent = "Please enter your username.";

        username.focus();

        return;

    }

    // PASSWORD VALIDATION

    if (!pass) {

        passwordError.textContent = "Please enter your password.";

        password.focus();

        return;

    }

    // Disable the button while we talk to Supabase so the user
    // can't double-submit.
    loginBtn.disabled = true;
    const originalText = loginBtn.textContent;
    loginBtn.textContent = "Logging in...";

    const result = await loginWithUsername(user, pass);

    loginBtn.disabled = false;
    loginBtn.textContent = originalText;

    if (result.error) {
        passwordError.textContent = "Invalid username or password.";
        return;
    }

    // Check if this account needs to set a new password before
    // going any further (must_change_password flag from profiles table).
    const profileResult = await getMyProfile();

    if (profileResult.profile && profileResult.profile.must_change_password) {
        window.location.href = "change-password.html";
        return;
    }

    window.location.href = "dashboard.html";

});
