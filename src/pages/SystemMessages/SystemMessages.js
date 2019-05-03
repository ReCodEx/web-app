import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';

import PageContent from '../../components/layout/PageContent';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { fetchAllMessages, createMessage, editMessage } from '../../redux/modules/systemMessages';
import { fetchManyStatus, readySystemMessagesSelector } from '../../redux/selectors/systemMessages';
import Box from '../../components/widgets/Box/Box';
import { AddIcon, EditIcon } from '../../components/icons';
import EditSystemMessageForm from '../../components/forms/EditSystemMessageForm/EditSystemMessageForm';
import { getLocalizedTextsInitialValues } from '../../helpers/localizedData';
import moment from 'moment';
import MessagesList from '../../components/SystemMessages/MessagesList/MessagesList';
import DeleteSystemMessageButtonContainer from '../../containers/DeleteSystemMessageButtonContainer';

const localizedTextDefaults = {
  text: '',
};

const messageInitialValues = () => ({
  localizedTexts: getLocalizedTextsInitialValues([], localizedTextDefaults),
  groupsIds: [],
  id: undefined,
});

const messageToForm = message => {
  const processedData = Object.assign({}, message, {
    visibleFrom: new Date(message.visibleFrom * 1000),
    visibleTo: new Date(message.visibleTo * 1000),
  });
  processedData.localizedTexts.forEach((value, index) => {
    if (value.text) {
      processedData.localizedTexts[index]['_enabled'] = true;
    }
  });
  return processedData;
};

const messageToSubmit = data =>
  Object.assign({}, data, {
    visibleFrom: moment(data.visibleFrom).unix(),
    visibleTo: moment(data.visibleTo).unix(),
  });

class SystemMessages extends Component {
  state = {
    isOpen: false,
    message: messageInitialValues(),
  };

  formReset = () => this.setState({ isOpen: false, message: messageInitialValues() });

  static loadAsync = (params, dispatch) => Promise.all([dispatch(fetchAllMessages)]);

  componentWillMount() {
    this.props.loadAsync();
  }

  render() {
    const { fetchStatus, createMessage, editMessage, systemMessages } = this.props;

    return (
      <FetchManyResourceRenderer
        fetchManyStatus={fetchStatus}
        loading={
          <PageContent
            title={<FormattedMessage id="app.systemMessages.loading" defaultMessage="Loading all system messages..." />}
            description={
              <FormattedMessage
                id="app.systemMessages.loadingDescription"
                defaultMessage="Please wait while we are getting the list of all system messages ready."
              />
            }
          />
        }
        failed={
          <PageContent
            title={
              <FormattedMessage
                id="app.systemMessages.failed"
                defaultMessage="Cannot load the list of system messages"
              />
            }
            description={
              <FormattedMessage
                id="app.systemMessages.failedDescription"
                defaultMessage="We are sorry for the inconvenience, please try again later."
              />
            }
          />
        }>
        {() => (
          <PageContent
            title={<FormattedMessage id="app.systemMessages.title" defaultMessage="System Messages" />}
            description={
              <FormattedMessage
                id="app.systemMessages.description"
                defaultMessage="Browse and manage all system messages"
              />
            }
            breadcrumbs={[
              {
                text: <FormattedMessage id="app.systemMessages.title" defaultMessage="System Messages" />,
                iconName: 'flag',
              },
            ]}>
            <React.Fragment>
              <Box
                title={<FormattedMessage id="app.systemMessages.listTitle" defaultMessage="System Messages" />}
                unlimitedHeight
                noPadding
                footer={
                  <p className="em-margin-top text-center">
                    <Button onClick={() => this.setState({ isOpen: true })} bsStyle="success">
                      <AddIcon gapRight />
                      <FormattedMessage id="app.systemMessages.newSystemMessage" defaultMessage="New System Message" />
                    </Button>
                  </p>
                }>
                <MessagesList
                  systemMessages={systemMessages}
                  renderActions={message => (
                    <React.Fragment>
                      <Button
                        bsSize="xs"
                        bsStyle="warning"
                        onClick={() => {
                          this.setState({ isOpen: true, message: messageToForm(message) });
                        }}>
                        <EditIcon gapRight />
                        <FormattedMessage id="generic.edit" defaultMessage="Edit" />
                      </Button>
                      <DeleteSystemMessageButtonContainer id={message.id} bsSize="xs" />
                    </React.Fragment>
                  )}
                />
              </Box>
              <EditSystemMessageForm
                initialValues={this.state.message}
                isOpen={this.state.isOpen}
                onClose={() => this.formReset()}
                onSubmit={data =>
                  this.state.message.id
                    ? editMessage(this.state.message.id, data).then(() => this.formReset())
                    : createMessage(data).then(() => this.formReset())
                }
              />
            </React.Fragment>
          </PageContent>
        )}
      </FetchManyResourceRenderer>
    );
  }
}

SystemMessages.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  fetchStatus: PropTypes.string,
  createMessage: PropTypes.func,
  editMessage: PropTypes.func,
  systemMessages: PropTypes.array.isRequired,
};

export default connect(
  state => ({
    fetchStatus: fetchManyStatus(state),
    systemMessages: readySystemMessagesSelector(state),
  }),
  dispatch => ({
    loadAsync: () => SystemMessages.loadAsync({}, dispatch),
    createMessage: data => dispatch(createMessage(messageToSubmit(data))),
    editMessage: (id, data) => dispatch(editMessage(id, messageToSubmit(data))),
  })
)(SystemMessages);
