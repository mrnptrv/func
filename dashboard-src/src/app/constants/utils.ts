
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
