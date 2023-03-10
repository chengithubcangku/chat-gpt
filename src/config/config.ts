/*
 * @Author: N0ts
 * @Date: 2023-03-07 16:58:59
 * @Description: config
 * @FilePath: /chat-gpt/src/config/config.ts
 * @Mail：mail@n0ts.cn
 */

import { ref } from "vue";

export default {
    key: "",
    data: {
        model: "gpt-3.5-turbo"
    },
    system: "",
    max_token: 4096
};
