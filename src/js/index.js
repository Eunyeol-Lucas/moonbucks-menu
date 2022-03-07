import { isBlankThenAlert, isReduplicatedThenAlert } from "./utils/validate.js";
import { $ } from "./utils/dom.js";
import MenuApi from "./utils/api.js";
import { MESSAGE, CATEGORY } from "./const/index.js";

function App() {
  this.currentCategory = CATEGORY[Object.keys(CATEGORY)[0]];
  this.menu = {};
  this.init = async () => {
    Object.values(CATEGORY).forEach((category) => (this.menu[category] = []));
    render();
    initEventListener();
  };

  const menuItemTemplate = (item) => {
    return `
    <li 
      class="menu-list-item d-flex items-center py-2" data-menu-id=${item.id}>
      <span class="${item.isSoldOut ? "sold-out" : ""}  w-100 pl-2 menu-name">${
      item.name
    }</span>
      <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
      >
        품절
      </button>
      <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
      >
        수정
      </button>
      <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
      >
        삭제
      </button>
    </li>
        `;
  };

  const render = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );

    const template = this.menu[this.currentCategory]
      ?.map((item) => menuItemTemplate(item))
      .join("");
    $("#menu-list").innerHTML = template;
    updateMenuCount();
  };

  const updateMenuCount = () => {
    $(".menu-count").innerText = `총 ${
      this.menu[this.currentCategory].length
    } 개`;
  };

  const addMenuName = async () => {
    const newMenuName = $("#menu-name").value.trim();
    $("#menu-name").value = "";
    if (isBlankThenAlert(newMenuName)) return;
    if (isReduplicatedThenAlert(this.menu[this.currentCategory], newMenuName))
      return;

    await MenuApi.createMenu(this.currentCategory, newMenuName);
    render();
  };

  const soldOutMenu = async ($li) => {
    const menuId = $li.dataset.menuId;
    await MenuApi.toggleSoldOut(this.currentCategory, menuId);
    render();
  };

  const editMenuName = async ($li) => {
    const $menuName = $li.querySelector(".menu-name");
    let editedMenuName = prompt(MESSAGE.EDIT_MENU, $menuName.textContent);
    const menuId = $li.dataset.menuId;
    if (editedMenuName) {
      editedMenuName = editedMenuName.trim();
    }
    if (isBlankThenAlert(editedMenuName)) return;
    if (
      isReduplicatedThenAlert(
        this.menu[this.currentCategory],
        editedMenuName,
        menuId
      )
    )
      return;
    await MenuApi.updateMenu(this.currentCategory, menuId, editedMenuName);
    render();
  };

  const removeMenuName = async ($li) => {
    if (confirm(MESSAGE.CHECK_DELETE)) {
      const menuId = $li.dataset.menuId;
      await MenuApi.deleteMenu(this.currentCategory, menuId);
      render();
    }
  };

  const updateMenuList = ({ target }) => {
    const { classList } = target;
    const $li = target.parentElement;
    if (classList.contains("menu-sold-out-button")) soldOutMenu($li);
    else if (classList.contains("menu-edit-button")) editMenuName($li);
    else if (classList.contains("menu-remove-button")) removeMenuName($li);
  };

  const changeMenuManagement = (target) => {
    $("#category-title").textContent = `${target.textContent} 메뉴 관리 `;
    $("#menu-name").placeholder = `${target.textContent
      .trim()
      .slice(3)} 메뉴 이름`;
    render();
  };
  const changeCategory = ({ target }) => {
    const isCategoryButton = target.classList.contains("cafe-category-name");
    if (!isCategoryButton) return;
    this.currentCategory = target.dataset.categoryName;
    changeMenuManagement(target);
  };

  const initEventListener = () => {
    $("#menu-list").addEventListener("click", updateMenuList);

    $("#menu-form").addEventListener("submit", (e) => e.preventDefault());

    $("#menu-submit-button").addEventListener("click", addMenuName);

    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") return;
      addMenuName();
    });

    $("nav").addEventListener("click", changeCategory);
  };
}

const app = new App();
app.init();

// trim polyfill
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  };
}
