import * as React from 'react';
// import * as style from "./style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {assetsApi} from "app/constants/api";
import {Asset, WorkTimeRange} from "app/api/api";
import {Alert, Button, Dropdown, DropdownButton, Form, InputGroup, Spinner} from "react-bootstrap";

const WORK_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]

class AssetCreateData {
    @observable error = ""
    @observable asset: Asset = {
        description: "",
        imageUrls: new Array<string>(),
        name: "",
        pubId: "",
        type: "MEETING_ROOM",
        workTimeRanges: new Array<WorkTimeRange>(),
        capacity : 0
    }
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class AssetCreateContainer extends React.Component<any, any> {
    private data = new AssetCreateData()

    cancel = () => {
        this.props.history.push("/dashboard/list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        assetsApi().createUsingPOST({
            type: this.data.asset.type,
            name: this.data.asset.name,
            description: this.data.asset.description,
            workTimeRanges: this.data.asset.workTimeRanges,
            imageUrls: this.data.asset.imageUrls,
            capacity: this.data.asset.capacity
        }).then((r) => {
            this.data.isSaving = false
            this.props.history.push("/dashboard/asset/" + r.data.pubId)
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

    addWorkTimeRange = () => {
        this.data.asset.workTimeRanges.push({
            start: "00:00",
            end: "00:00",
            price: "0.00",
            isWeekend: false
        })
    }

    addImageUrl = () => {
        this.data.asset.imageUrls.push("")
    }

    private setWeekend(wtr: WorkTimeRange, isWeekend: boolean) {
        return () => {
            wtr.isWeekend = isWeekend
        }
    }

    private setStartWorkTime(wtr: WorkTimeRange, h: number) {
        return () => {
            wtr.start = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private setEndWorkTime(wtr: WorkTimeRange, h: number) {
        return () => {
            wtr.end = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private deleteWorkTimeRange(wtr: WorkTimeRange) {
        return () => {
            this.data.asset.workTimeRanges = this.data.asset.workTimeRanges.filter(w => wtr != w)
        };
    }

    private deleteImageUrl(index: number) {
        return () => {
            let arr = this.data.asset.imageUrls.slice(0)
            arr.splice(index, 1)
            this.data.asset.imageUrls = arr
        };
    }

    render() {
        return (
            <div>
                <MainMenu/>

                <h4>New Asset</h4>

                <Form>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Name"
                            value={this.data.asset.name}
                            onChange={(e) => this.data.asset.name = e.target.value}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            placeholder="Description"
                            rows={3}
                            value={this.data.asset.description}
                            onChange={(e) => this.data.asset.description = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Control
                            type="capacity"
                            placeholder="Capacity"
                            value={this.data.asset.capacity}
                            onChange={(e) => this.data.asset.capacity = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>
                            Work Time
                            <Button
                                variant="light"
                                onClick={this.addWorkTimeRange}
                            > + </Button>
                        </Form.Label>

                        {this.data.asset.workTimeRanges.map(wtr =>
                            <InputGroup className="mb-3">
                                <DropdownButton
                                    as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={wtr.isWeekend ? "weekend " : "workday "}
                                >
                                    <Dropdown.Item onClick={this.setWeekend(wtr, false)}>
                                        workday
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={this.setWeekend(wtr, true)}>
                                        weekend
                                    </Dropdown.Item>
                                </DropdownButton>
                                <DropdownButton
                                    as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={wtr.start}
                                    id="input-group-dropdown-1"
                                >
                                    {WORK_HOURS.map(h =>
                                        <Dropdown.Item onClick={this.setStartWorkTime(wtr, h)}>
                                            {h < 10 ? "0" + h : h}:00
                                        </Dropdown.Item>
                                    )}
                                </DropdownButton>
                                <DropdownButton
                                    as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={wtr.end}
                                    id="input-group-dropdown-1"
                                >
                                    {WORK_HOURS.map(h =>
                                        <Dropdown.Item onClick={this.setEndWorkTime(wtr, h)}>
                                            {h < 10 ? "0" + h : h}:00
                                        </Dropdown.Item>
                                    )}
                                </DropdownButton>
                                <Form.Control
                                    aria-describedby="basic-addon1"
                                    value={wtr.price}
                                    onChange={(e) => {
                                        wtr.price = e.target.value
                                    }}
                                />
                                <InputGroup.Append>
                                    <Button variant="outline-secondary"
                                            onClick={this.deleteWorkTimeRange(wtr)}
                                    >X</Button>
                                </InputGroup.Append>
                            </InputGroup>
                        )}
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>
                            Image URLs
                            <Button
                                variant="light"
                                onClick={this.addImageUrl}
                            > + </Button>
                        </Form.Label>
                        {this.data.asset.imageUrls.map((imageURL, index) =>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    aria-describedby="basic-addon1"
                                    value={imageURL}
                                    onChange={(e) => {
                                        this.data.asset.imageUrls[index] = e.target.value
                                    }}
                                />
                                <InputGroup.Append>
                                    <Button variant="outline-secondary"
                                            onClick={this.deleteImageUrl(index)}
                                    >X</Button>
                                </InputGroup.Append>
                            </InputGroup>
                        )}

                    </Form.Group>
                    <Form.Group>
                        {this.data.error &&
                        <Alert variant="danger">
                            {this.data.error}
                            {this.data.fieldErrors.length &&
                            (<ul>{this.data.fieldErrors.map(e => <li>{e}</li>)}</ul>)
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
