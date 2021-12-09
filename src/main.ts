import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";

import ECharts from "vue-echarts";
import { use } from "echarts/core";

// import ECharts modules manually to reduce bundle size
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  PieChart,
  TitleComponent,
  LegendComponent,
]);

axios.defaults.baseURL = "https://restcountries.com/v3.1/";

createApp(App)
  .use(store)
  .use(router)
  .component("v-chart", ECharts)
  .mount("#app");
