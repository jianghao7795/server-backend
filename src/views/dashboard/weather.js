import axios from "axios";
import { ref } from "vue";

const weatherInfo = ref("今日晴，0℃ - 10℃，天气寒冷，注意添加衣物。");
const amapKey = "77f260ce700f02630963b52ade500c43";

export const useWeatherInfo = () => {
  ip();
  // getWeather();
  return weatherInfo;
};

export const ip = async () => {
  // key换成你自己的 https://console.amap.com/dev/index
  if (amapKey === "") {
    return false;
  }
  const res = await axios.get("https://restapi.amap.com/v3/ip?key=" + amapKey);
  // console.log(res);
  if (res.data.status === "1") {
    getWeather(res.data.adcode);
  }
  return true;
  // ge;
};

const getWeather = async (code) => {
  const response = await axios.get("https://restapi.amap.com/v3/weather/weatherInfo?key=" + amapKey + "&city=" + code);
  if (response.data.status === "1") {
    // console.log(response);
    const s = response.data.lives[0];
    weatherInfo.value = s.city + " 天气：" + s.weather + " 温度：" + s.temperature + "℃ 风向：" + s.winddirection + " 风力：" + s.windpower + "级 空气湿度：" + s.humidity + "%";
  }
};
