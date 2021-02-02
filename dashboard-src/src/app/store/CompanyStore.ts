import {action, observable} from "mobx";
import {Company} from "app/api";
import {companyApi} from "app/constants";
import {eventBus} from "mobx-event-bus2";

class CompanyStore {
    @observable companies: Array<Company> = new Array<Company>();
    @observable selectedCompany: Company = null
    @observable selectedId: string = null

    constructor() {
    }

    load() {
        companyApi().getCompanyListUsingPOST(null).then(r => {
            this.companies = r.data
            this.select(this.selectedId)
        })
    }

    @action
    select(pubId) {
        this.selectedId = pubId
        this.selectedCompany = this.companies.find(l => l.pubId === pubId)

        eventBus.post(CHANGE_SELECTED_COMPANY_TOPIC, pubId)
    }

    selectedCompanyPubId() {
        return this.selectedId
    }
}

export const COMPANY_STORE = new CompanyStore()
export const CHANGE_SELECTED_COMPANY_TOPIC = 'changeSelectedCompany'
