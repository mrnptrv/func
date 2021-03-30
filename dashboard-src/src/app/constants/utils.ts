import format from "date-fns/format";

export const formatDate = (d: string) => {
    if (d) {
        let date = new Date(d)
        if (format(date, "HH:mm") === "00:00") {
            return format(date, "yyyy-MM-dd")
        }
        return format(date, "yyyy-MM-dd HH:mm")
    }
    return ""
}

export const formatPhone = (newValue) => {
    newValue = newValue.replace(new RegExp("[^0-9]", "g"), "")


    let formattedValue = "+" + newValue.slice(0, 1)

    if (newValue.length > 1) {
        formattedValue += " (" + newValue.slice(1, 4)
    }

    if (newValue.length > 4) {
        formattedValue += ") " + newValue.slice(4, 7)
    }

    if (newValue.length > 7) {
        formattedValue += "-" + newValue.slice(7, 9)
    }

    if (newValue.length > 9) {
        formattedValue += "-" + newValue.slice(9, 11)
    }
    return formattedValue;
}

