/*
 * @Author: N0ts
 * @Date: 2023-03-02 15:53:15
 * @Description: vue config
 * @FilePath: /chat-gpt/vue.config.js
 * @Mail：mail@n0ts.cn
 */

const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        host: "0.0.0.0",
        // https:true,
        port: 6103,
        client: {
            webSocketURL: "ws://0.0.0.0:6103/ws"
        },
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }
});
