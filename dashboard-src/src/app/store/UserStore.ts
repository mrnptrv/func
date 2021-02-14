import {action, observable} from "mobx";
import {UserLite} from "app/api";
import {userApi} from "app/constants";
import {CHANGE_LOCATION_TOPIC, LOCATION_STORE} from "app/store/LocationStore";
import {eventBus, subscribe} from 'mobx-event-bus2'

class UserStore {
    @observable users: Array<UserLite> = new Array<UserLite>();
    @observable selectedUser: UserLite = null;
    private locationId: string = ""
    private selectedUserId: string = ""

    constructor() {
        eventBus.register(this)
    }

    @subscribe(CHANGE_LOCATION_TOPIC)
    changeLocationLister() {
        this.loadUsers().then(() => {
        })
    }

    @action
    clear() {
        this.selectedUser = null
        this.selectedUserId = null
    }

    @action
    loadUsers(): Promise<void> {
        this.locationId = LOCATION_STORE.selectedLocationPubId();
        return userApi().getUserListUsingPOST({
            locationPubId: this.locationId,
        }).then(r => {
            this.users = r.data
            this.select(this.selectedUserId, false)
        })

    }

    selectedId(): string {
        return this.selectedUserId
    }

    @action
    select(pubId, riseEvent = true) {
        let selected = this.users.find(l => l.pubId === pubId)
        if (selected) {
            this.selectedUser = selected
        } else {
            this.selectedUser = null
        }
        this.selectedUserId = pubId

        if (riseEvent) {
            eventBus.post(CHANGE_SELECTED_USER_TOPIC, pubId)
        }
    }
}

export const USER_STORE = new UserStore()
export const CHANGE_SELECTED_USER_TOPIC = 'changeSelectedUser'
