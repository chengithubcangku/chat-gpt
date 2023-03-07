/*
 * @Author: N0ts
 * @Date: 2023-03-07 11:43:13
 * @Description: 主题色配置
 * @FilePath: /chat-gpt/src/utils/themeUtil.ts
 * @Mail：mail@n0ts.cn
 */

import { ref } from "vue";

const themeCache = ref<any>("");

function setLocalStorage(theme: string) {
    window.localStorage.setItem("n0ts-chatgpt-theme", theme);
    themeCache.value = theme;
}

function load() {
    const cache = window.localStorage.getItem("n0ts-chatgpt-theme");
    if (!cache) {
        setLocalStorage("light");
    } else {
        themeCache.value = cache;
    }
    document.documentElement.setAttribute("theme", cache || "light");
}

function switchTheme() {
    themeCache.value = window.localStorage.getItem("n0ts-chatgpt-theme");
    themeCache.value = themeCache.value === "light" ? "dark" : "light";
    setLocalStorage(themeCache.value);
    load();
}

export default {
    switchTheme,
    load,
    themeCache
};
