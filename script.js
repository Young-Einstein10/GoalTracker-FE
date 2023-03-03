const $ = (element) => document.querySelector(element);
const script_base_url = "http://localhost:5000";
// const script_base_url = "https://goaltracker.herokuapp.com";

// ADD PROJECT/GOAL BUTTON
const projects = $("li.project-list");
const dropDownIcon = $("button.svg-btn svg");
const projectDropDown = $("ul.side-nav__item__dropdown");
const addGoalBtn = $(".add-goal-btn");

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

// Listeners for showing Add Project Form
trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
addGoalBtn.addEventListener("click", () => {
  closeMenu();
  toggleModal();
});
window.addEventListener("click", windowOnClick);

// Listener for Project/Goal
dropDownIcon.addEventListener("click", showDropDown);

function showDropDown(e) {
  // const elem = e.target;

  // if (elem.parentElement.getAttribute("aria-expanded") == false) {
  //   elem.parentElement.setAttribute("aria-expanded", true);
  //   elem.classList.toggle("rotate");
  // } else {
  //   elem.parentElement.setAttribute("aria-expanded", false);
  //   elem.classList.toggle("rotate");
  // }
  // console.log(elem.parentElement.getAttribute("aria-expanded"));
  dropDownIcon.classList.toggle("rotate");
  projectDropDown.classList.toggle("show-goal-dropdown");
}

// SELECT ALL PROJECT ITEMS
const projectItems = document.querySelectorAll(
  "ul.side-nav__item__dropdown li"
);

// Listeners for Closing Edit Project Form
const closeEditButton = $(".close-edit-button");
closeEditButton.addEventListener("click", () => {
  const modal = $(".edit-modal");
  modal.classList.toggle("show-modal");
});

window.addEventListener("click", (event) => {
  const modal = $(".edit-modal");

  if (event.target === modal) {
    modal.classList.toggle("show-modal");
  }
});

// Handles Form Submission for Goal Update
$("form.edit-project").addEventListener("submit", (e) => {
  console.log(e.target.id);
  let goalId = e.target.id;

  editGoal(e, goalId);
});

// Handle Editing of Goal
const handleEditGoal = (event) => {
  // Get ID of Goal to Edit
  const goalId = event.target.parentElement.parentElement.id;
  // Get Text Content Of Parent Elemnt
  const text =
    event.target.parentElement.parentElement.firstElementChild.textContent;

  // Set ID of Edit Form to ID of Current Goal
  $("form.edit-project").id = goalId;

  // Set Form Input Value To Current Goal
  const formInput = document.getElementById("edit-goal-input");
  formInput.value = text;

  // Display Modal With Edit Form
  $(".edit-modal").classList.toggle("show-modal");
};

const editGoal = async (e, goalId) => {
  e.preventDefault();

  console.log("editing...");

  // Get Form Input Value
  const formInput = document.getElementById("edit-goal-input");

  // Get Current Goal
  const currGoal = document.getElementById(goalId);

  // Get Status of Current Goal Whether its been achieved or not
  let is_achieved = currGoal.getAttribute("is_achieved");
  // Convert is_achieved to Boolean
  is_achieved = JSON.parse(is_achieved);

  const url = `${script_base_url}/api/v1/goals/${goalId}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ body: formInput.value, is_achieved }),
    });

    const data = await response.json();
    console.log(data);
    if (data.status == "success") {
      const { id, body, is_achieved } = data.data[0];

      // Set Text Context of Current Goal to Body
      currGoal.querySelector("span.text").textContent = body;

      currGoal.setAttribute("is_achieved", is_achieved);

      // Close Modal
      $(".edit-modal").classList.toggle("show-modal");
    } else if (data.status == "error") {
      displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    displayMsg(error.message, "Error");
  }
};

// Handle Deletion of Goal
const handleDeleteGoal = async (event) => {
  // console.log(event.target.parentElement.parentElement.id);
  console.log("Deleting");

  // Get ID of Goal to Delete
  const goalId = event.target.parentElement.parentElement.id;

  // Functon Handling Removal of Goal From UI
  const removeGoalFromUI = () => {
    const currGoal = document.getElementById(goalId);

    // Remove Current Gooal From UI
    currGoal.innerHTML = "";
    // Remove All ToDos under Current Goal
    $("ul.todos-list").innerHTML = "";
    // Hide Add Task Button Within List Container
    $("p.todos-intro__btn").style.display = "none";

    const allGoals = document.querySelectorAll(".project-list__item");

    allGoals.forEach((goal) => {
      if (goal.dataset.name == goalId) {
        console.log(goal);
        goal.remove();
      }
    });
  };

  const url = `${script_base_url}/api/v1/goals/${goalId}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: headers,
    });

    const data = await response.json();

    if (data.status == "success") {
      removeGoalFromUI();
      displayMsg(data.message, "Success");
    } else if (data.status == "error") {
      displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    displayMsg(error.message, "Error");
  }
};

const linkToHome = $(".link-to-homepage");
linkToHome.addEventListener("click", showHomepage);

function showHomepage() {
  $("div.welcome-msg").style.display = "block";
  $("section.todos").style.display = "none";
  closeMenu();
}

function closeHomepage() {
  $("div.welcome-msg").style.display = "none";
  $("section.todos").style.display = "block";
}

const showProjectTodos = (goal) => {
  const { todos, body, id: goalId, is_achieved, created_on } = goal;

  // Project Header
  closeHomepage();
  $("p.todos-intro__goal").innerHTML = `
    <span class="text">${body}</span>
    <span class="todos-intro__goal__options">
      <svg class="edit-goal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" data-svgs-path="sm1/edit.svg" class="form_action_icon">
        <g fill="none" fill-rule="evenodd">
          <path fill="currentColor" d="M9.5 19h10a.5.5 0 1 1 0 1h-10a.5.5 0 1 1 0-1z"></path>
          <path stroke="currentColor"
            d="M4.42 16.03a1.5 1.5 0 0 0-.43.9l-.22 2.02a.5.5 0 0 0 .55.55l2.02-.21a1.5 1.5 0 0 0 .9-.44L18.7 7.4a1.5 1.5 0 0 0 0-2.12l-.7-.7a1.5 1.5 0 0 0-2.13 0L4.42 16.02z">
          </path>
        </g>
      </svg>
      <svg class="delete-goal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" data-svgs-path="sm1/trash.svg">
        <g fill="none" fill-rule="evenodd">
          <path d="M0 0h24v24H0z"></path>
          <rect width="14" height="1" x="5" y="6" fill="currentColor" rx=".5"></rect>
          <path fill="currentColor" d="M10 9h1v8h-1V9zm3 0h1v8h-1V9z"></path>
          <path stroke="currentColor" d="M17.5 6.5h-11V18A1.5 1.5 0 0 0 8 19.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5zm-9 0h7V5A1.5 1.5 0 0 0 14 3.5h-4A1.5 1.5 0 0 0 8.5 5v1.5z"></path>
        </g>
      </svg>
    </span>
  `;
  $("p.todos-intro__goal").id = goalId;
  $("p.todos-intro__goal").setAttribute("is_achieved", is_achieved);
  $("p.todos-intro__goal").setAttribute("created_on", created_on);

  // Add Click Listeners for Goal EDit and Delete
  $(".edit-goal").addEventListener("click", (e) => handleEditGoal(e));
  $(".delete-goal").addEventListener("click", (e) => handleDeleteGoal(e));

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
          const label = document.createElement("label");
          const inputCheck = document.createElement("input");
          const childLabel = document.createElement("label");
          const textSpan = document.createElement("span");
          const moreOptions = document.createElement("span");

          const svgEditIcon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          const svgDeleteIcon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );

          svgEditIcon.dataset.name = todo.id;
          svgEditIcon.setAttribute("width", "24");
          svgEditIcon.setAttribute("height", "24");
          svgEditIcon.setAttribute("data-svgs-path", "sm1/edit.svg");
          svgEditIcon.setAttribute("class", "form_action_icon");

          svgDeleteIcon.dataset.name = todo.id;
          svgDeleteIcon.setAttribute("width", "24");
          svgDeleteIcon.setAttribute("height", "24");
          svgDeleteIcon.setAttribute("data-svgs-path", "sm1/trash.svg");
          svgDeleteIcon.setAttribute("class", "form_action_icon");

          svgEditIcon.innerHTML = `
            <g fill="none" fill-rule="evenodd">
              <path fill="currentColor" d="M9.5 19h10a.5.5 0 1 1 0 1h-10a.5.5 0 1 1 0-1z"></path>
              <path stroke="currentColor"
                d="M4.42 16.03a1.5 1.5 0 0 0-.43.9l-.22 2.02a.5.5 0 0 0 .55.55l2.02-.21a1.5 1.5 0 0 0 .9-.44L18.7 7.4a1.5 1.5 0 0 0 0-2.12l-.7-.7a1.5 1.5 0 0 0-2.13 0L4.42 16.02z">
              </path>
            </g>
          `;

          svgDeleteIcon.innerHTML = `
          <g fill="none" fill-rule="evenodd">
            <path d="M0 0h24v24H0z"></path>
            <rect width="14" height="1" x="5" y="6" fill="currentColor" rx=".5"></rect>
            <path fill="currentColor" d="M10 9h1v8h-1V9zm3 0h1v8h-1V9z"></path>
            <path stroke="currentColor" d="M17.5 6.5h-11V18A1.5 1.5 0 0 0 8 19.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5zm-9 0h7V5A1.5 1.5 0 0 0 14 3.5h-4A1.5 1.5 0 0 0 8.5 5v1.5z"></path>
          </g>
          `;

          li.id = todo.id;
          li.className = "todos-list__item";

          inputCheck.type = "checkbox";
          inputCheck.checked = todo.is_done;
          inputCheck.dataset.name = todo.id;
          inputCheck.onchange = (e) => handleCheckBox(e);

          // Intercept Todo State whether its done or not, if done strikethrough text else do not strikethrough

          if (todo.is_done) {
            textSpan.style.textDecoration = "line-through";
          } else {
            textSpan.style.textDecoration = "";
          }

          li.setAttribute("is_done", todo.is_done);
          li.setAttribute("created_on", todo.created_on);
          li.addEventListener("mouseover", showOptions);
          li.addEventListener("mouseout", hideOptions);

          checkbox.className = "todos-list__item__checkbox";
          textSpan.className = "todos-list__item__text";
          moreOptions.className = "todos-list__item__options";

          label.appendChild(inputCheck);
          label.appendChild(childLabel);
          checkbox.appendChild(label);

          textSpan.textContent = todo.body;

          svgEditIcon.addEventListener("mouseover", (e) =>
            showImgOptions(e, todo.id)
          );
          svgEditIcon.addEventListener("mouseout", (e) =>
            removeImgOptions(e, todo.id)
          );
          svgEditIcon.addEventListener("click", (e) => handleEditTodo(e));

          svgDeleteIcon.addEventListener("mouseover", (e) =>
            showImgOptions(e, todo.id)
          );
          svgDeleteIcon.addEventListener("mouseout", (e) =>
            removeImgOptions(e, todo.id)
          );

          svgDeleteIcon.addEventListener("click", (e) => deleteTodo(e));

          // Append svg delete and edit icon
          moreOptions.appendChild(svgEditIcon);
          moreOptions.appendChild(svgDeleteIcon);

          li.appendChild(checkbox);
          li.appendChild(textSpan);
          li.appendChild(moreOptions);

          $("ul.todos-list").appendChild(li);
        })
      : ($("ul.todos-list").innerHTML = `<p>No Todos for this Goal</p>`);
};

// Listener for Edit Todo Cancel Button
$(".edit-todo-cancelBtn").addEventListener("click", (event) => {
  const selectedTodoID = event.target.dataset.name;
  // console.log(document.getElementById(selectedTodoID));
  const currTodo = document.getElementById(selectedTodoID);
  // Show TodoItem
  currTodo.style.display = "flex";
  // Hide Add Todo Form
  $("form.edit-todo").style.display = "none";
});

// Submit Listener for Edit Todo Form
$("form.edit-todo").addEventListener("submit", (e) => {
  // console.log(e.target.parentElement.firstElementChild.id);

  let todoId, goalId;

  // Grab Data ID from Form
  todoId = e.target.dataset.name;
  // Grab Goal ID from Section Header
  goalId = e.target.parentElement.firstElementChild.id;

  editTodo(e, todoId, goalId);
});

const handleEditTodo = async (event) => {
  console.log("Editing...");
  // Get Current Value of Item Clicked
  const currTodo = await event.target.parentElement.parentElement;
  console.log(currTodo);
  // Hide TodoItem
  currTodo.style.display = "none";

  // Show Add Todo Form
  $("form.edit-todo").style.display = "flex";

  // Give Add Todo Form ID of Selected todoItem which will be used to display Selected TodoItem back
  $("form.edit-todo").dataset.name = currTodo.id;

  // ALso give a Data ID to the cancel button within form
  $("form.edit-todo").querySelector("span.edit-todo-cancelBtn").dataset.name =
    currTodo.id;

  // Access Current Todo Text Value from Second Child Element
  const currTodoValue = currTodo.childNodes[1].textContent;

  // Access Todo-Input then set its value to current todo's value
  $("#edit-todo-input").value = currTodoValue;
};

const editTodo = async (event, todoId, goalId) => {
  event.preventDefault();
  // console.log(todoId);
  // Get Edit Todo Input Value
  const editTodoInput = document.getElementById("edit-todo-input");
  // Get Current ToDo
  const currTodo = document.getElementById(todoId);
  // Get Status of Todo whether its been done or not
  let is_done = currTodo.getAttribute("is_done");
  // Convert is_done attribute to Boolean
  is_done = JSON.parse(is_done);

  const url = `${script_base_url}/api/v1/goals/${goalId}/todos/${todoId}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ body: editTodoInput.value, is_done }),
    });

    const data = await response.json();

    if (data.status === "success") {
      // Hide EDit Todo Form
      $("form.edit-todo").style.display = "none";

      // Remove All Child Elements For ListItem
      currTodo.innerHTML = "";

      // Create Newly Updated Child Elements For ListItem (current todo being edited)
      const checkbox = document.createElement("span");
      const label = document.createElement("label");
      const inputCheck = document.createElement("input");
      const childLabel = document.createElement("label");
      const textSpan = document.createElement("span");
      const moreOptions = document.createElement("span");
      const svgEditIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      const svgDeleteIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

      svgEditIcon.dataset.name = data.data[0].id;
      svgEditIcon.setAttribute("width", "24");
      svgEditIcon.setAttribute("height", "24");
      svgEditIcon.setAttribute("data-svgs-path", "sm1/edit.svg");
      svgEditIcon.setAttribute("class", "form_action_icon");

      svgDeleteIcon.dataset.name = data.data[0].id;
      svgDeleteIcon.setAttribute("width", "24");
      svgDeleteIcon.setAttribute("height", "24");
      svgDeleteIcon.setAttribute("data-svgs-path", "sm1/trash.svg");
      svgDeleteIcon.setAttribute("class", "form_action_icon");

      svgEditIcon.innerHTML = `
            <g fill="none" fill-rule="evenodd">
              <path fill="currentColor" d="M9.5 19h10a.5.5 0 1 1 0 1h-10a.5.5 0 1 1 0-1z"></path>
              <path stroke="currentColor"
                d="M4.42 16.03a1.5 1.5 0 0 0-.43.9l-.22 2.02a.5.5 0 0 0 .55.55l2.02-.21a1.5 1.5 0 0 0 .9-.44L18.7 7.4a1.5 1.5 0 0 0 0-2.12l-.7-.7a1.5 1.5 0 0 0-2.13 0L4.42 16.02z">
              </path>
            </g>
          `;

      svgDeleteIcon.innerHTML = `
          <g fill="none" fill-rule="evenodd">
            <path d="M0 0h24v24H0z"></path>
            <rect width="14" height="1" x="5" y="6" fill="currentColor" rx=".5"></rect>
            <path fill="currentColor" d="M10 9h1v8h-1V9zm3 0h1v8h-1V9z"></path>
            <path stroke="currentColor" d="M17.5 6.5h-11V18A1.5 1.5 0 0 0 8 19.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5zm-9 0h7V5A1.5 1.5 0 0 0 14 3.5h-4A1.5 1.5 0 0 0 8.5 5v1.5z"></path>
          </g>
          `;

      checkbox.className = "todos-list__item__checkbox";
      textSpan.className = "todos-list__item__text";
      moreOptions.className = "todos-list__item__options";

      inputCheck.type = "checkbox";
      inputCheck.checked = data.data[0].is_done;
      inputCheck.dataset.name = data.data[0].id;
      inputCheck.onchange = (e) => handleCheckBox(e);

      label.appendChild(inputCheck);
      label.appendChild(childLabel);
      checkbox.appendChild(label);

      // Intercept Todo State whether its done or not, if done strikethrough text else do not strikethrough
      if (data.data[0].is_done) {
        textSpan.style.textDecoration = "line-through";
      } else {
        textSpan.style.textDecoration = "";
      }

      textSpan.textContent = data.data[0].body;

      svgEditIcon.addEventListener("mouseover", (e) =>
        showImgOptions(e, data.data[0].id)
      );
      svgEditIcon.addEventListener("mouseout", (e) =>
        removeImgOptions(e, data.data[0].id)
      );
      svgEditIcon.addEventListener("click", (e) => handleEditTodo(e));

      svgDeleteIcon.addEventListener("mouseover", (e) =>
        showImgOptions(e, data.data[0].id)
      );
      svgDeleteIcon.addEventListener("mouseout", (e) =>
        removeImgOptions(e, data.data[0].id)
      );

      svgDeleteIcon.addEventListener("click", (e) => deleteTodo(e));

      // Append svg delete and edit icon
      moreOptions.appendChild(svgEditIcon);
      moreOptions.appendChild(svgDeleteIcon);

      // Set Current Todo's to newly created child elements
      currTodo.appendChild(checkbox);
      currTodo.appendChild(textSpan);
      currTodo.appendChild(moreOptions);

      // Set IS_DONE Attribute for Todo
      // currTodo.setAttribute("is_done", data.data[0].is_done);

      // Show TodoItem
      currTodo.style.display = "flex";

      // displayMsg(data.message, "Success");
    } else if (data.status == "error") {
      displayMsg(data.message, "Error");
    }
  } catch (error) {
    console.log(error);
    displayMsg(error.message, "Error");
  }
};

const removeTodoFromUI = (id) => {
  const todoItem = document.getElementById(id);
  todoItem.remove();
};

const deleteTodo = async (event) => {
  console.log("Deleting...");

  const todoId = event.target.parentElement.parentElement.id;

  // Confirmation Modal
  // displayMsg("Are you sure you want to delete this Todo?", "Confirm");

  const goalId =
    event.target.parentElement.parentElement.parentElement.parentElement
      .previousElementSibling.id;

  const url = `${script_base_url}/api/v1/goals/${goalId}/todos/${todoId}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: headers,
    });

    const data = await response.json();

    if (data.status == "success") {
      removeTodoFromUI(todoId);
    } else if (data.status == "error") {
      displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    displayMsg(error.message, "Error");
  }
};

async function showImgOptions(e, todoId) {
  if (e.target.dataset.name === todoId) {
    e.target.parentElement.style.visibility = "visible";
  }
}

async function removeImgOptions(e, todoId) {
  if (e.target.dataset.name === todoId) {
    e.target.parentElement.style.visibility = "visible";
  }
}

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

const getAllGoals = async () => {
  const url = `${script_base_url}/api/v1/goals/`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (data.status === "success") {
      displayGoals(data.data, "Success");
    } else if (data.status === "error") {
      console.log(data);
      displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    displayMsg(err.message, "Error");
  }
};

const displayGoals = (goals) => {
  goals.forEach((eachGoal) => {
    const li = document.createElement("li");
    const checkboxSpan = document.createElement("span");
    const textSpan = document.createElement("span");
    // const optionSpan = document.createElement("span");

    li.dataset.name = `${eachGoal.id}`;
    li.className = "project-list__item";
    li.setAttribute("is-achieved", eachGoal.is_achieved);
    li.setAttribute("created_on", eachGoal.created_on);
    li.addEventListener("click", (e) => {
      getProjectGoal(eachGoal.id);
      closeMenu();
    });

    // optionSpan.className = "more-options-icon";

    checkboxSpan.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd"
        d="M4 12C4 7.58 7.58002 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58002 20 4 16.42 4 12ZM18 12C18 8.69 15.31 6 12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12Z"
        fill="" fill-opacity="0.54" />
      </svg>
    `;
    textSpan.className = "goal-text";
    textSpan.textContent = `${eachGoal.body}`;
    // optionSpan.innerHTML = `<img src="./assets/more_vert.svg" alt="More Options" />`;

    li.appendChild(checkboxSpan);
    li.appendChild(textSpan);
    // li.appendChild(optionSpan);
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

const getProjectGoal = async (goalId) => {
  console.log("Getting Project Goal...", goalId);

  showloader("show");

  const url = `${script_base_url}/api/v1/goals/${goalId}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthState.credentials.token}`,
  });

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (data.status === "success") {
      // console.log(data.data[0].todos);
      showloader("hide");
      showProjectTodos(data.data[0]);
    } else if (data.status === "error") {
      console.log(data);
      showloader("hide");
      displayMsg(data.message, "Error");
    }
  } catch (error) {
    console.log(error);
    showloader("hide");
    displayMsg(err.message, "Error");
  }
};

// window.addEventListener("DOMContentLoaded", getAllGoals);
if (AuthState.isAuthenticated) {
  getAllGoals();
  document.querySelectorAll(".hide-when-signed-in").forEach((item) => {
    item.classList.add("hide");
  });
} else {
  document.querySelectorAll(".hide-when-signed-out").forEach((item) => {
    item.classList.add("hide");
  });
}

// ADD LISTENER ON ADD PROJECT FORM
const addProjForm = $("form.add-project");
addProjForm.addEventListener("submit", (e) => addProject(e));

const addProject = async (event) => {
  event.preventDefault();

  const project = $("#goal-input").value;

  const addNewGoalToUI = (data) => {
    const { id, body, is_achieved, created_on } = data;

    // Select Goal List Container
    const goalListContainer = $("ul.side-nav__item__dropdown");

    // Create New List Element
    const li = document.createElement("li");
    // Set ClassName
    li.className = "project-list__item";
    // Set data-name attribute
    li.dataset.name = id;
    // Set IS_ACHIEVED ATTRIBUTE and Date Created
    li.setAttribute("is_achieved", is_achieved);
    li.setAttribute("created_on", created_on);
    li.addEventListener("click", (e) => getProjectGoal(id));

    li.innerHTML = `
      <span>
        <img src="./assets/circle.svg" alt="check button">
      </span>
      <span class="goal-text">${body}</span>
    `;

    goalListContainer.appendChild(li);
  };

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
      addNewGoalToUI(data.data);
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
    btnSpan.style.color = "var(--color-add-hover)";
    btn.style.color = "var(--color-hover)";
    btnSpan.style.background = "var(--color-hover)";
    btnSpan.style.borderRadius = "5rem";
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

// Handles Insertion of New Todo in TodoList
const addNewTodoToUI = (data) => {
  const { id, body, is_done, created_on } = data;
  // Access TodoList Container
  const todoContainer = $("ul.todos-list");

  // Create New Elements
  const li = document.createElement("li");
  const checkbox = document.createElement("span");
  const label = document.createElement("label");
  const inputCheck = document.createElement("input");
  const childLabel = document.createElement("label");
  const textSpan = document.createElement("span");
  const moreOptions = document.createElement("span");

  const svgEditIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  const svgDeleteIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  svgEditIcon.dataset.name = id;
  svgEditIcon.setAttribute("width", "24");
  svgEditIcon.setAttribute("height", "24");
  svgEditIcon.setAttribute("data-svgs-path", "sm1/edit.svg");
  svgEditIcon.setAttribute("class", "form_action_icon");

  svgDeleteIcon.dataset.name = id;
  svgDeleteIcon.setAttribute("width", "24");
  svgDeleteIcon.setAttribute("height", "24");
  svgDeleteIcon.setAttribute("data-svgs-path", "sm1/trash.svg");
  svgDeleteIcon.setAttribute("class", "form_action_icon");

  svgEditIcon.innerHTML = `
            <g fill="none" fill-rule="evenodd">
              <path fill="currentColor" d="M9.5 19h10a.5.5 0 1 1 0 1h-10a.5.5 0 1 1 0-1z"></path>
              <path stroke="currentColor"
                d="M4.42 16.03a1.5 1.5 0 0 0-.43.9l-.22 2.02a.5.5 0 0 0 .55.55l2.02-.21a1.5 1.5 0 0 0 .9-.44L18.7 7.4a1.5 1.5 0 0 0 0-2.12l-.7-.7a1.5 1.5 0 0 0-2.13 0L4.42 16.02z">
              </path>
            </g>
          `;

  svgDeleteIcon.innerHTML = `
          <g fill="none" fill-rule="evenodd">
            <path d="M0 0h24v24H0z"></path>
            <rect width="14" height="1" x="5" y="6" fill="currentColor" rx=".5"></rect>
            <path fill="currentColor" d="M10 9h1v8h-1V9zm3 0h1v8h-1V9z"></path>
            <path stroke="currentColor" d="M17.5 6.5h-11V18A1.5 1.5 0 0 0 8 19.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5zm-9 0h7V5A1.5 1.5 0 0 0 14 3.5h-4A1.5 1.5 0 0 0 8.5 5v1.5z"></path>
          </g>
          `;

  li.id = id;
  li.className = "todos-list__item";

  inputCheck.type = "checkbox";
  inputCheck.checked = is_done;
  inputCheck.dataset.name = id;
  inputCheck.onchange = (e) => handleCheckBox(e);

  // Intercept Todo State whether its done or not, if done strikethrough text else do not strikethrough

  if (is_done) {
    textSpan.style.textDecoration = "line-through";
  } else {
    textSpan.style.textDecoration = "";
  }

  li.setAttribute("is_done", is_done);
  li.setAttribute("created_on", created_on);
  li.addEventListener("mouseover", showOptions);
  li.addEventListener("mouseout", hideOptions);

  checkbox.className = "todos-list__item__checkbox";
  textSpan.className = "todos-list__item__text";
  moreOptions.className = "todos-list__item__options";

  label.appendChild(inputCheck);
  label.appendChild(childLabel);
  checkbox.appendChild(label);

  textSpan.textContent = body;

  svgEditIcon.addEventListener("mouseover", (e) => showImgOptions(e, id));
  svgEditIcon.addEventListener("mouseout", (e) => removeImgOptions(e, id));
  svgEditIcon.addEventListener("click", (e) => handleEditTodo(e));

  svgDeleteIcon.addEventListener("mouseover", (e) => showImgOptions(e, id));
  svgDeleteIcon.addEventListener("mouseout", (e) => removeImgOptions(e, id));

  svgDeleteIcon.addEventListener("click", (e) => deleteTodo(e));

  // Append svg delete and edit icon
  moreOptions.appendChild(svgEditIcon);
  moreOptions.appendChild(svgDeleteIcon);

  li.appendChild(checkbox);
  li.appendChild(textSpan);
  li.appendChild(moreOptions);

  todoContainer.appendChild(li);
};

const handleTodoSubmit = async (event) => {
  event.preventDefault();

  const goalId = $("p.todos-intro__goal").id;

  const todoInput = document.getElementById("todo-input");

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
      addNewTodoToUI(data.data);
      // displayMsg("Todo Posted Successfully", "Success");
      $("form.add-todo").reset();
    } else if (data.status == "error") {
      displayMsg(data.error, "Error");
    }
  } catch (error) {
    console.log(error);
    displayMsg(error.message, "Error");
  }
};

// Functiom To Handle Sidebar Toggle
const closeBtn = document.querySelector("button.close-icon");
const menuBtn = document.querySelector("button.menu-icon");
const sideBar = document.querySelector("nav.sidebar");
const overLay = document.querySelector("div.overlay");

menuBtn.addEventListener("click", openMenu);
closeBtn.addEventListener("click", closeMenu);
window.addEventListener("click", closeOverlay);

function openMenu(e) {
  sideBar.style.left = "0";
  menuBtn.style.display = "none";
  closeBtn.style.display = "block";
  overLay.style.display = "block";
}

function closeMenu(e) {
  sideBar.style.left = "-280px";
  menuBtn.style.display = "flex";
  closeBtn.style.display = "none";
  overLay.style.display = "none";
}

function closeOverlay(e) {
  if (e.target == overLay) {
    closeMenu();
  }
}

// Event Listener for Each Checkbox, if checked strikethrough the current todo
const allCheckboxes = document.querySelectorAll("input[type='checkbox']");

allCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", (e) => {
    if (checkbox.checked) {
      console.log("Item Checked...", e.target.id);
    }
  });
});

const handleCheckBox = (e) => {
  const todoId = e.target.dataset.name;
  const todo = document
    .getElementById(todoId)
    .querySelector("span.todos-list__item__text");
  const goalId =
    document.getElementById(todoId).parentElement.parentElement
      .previousElementSibling.id;

  const updateTodoWhenChecked = async (is_done_State) => {
    const url = `${script_base_url}/api/v1/goals/${goalId}/todos/${todoId}`;

    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${AuthState.credentials.token}`,
    });

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({
          body: todo.textContent,
          is_done: is_done_State,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        document
          .getElementById(todoId)
          .setAttribute("is_done", data.data[0].is_done);
      } else if (data.status === "error") {
        displayMsg("Error syncing todo with Database", "Error");
      }
    } catch (error) {
      console.log(error);
      displayMsg(error.message, "Error");
    }
  };

  if (e.target.checked) {
    todo.style.textDecoration = "line-through";

    // Make Request to Update ToDo State in database
    updateTodoWhenChecked(true);
  } else {
    todo.style.textDecoration = "";
    // Make Request to Update ToDo State in database
    updateTodoWhenChecked(false);
  }
};

// Function to hide and show the loading visual cue
const showloader = (action) => {
  if (action === "show") {
    document.getElementById("loader-outer-container").style.display = "block";
  } else if (action === "hide") {
    document.getElementById("loader-outer-container").style.display = "none";
  } else {
    console.log("loading error");
  }
};
