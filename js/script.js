const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

const username = document.getElementById("username");
const loginForm = document.getElementById("loginForm");

const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");

// SHOW / HIDE PASSWORd

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

// LOGIN VALIDATION

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    // Clear previous errors
    usernameError.textContent = "";
    passwordError.textContent = "";

    const user = username.value.trim();
    const pass = password.value;

    // USERNAME VALIDATIOn

    if (!user) {

        usernameError.textContent = "Please enter your username.";

        username.focus();

        return;

    }

    // PASSWORD VALIDATion

    if (!pass) {

        passwordError.textContent = "Please enter your password.";

        password.focus();

        return;

    }

    // ADMIN ACCOUNt

    if (user === "Admin" && pass === "Admin123") {

        alert("Admin Login Successful!");

        window.location.href = "dashboard.html";

        return;

    }

    // CLIENT ACCOUNT

    if (user === "Client" && pass === "Client123") {

        alert("Client Login Successful!");

        window.location.href = "dashboard.html";

        return;

    }

    // INVALID ACCOUNT

    passwordError.textContent = "Invalid username or password.";

});