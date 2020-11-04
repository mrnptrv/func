import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {assetsApi} from "app/constants/api";
import {Asset, BookedAsset} from "../../../api";
import ReactDatePicker from "react-datepicker";
import {AssetItem} from "app/components/AssetItem";
import {bookingApi} from "../../../../../dashboard-src/src/app/constants";
import * as moment from 'moment';
import {ru_RU} from "app/constants/locale_ru";


class AssetListData {
    @observable bookingDate: Date = new Date()
    @observable capacityFilter = "all"
    @observable isLoading = true
    @observable error = ""
    @observable assets: Array<Asset> = new Array<Asset>()
    @observable bookedAssets: Array<BookedAsset> = new Array<BookedAsset>()
}


@observer
export class AssetListContainer extends React.Component<any, any> {
    private data = new AssetListData()

    constructor(props: any, context: any) {
        super(props, context);
        this.load();
    }


    private load() {
        this.data.isLoading = true
        this.data.bookedAssets = []
        this.data.assets = []

        let assets : Array<Asset> = new Array<Asset>()

        assetsApi().assetsListUsingPOST({
            capacityFilter: this.data.capacityFilter
        }).then((response) => {
            assets = response.data
        }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }
            this.data.isLoading = false;
        }).then(() => {
            bookingApi().findBookedAssetsUsingPOST({
                date: (moment(this.data.bookingDate)).format("yyyy-MM-DD")
            }).then(r => {
                this.data.isLoading = false
                this.data.bookedAssets = r.data
                this.data.assets = assets
            }).catch(error => {
                if (error && error.response && error.response.data.message) {
                    this.data.error = error.response.data.message
                }

                this.data.isLoading = false;
            })
        })
    }

    private onChangeCapacityFilter = e => {
        this.data.capacityFilter = e.target.value
        this.load()
    }

    render() {
        return (
            <div className="page-main__container container">
                <section className="top">
                    <h1 className="top__headline headline">Аренда переговорных комнат</h1>
                    <p className="top__text text">Переговорные комнаты арендуются и оплачиваются за час нерезидентами
                        коворкинга. Резиденты же fun(c) имеют безлимитный доступ ко всем переговоркам. Поэтому иногда
                        выгоднее купить день в коворкинге за 500 рублей и сесть в переговорку. День в коворкинге, кроме
                        переговорок, включает бесплатный кофе/снеки, пользование кафетерием, не фиксированное рабочее
                        место, спортзал, душевые.</p>
                    <div className="top__filters">
                        <div className="top__group group">
                            <ReactDatePicker
                                dateFormat="dd MMMM, yyyy"
                                className="top__input top__input--select input input--select"
                                placeholderText="Дата"
                                selected={this.data.bookingDate}
                                locale={ru_RU}
                                onChange={(d: Date) => {
                                    this.data.bookingDate = d;
                                    this.load();
                                }}/>
                            <label className="top__label label" htmlFor="filter-date">Дата</label>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4.5 6.5L8 10L11.5 6.5" stroke="#333333" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="top__group group">
                            <select className="top__input top__input--select input input--select" id="filter-people"
                                    value={this.data.capacityFilter}
                                    onChange={this.onChangeCapacityFilter}
                            >
                                <option value="all">Все переговорки</option>
                                <option value="6-">До 6 человек</option>
                                <option value="10-">До 10 человек</option>
                                <option value="10+">От 10 человек</option>
                            </select>
                            <label className="top__label label" htmlFor="filter-people">Количество людей</label>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4.5 6.5L8 10L11.5 6.5" stroke="#333333" strokeWidth="2"/>
                            </svg>
                        </div>
                    </div>
                </section>

                {this.data.assets.map((a, i) =>
                    <AssetItem
                        key={a.pubId}
                        asset={a}
                        bookingDate={this.data.bookingDate}
                        bookedAsset={this.data.bookedAssets}
                    />
                )}
            </div>
        );
    }
}
