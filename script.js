const $ = (element) => document.querySelector(element);
const script_base_url = "http://localhost:5000";

// ADD PROJECT/GOAL BUTTON
const svgBtn = $(".svg-btn");
const projectDropDown = $(".side-nav__item__dropdown");

// MODAL
const modal = $(".modal");
const trigger = $(".add-modal-btn");
const closeButton = $(".close-button");

function toggleModal() {
  modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);

// Listener for Project/Goal
svgBtn.addEventListener("click", showDropDown);

function showDropDown(e) {
  const elem = e.target;

  if (elem.parentElement.getAttribute("aria-expanded") == false) {
    elem.parentElement.setAttribute("aria-expanded", true);
    elem.classList.toggle("rotate");
  } else {
    elem.parentElement.setAttribute("aria-expanded", false);
    elem.classList.toggle("rotate");
  }
  // console.log(elem.parentElement.getAttribute("aria-expanded"));
  projectDropDown.classList.toggle("show-goal-dropdown");
}

// SELECT ALL PROJECT ITEMS
const projectItems = document.querySelectorAll(
  "ul.side-nav__item__dropdown li"
);

const showProjectTodos = (goal) => {
  const { todos, body, id: goalId, is_achieved, created_on } = goal;

  $("div.welcome-msg").style.display = "none";
  $("section.todos").style.display = "block";
  $("p.todos-intro__goal").textContent = body;
  $("p.todos-intro__goal").id = goalId;
  $("p.todos-intro__goal").setAttribute("is_achieved", is_achieved);
  $("p.todos-intro__goal").setAttribute("created_on", created_on);

  // Clear TodosList if available
  $("ul.todos-list").innerHTML = "";

  const todoListItem =
    todos.length !== 0
      ? todos.forEach((todo) => {
          /**
           * li = Parent List Element
           * textSpan = Text Container
           * moreOptions = Edit and Delete Options
           */
          const li = document.createElement("li");
          const checkbox = document.createElement("span");
          const textSpan = document.createElement("span");
          const moreOptions = document.createElement("span");
          const editIcon = document.createElement("img");
          const delIcon = document.createElement("img");

          li.id = todo.id;
          li.className = "todos-list__item";
          li.setAttribute("is_done", todo.is_done);
          li.setAttribute("created_on", todo.created_on);
          li.addEventListener("mouseover", showOptions);
          li.addEventListener("mouseout", hideOptions);

          checkbox.className = "todos-list__item__checkbox";
          textSpan.className = "todos-list__item__text";
          moreOptions.className = "todos-list__item__options";

          checkbox.innerHTML = `
            <label>
              <input id="c1" type="checkbox">
              <label for="c1"></label>
            </label>
          `;
          textSpan.textContent = todo.body;

          editIcon.src = "./assets/edit.svg";
          editIcon.alt = "edit button";
          editIcon.addEventListener("mouseover", (e) => showImgOptions(e));
          editIcon.addEventListener("click", (e) => editTodo(e));

          delIcon.src = "./assets/delete.svg";
          delIcon.alt = "delete button";
          delIcon.addEventListener("mouseover", (e) => showImgOptions(e));
          delIcon.addEventListener("click", (e) => deleteTodo());

          moreOptions.appendChild(editIcon);
          moreOptions.appendChild(delIcon);
          li.appendChild(checkbox);
          li.appendChild(textSpan);
          li.appendChild(moreOptions);

          $("ul.todos-list").appendChild(li);
        })
      : ($("ul.todos-list").innerHTML = `<p>No Todos for this Goal</p>`);
};

const editTodo = () => {
  console.log("Editing...");
};

const deleteTodo = () => {
  console.log("Deleting...");
};

const showImgOptions = (e) => {
  // console.log("Mouseovering...", e.target);
  e.target.parentElement.style.visibility = "visible";
};

const showOptions = (event) => {
  // console.log("Mouseovering...", event.target);
  const todoOptions = document.querySelectorAll(".todos-list__item__options");

  todoOptions.forEach((todo) => {
    if (event.target.childNodes[2] == todo) {
      todo.style.visibility = "visible";
    }
  });
};

const hideOptions = (event) => {
  // console.log("Mouseouting...", event.target);
  const todoOptions = document.querySelectorAll(
    "span.todos-list__item__options"
  );

  todoOptions.forEach((todo) => {
    if (event.target.childNodes[2] == todo) {
      todo.style.visibility = "hidden";
    }
  });
};

const getAllGoals = () => {
  const url = `${script_base_url}/api/v1/goals/`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  fetch(url, {
    headers: headers,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        displayGoals(data.data, "Success");
      } else if (data.status === "error") {
        console.log(data);
        displayMsg(data.message, "Error");
      }
    })
    .catch((err) => {
      console.log(err);
      displayMsg(err.message, "Error");
    });
};

const displayGoals = (goals) => {
  goals.forEach((eachGoal) => {
    const li = document.createElement("li");
    const iconSpan = document.createElement("span");
    const textSpan = document.createElement("span");

    li.id = `${eachGoal.id}`;
    li.setAttribute("is-achieved", eachGoal.is_achieved);
    li.setAttribute("created_on", eachGoal.created_on);
    li.addEventListener("click", (e) => {
      getProjectGoal(eachGoal.id);
    });

    iconSpan.innerHTML = `<img src="./assets/circle.svg" alt="check button" />`;
    textSpan.textContent = `${eachGoal.body}`;

    li.appendChild(iconSpan);
    li.appendChild(textSpan);
    const dropdownContainer = $("ul.side-nav__item__dropdown");
    dropdownContainer.appendChild(li);
  });
};

const displayMsg = (msg, type) => {
  const msgModal = $(".msgModal");
  const msgType = $(".msgType");
  const msgElement = $(".msg");
  const closeModal = $("button.close-button");

  msgElement.innerHTML = msg;
  msgType.innerHTML = type;
  // msgModal.addEventListener("click", toggleClose);
  msgModal.classList.toggle("show-modal");
  closeModal.addEventListener("click", toggleClose);
  window.addEventListener("click", windowOnClick);

  function windowOnClick(event) {
    if (event.target == $(".msgModal")) {
      toggleClose();
    }
  }

  function toggleClose() {
    msgModal.classList.remove("show-modal");
  }
};

const getProjectGoal = (goalId) => {
  console.log("Getting Project Goal...", goalId);

  const url = `${script_base_url}/api/v1/goals/${goalId}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  fetch(url, {
    headers: headers,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        // console.log(data.data[0].todos);
        showProjectTodos(data.data[0]);
      } else if (data.status === "error") {
        console.log(data);
        displayMsg(data.message, "Error");
      }
    })
    .catch((err) => {
      console.log(err);
      displayMsg(err.message, "Error");
    });
};

// window.addEventListener("DOMContentLoaded", getAllGoals);
if (AuthState.isAuthenticated) {
  getAllGoals();
}

// ADD LISTENER ON ADD PROJECT FORM
const addProjForm = $("form.add-project");
addProjForm.addEventListener("submit", (e) => addProject(e));

const addProject = async (event) => {
  event.preventDefault();

  const project = $("#goal-input").value;

  const url = `${script_base_url}/api/v1/goals/`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ body: project, is_achieved: false }),
    });
    const data = await response.json();

    console.log(data);

    if (data.status == "success") {
      toggleModal();
      displayMsg("Goal Successfully Posted", "Success");
      addProjForm.reset();
    } else {
      toggleModal();
      displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    toggleModal();
    displayMsg(error.message, "Error");
  }
};

// Click, MouseOver and Mouseout Event for Add Task Link
$(".todos-intro__btn").addEventListener("mouseover", (e) => handleMouseOver(e));
$(".todos-intro__btn").addEventListener("mouseout", (e) => handleMouseOut(e));
$(".todos-intro__btn").addEventListener("click", (e) => displayTodoForm(e));

const handleMouseOver = (event) => {
  const btn = $(".todos-intro__btn");
  const btnSpan = $(".todos-intro__btn span");
  if (event.target === btn) {
    btn.style.color = "#2cb978";
    btnSpan.style.background = "#2cb978";
    btnSpan.style.color = "var(--color-primary-light)";
    btnSpan.style.borderRadius = "50px";
  }
};

const handleMouseOut = (event) => {
  const btn = $(".todos-intro__btn");
  const btnSpan = $(".todos-intro__btn span");
  if (event.target === btn) {
    btn.style.color = "";
    btnSpan.style.background = "";
    btnSpan.style.color = "";
    btnSpan.style.borderRadius = "";
  }
};

const displayTodoForm = (event) => {
  $(".todos-intro__btn").style.display = "none";
  $("form.add-todo").style.display = "flex";
};

// Event for Closing Add Todo Form
$("form.add-todo .links").addEventListener("click", () => {
  $(".todos-intro__btn").style.display = "flex";
  $("form.add-todo").style.display = "none";
});

// Submit Event for Add Todo Form
$("form.add-todo").addEventListener("submit", (e) => handleTodoSubmit(e));

// Handles Insertion of New Todo in TodosList
const addNewTodoToUI = (newTodo) => {};

const handleTodoSubmit = async (event) => {
  event.preventDefault();

  const goalId = $("p.todos-intro__goal").id;

  const todoInput = document.getElementById("todo-input");

  // addNewTodoToUI(todoInput);

  const url = `${script_base_url}/api/v1/goals/${goalId}/todos/`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ body: todoInput.value, is_done: false }),
    });
    const data = await response.json();

    console.log(data);

    if (data.status == "success") {
      displayMsg("Todo Posted Successfully", "Success");
      $("form.add-todo").reset();
    } else {
      displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    displayMsg(error.message, "Error");
  }
};
