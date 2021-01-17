import * as Cookies from "js-cookie";
import {CompanyApi, AssetsApi, AuthAPIApi, BookingApi, LocationApi, PaymentPlanApi, UserApi} from "app/api";

const BASE_URL = ""

export const authApi = () => {
    return new AuthAPIApi(getConfiguration())
}

export const userApi = () => {
    return new UserApi(getConfiguration())
}

export const assetsApi = () => {
    return new AssetsApi(getConfiguration())
}

export const locationApi = () => {
    return new LocationApi(getConfiguration())
}

export const companyApi = () => {
    return new CompanyApi(getConfiguration())
}

export const paymentPlanApi = () => {
    return new PaymentPlanApi(getConfiguration())
}

export const bookingApi = () => {
    return new BookingApi(getConfiguration())
}

const getConfiguration = () => {
    return {
        basePath: BASE_URL,
        accessToken: getAccessToken(),
        baseOptions: {
            headers: {
                "Accept-Language": "en_US"
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
