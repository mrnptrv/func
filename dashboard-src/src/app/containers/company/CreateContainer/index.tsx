import * as React from 'react';
// import * as style from "./style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {companyApi} from "app/constants/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";

class CompanyCreateData {
    @observable error = ""
    @observable name = ""
    @observable address = ""
    @observable details = ""
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class CompanyCreateContainer extends React.Component<any, any> {
    private data = new CompanyCreateData()

    cancel = () => {
        this.props.history.push("/dashboard/company/list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        companyApi().createCompanyUsingPOST({
            name: this.data.name,
            address: this.data.address,
            details: this.data.details,
        }).then((r) => {
            this.data.isSaving = false
            this.props.history.push("/dashboard/edit-company/" + r.data.pubId)
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


    render() {
        return (
            <div>
                <MainMenu/>

                <h4>New Company</h4>

                <Form>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Name"
                            value={this.data.name}
                            onChange={(e) => this.data.name = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            placeholder="Address"
                            rows={3}
                            value={this.data.address}
                            onChange={(e) => this.data.address = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            placeholder="Details"
                            rows={3}
                            value={this.data.details}
                            onChange={(e) => this.data.details = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        {this.data.error &&
                        <Alert variant="danger">
                            {this.data.error}
                            {
                            (<ul>{this.data.fieldErrors.map((e,i) => <li key={i}>{e}</li>)}</ul>)
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
            </div>
        );
    }

}
