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

// const base_url = "http://localhost:5000";
const base_url = "https://goaltracker.herokuapp.com";

// Access Forms
const signInForm = $$(".sign-in form");
const signUpForm = $$(".sign-up form");

// Error Placeholders
const signInAuthDialog = $$("div.signin-auth-error");
const signupAuthDialog = $$("div.signup-auth-error");

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
      console.log("Sign Out Active");
      signOut();
    }
  });
});

const showSignInForm = () => {
  const signInForm = $$(".sign-in");
  const signUpForm = $$(".sign-up");
  const dashBoard = $$("section.content");
  dashBoard.style.display = "none";
  $("section.user-forms").style.display = "flex";

  signUpForm.style.display = "none";
  signInForm.style.display = "block";
};

const showSignUpForm = () => {
  const signInForm = $$(".sign-in");
  const signUpForm = $$(".sign-up");
  const dashBoard = $$("section.content");
  dashBoard.style.display = "none";
  $("section.user-forms").style.display = "flex";
  signInForm.style.display = "none";
  signUpForm.style.display = "block";
};

const signOut = () => {
  localStorage.removeItem("FBIdToken");
  AuthState = {
    isAuthenticated: false,
    credentials: {},
  };
  console.log(AuthState);
  window.location.href = "/";
  routeToSignInPage();
};

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

const showAuthDialog = (element, message) => {
  element.style.display = "block";
  element.innerHTML = message;
};

const hideAuthDialog = (element) => {
  element.style.display = "none";
  element.innerHTML = "";
};

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

    if (data.status == "success") {
      setAuthState(data);
      loading("hide");
      signInForm.reset();
    } else if (data.status == "error") {
      loading("hide");
      showAuthDialog(signInAuthDialog, data.error);
      setTimeout(() => {
        hideAuthDialog(signInAuthDialog);
      }, 3000);
      // displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    loading("hide");
    displayMsg(error.message, "Error");
  }
};

// const handleAuthError = (errMasg, type) => {
//   if (type === 'Error') {

//   }
// }

function routeToDashboard() {
  // debugger;
  // window.location.href = "/";
  // HIDE ALL FORMS THEN DISPLAY DASHBOARD
  $$("section.user-forms").style.display = "none";
  $$("section.content").style.display = "block";

  $$("section.content").style.display = "flex";

  // Fetch All User Goals
  // getAllGoals();
  // setTimeout(() => {
  //   getAllGoals();
  // }, 3000);
}

function routeToSignInPage() {
  // HIDE DASHBOARD THEN DISPLAY SIGNIN PAGE
  $$("section.content").style.display = "none";
  $$("section.user-forms").style.display = "flex";
}

const setAuthState = (userDetails) => {
  AuthState.isAuthenticated = true;
  AuthState.credentials = userDetails.data;

  const { token } = userDetails.data;

  const FBIdToken = `Bearer ${token}`;
  localStorage.setItem("FBIdToken", FBIdToken);
  window.location.href = "/";
  // routeToDashboard();
};

const handleSignUp = async (event) => {
  event.preventDefault();

  // SHOW LOADING SPINNER
  loading("show");

  const firstname = $$("#signup-firstname").value,
    lastname = $$("#signup-lastname").value,
    username = $$("#signup-username").value,
    email = $$("#signup-email").value,
    password = $$("#signup-password").value;

  const url = `${base_url}/api/v1/users/create`;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ firstname, lastname, username, email, password }),
    });
    const data = await response.json();

    if (data.status === "success") {
      console.log(data);
      setAuthState(data);
      loading("hide");
      signUpForm.reset();
    } else if (data.status === "error") {
      loading("hide");
      showAuthDialog(signupAuthDialog, data.error);
      setTimeout(() => {
        hideAuthDialog(signupAuthDialog);
      }, 3000); // displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    loading("hide");
    displayMsg(error.message, "Error");
  }
};

// export const auth = new Auth();
