(function () {
  const mainLeft = document.querySelector("#main-left");
  const mainCenter = document.querySelector("#main-center");
  const mainRight = document.querySelector("#main-right");

  let user = null;

  function apiURL(path) {
    return `http://localhost:3000${path}`;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let wine = document.querySelector("#create-new-wine");
  wine.addEventListener("click", () => {
    editForm(handlesWineCreateForm);
  });

  let login = document.querySelector("#login");
  login.addEventListener("click", () => {
    showLogin();
  });

  function editForm(submitHandler) {
    mainCenter.innerHTML = `
    <div class="create-wine-form">
    <form id="wine-edit-form">
      <div class="form-group row">
        <label for="wine-name" class="col-sm-2 col-form-label"> Name </label>
        <div class="col-sm-10">
          <input type="text" id="wine-name" class="form-control" required/>
        </div>
      </div>
      <div class="form-group row">
        <label for="wine-year" class="col-sm-2 col-form-label"> Year </label>
        <div class="col-sm-10">
          <input type="number" id="wine-year" class="form-control" required/>
        </div>
      </div>
      <div class="form-group row">
        <label for="wine-kind" class="col-sm-2 col-form-label"> Kind </label>
        <div class="col-sm-10">
          <input type="text" id="wine-kind" class="form-control" required/>
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
          <input type="text" id="wine-reg" class="form-control"  required/>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-sm-10">
          <input type="submit" class="btn btn-primary" id="wine-create-btn" value="Submit" />
        </div>
      </div>
    </form>
  </div>
  `;

    mainCenter
      .querySelector("#wine-edit-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
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
        submitHandler({ name, year, kind, cost, reg });
      });
  }

  function handlesLoveBtn(e) {
    if (e.target.classList.contains("fas")) {
      e.target.classList.remove("fas");
      e.target.classList.add("far");
    } else {
      e.target.classList.remove("far");
      e.target.classList.add("fas");
    }
  }

  function handlesWineCreateForm(wine) {
    createWine(wine);
  }

  async function showUserSidebar() {
    mainLeft.innerHTML = `
        <div class="alert alert-success sm-5 text-monospace">
            Hello, ${user.name}!
        </div>
      `;
    editForm(handlesWineCreateForm);
    await sleep(1500);
    mainLeft.innerHTML = "";
  }

  function showLogin() {
    mainLeft.innerHTML = `
      <div class="user-container">
      <div class="form-group row">
      <label for="user-name" class="col-sm-2 col-form-label text-monospace"> Name </label>
      <div class="col-sm-5">
        <input type="text" id="user-name" class="form-control text-monospace" />
      </div>
    </div>
    <div class="form-group row">
    <div class="col-sm-5">
      <input type="submit" class="btn btn-primary text-monospace" id="login-btn" value="Login" />
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
    validateLogin(userName);
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
    listMode = "my-wines";
    getAllWines();
    showUserSidebar();
  }

  function validateLogin(userName) {
    let name = document.querySelector("#user-name").value;
    if (name == "") {
      alert("Name must be filled out");
      return false;
    } else {
      createUser(userName);
    }
  }

  async function createWine(wineData) {
    let postData = wineData;
    if (user) {
      postData = {
        ...wineData,
        user_id: user.id,
      };
    }
    let response = await fetch("http://localhost:3000/wines", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    let data = await response.json();
    if (!response.ok) {
      showError(data.error);
      return;
    }
    // data is our wine object, since the response was ".ok"!
    showWine(data, []);
    getAllWines();
  }

  // app state
  let pageNumber = 1;
  let listMode = "all-wines"; // could be "my-wines" or "all-wines"

  async function getAllWines() {
    let response;
    if (listMode === "my-wines") {
      response = await fetch(
        apiURL(`/wines?liked_by=${user.id}&page=${pageNumber}`)
      );
    } else if (listMode === "all-wines") {
      response = await fetch(apiURL(`/wines?page=${pageNumber}`));
    } else {
      throw new Error(`invalid listMode: ${listMode}`);
    }
    let data = await response.json();
    if (!response.ok) {
      showError(data.error);
      return;
    }
    if (data.length === 0 && pageNumber > 1) {
      pageNumber--;
      return await getAllWines();
    }
    // data is our wine object, since the response was ".ok"!
    showWineList(data);
  }

  //shows all wines and also forward and back buttons
  function showWineList(wines) {
    mainRight.innerHTML = `
    <div class="list-group">
    <div class="btn-group" role="group" aria-label="Basic example">
    <button type="button" id="my-wines" class="wine-list-selector btn btn-secondary text-monosapce">My Favorites</button>
    <button type="button" id="all-wines" class="wine-list-selector btn btn-secondary text-monospace">All Wines</button>
    </div> 
    ${wines
      .map(function (w) {
        return `<a data-wine-id="${w.id}" class="wine-link list-group-item list-group-item-action text-monospace">${w.name}</a>
        `;
      })
      .join("")}
    <div class="col-sm-5">
    <button type="button" id="back-btn" class="btn btn-primary btn-sm text-monospace ">back</button>
    <button type="button" id="forward-btn" class="btn btn-primary btn-sm text-monospace">forward</button>
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
    const seeSawButtonHandler = (e) => {
      listMode = e.target.id;
      getAllWines();
    };
    for (let e of mainRight.querySelectorAll(".wine-list-selector")) {
      e.addEventListener("click", seeSawButtonHandler);
    }
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
    fetchSingleWine(wineID);
  }

  async function fetchSingleWine(wineID) {
    let response = await fetch(apiURL(`/wines/${wineID}`));
    let data = await response.json();
    let response1 = await fetch(apiURL(`/comments?wine_id=${wineID}`));
    let data1 = await response1.json();
    showWine(data, data1);
  }

  //shows each individual wine's info(includes love button, and comment section)
  function showWine(wine, comments) {
    mainCenter.innerHTML = `
    <div class="wine-info">
  <h4 id="wine-name" class="card-title text-monospace">${wine.name}</h4>
  <button
    type="button"
    id="update-btn"
    data-wine-id="${wine.id}"
    class="btn btn-primary btn-sm-5 text-monospace">
    Update
  </button>
  <button
    type="button"
    id="delete-btn"
    data-wine-id="${wine.id}"
    class="btn btn-primary btn-sm-5 text-monospace">
    Delete
  </button>
  <h6 class="card-kind text-monospace">${wine.year}</h6>
  <h6 class="card-kind text-monospace">${wine.kind}</h6>
  <h6 class="card-kind text-monospace">${wine.cost}</h6>
  <h6 class="card-reg text-monospace">${wine.region}</h6>
  <a id="love-btn" class="btn btn far">&#xF004;</a>
 <br>
 <br>
    <label class="text-monospace" for="exampleFormControlTextarea1"
      >Comment</label>
      <br>
    <textarea
      class="form-control text-monospace"
      id="comment-input"
      maxlength="250"
    ></textarea>
    <small id="passwordHelpBlock" class="form-text text-muted text-monospace">
      Character limit of 250.
    </small>

    <div class="col-sm-10">
      <input
        type="submit"
        data-wine-id="${wine.id}"
        class="btn btn-primary text-monospace"
        id="send-btn"
        value="Send"
      />
    </div>
    <div>
      <h5 class="text-monospace">Comments:</h5>
      ${comments
        .map(function (c) {
          return `
      <h6 class="text-monospace">${c.user.name}</h6>
      <p class="text-monospace">${c.comment}</p>
      `;
        })
        .join("")}
        
    </div>
  </div>
</div> `;
    mainCenter
      .querySelector("#send-btn")
      .addEventListener("click", handlesSendButton);
    mainCenter
      .querySelector("#update-btn")
      .addEventListener("click", handlesUpdateButton(wine));
    mainCenter
      .querySelector("#delete-btn")
      .addEventListener("click", handlesDeleteButton);
    let loveBtn = document.querySelector("#love-btn");
    loveBtn.addEventListener("click", handlesLoveBtn);
  }

  function handlesSendButton(e) {
    let wineID = e.target.dataset.wineId;
    let commentData = document.querySelector("#comment-input");
    let comment = commentData.value;
    createComment(comment, wineID);
  }

  async function createComment(comment, wineID) {
    await fetch("http://localhost:3000/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: comment,
        user_id: user.id,
        wine_id: wineID,
      }),
    });
    fetchSingleWine(wineID);
  }

  function handlesUpdateButton(wineData) {
    return function () {
      editForm(function (wine) {
        wine.id = wineData.id;
        updatesWine(wine);
      });
      document.querySelector("#wine-name").value = wineData.name;
      document.querySelector("#wine-year").value = wineData.year;
      document.querySelector("#wine-kind").value = wineData.kind;
      document.querySelector("#wine-cost").value = wineData.cost;
      document.querySelector("#wine-reg").value = wineData.region;
    };
  }

  async function updatesWine(wine) {
    await fetch(apiURL(`/wines/${wine.id}`), {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(wine),
    });
    fetchSingleWine(wine.id);
  }

  function handlesDeleteButton() {}
  getAllWines();
  showLogin();
})();
