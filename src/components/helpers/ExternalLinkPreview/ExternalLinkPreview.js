import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import OnOffCheckbox from '../../forms/OnOffCheckbox';
import { LoadingIcon } from '../../icons';
import Markdown from '../../widgets/Markdown';
import InsetPanel from '../../widgets/InsetPanel';
import Callout from '../../widgets/Callout';

class ExternalLinkPreview extends Component {
  state = {
    url: null,
    pending: false,
    error: null,
    text: null,
    isMarkdown: false,
  };

  toggleIsMarkdown = () => {
    this.setState({
      isMarkdown: !this.state.isMarkdown,
    });
  };

  fetchPreview = urlRaw => {
    // normalize url
    const url = urlRaw.trim().replace(/#.*$/, '');

    if (url === this.state.url) {
      return;
    }

    this.setState({
      url,
      pending: true,
      error: null,
      text: null,
    });

    fetch(url, { mode: 'cors' })
      .then(resp => {
        if (url !== this.state.url) {
          return; // url was changed whilst fetch was resolved (no longer valid result)
        }

        // Was the fetch successful?
        if (resp.status !== 200) {
          this.setState({
            pending: false,
            error: (
              <FormattedMessage
                id="app.externalLinkPreview.httpFailed"
                defaultMessage="Unable to download the referred content. The link may be invalid."
              />
            ),
          });
          return;
        }

        // Is the contents text-based?
        const contentType = resp.headers.get('Content-Type');
        if (!contentType.startsWith('text/')) {
          this.setState({
            pending: false,
            error: (
              <FormattedMessage
                id="app.externalLinkPreview.noTextContent"
                defaultMessage='Only plain text and Markdown contents can be previewed here. The link refers to a \"{contentType}\" content.'
                values={{ contentType }}
              />
            ),
          });
          return;
        }

        const isMarkdown =
          contentType.indexOf('markdown') > 0 || (contentType.startsWith('text/plain') && url.endsWith('.md'));

        return resp
          .text()
          .then(text => this.setState({ pending: false, text, isMarkdown }))
          .catch(() =>
            this.setState({
              pending: false,
              error: (
                <FormattedMessage
                  id="app.externalLinkPreview.readingTextFailed"
                  defaultMessage="Internal error occurred. We are stating this in passive voice to avoid any responsibility."
                />
              ),
            })
          );
      })
      .catch(() => {
        if (url === this.state.url) {
          this.setState({
            pending: false,
            error: (
              <FormattedMessage
                id="app.externalLinkPreview.fetchFailed"
                defaultMessage="The download has failed. Either the network has malfunctioned or CSP prevented us from reaching the content."
              />
            ),
          });
        }
      });
  };

  componentDidUpdate() {
    if (this.state.url !== this.props.url) {
      this.fetchPreview(this.props.url);
    }
  }

  render() {
    const { url, pending, error, text, isMarkdown } = this.state;
    return url !== null ? (
      <div>
        {text && (
          <OnOffCheckbox checked={isMarkdown} onChange={this.toggleIsMarkdown} className="float-end">
            <FormattedMessage id="app.externalLinkPreview.showAsMarkdown" defaultMessage="Show as markdown" />
          </OnOffCheckbox>
        )}

        {(!text || !isMarkdown) && (
          <h3>
            <FormattedMessage id="app.externalLinkPreview.title" defaultMessage="Preview" />
          </h3>
        )}

        {pending && (
          <InsetPanel>
            <LoadingIcon gapRight={2} />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </InsetPanel>
        )}

        {error && <Callout variant="warning">{error}</Callout>}

        {text && <div>{isMarkdown ? <Markdown source={text} /> : <pre style={{ marginTop: '20px' }}>{text}</pre>}</div>}
      </div>
    ) : (
      <div />
    );
  }
}

ExternalLinkPreview.propTypes = {
  url: PropTypes.string.isRequired,
};

export default ExternalLinkPreview;
