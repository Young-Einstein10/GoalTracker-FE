const $ = (element) => document.querySelector(element);
// const script_base_url = "http://localhost:5000";
const script_base_url = "https://einstein-goal-tracker.herokuapp.com";

// ADD PROJECT/GOAL BUTTON
const svgBtn = $(".svg-btn");
const projectDropDown = $(".side-nav__item__dropdown");
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
addGoalBtn.addEventListener("click", toggleModal);
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

const showProjectTodos = (goal) => {
  const { todos, body, id: goalId, is_achieved, created_on } = goal;

  // Project Header
  $("div.welcome-msg").style.display = "none";
  $("section.todos").style.display = "block";
  $("p.todos-intro__goal").innerHTML = `
    <span class="text">${body}</span>
    <span class="todos-intro__goal__options">
      <img class="edit-goal" src="./assets/edit.svg" alt="edit button">
      <img class="delete-goal" src="./assets/delete.svg" alt="delete button">
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
          editIcon.addEventListener("click", () => handleEditTodo());

          delIcon.src = "./assets/delete.svg";
          delIcon.alt = "delete button";
          delIcon.addEventListener("mouseover", (e) => showImgOptions(e));
          delIcon.addEventListener("click", (e) => deleteTodo(e));

          moreOptions.appendChild(editIcon);
          moreOptions.appendChild(delIcon);
          li.appendChild(checkbox);
          li.appendChild(textSpan);
          li.appendChild(moreOptions);

          $("ul.todos-list").appendChild(li);
        })
      : ($("ul.todos-list").innerHTML = `<p>No Todos for this Goal</p>`);
};

// Listener for Edit Todo Cancel Button
$(".edit-todo-cancelBtn").addEventListener("click", (event) => {
  const selectedTodoID = event.target.id;
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

  todoId = e.target.id;
  goalId = e.target.parentElement.firstElementChild.id;

  editTodo(e, todoId, goalId);
});

const handleEditTodo = () => {
  console.log("Editing...");
  // Get Current Value of Item Clicked
  const currTodo = event.target.parentElement.parentElement;

  // Hide TodoItem
  currTodo.style.display = "none";

  // Show Add Todo Form
  $("form.edit-todo").style.display = "flex";

  // Give Add Todo Form ID of Selected todoItem which will be used to display Selected TodoItem back
  $("form.edit-todo").id = currTodo.id;

  // ALso give an ID to the cancel button within form
  $("form.edit-todo").querySelector("span.edit-todo-cancelBtn").id =
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

  const url = `http://localhost:5000/api/v1/goals/${goalId}/todos/${todoId}`;

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

    if (data.status == "success") {
      // Hide EDit Todo Form
      $("form.edit-todo").style.display = "none";

      // Remove All Child Elements For ListItem
      currTodo.innerHTML = "";

      // Create Newly Updated Child Elements For ListItem (current todo being edited)
      const checkbox = document.createElement("span");
      const textSpan = document.createElement("span");
      const moreOptions = document.createElement("span");
      const editIcon = document.createElement("img");
      const delIcon = document.createElement("img");

      checkbox.className = "todos-list__item__checkbox";
      textSpan.className = "todos-list__item__text";
      moreOptions.className = "todos-list__item__options";

      checkbox.innerHTML = `
        <label>
          <input id="c1" type="checkbox">
          <label for="c1"></label>
        </label>
      `;
      textSpan.textContent = data.data[0].body;

      editIcon.src = "./assets/edit.svg";
      editIcon.alt = "edit button";
      editIcon.addEventListener("mouseover", (e) => showImgOptions(e));
      editIcon.addEventListener("click", () => handleEditTodo());

      delIcon.src = "./assets/delete.svg";
      delIcon.alt = "delete button";
      delIcon.addEventListener("mouseover", (e) => showImgOptions(e));
      delIcon.addEventListener("click", (e) => deleteTodo(e));

      moreOptions.appendChild(editIcon);
      moreOptions.appendChild(delIcon);

      // Set Current Todo's to newly created child elements
      currTodo.appendChild(checkbox);
      currTodo.appendChild(textSpan);
      currTodo.appendChild(moreOptions);

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
        displayMsg(data.error, "Error");
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
    const checkboxSpan = document.createElement("span");
    const textSpan = document.createElement("span");
    // const optionSpan = document.createElement("span");

    li.dataset.name = `${eachGoal.id}`;
    li.className = "project-list__item";
    li.setAttribute("is-achieved", eachGoal.is_achieved);
    li.setAttribute("created_on", eachGoal.created_on);
    li.addEventListener("click", (e) => {
      getProjectGoal(eachGoal.id);
    });

    // optionSpan.className = "more-options-icon";

    checkboxSpan.innerHTML = `<img src="./assets/circle.svg" alt="check button" />`;
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

// Handles Insertion of New Todo in TodoList
const addNewTodoToUI = (data) => {
  const { id, body, is_done, created_on } = data;
  // Access TodoList Container
  const todoContainer = $("ul.todos-list");

  // Create New Elements
  const li = document.createElement("li");
  const checkbox = document.createElement("span");
  const textSpan = document.createElement("span");
  const moreOptions = document.createElement("span");
  const editIcon = document.createElement("img");
  const delIcon = document.createElement("img");

  li.id = id;
  li.className = "todos-list__item";
  li.setAttribute("is_done", is_done);
  li.setAttribute("created_on", created_on);
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
  textSpan.textContent = body;

  editIcon.src = "./assets/edit.svg";
  editIcon.alt = "edit button";
  editIcon.addEventListener("mouseover", (e) => showImgOptions(e));
  editIcon.addEventListener("click", () => handleEditTodo());

  delIcon.src = "./assets/delete.svg";
  delIcon.alt = "delete button";
  delIcon.addEventListener("mouseover", (e) => showImgOptions(e));
  delIcon.addEventListener("click", (e) => deleteTodo(e));

  moreOptions.appendChild(editIcon);
  moreOptions.appendChild(delIcon);
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

// Event Listener
