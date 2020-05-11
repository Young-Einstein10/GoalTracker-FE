const $$ = (element) => document.querySelector(element);

let AuthState = {
  isAuthenticated: false,
  credentials: {},
};

const checkAuthState = () => {
  localStorage.getItem("FBIdToken");

  if (localStorage.getItem("FBIdToken") !== null) {
    var token = localStorage.getItem("FBIdToken");
    token = token.split(" ")[1];
    AuthState = {
      isAuthenticated: true,
      credentials: {
        token,
      },
    };
    routeToDashboard();
  } else if (localStorage.getItem("FBIdToken" == null)) {
    return AuthState;
  }
};

checkAuthState();

console.log(AuthState);

const base_url = "http://localhost:5000";

// Access auth elements to listen for auth actions
const authAction = document.querySelectorAll(".auth");

// Loop through elements and use the associated auth attribute to determine what action to take when clicked
authAction.forEach((eachItem) => {
  eachItem.addEventListener("click", (event) => {
    let chosen = event.target.getAttribute("auth");
    if (chosen === "sign-up") {
      showSignUpForm();
    } else if (chosen === "sign-in") {
      showSignInForm();
    } else if (chosen === "forgot-password") {
      showForgotPasswordForm();
    } else if (chosen === `sign-out`) {
      signOut();
    }
  });
});

const showSignInForm = () => {
  const signInForm = $$(".sign-in");
  const signUpForm = $$(".sign-up");
  signUpForm.style.display = "none";
  signInForm.style.display = "block";
};

const showSignUpForm = () => {
  const signInForm = $$(".sign-in");
  const signUpForm = $$(".sign-up");
  signUpForm.style.display = "block";
  signInForm.style.display = "none";
};

const signOut = () => {};

// Function to hide and show the loading visual cue
const loading = (action) => {
  if (action === "show") {
    document.getElementById("loading-outer-container").style.display = "block";
  } else if (action === "hide") {
    document.getElementById("loading-outer-container").style.display = "none";
  } else {
    console.log("loading error");
  }
};

// Access Forms
const signInForm = $$(".sign-in form");
const signUpForm = $$(".sign-up form");

signInForm.addEventListener("submit", (e) => handleSignIn(e));
signUpForm.addEventListener("submit", (e) => handleSignUp(e));

const handleSignIn = async (event) => {
  event.preventDefault();

  // SHOW LOADING SPINNER
  loading("show");

  const email = $$("#signin-email").value;
  const password = $$("#signin-password").value;

  const url = `${base_url}/api/v1/users/signin`;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    setAuthState(data);
    loading("hide");
  } catch (error) {
    console.log(error);
  }
};

const setAuthState = (userDetails) => {
  AuthState.isAuthenticated = true;
  AuthState.credentials = userDetails.data;

  const { token } = userDetails.data;

  const FBIdToken = `Bearer ${token}`;
  localStorage.setItem("FBIdToken", FBIdToken);

  routeToDashboard();
};

function routeToDashboard() {
  // HIDE ALL FORMS THEN DISPLAY DASHBOARD
  $$("section.user-forms").style.display = "none";
  $$("section.content").style.display = "block";

  $$("section.content").style.display = "flex";
}

const handleSignUp = async () => {};

// export const auth = new Auth();