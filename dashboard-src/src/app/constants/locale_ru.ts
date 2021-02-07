import {registerLocale, setDefaultLocale} from "react-datepicker";
import ru from "date-fns/locale/ru";

registerLocale('ru', ru)

export default function buildLocalizeFn(args) {
    return function (dirtyIndex, dirtyOptions) {
        var options = dirtyOptions || {}

        var context = options.context ? String(options.context) : 'standalone'

        var valuesArray
        if (context === 'formatting' && args.formattingValues) {
            const defaultWidth = args.defaultFormattingWidth || args.defaultWidth
            const width = options.width ? String(options.width) : defaultWidth
            valuesArray =
                args.formattingValues[width] || args.formattingValues[defaultWidth]
        } else {
            const defaultWidth = args.defaultWidth
            const width = options.width ? String(options.width) : args.defaultWidth
            valuesArray = args.values[width] || args.values[defaultWidth]
        }
        var index = args.argumentCallback
            ? args.argumentCallback(dirtyIndex)
            : dirtyIndex
        return valuesArray[index]
    }
}

const monthValues = {
    narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
    abbreviated: ['янв.', 'фев.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
    wide: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
};

const formattingMonthValues = {
    narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
    abbreviated: ['янв.', 'фев.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
    wide: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']
};

ru.localize.month = buildLocalizeFn({
    values: monthValues,
    defaultWidth: 'wide',
    formattingValues: formattingMonthValues,
    defaultFormattingWidth: 'wide'
})

setDefaultLocale("ru")

export const ru_RU = ru

export const getStatusName = (status: String) => {
    return [
        {v: 'ALL', c: 'все'},
        {v: 'PENDING', c: 'ожидание'},
        {v: 'BOOKED', c: 'забронировано'},
        {v: 'DECLINED', c: 'отменено'},
    ].filter(s => s.v === status)
        .map(s => s.c)
        .pop()

}
