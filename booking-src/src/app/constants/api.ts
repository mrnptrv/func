import * as Cookies from "js-cookie";
import {AssetsApi, AuthAPIApi, BookingApi, LocationApi, PaymentPlanApi, UserApi} from "app/api";

const BASE_URL = ""

export const authApi = () => {
    return new AuthAPIApi(getConfiguration())
}

export const userApi = () => {
    return new UserApi(getConfiguration())
}

export const locationApi = () => {
    return new LocationApi(getConfiguration())
}

export const assetsApi = () => {
    return new AssetsApi(getConfiguration())
}

export const bookingApi = () => {
    return new BookingApi(getConfiguration())
}

export const paymentPlanApi = () => {
    return new PaymentPlanApi(getConfiguration())
}

const getConfiguration = () => {
    return {
        basePath: BASE_URL,
        accessToken: getAccessToken(),
        baseOptions: {
            headers: {
                "Accept-Language": "ru"
            }
        }
    }
}

const getAccessToken = () => {
    return Cookies.get("func_ut")
}

export const saveAccessToken = (accessToken) => {
    Cookies.set("func_ut", accessToken)
}

export const getLocation = () => {
    return Cookies.get("func_location")
}

export const saveLocation = (location) => {
    Cookies.set("func_location", location)
}
