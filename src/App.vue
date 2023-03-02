<!--
 * @Author: N0ts
 * @Date: 2023-03-02 15:53:15
 * @Description: ChatGPT
 * @FilePath: /chat-gpt/src/App.vue
 * @Mail：mail@n0ts.cn
-->
<template>
    <div id="chatgpt">
        <div id="sidebar">
            <div id="chats">
                <div class="btn">新建会话</div>
                <div class="list">
                    <div>test</div>
                </div>
            </div>
        </div>
        <div id="main">
            <div id="messages">
                <div v-for="(item, index) in showData" :key="index">
                    <div class="img">
                        <img
                            v-if="item.role == 'user'"
                            src="https://q1.qlogo.cn/g?b=qq&nk=1656071287&s=640"
                            alt="You"
                        />
                        <img
                            v-else
                            src="https://chat.openai.com/apple-touch-icon.png"
                            alt="chatgpt"
                        />
                    </div>
                    <div class="content">{{ item.content }}</div>
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import axios from "axios";

let messageDom: Element | null = null;
onMounted(() => {
    messageDom = document.querySelector("#messages");
});

const key = ref("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");
const messages: any = reactive([]);
const showData: any = reactive([
    {
        role: "user",
        content: "上海有多大\n"
    },
    {
        role: "assistant",
        content:
            "\n\n上海是中国的一个直辖市，面积为7,037平方千米，是中国第二大城市和全球人口最多的城市之一。上海市辖区面积为6,341平方千米。"
    },
    {
        role: "user",
        content: "真的嘛，为什么呢\n"
    },
    {
        role: "assistant",
        content:
            "是的，上海是中国第一大城市，面积为6340.5平方千米，人口约2400万。上海是中国的一个经济、金融、贸易、航运、科技、文化、教育中心，也是一个国际大都市。"
    },
    {
        role: "user",
        content: "上海有多大\n"
    },
    {
        role: "assistant",
        content:
            "\n\n上海是中国的一个直辖市，面积为7,037平方千米，是中国第二大城市和全球人口最多的城市之一。上海市辖区面积为6,341平方千米。"
    },
    {
        role: "user",
        content: "真的嘛，为什么呢\n"
    },
    {
        role: "assistant",
        content:
            "是的，上海是中国第一大城市，面积为6340.5平方千米，人口约2400万。上海是中国的一个经济、金融、贸易、航运、科技、文化、教育中心，也是一个国际大都市。"
    },
    {
        role: "user",
        content: "上海有多大\n"
    },
    {
        role: "assistant",
        content:
            "\n\n上海是中国的一个直辖市，面积为7,037平方千米，是中国第二大城市和全球人口最多的城市之一。上海市辖区面积为6,341平方千米。"
    },
    {
        role: "user",
        content: "真的嘛，为什么呢\n"
    },
    {
        role: "assistant",
        content:
            "是的，上海是中国第一大城市，面积为6340.5平方千米，人口约2400万。上海是中国的一个经济、金融、贸易、航运、科技、文化、教育中心，也是一个国际大都市。"
    },
    {
        role: "user",
        content: "上海有多大\n"
    },
    {
        role: "assistant",
        content:
            "\n\n上海是中国的一个直辖市，面积为7,037平方千米，是中国第二大城市和全球人口最多的城市之一。上海市辖区面积为6,341平方千米。"
    },
    {
        role: "user",
        content: "真的嘛，为什么呢\n"
    },
    {
        role: "assistant",
        content:
            "是的，上海是中国第一大城市，面积为6340.5平方千米，人口约2400万。上海是中国的一个经济、金融、贸易、航运、科技、文化、教育中心，也是一个国际大都市。"
    },
    {
        role: "user",
        content: "上海有多大\n"
    },
    {
        role: "assistant",
        content:
            "\n\n上海是中国的一个直辖市，面积为7,037平方千米，是中国第二大城市和全球人口最多的城市之一。上海市辖区面积为6,341平方千米。"
    },
    {
        role: "user",
        content: "真的嘛，为什么呢\n"
    },
    {
        role: "assistant",
        content:
            "是的，上海是中国第一大城市，面积为6340.5平方千米，人口约2400万。上海是中国的一个经济、金融、贸易、航运、科技、文化、教育中心，也是一个国际大都市。"
    }
]);
const loading = ref(false);
async function submit() {
    loading.value = true;
    const { data } = await axios({
        method: "post",
        url: "https://api.openai.com/v1/chat/completions",
        headers: {
            Authorization: `Bearer ${key.value}`
        },
        data: {
            model: "gpt-3.5-turbo",
            messages
        },
        timeout: 30000
    });
    showData.push({
        role: "assistant",
        content: data.choices[0].message.content
    });
    loading.value = false;
    console.log("🚀 对话结果： | showData:", showData);
}

const message = ref("");
async function send() {
    messages.push({
        role: "user",
        content: message.value
    });
    showData.push({
        role: "user",
        content: message.value
    });
    message.value = "";
    await nextTick();
    if (messageDom) {
        messageDom.scrollTo({
            top: messageDom.scrollHeight
        });
    }
    // submit();
}

let shiftDown = false;
function keydown(event: KeyboardEvent) {
    if (event.keyCode === 16) {
        shiftDown = true;
    }
    if (!shiftDown && event.keyCode === 13) {
        send();
        event.preventDefault();
        return false;
    }
}

function keyup(event: KeyboardEvent) {
    if (event.keyCode === 16) {
        shiftDown = false;
    }
}

const textareaHeight = ref(24);
watch(
    () => message.value,
    () => {
        // 根据换行符计算高度
        const lines = message.value.split("\n").length;
        textareaHeight.value = lines * 24;
    }
);
</script>

<style scoped lang="less">
#chatgpt {
    height: 100%;
    display: flex;
    background-color: #343540;
    color: white;
    font-size: 0.9rem;

    > div {
        width: 100%;
    }

    #sidebar {
        width: 350px;
        background-color: #202123;

        #chats {
            padding: 10px;

            div {
                border-radius: 5px;
            }

            .btn {
                border: 1px solid #ffffff33;
                padding: 10px 0 10px 30px;

                &:hover {
                    background-color: #2b2c2f;
                }
            }

            .list {
                margin-top: 10px;

                > div {
                    padding: 10px 0 10px 30px;
                    cursor: pointer;

                    &:hover {
                        background-color: #2b2c2f;
                    }
                }
            }
        }
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
                rgba(52, 53, 64, 0.05),
                #343540 40%
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
                border: 1px solid #343540;
                background: #40414e;
                outline: none;
                resize: none;
                padding: 15px 20px;
                color: white;
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
                background: #343540;
            }

            #stretch {
                height: 15%;
                background-color: #34353f;
            }

            > div:nth-child(odd) {
                background-color: #343540;
            }

            > div:nth-child(even) {
                background-color: #444653;
            }

            > div {
                padding: 20px 100px;
                display: flex;
                flex-wrap: nowrap;

                .img {
                    border-radius: 5px;
                    min-width: 40px;
                    width: 40px;
                    height: 40px;
                    overflow: hidden;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
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
    }
}
</style>
