<template>
  <el-card>
    <div v-cloak>
      <div class="container">
        <div :class="['item', { active: currentIndex === index }]" v-for="(item, index) in prizeList" @click="start(index)">
          <img :src="item.pic" alt="" />
          <p v-if="index !== 4">{{ item.name }}</p>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { onMounted, reactive, toRefs, computed, defineComponent } from "vue";
const Base_URL = import.meta.env.VITE_BASE_API + "/";
export default defineComponent({
  setup() {
    const state = reactive({
      prizeList: [
        {
          name: "手机",
          pic: `${Base_URL}uploads/file/2023/04/10/b53b3a3d6ab90ce0268229151c9bde11_162839.jpeg`,
        },
        {
          name: "手表",
          pic: "https://img1.baidu.com/it/u=2631716577,1296460670&fm=253&fmt=auto&app=120&f=JPEG",
        },
        {
          name: "苹果",
          pic: "https://img2.baidu.com/it/u=2611478896,137965957&fm=253&fmt=auto&app=138&f=JPEG",
        },
        {
          name: "棒棒糖",
          pic: "https://img2.baidu.com/it/u=576980037,1655121105&fm=253&fmt=auto&app=138&f=PNG",
        },
        {
          name: "娃娃",
          pic: "https://img2.baidu.com/it/u=4075390137,3967712457&fm=253&fmt=auto&app=138&f=PNG",
        },
        {
          name: "木马",
          pic: "https://img1.baidu.com/it/u=2434318933,2727681086&fm=253&fmt=auto&app=120&f=JPEG",
        },
        {
          name: "德芙",
          pic: "https://img0.baidu.com/it/u=1378564582,2397555841&fm=253&fmt=auto&app=120&f=JPEG",
        },
        {
          name: "玫瑰",
          pic: "https://img1.baidu.com/it/u=1125656938,422247900&fm=253&fmt=auto&app=120&f=JPEG",
        },
      ], // 后台配置的奖品数据
      currentIndex: 0, // 当前位置
      isRunning: false, // 是否正在抽奖
      speed: 10, // 抽奖转动速度
      timerIns: null, // 定时器实例
      currentRunCount: 0, // 已跑次数
      totalRunCount: 32, // 总共跑动次数 8的倍数
      prizeId: 0, // 中奖id
    });
    const startBtn = {
      name: "开始按钮",
      pic: "https://img2.baidu.com/it/u=1497996119,382735686&fm=253",
    };

    // 奖品高亮顺序
    const prizeSort = [0, 1, 2, 5, 8, 7, 6, 3];

    // 要执行总步数
    const totalRunStep = computed(() => {
      return state.totalRunCount + prizeSort.indexOf(state.prizeId);
    });

    onMounted(() => {
      state.prizeList.splice(4, 0, startBtn);
    });

    // 获取随机数
    const getRandomNum = () => {
      // const num = Math.floor(Math.random() * 9)
      // if (num === 4) {
      //  console.log(">>>>>不能为4")
      //  return getRandomNum()
      // } else {
      //  return num
      // }
      // 这里一次必然可以取到 时间为1次
      return prizeSort[Math.floor(Math.random() * prizeSort.length)];
    };

    const start = (i) => {
      if (i === 4 && !state.isRunning) {
        // 重置数据
        state.currentRunCount = 0;
        state.speed = 100;
        state.isRunning = true;

        // console.log("开始抽奖，后台请求中奖奖品");
        // 请求返回的奖品编号 这里使用随机数 但不能为4
        // const prizeId = getRandomNum()
        // console.log('中奖ID>>>', prizeId, state.prizeList[prizeId])
        // state.prizeId = prizeId
        // 模拟接口延时返回 如果接口突然报错如何处理？直接调用stopRun()方法停止转动
        setTimeout(() => {
          const prizeId = getRandomNum();
          // console.log("中奖ID>>>", prizeId, state.prizeList[prizeId]);
          state.prizeId = prizeId;
        }, 2000);
        startRun();
      }
    };

    const startRun = () => {
      stopRun();
      console.log(state.currentRunCount, totalRunStep.value);
      // 要执行总步数
      // 已走步数超过
      if (state.currentRunCount > totalRunStep.value) {
        state.isRunning = false;
        return;
      }
      state.currentIndex = prizeSort[state.currentRunCount % 8];
      // 如果当前步数超过了2/3则速度慢下来
      if (state.currentRunCount > Math.floor((state.totalRunCount * 2) / 3)) {
        state.speed = state.speed + Math.floor(state.currentRunCount / 3);
        console.log("速度>>>>", state.speed);
      }
      state.timerIns = setTimeout(() => {
        state.currentRunCount++;
        startRun();
      }, state.speed);
    };

    const stopRun = () => {
      state.timerIns && clearTimeout(state.timerIns);
    };

    return {
      ...toRefs(state),
      start,
    };
  },
});
</script>

<style scoped lang="scss">
[v-cloak] {
  display: none;
}

.container {
  width: 450px;
  height: 450px;
  background: #98d3fc;
  border: 1px solid #98d3fc;
  /* margin: 100px auto; */
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

.item {
  width: 140px;
  height: 140px;
  border: 2px solid #fff;
  position: relative;
}

.item:nth-of-type(5) {
  cursor: pointer;
}

.item img {
  width: 100%;
  height: 100%;
}

.item p {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  text-align: center;
  line-height: 20px;
  position: absolute;
  left: 0;
  bottom: 0;
}

.active {
  border: 2px solid red;
  box-shadow: 2px 2px 30px #fff;
}
</style>
