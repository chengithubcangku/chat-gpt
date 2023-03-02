interface IType {
    type: "success" | "warning" | "danger" | "info";
    content: string;
}

let index = 0;

function message(type: IType) {
    const bodyDom = document.querySelector("body");
    console.log("🚀 | bodyDom:", bodyDom);
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
