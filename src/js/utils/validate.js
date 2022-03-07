import { MESSAGE } from "../const/index.js";

export function isBlankThenAlert(menuName) {
  if (!menuName) alert(MESSAGE.WARN_BLANK);
  return !menuName;
}

export function isReduplicatedThenAlert(menuList, menuName, id = null) {
  const reduplication = menuList.find(
    (item) => item.name === menuName && item.id !== parseInt(id)
  );
  if (reduplication) alert(MESSAGE.ALREADY_EXISTS);
  return !!reduplication;
}
