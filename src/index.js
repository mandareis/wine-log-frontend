(function () {
  //   const loginBtn = document.querySelector("#login-btn");
  //   const createWineBtn = document.querySelector("#wine-create-btn");
  const mainLeft = document.querySelector("#main-left");
  const mainCenter = document.querySelector("#main-center");
  const mainRight = document.querySelector("#main-right");

  let user = null;

  let wine = document.querySelector("#create-new-wine");
  wine.addEventListener("click", () => {
    showForm();
  });

  let login = document.querySelector("#login");
  login.addEventListener("click", () => {
    showLogin();
  });

  function showForm() {
    mainCenter.innerHTML = `
    <div class="create-wine-form">
    <form id="wine-create-form">
      <div class="form-group row">
        <label for="wine-name" class="col-sm-2 col-form-label"> Name </label>
        <div class="col-sm-10">
          <input type="text" id="wine-name" class="form-control" />
        </div>
      </div>
      <div class="form-group row">
        <label for="wine-year" class="col-sm-2 col-form-label"> Year </label>
        <div class="col-sm-10">
          <input type="number" id="wine-year" class="form-control" />
        </div>
      </div>
      <div class="form-group row">
        <label for="wine-kind" class="col-sm-2 col-form-label"> Kind </label>
        <div class="col-sm-10">
          <input type="text" id="wine-kind" class="form-control" />
        </div>
      </div>
      <div class="form-group row">
        <label for="wine-cost" class="col-sm-2 col-form-label"> Cost </label>
        <div class="col-sm-10">
          <input type="text" id="wine-cost" class="form-control" />
        </div>
      </div>
      <div class="form-group row">
        <label for="wine-reg" class="col-sm-2 col-form-label"> Region </label>
        <div class="col-sm-10">
          <input type="text" id="wine-reg" class="form-control" />
        </div>
      </div>
      <a class="btn btn-danger fas">&#xF004;</a>
      <div class="form-group row">
        <div class="col-sm-10">
          <input type="submit" class="btn btn-primary" id="wine-create-btn" value="Submit" />
        </div>
      </div>
    </form>
  </div>
  `;

    mainCenter
      .querySelector("#wine-create-form")
      .addEventListener("submit", handlesWineCreateForm);
  }

  function handlesWineCreateForm() {
    let wineName = document.querySelector("#wine-name");
    let name = wineName.value;
    let wineYear = document.querySelector("#wine-year");
    let year = wineYear.value;
    let wineKind = document.querySelector("#wine-kind");
    let kind = wineKind.value;
    let wineCost = document.querySelector("#wine-cost");
    let cost = wineCost.value;
    let wineReg = document.querySelector("#wine-reg");
    let reg = wineReg.value;
    createWine({ name, year, kind, cost, reg });
  }

  function showUserSidebar() {
    mainLeft.innerHTML = `
        <div class="alert alert-success">
            Hello, ${user.name}!
        </div>
      `;
  }
  function showLogin() {
    mainLeft.innerHTML = `
      <div class="user-container">
      <div class="form-group row">
      <label for="user-name" class="col-sm-2 col-form-label"> Name </label>
      <div class="col-sm-5">
        <input type="text" id="user-name" class="form-control" />
      </div>
    </div>
    <div class="form-group row">
    <div class="col-sm-5">
      <input type="submit" class="btn btn-primary" id="login-btn" value="Login" />
    </div>
  </div>
      `;
    mainLeft
      .querySelector("#login-btn")
      .addEventListener("click", handlesLoginBtn);
  }

  function handlesLoginBtn() {
    let userData = document.querySelector("#user-name");
    let userName = userData.value;
    createUser(userName);
  }

  async function createUser(userName) {
    let response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ name: userName }),
    });
    user = await response.json();
    showUserSidebar();
  }
  async function createWine(wineData) {
    let response = await fetch("http://localhost:3000/wines", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(wineData),
    });
    let data = await response.json();
    if (!response.ok) {
      showError(data.error);
      return;
    }
    // data is our wine object, since the response was ".ok"!
    showWine(data);
  }

  function apiURL(path) {
    return `http://localhost:3000${path}`;
  }
  let pageNumber = 1;
  async function getAllWines() {
    let response = await fetch(apiURL(`/wines?page=${pageNumber}`));
    let data = await response.json();
    if (!response.ok) {
      showError(data.error);
      return;
    }
    // data is our wine object, since the response was ".ok"!
    showWineList(data);
  }

  function showWineList(wines) {
    mainRight.innerHTML = `
    <div class="list-group">
    ${wines
      .map(function (w) {
        return `<a data-wine-id="${w.id}" class="wine-link list-group-item list-group-item-action ">${w.name}</a>`;
      })
      .join("")}
    <div class="col-sm-5">
    <button type="button" id="back-btn" class="btn btn-primary btn-sm">back</button>
    <button type="button" id="forward-btn" class="btn btn-primary btn-sm">forward</button>
    </div>
    </div>
    `;
    for (let e of mainRight.querySelectorAll(".wine-link")) {
      e.addEventListener("click", handlesWineLinkClick);
    }
    let backBtn = document.querySelector("#back-btn");
    backBtn.addEventListener("click", handlesBackBtn);

    let forwardBtn = document.querySelector("#forward-btn");
    forwardBtn.addEventListener("click", handlesForwardBtn);
  }

  function handlesBackBtn() {
    pageNumber--;
    if (pageNumber < 1) {
      pageNumber = 1;
    }
    getAllWines();
  }
  function handlesForwardBtn() {
    pageNumber++;
    getAllWines();
  }

  async function handlesWineLinkClick(event) {
    let wineID = event.target.dataset.wineId;
    let response = await fetch(apiURL(`/wines/${wineID}`));
    let data = await response.json();
    showWine(data);
  }

  function showWine(wine) {
    mainCenter.innerHTML = `
    <div class="wine-info">
    <h5 class="card-title">${wine.name}</h5>
    <h6 class="card-kind">${wine.kind}</h6>
    <h6 class="card-kind">${wine.cost}</h6>
    <h6 class="card-reg">${wine.region}</h6>
  </div>
</div>
  `;
  }

  getAllWines();
  showLogin();
})();
