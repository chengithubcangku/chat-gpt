/*
 * @Author: N0ts
 * @Date: 2023-03-03 08:59:14
 * @Description: messageUtil
 * @FilePath: /chat-gpt/src/utils/messageUtil.ts
 * @Mail：mail@n0ts.cn
 */

interface IType {
    type: "success" | "warning" | "danger" | "info";
    content: string;
}

let index = 0;

function message(type: IType) {
    const bodyDom = document.querySelector("body");
    const div = document.createElement("div");
    div.id = "messageBox";
    div.className = `messageBox-${++index}`;
    div.innerHTML = `<div class="${type.type}">${type.content}</div>`;
    bodyDom?.appendChild(div);

    setTimeout(() => {
        index--;
        div.remove();
    }, 3000);
}

export default message;
