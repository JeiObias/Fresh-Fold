const signupForm = document.getElementById("signupForm");
const fullName = document.getElementById("fullName");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const signupBtn = document.getElementById("signupBtn");

const fullNameError = document.getElementById("fullNameError");
const usernameError = document.getElementById("usernameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const generalError = document.getElementById("generalError");
const generalSuccess = document.getElementById("generalSuccess");

function clearErrors() {
    fullNameError.textContent = "";
    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    generalError.textContent = "";
    generalSuccess.textContent = "";
}

signupForm.addEventListener("submit", async function (e) {

    e.preventDefault();
    clearErrors();

    const nameVal = fullName.value.trim();
    const userVal = username.value.trim();
    const emailVal = email.value.trim();
    const passVal = password.value;
    const confirmVal = confirmPassword.value;

    let hasError = false;

    if (!nameVal) {
        fullNameError.textContent = "Please enter your full name.";
        hasError = true;
    }

    if (!userVal) {
        usernameError.textContent = "Please choose a username.";
        hasError = true;
    } else if (userVal.length < 3) {
        usernameError.textContent = "Username must be at least 3 characters.";
        hasError = true;
    }

    if (!emailVal) {
        emailError.textContent = "Please enter your email.";
        hasError = true;
    }

    if (!passVal || passVal.length < 6) {
        passwordError.textContent = "Password must be at least 6 characters.";
        hasError = true;
    }

    if (confirmVal !== passVal) {
        confirmPasswordError.textContent = "Passwords do not match.";
        hasError = true;
    }

    if (hasError) {
        return;
    }

    signupBtn.disabled = true;
    const originalText = signupBtn.textContent;
    signupBtn.textContent = "Creating account...";

    try {

        const result = await signUpNewUser({
            fullName: nameVal,
            username: userVal,
            email: emailVal,
            password: passVal,
        });

        if (result.error) {
            generalError.textContent = result.error;
            return;
        }

        // If your Supabase project has "Confirm email" turned on
        // (default), there's no active session yet - the user needs
        // to click the link in their inbox first.
        if (result.data && !result.data.session) {
            generalSuccess.textContent = "Account created! Check your email to confirm before logging in.";
            signupForm.reset();
            return;
        }

        // Email confirmation is off, so they're already signed in.
        window.location.href = "dashboard.html";

    } catch (err) {

        console.error("Signup failed:", err);
        generalError.textContent = "Something went wrong: " + err.message;

    } finally {

        signupBtn.disabled = false;
        signupBtn.textContent = originalText;

    }

});
