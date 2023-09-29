import { GithubUser } from "./githubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }
  load() {
    this.entries = JSON.parse(localStorage.getItem("@gitfav:")) || [];
  }

  save() {
    localStorage.setItem("@gitfav:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExist = this.entries.find((entry) => entry.login === username);
      const user = await GithubUser.search(username);

      if (userExist) {
        throw new Error("Usúario já cadastrado");
      }

      if (user.login === undefined) {
        throw new Error("Usúario não cadastrado!");
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
      this.checkIsEmpty(this.entries.length);
    } catch (err) {
      console.log(err);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoriteView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onadd();
    this.checkIsEmpty(this.entries.length);
    this.sendEnter();
  }

  onadd() {
    const favoriteButton = this.root.querySelector(".search button");

    favoriteButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");

      this.add(value);
      this.clearInput();
    };
  }

  sendEnter() {
    const sendInputEnter = document.querySelector(".search input");

    sendInputEnter.onchange = () => {
      const { value } = document.querySelector(".search input");
      this.add(value);

      this.clearInput();
    };
  }

  clearInput() {
    const input = document.querySelector(".search input");

    return (input.value = "");
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow(user);

      row.querySelector(".user img").src = `
      https://github.com/${user.login}.png
      `;
      row.querySelector(".user img").alt = `
        Imagem de ${user.name}
        `;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const confirmar = confirm(
          "Tem certeza que deseja deletar esse Perfil?"
        );

        if (confirmar) {
          this.delete(user);
          this.checkIsEmpty(this.entries.length);
        }
      };
      this.tbody.append(row);
    });
  }

  checkIsEmpty(index) {
    const plus4table = document.querySelector("table");
    if (index >= 4) {
      plus4table.classList.add("scroll-container");
    }
    if (index <= 3) {
      plus4table.classList.remove("scroll-container");
    }
    if (index === 0) {
      const nullRow = this.emptyRow();
      this.tbody.append(nullRow);
    }
  }

  emptyRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
    
    <th class="emptyTr emptyText">
    Nenhum favorito ainda
    <th class="emptyTr">
        <img src="./assets/Estrela.svg" alt="">
        <th class="emptyTr">
        <th class="emptyTr">
        </th>
        </th>
        </th>
        </th>   
        `;
    return tr;
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `

    <td class="user">
    <img
      src="https://github.com/Andre-G-C-Araujo.png"
      alt=""
    />
    <a href="https://github.com/Andre-G-C-Araujo" target="_blank">
      <p>Andre Caue</p>
      <span>AndreCaue</span>
    </a>
  </td>
  <td class="repositories">123</td>
  <td class="followers">17</td>
  <td><button class="remove">Remover</button></td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => tr.remove());
  }
}
