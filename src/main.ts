import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router from "./router";
import App from "./App.vue";
import "./style.css";

// First create the Pinia instance
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Then create the app and register Pinia first
const app = createApp(App);

// Now create and provide the apiService AFTER Pinia is registered
import { apiService } from "./api/apiService";
app.provide("apiService", apiService);

// Complete the app setup
app.use(pinia)
   .use(router)
   .mount("#app");