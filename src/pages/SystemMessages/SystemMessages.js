import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';

import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import PageContent from '../../components/layout/PageContent';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { fetchAllMessages, createMessage, editMessage } from '../../redux/modules/systemMessages';
import { fetchManyStatus, readySystemMessagesSelector } from '../../redux/selectors/systemMessages';
import Box from '../../components/widgets/Box/Box';
import { AddIcon, EditIcon } from '../../components/icons';
import EditSystemMessageForm from '../../components/forms/EditSystemMessageForm/EditSystemMessageForm';
import { getLocalizedTextsInitialValues, transformLocalizedTextsFormData } from '../../helpers/localizedData';
import moment from 'moment';
import MessagesList from '../../components/SystemMessages/MessagesList/MessagesList';
import DeleteSystemMessageButtonContainer from '../../containers/DeleteSystemMessageButtonContainer';

const localizedTextDefaults = {
  text: '',
};

const createMewMessageInitialValues = () => ({
  localizedTexts: getLocalizedTextsInitialValues([], localizedTextDefaults),
  groupsIds: [],
  id: undefined,
  type: 'success',
  role: 'student',
  visibleFrom: moment(),
  visibleTo: moment().add(1, 'week').endOf('day'),
});

const getMessageInitialValues = message => {
  const processedData = Object.assign({}, message, {
    visibleFrom: moment.unix(message.visibleFrom),
    visibleTo: moment.unix(message.visibleTo),
    localizedTexts: getLocalizedTextsInitialValues(message.localizedTexts, localizedTextDefaults),
  });
  return processedData;
};

const transformMessageFormData = data =>
  Object.assign({}, data, {
    visibleFrom: moment(data.visibleFrom).unix(),
    visibleTo: moment(data.visibleTo).unix(),
    localizedTexts: transformLocalizedTextsFormData(data.localizedTexts),
  });

class SystemMessages extends Component {
  state = {
    isOpen: false,
    createNew: false,
    message: createMewMessageInitialValues(),
  };

  formReset = () => this.setState({ isOpen: false, message: createMewMessageInitialValues() });

  static loadAsync = (params, dispatch) => dispatch(fetchAllMessages());

  componentDidMount = () => this.props.loadAsync();

  render() {
    const {
      fetchStatus,
      createMessage,
      editMessage,
      systemMessages,
      intl: { locale },
    } = this.props;

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
            }>
            <>
              <Box
                title={<FormattedMessage id="app.systemMessages.listTitle" defaultMessage="System Messages" />}
                unlimitedHeight>
                <>
                  <MessagesList
                    systemMessages={systemMessages}
                    renderActions={message => (
                      <TheButtonGroup>
                        <Button
                          size="xs"
                          variant="warning"
                          onClick={() => {
                            this.setState({
                              isOpen: true,
                              createNew: false,
                              message: getMessageInitialValues(message),
                            });
                          }}>
                          <EditIcon gapRight />
                          <FormattedMessage id="generic.edit" defaultMessage="Edit" />
                        </Button>
                        <DeleteSystemMessageButtonContainer
                          id={message.id}
                          size="xs"
                          locale={locale /* Hack to force re-rendering when locale changes */}
                        />
                      </TheButtonGroup>
                    )}
                  />
                  <hr className="no-margin" />
                  <p className="em-margin-top text-center">
                    <Button onClick={() => this.setState({ isOpen: true, createNew: true })} variant="success">
                      <AddIcon gapRight />
                      <FormattedMessage id="app.systemMessages.newSystemMessage" defaultMessage="New System Message" />
                    </Button>
                  </p>
                </>
              </Box>

              <EditSystemMessageForm
                createNew={this.state.createNew}
                initialValues={this.state.message}
                isOpen={this.state.isOpen}
                onClose={() => this.formReset()}
                onSubmit={data =>
                  this.state.message.id
                    ? editMessage(this.state.message.id, data).then(() => this.formReset())
                    : createMessage(data).then(() => this.formReset())
                }
              />
            </>
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
  intl: PropTypes.object.isRequired,
};

export default connect(
  state => ({
    fetchStatus: fetchManyStatus(state),
    systemMessages: readySystemMessagesSelector(state),
  }),
  dispatch => ({
    loadAsync: () => SystemMessages.loadAsync({}, dispatch),
    createMessage: data => dispatch(createMessage(transformMessageFormData(data))),
    editMessage: (id, data) => dispatch(editMessage(id, transformMessageFormData(data))),
  })
)(injectIntl(SystemMessages));
