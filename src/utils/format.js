// import { formatTimeToStr } from "@/utils/date";
import dayjs from "dayjs";
import { getDict } from "@/utils/dictionary";

export const formatBoolean = (bool) => {
  if (bool !== null) {
    return bool ? "开启" : "停用";
  } else {
    return "";
  }
};
export const formatDate = (time, pattern = "YYYY-MM-DD HH:mm:ss") => {
  if (time !== null && time !== "") {
    // var date = new Date(time);
    return dayjs(time).format(pattern);
  } else {
    return "";
  }
};

export const filterDict = (value, options) => {
  const rowLabel = options && options.filter((item) => item.value === value);
  return rowLabel && rowLabel[0] && rowLabel[0].label;
};

export const getDictFunc = async (type) => {
  const dicts = await getDict(type);
  return dicts;
};

export const fileSizeChange = (value = 0) => {
  if (value === 0) return `0 B`;
  let size = value;
  let i = 0;
  while (size > 1024) {
    size = size / 1024;
    i = i + 1;
  }
  const unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  return `${size.toFixed(2)} ${unit[i]}`;
};
