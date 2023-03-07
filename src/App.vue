<!--
 * @Author: N0ts
 * @Date: 2023-03-02 15:53:15
 * @Description: ChatGPT
 * @FilePath: /chat-gpt/src/App.vue
 * @Mail：mail@n0ts.cn
-->
<template>
    <div id="chatgpt">
        <div id="sidebar" :class="{ sideBarShow: sideBarShow }">
            <div id="chats">
                <div class="btn" @click="newClient">新建会话</div>
                <div class="list">
                    <div
                        v-for="(item, index) in clients"
                        :key="index"
                        @click="clientsIndex = index"
                        :class="{ active: clientsIndex == index }"
                    >
                        <p>{{ item.name }}</p>
                        <span @click.stop="removeClient(index)">删除</span>
                    </div>
                </div>
            </div>
            <div id="showBtn" @click="sideBarShow = !sideBarShow">
                {{ sideBarShow ? "收起" : "展开" }}
            </div>
            <div id="bottom">
                <div class="btn" @click="themeUtil.switchTheme">
                    {{
                        themeUtil.themeCache.value == "light"
                            ? "暗色模式"
                            : "亮色模式"
                    }}
                </div>
                <div class="btn" @click="reloadConfig">重置配置</div>
            </div>
        </div>
        <div id="main">
            <div id="messages" v-if="clients[clientsIndex]">
                <div
                    v-for="(item, index) in clients[clientsIndex].contents"
                    :key="index"
                >
                    <div class="img">
                        <div v-if="item.role == 'user'" class="user">Me</div>
                        <div v-else class="ai">AI</div>
                    </div>
                    <div
                        class="content"
                        v-if="item.role == 'assistant'"
                        v-html="marked.parse(item.content)"
                    ></div>
                    <div v-else class="content">
                        <p>{{ item.content }}</p>
                    </div>
                </div>
                <div v-if="loading">
                    <div class="img">
                        <img
                            src="https://chat.openai.com/apple-touch-icon.png"
                            alt="chatgpt"
                        />
                    </div>
                    <div class="content loading"></div>
                </div>
                <div id="stretch"></div>
            </div>
            <div v-else id="home">
                <div>
                    <p>ChatGPT By:N0ts</p>
                    <div class="content">
                        <p>
                            开源地址（求 star）：<a
                                href="https://gitee.com/n0ts/chat-gpt"
                                target="_blank"
                                >Gitee</a
                            >
                        </p>
                        <p>瞎写一通，功能简单所以代码较臭</p>
                        <p>本项目纯前端自娱自乐，不会保存任何数据</p>
                        <p>
                            技术交流：<a
                                href="https://jq.qq.com/?_wv=1027&k=Mh7ah6Dd"
                                >坚果小栈</a
                            >
                        </p>
                    </div>
                </div>
            </div>
            <div id="input">
                <textarea
                    v-model="message"
                    @keydown="keydown"
                    @keyup="keyup"
                    :style="{ height: textareaHeight + 'px' }"
                ></textarea>
            </div>
        </div>
    </div>

    <DialogCom title="输入 key" :show="okKeyDialog">
        <template #center>
            <p>请在下方输入你的 key</p>
            <p>
                申请地址：<a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                    >点我</a
                >
            </p>
            <input v-model="key" @keydown.enter="okKey" />
            <p class="tips">
                key 会保存在本地浏览器(localStorage)中，只供本地使用
            </p>
        </template>
        <template #bottom>
            <button class="success" @click="okKey">提交</button>
        </template>
    </DialogCom>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import axios from "axios";
import DialogCom from "@/components/dialogCom.vue";
import messageUtil from "@/utils/messageUtil";
import { marked } from "marked";
import hljs from "highlight.js";
import Clipboard from "clipboard";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";
import themeUtil from "@/utils/themeUtil";

// key
const cacheKey = window.localStorage.getItem("chatgpt-key");
const key = ref(cacheKey ? cacheKey : "");
// 输入 key dialog
const okKeyDialog = ref(key.value == "");

// 获取聊天窗口 dom
let messageDom: Element | null = null;
// Viewer
let viewer: any = null;

onMounted(() => {
    viewer = new Viewer(document.querySelector("#main") as HTMLElement);
    messageDom = document.querySelector("#messages");
    themeUtil.load();
});

/**
 * 确认 key
 */
function okKey() {
    if (key.value == "") {
        return messageUtil({
            type: "warning",
            content: "key 不能为空"
        });
    }

    window.localStorage.setItem("chatgpt-key", key.value);
    okKeyDialog.value = false;
    messageUtil({
        type: "success",
        content: "key 存储成功，开始提问吧"
    });
}

// 是否正在加载
const loading = ref(false);

/**
 * 提交问题
 */
async function submit() {
    loading.value = true;
    await axios({
        method: "post",
        url: "https://node.fatshady.cn/cors",
        timeout: 600000,
        data: {
            method: "POST",
            url: "https://api.openai.com/v1/chat/completions",
            data: {
                model: "gpt-3.5-turbo",
                messages: clients[clientsIndex.value].contents
            },
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${key.value}`
            }
        }
    })
        .then((res: any) => {
            if (res.data.status == 400) {
                throw res.data;
            }

            pushResult(res.data);
        })
        .catch((err) => {
            pushResult(
                null,
                `网络请求错误，请联系站长排查！错误内容：
                    \`\`\`${JSON.stringify(err.msg)}\`\`\``
            );
            if (err.msg?.error?.code == "invalid_api_key") {
                messageUtil({
                    type: "danger",
                    content: `key 错误，请重新输入`
                });
                window.localStorage.removeItem("chatgpt-key");
                okKeyDialog.value = true;
                key.value = "";
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

/**
 * 存入数据
 */
function pushResult(res: any, errContent?: string) {
    // 塞入显示数据，role 为 assistant
    clients[clientsIndex.value].contents.push({
        role: "assistant",
        content: errContent ? errContent : res.data.choices[0].message.content
    });
    hljsInit();
    window.localStorage.setItem("message-data", JSON.stringify(clients));
    scrollToBottom();
    console.log(
        "🚀 对话结果： | clients[clientsIndex.value].contents:",
        clients[clientsIndex.value].contents
    );
}

// 消息框内容
const message = ref("");

/**
 * 发送消息
 */
function send() {
    if (message.value == "" || message.value.trim() == "" || loading.value) {
        return;
    }

    // 没有对话时
    if (clientsIndex.value == -1) {
        clients.unshift({
            name: "",
            contents: []
        });
        clientsIndex.value = 0;
    }

    // 内容存入回话
    clients[clientsIndex.value].contents.push({
        role: "user",
        content: message.value
    });

    // 第一句对话修改标题
    if (clients[clientsIndex.value].contents.length == 1) {
        const cacheName = message.value;
        clients[clientsIndex.value].name = cacheName;
        document.title = cacheName + " | ChatGPT";
    }

    window.localStorage.setItem("message-data", JSON.stringify(clients));

    // 清空输入框
    message.value = "";

    scrollToBottom();
    submit();
}

/**
 * 滚动到底部
 */
async function scrollToBottom() {
    await nextTick();
    messageDom = document.querySelector("#messages");
    if (messageDom) {
        const childrens = messageDom.children;
        let height = 0;
        if (childrens[childrens.length - 1]) {
            height += childrens[childrens.length - 1].clientHeight;
        }
        if (childrens[childrens.length - 2]) {
            height += childrens[childrens.length - 2].clientHeight;
        }
        messageDom.scrollTo({
            top: messageDom.scrollHeight - height
        });
    } else {
        scrollToBottom();
    }
}

// shift 是否按住
let shiftDown = false;

/**
 * 消息框键盘按下
 */
function keydown(event: KeyboardEvent) {
    // shift 是否按下
    if (event.keyCode === 16) {
        shiftDown = true;
    }
    // shift 不按住与 enter 按下，则发送
    if (!shiftDown && event.keyCode === 13) {
        send();
        event.preventDefault();
        return false;
    }
}

/**
 * 消息框键盘抬起
 */
function keyup(event: KeyboardEvent) {
    // shift 是否取消按下
    if (event.keyCode === 16) {
        shiftDown = false;
    }
}

// 消息框高度
const textareaHeight = ref(24);

// 监听消息框内容变化改变高度
watch(
    () => message.value,
    () => {
        // 根据换行符计算高度
        const lines = message.value.split("\n").length;
        textareaHeight.value = lines * 24;
    }
);

// 消息列表
interface IMessage {
    role: "user" | "assistant";
    content: string;
}
// 回话列表
interface IClient {
    name: string;
    contents: Array<IMessage>;
}
const cacheClients = window.localStorage.getItem("message-data");
const clients: Array<IClient> = reactive(
    cacheClients ? JSON.parse(cacheClients) : []
);
const clientsIndex = ref(-1);

// 会话索引切换
watch(
    () => clientsIndex.value,
    async () => {
        if (clients[clientsIndex.value]) {
            document.title = clients[clientsIndex.value].name + " | ChatGPT";
            hljsInit();
            scrollToBottom();
            await nextTick();
            viewer.update();
        }
    }
);

/**
 * 创建新会话
 */
function newClient() {
    window.localStorage.setItem("message-data", JSON.stringify(clients));
    clients.unshift({
        name: `新会话`,
        contents: []
    });
    message.value = "";
    clientsIndex.value = 0;
}

/**
 * 删除会话
 */
function removeClient(i: number) {
    // 删除会话
    clients.splice(i, 1);
    clientsIndex.value = -1;
    window.localStorage.setItem("message-data", JSON.stringify(clients));
}

/**
 * 代码高亮
 */
async function hljsInit() {
    await nextTick();
    const dom: any = [];
    document.querySelectorAll("#messages pre code").forEach((el1: Element) => {
        const el = el1 as HTMLElement;
        if (!el.className.includes("hljs")) {
            const copyBtn = document.createElement("div");
            copyBtn.className = "copyBtn";
            copyBtn.innerHTML = "复制";
            copyBtn.setAttribute("code", el.innerText);
            copyBtn.addEventListener("click", (e) => {
                copyCode(e);
            });
            el.parentElement?.appendChild(copyBtn);
            hljs.highlightElement(el);
            dom.push(el);
        }
    });
    addCodeNum(dom);
}

/**
 * 添加代码行号
 */
function addCodeNum(dom: any) {
    for (let i = 0; i < dom.length; i++) {
        const enter = dom[i].innerHTML.replace(/\n/g, "</li><li>");
        dom[i].innerHTML = `<ol><li>${enter}</li></ol>`.replace(
            "<li></li></ol>",
            "</ol>"
        );
    }
}

// 侧边栏显示
const sideBarShow = ref(false);

/**
 * 复制代码块
 */
function copyCode(el: MouseEvent) {
    const code = (el.target as HTMLElement).getAttribute("code");
    if (code) {
        Clipboard.copy(code);
        messageUtil({
            type: "success",
            content: "复制成功"
        });
    }
}

/**
 * 重置配置
 */
function reloadConfig() {
    window.localStorage.removeItem("message-data");
    window.localStorage.removeItem("chatgpt-key");
    window.location.reload();
}
</script>

<style scoped lang="less">
@import url("https://cdn.bootcdn.net/ajax/libs/firacode/6.2.0/fira_code.min.css");

#chatgpt {
    height: 100%;
    display: flex;
    background-color: var(--background-color-1);
    color: var(--text-color);
    font-size: 0.9rem;

    > div {
        width: 100%;
    }

    #sidebar {
        width: 350px;
        height: 100%;
        background-color: #202123;
        position: relative;
        left: 0;
        top: 0;
        z-index: 1;
        color: white;

        .btn {
            border: 1px solid #ffffff33;
            padding: 10px 0 10px 30px;
            margin-bottom: 10px;
            border-radius: 5px;
            cursor: pointer;

            &:hover {
                background-color: #2b2c2f;
            }
        }

        #chats {
            padding: 10px;

            .list {
                margin-top: 10px;

                > div {
                    padding: 10px 0 10px 30px;
                    overflow: hidden;
                    margin-bottom: 10px;
                    position: relative;
                    border-radius: 5px;

                    p {
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        cursor: pointer;
                        overflow: hidden;
                        width: 70%;
                    }

                    span {
                        font-size: 0.8rem;
                        color: gray;
                        opacity: 0;
                        visibility: hidden;
                        position: absolute;
                        right: 20px;
                        top: 50%;
                        transform: translate(10px, -50%);
                        cursor: pointer;

                        &:hover {
                            color: red;
                        }
                    }

                    &:hover {
                        background-color: #2b2c2f;
                    }

                    &:hover span {
                        opacity: 1;
                        visibility: visible;
                        transform: translate(0, -50%);
                    }
                }

                .active {
                    background-color: #2b2c2f;
                }
            }
        }

        #showBtn {
            position: absolute;
            top: 10%;
            right: 0;
            transform: translateX(100%);
            padding: 10px 15px;
            background-color: #202123;
            cursor: pointer;
            z-index: 1;
            user-select: none;
            visibility: hidden;
        }

        #bottom {
            border-top: 1px solid #ffffff33;
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 10px 10px 0;
            box-sizing: border-box;

            .btn {
                border: none;
            }
        }
    }

    .sideBarShow {
        transform: translateX(0) !important;
    }

    #main {
        position: relative;

        #input {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 20%;
            display: flex;
            justify-content: center;
            background-image: linear-gradient(
                to bottom,
                transparent,
                var(--background-color-2) 40%
            );
            padding-top: 50px;
            box-sizing: border-box;

            textarea {
                position: absolute;
                left: 50%;
                bottom: 30%;
                transform: translateX(-50%);
                width: 80%;
                border-radius: 6px;
                border: 1px solid var(--background-color-1);
                background: var(--background-color-1);
                outline: none;
                resize: none;
                padding: 15px 20px;
                color: var(--text-color);
                max-height: 150px;
                overflow-y: auto;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                font-size: 1rem;

                &::-webkit-scrollbar {
                    width: 8px;
                    height: 1px;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    box-shadow: none;
                    background: #565868;
                }

                &::-webkit-scrollbar-track {
                    box-shadow: none;
                    border-radius: 10px;
                    background: transparent;
                }
            }
        }

        #messages {
            height: 100%;
            overflow-y: auto;

            &::-webkit-scrollbar {
                width: 10px;
                height: 1px;
            }

            &::-webkit-scrollbar-thumb {
                border-radius: 10px;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                background: #444653;
            }

            &::-webkit-scrollbar-track {
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                border-radius: 10px;
                background: var(--background-color-1);
            }

            #stretch {
                height: 15%;
            }

            > div:nth-child(odd) {
                background-color: var(--background-color-1);
            }

            > div:nth-child(even) {
                background-color: var(--background-color-2);
            }

            > div {
                padding: 20px 100px;
                display: flex;
                flex-wrap: nowrap;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);

                .img {
                    border-radius: 5px;
                    min-width: 40px;
                    width: 40px;
                    height: 40px;
                    overflow: hidden;
                    user-select: none;
                    color: white;

                    div {
                        height: 100%;
                        text-align: center;
                        line-height: 40px;
                        font-size: 1.1rem;
                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                    }

                    .user {
                        background-color: #81679f;
                    }

                    .ai {
                        background-color: #679f92;
                    }
                }
            }

            .content {
                padding-left: 20px;
                flex: 1;
            }

            .loading {
                &::after {
                    content: "";
                    display: block;
                    width: 8px;
                    height: 14px;
                    background-color: white;
                    animation: flicker 0.8s infinite ease-in-out;
                }

                @keyframes flicker {
                    0% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
            }
        }

        #home {
            height: 100%;
            display: flex;
            justify-content: center;
            text-align: center;
            align-items: center;

            > div {
                transform: translateY(-150px);

                > p {
                    font-size: 2rem;
                    margin-bottom: 20px;
                }

                .content {
                    a {
                        color: rgb(0, 174, 255);
                    }
                }
            }
        }
    }
}

@media screen and (max-width: 1200px) {
    #sidebar {
        position: absolute !important;
        transform: translateX(-100%);

        #showBtn {
            visibility: visible !important;
        }
    }

    #messages {
        > div {
            padding: 20px 50px !important;
        }
    }
}

@media screen and (max-width: 700px) {
    #messages {
        > div {
            padding: 20px 20px !important;
        }
    }

    #chats .list > div span {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateX(0) !important;
        color: red !important;
    }
}

@media screen and (max-width: 450px) {
    #messages {
        > div {
            padding: 10px !important;
        }
    }
}
</style>
