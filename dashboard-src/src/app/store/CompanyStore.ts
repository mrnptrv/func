import {action, observable} from "mobx";
import {Company} from "app/api";
import {companyApi} from "app/constants";

class CompanyStore {
    @observable companies: Array<Company> = new Array<Company>();
    @observable selectedCompany: Company = null

    constructor() {
        this.load()
    }

    load() {
        companyApi().getCompanyListUsingPOST(null).then(r => {
            this.companies = r.data
        })
    }

    @action
    select(pubId) {
        this.selectedCompany = this.companies.find(l => l.pubId === pubId)
    }

    selectedCompanyPubId() {
        return this.selectedCompany && this.selectedCompany.pubId
    }
}

export const COMPANY_STORE = new CompanyStore()
