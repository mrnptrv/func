import * as React from 'react';
import * as style from "../../style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {companyApi} from "app/constants/api";
import {Company} from "app/api/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";

class CompanyEditData {
    @observable isCompanyLoading = true
    @observable error = ""
    @observable company: Company = null
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class CompanyEditContainer extends React.Component<any, any> {
    private data = new CompanyEditData()

    cancel = () => {
        this.props.history.push("/dashboard/company-list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        companyApi().updateCompanyUsingPOST({
            pubId: this.data.company.pubId,
            name: this.data.company.name,
            address: this.data.company.address,
            details: this.data.company.details
        }).then(() => {
            this.data.isSaving = false
        }).catch((error) => {
            this.data.isSaving = false

            if (error && error.response && error.response.data && error.response.data.message) {
                this.data.error = error.response.data.message
            }


            if (error && error.response && error.response.data.errors) {
                this.data.fieldErrors = error.response.data.errors.map(e => e.messages).flat()
            }
        })
    }

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isCompanyLoading = true

        companyApi().getCompanyUsingGET(this.props.match.params.id)
            .then(res => {
                this.data.company = res.data
                this.data.isCompanyLoading = false
            })
            .catch(error => {
                this.data.isCompanyLoading = false

                if (error && error.response && error.response.data.message) {
                    this.data.error = error.response.data.message
                }
            })
    }

    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Company</h4>
                {this.data.isCompanyLoading ? <Spinner animation="grow"/> :
                    <Form className={style.editForm}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Name"
                                value={this.data.company.name}
                                onChange={(e) => this.data.company.name = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Control
                                as="textarea"
                                placeholder="Address"
                                rows={3}
                                value={this.data.company.address}
                                onChange={(e) => this.data.company.address = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Control
                                as="textarea"
                                placeholder="Details"
                                rows={3}
                                value={this.data.company.details}
                                onChange={(e) => this.data.company.details = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            {this.data.error &&
                            <Alert variant="danger">
                                {this.data.error}
                                {
                                    (<ul>{this.data.fieldErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>)
                                }
                            </Alert>
                            }
                        </Form.Group>
                        <Form.Group>
                            <Button
                                variant="light"
                                onClick={this.cancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={this.save}
                            >
                                Save
                                {this.data.isSaving &&
                                <Spinner animation="grow" as="span" size="sm" role="status"/>
                                }
                            </Button>
                        </Form.Group>
                    </Form>
                }
            </div>
        );
    }

}
