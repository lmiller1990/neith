import { createApp } from "vue";
import { createRouter } from "./router.js";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);
const router = createRouter();

app.use(router);
app.use(VueQueryPlugin)
app.mount("#root");
