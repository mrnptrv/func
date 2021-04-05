import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import jsonp from "jsonp";
import {getLocation, locationApi, saveLocation} from "app/constants";
import {Location} from "app/api";

class LocationData {
    @observable isOpeningModal = false
    @observable locations: Array<Location> = new Array<Location>()
    @observable selected: Location = null
    @observable selectMode: boolean = false;
}


@observer
export class LocationTile extends React.Component<any, any> {
    private data = new LocationData()

    constructor(props: any, context: any) {
        super(props, context);
        this.getLocation()
    }

    getLocation = () => {
        let me = this
        jsonp('http://api.ipstack.com/check?access_key=3f3444331f2d7e5dd69d5bfe393d9df9', null, function (err, data) {
            let geoCity = null
            if (err) {
                console.error(err.message);
            } else {
                geoCity = data.city;
            }

            let city = getLocation()

            if (!city) {
                city = geoCity
            }

            locationApi().getLocationListUsingPOST("").then(r => {
                me.data.locations = r.data
                me.data.selected = me.data.locations.find(l => l.pubId.toUpperCase() === city.toUpperCase())
            })
        });
    }

    selectLocation = (l) => {
        return () => {
            saveLocation(l.pubId)
            getLocation()
            this.data.selectMode = false
        }
    }

    render() {
        return (
            <>
                <div>
                    <div onClick={() => this.data.selectMode = !this.data.selectMode}>
                        {this.data.selected?.name}
                    </div>
                    {this.data.selectMode ?
                        < >
                            {this.data.locations.map(l =>
                                <div key={l.pubId}
                                     onClick={this.selectLocation(l)}
                                >
                                    {l.name}
                                </div>
                            )}
                        </>
                        : <></>
                    }
                </div>
            </>
        );
    }

}
