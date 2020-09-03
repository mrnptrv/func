import * as Cookies from "js-cookie";
import {AuthAPIApi} from "../../api";

export const authApi = () => {
    let accessToken = getAccessToken()

    return new AuthAPIApi({
        basePath: "http://localhost/api",
        accessToken: accessToken
    })
}

const getAccessToken = () => {
    return Cookies.get("func_ut")
}

export const saveAccessToken = (accessToken) => {
    Cookies.set("func_ut", accessToken)
}