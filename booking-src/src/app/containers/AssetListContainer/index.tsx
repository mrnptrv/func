import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {assetsApi, authApi, bookingApi, locationApi} from "app/constants/api";
import ReactDatePicker from "react-datepicker";
import {AssetItem} from "app/components/AssetItem";
import * as moment from 'moment';
import {ru_RU} from "app/constants/locale_ru";
import {Asset, BookedAsset, UserLite} from "app/api";


class AssetListData {
    @observable bookingDate: Date = new Date()
    @observable capacityFilter = "all"
    @observable isLoading = true
    @observable error = ""
    @observable assets: Array<Asset> = new Array<Asset>()
    @observable bookedAssets: Array<BookedAsset> = new Array<BookedAsset>()
    @observable userLite: UserLite = null
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

        let assets: Array<Asset> = new Array<Asset>()
        let bookedAssets: Array<BookedAsset> = new Array<BookedAsset>()
        let userLite: UserLite = null

        locationApi().getLocationListUsingPOST().then(r => {
            return r.data.filter(l => {
                return l.path.toUpperCase() === this.props.match.params.id.toUpperCase()
            }).pop()
        }).then(l => {
            return assetsApi().assetsListUsingPOST({
                locationPubId: l.pubId,
                type: 'MEETING_ROOM',
                capacityFilter: this.data.capacityFilter
            })
        }).then((response) => {
            assets = response.data
        }).then(() => {
            return bookingApi().findBookedAssetsUsingPOST({
                date: (moment(this.data.bookingDate)).format("yyyy-MM-DD")
            })
        }).then(r => {
            bookedAssets = r.data
        }).then(() => {
            return authApi().getUsingGET1().then((r) => {
                userLite = r.data
            }).catch(error => {
                userLite = null
            })
        }).then(r => {
            this.data.userLite = userLite
            this.data.bookedAssets = bookedAssets
            this.data.assets = assets
            this.data.isLoading = false
        }).catch(error => {
            this.data.userLite = userLite
            this.data.bookedAssets = bookedAssets
            this.data.assets = assets
            this.data.isLoading = false

            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
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
                    <div className="top__info">
                      <p className="top__text text">Аренда переговорной комнаты в коворкинге fun(c)&nbsp;&mdash; это возможность провести собеседования, презентации, встречи с деловыми партнерами или тренинги в уютной и комфортной обстановке.</p>
                      <ul className="top__list list">
                        <li className="top__item text">Если вы не являетесь резидентом коворкинга fun(c), то у вас есть возможность аренды переговорной комнаты с почасовой оплатой в соответствии с приведенными ниже тарифами.</li>
                        <li className="top__item text">Если вы резидент, то у вас есть бесплатный доступ в переговорные комнаты в соответствии с правилами нашего коворкинга.</li>
                      </ul>
                    </div>
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
                                <option value="1-10">1-10 человек</option>
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
                        user={this.data.userLite}
                        bookingDate={this.data.bookingDate}
                        bookedAsset={this.data.bookedAssets}
                    />
                )}
            </div>
        );
    }
}
