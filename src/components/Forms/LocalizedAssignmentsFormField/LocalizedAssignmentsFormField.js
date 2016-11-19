import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Alert, Button, Tabs, Tab } from 'react-bootstrap';
import Confirm from '../Confirm';
import { AddIcon, WarningIcon } from '../../Icons';
import {
  TextField,
  MarkdownTextAreaField,
  LanguageSelectField
} from '../Fields';

class LocalizedAssignmentsFormField extends Component {

  state = { localeTab: 0 };
  changeTab = (n) => this.setState({ localeTab: n });

  render() {
    const {
      fields,
      localizedAssignments = []
    } = this.props;

    return (
      <div>
        <p>
          <Button bsStyle='success' className='btn-flat' bsSize='sm' onClick={() => { fields.push(); this.changeTab(fields.length); }}>
            <AddIcon /> <FormattedMessage id='app.editAssignmentForm.addLanguage' defaultMessage='Add language variant' />
          </Button>
        </p>
        {fields.length > 0 && (
          <Tabs
            id='localized-assignments'
            className='nav-tabs-custom'
            activeKey={this.state.localeTab}
            onSelect={this.changeTab}>
            {fields.map((localized, i) => (
              <Tab key={i} eventKey={i} title={
                (localizedAssignments && localizedAssignments[i])
                  ? localizedAssignments[i].locale
                  : <FormattedMessage id='app.editAssignmentForm.newLocale' defaultMessage='New language' />
              }>
                <Field
                  name={`${localized}.locale`}
                  component={LanguageSelectField}
                  label={<FormattedMessage id='app.editAssignmentForm.localized.locale' defaultMessage='The language:' />} />

                <Field
                  name={`${localized}.name`}
                  component={TextField}
                  label={<FormattedMessage id='app.editAssignmentForm.localized.name' defaultMessage='Assignment name:' />} />

                <Field
                  name={`${localized}.description`}
                  component={MarkdownTextAreaField}
                  label={<FormattedMessage id='app.editAssignmentForm.localized.assignment' defaultMessage='Assignment and description for the students:' />} />

                <hr />
                <p className='text-center'>
                  <Confirm
                    id={`remove-locale-${i}`}
                    question={<FormattedMessage id='app.editAssignmentForm.localized.reallyRemoveQuestion' defaultMessage='Do you really want to delete the assignmenet in this language?' />}
                    onConfirmed={() => { fields.remove(i); this.changeTab(Math.min(i, fields.length - 2)); }}>
                    <Button bsStyle='default'>
                      <WarningIcon /> <FormattedMessage id='app.editAssignmentForm.localized.remove' defaultMessage='Remove this language' />
                    </Button>
                  </Confirm>
                </p>
              </Tab>
            ))}
          </Tabs>
        )}

        {fields.length === 0 && (
          <Alert bsStyle='warning'>
            <FormattedMessage id='app.editAssignmentForm.localized.noLanguage' defaultMessage='There is currently no text in any language for this assignment.' />
          </Alert>
        )}
      </div>
    );
  }
}

LocalizedAssignmentsFormField.propTypes = {
  fields: PropTypes.object,
  localizedAssignments: PropTypes.array
};

export default LocalizedAssignmentsFormField;
