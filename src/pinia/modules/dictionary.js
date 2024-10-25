import { findSysDictionary } from "@/api/sysDictionary";

import { defineStore } from "pinia";
import { ref } from "vue";

export const useDictionaryStore = defineStore("dictionary", () => {
  const dictionaryMap = ref({});

  const setDictionaryMap = (dictionaryRes) => {
    dictionaryMap.value = { ...dictionaryMap.value, ...dictionaryRes };
  };

  const getDictionary = async (type) => {
    if (dictionaryMap.value[type] && dictionaryMap.value[type].length) {
      return dictionaryMap.value[type];
    } else {
      // console.log(type);
      const res = await findSysDictionary({ type });
      if (res.code === 200) {
        // console.log(res);
        const dictionaryRes = {};
        const dict = [];
        res.data.sysDictionaryDetails &&
          res.data.sysDictionaryDetails.forEach((item) => {
            dict.push({
              label: item.label,
              value: item.value,
            });
          });
        dictionaryRes[res.data.type] = dict;
        setDictionaryMap(dictionaryRes);
        return dictionaryMap.value[type];
      }
    }
  };

  return {
    dictionaryMap,
    setDictionaryMap,
    getDictionary,
  };
});
