const $ = (element) => document.querySelector(element);
const base_url = "http://localhost:5000";

// ADD PROJECT/GOAL BUTTON
const svgBtn = $(".svg-btn");
const projectDropDown = $(".side-nav__item__dropdown");

// MODAL
const modal = document.querySelector(".modal");
const trigger = document.querySelector(".add-modal-btn");
const closeButton = document.querySelector(".close-button");

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
  console.log(goal);
  $("div.welcome-msg").style.display = "none";
  $("section.todos").style.display = "block";
  $("p.todos-intro__goal").textContent = goal.body;

  const { todos } = goal;
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
              <label for="c1">Checkbox</label>
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
  const url = `${base_url}/api/v1/goals/`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNTU0MDNkOC1jMDYyLTRiNTEtOWIyMy03NmE0ZTgyYjBjZjIiLCJpYXQiOjE1ODkxMjA1NzUsImV4cCI6MTU4OTcyNTM3NX0.Gdpv68z2UwVCUGtUTMtxsLxoey_KVhuek4hNINoUONI",
  });

  fetch(url, {
    headers: headers,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        displayGoals(data.data);
      } else if (data.status === "error") {
        console.log(data);
        displayErrorMsg(data.message);
      }
    })
    .catch((err) => {
      console.log(err);
      displayErrorMsg(err.message);
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

const displayErrorMsg = (errMsg) => {};

const getProjectGoal = (goalId) => {
  console.log("Getting Project Goal...", goalId);

  const url = `${base_url}/api/v1/goals/${goalId}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNTU0MDNkOC1jMDYyLTRiNTEtOWIyMy03NmE0ZTgyYjBjZjIiLCJpYXQiOjE1ODkxMjA1NzUsImV4cCI6MTU4OTcyNTM3NX0.Gdpv68z2UwVCUGtUTMtxsLxoey_KVhuek4hNINoUONI",
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
        displayErrorMsg(data.message);
      }
    })
    .catch((err) => {
      console.log(err);
      displayErrorMsg(err.message);
    });
};

window.addEventListener("DOMContentLoaded", getAllGoals);
