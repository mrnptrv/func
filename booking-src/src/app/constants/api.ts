import * as Cookies from "js-cookie";
import {AssetsApi, AuthAPIApi, BookingApi} from "../../api";

const BASE_URL = "/api"

export const authApi = () => {
    let accessToken = getAccessToken()

    return new AuthAPIApi({
        basePath: BASE_URL,
        accessToken: accessToken
    })
}

export const assetsApi = () => {
    let accessToken = getAccessToken()

    return new AssetsApi({
        basePath: BASE_URL,
        accessToken: accessToken
    })
}

export const bookingApi = () => {
    let accessToken = getAccessToken()

    return new BookingApi({
        basePath: BASE_URL,
        accessToken: accessToken
    })
}

const getAccessToken = () => {
    return Cookies.get("func_ut")
}

export const saveAccessToken = (accessToken) => {
    Cookies.set("func_ut", accessToken)
}