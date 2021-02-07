import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {Button, Dropdown, DropdownButton, Modal, Spinner, Table} from "react-bootstrap";
import {companyApi} from "app/constants/api";
import {Company} from "app/api/api";
import {MainMenu} from "app/components";

class CompanyListData {
    @observable isLoading = true
    @observable error = ""
    @observable companies: Array<Company> = new Array<Company>()
    @observable isShowDeletionDialog = false;
    @observable deletionCompany: Company = null;

    @action
    deleteCompany(company) {
        companyApi().deleteCompanyUsingPOST({
            pubId: company.pubId
        }).then(() => {
            this.companies = this.companies.filter(a => a.pubId != company.pubId)
        }).catch(error => {
            console.log(error);
        })
    }
}

@observer
export class CompanyListContainer extends React.Component<any, any> {
    private data = new CompanyListData()

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isLoading = true
        companyApi().getCompanyListUsingPOST("").then(
            (response) => {
                this.data.companies = response.data
                this.data.isLoading = false
            }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    deleteCompany = () => {
        this.data.deleteCompany(this.data.deletionCompany)
        this.data.isShowDeletionDialog = false;
    }

    openDeletionDialog = (asset) => {
        return () => {
            this.data.deletionCompany = asset;
            this.data.isShowDeletionDialog = true
        }
    }

    hideDeletionDialog = () => {
        this.data.isShowDeletionDialog = false
        this.data.deletionCompany = null;
    }

    editCompany = (company) => {
        return () => {
            this.props.history.push("/dashboard/edit-company/" + company.pubId)
        }
    }

    newCompany = () => {
        this.props.history.push("/dashboard/create-company")
    }

    render() {
        const items = this.data.companies.map((company) =>
            <tr key={company.pubId}>
                <td>{company.name}</td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.editCompany(company)}>Редактировать</Dropdown.Item>
                        <Dropdown.Item onClick={this.openDeletionDialog(company)}>Удалить</Dropdown.Item>
                    </DropdownButton>
                </td>
            </tr>
        );
        return (
            <div>
                <MainMenu/>
                <h4>
                    Организации

                    <Button
                        variant="light"
                        onClick={this.newCompany}
                    > + </Button>
                </h4>
                <Table striped={true} bordered={true} hover>
                    <thead>
                    <tr>
                        <th>Название</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>
                    {this.data.isLoading ?
                        <tr>
                            <td colSpan={3}><Spinner size="sm" animation="grow"/></td>
                        </tr>
                        : items
                    }
                    </tbody>
                </Table>
                <Modal show={this.data.isShowDeletionDialog} onHide={this.hideDeletionDialog}>
                    <Modal.Header closeButton>
                        <Modal.Title>Удалить ораганизацию</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                            Организация "{this.data?.deletionCompany?.name}" будет удалена.
                            Продолжить?
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeletionDialog}>Нет</Button>
                        <Button variant="primary" onClick={this.deleteCompany}>Да</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
