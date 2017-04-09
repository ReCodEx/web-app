import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Alert, Tabs, Tab } from 'react-bootstrap';
import Button from '../../AdminLTE/FlatButton';
import Confirm from '../Confirm';
import { AddIcon, WarningIcon } from '../../Icons';
import { MarkdownTextAreaField, LanguageSelectField } from '../Fields';

class LocalizedTextsFormField extends Component {
  state = { localeTab: 0 };
  changeTab = n => this.setState({ localeTab: n });

  render() {
    const {
      fields,
      localizedTexts = []
    } = this.props;

    return (
      <div>
        <p>
          <Button
            bsStyle="success"
            bsSize="sm"
            onClick={() => {
              fields.push();
              this.changeTab(fields.length);
            }}
          >
            <AddIcon />
            {' '}
            <FormattedMessage
              id="app.editAssignmentForm.addLanguage"
              defaultMessage="Add language variant"
            />
          </Button>
        </p>
        {fields.length > 0 &&
          <Tabs
            id="localized-assignments"
            className="nav-tabs-custom"
            activeKey={this.state.localeTab}
            onSelect={this.changeTab}
          >
            {fields.map((localized, i) => (
              <Tab
                key={i}
                eventKey={i}
                title={
                  localizedTexts &&
                    localizedTexts[i] &&
                    localizedTexts[i].locale
                    ? localizedTexts[i].locale
                    : <FormattedMessage
                        id="app.editAssignmentForm.newLocale"
                        defaultMessage="New language"
                      />
                }
              >
                <Field
                  name={`${localized}.locale`}
                  component={LanguageSelectField}
                  label={
                    <FormattedMessage
                      id="app.editAssignmentForm.localized.locale"
                      defaultMessage="The language:"
                    />
                  }
                />

                <Field
                  name={`${localized}.text`}
                  component={MarkdownTextAreaField}
                  label={
                    <FormattedMessage
                      id="app.editAssignmentForm.localized.assignment"
                      defaultMessage="Description for the students:"
                    />
                  }
                />

                <hr />
                <p className="text-center">
                  <Confirm
                    id={`remove-locale-${i}`}
                    question={
                      <FormattedMessage
                        id="app.editAssignmentForm.localized.reallyRemoveQuestion"
                        defaultMessage="Do you really want to delete the assignmenet in this language?"
                      />
                    }
                    onConfirmed={() => {
                      fields.remove(i);
                      this.changeTab(Math.min(i, fields.length - 2));
                    }}
                  >
                    <Button bsStyle="default">
                      <WarningIcon />
                      {' '}
                      <FormattedMessage
                        id="app.editAssignmentForm.localized.remove"
                        defaultMessage="Remove this language"
                      />
                    </Button>
                  </Confirm>
                </p>
              </Tab>
            ))}
          </Tabs>}

        {fields.length === 0 &&
          <Alert bsStyle="warning">
            <FormattedMessage
              id="app.editAssignmentForm.localized.noLanguage"
              defaultMessage="There is currently no text in any language for this assignment."
            />
          </Alert>}
      </div>
    );
  }
}

LocalizedTextsFormField.propTypes = {
  fields: PropTypes.object,
  localizedTexts: PropTypes.array
};

export default LocalizedTextsFormField;
