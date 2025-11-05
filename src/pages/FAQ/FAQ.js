import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import PageContent from '../../components/layout/PageContent';
import Markdown from '../../components/widgets/Markdown';
import { FaqIcon, LoadingIcon } from '../../components/icons';
import { getConfigVar } from '../../helpers/config.js';
import Callout from '../../components/widgets/Callout/Callout.js';

import './FAQ.css';

const FAQ_MD_URI = getConfigVar('FAQ_URI') || 'https://raw.githubusercontent.com/wiki/ReCodEx/wiki/FAQ.md';

class FAQ extends Component {
  state = {
    faqText: null,
  };

  fetchFaq = () => {
    const {
      intl: { locale },
    } = this.props;

    const url =
      typeof FAQ_MD_URI === 'string'
        ? FAQ_MD_URI
        : typeof FAQ_MD_URI !== 'object'
          ? null
          : FAQ_MD_URI[locale] || FAQ_MD_URI.en || Object.values(FAQ_MD_URI)[0] || null;

    if (!url) {
      this.setState({ faqText: false });
    } else {
      this.setState({ faqText: null });
      fetch(url)
        .then(res => res.text())
        .then(text => this.setState({ faqText: text }));
    }
  };

  componentDidMount() {
    this.fetchFaq();
  }

  render() {
    return (
      <PageContent
        icon={<FaqIcon />}
        title={<FormattedMessage id="app.faq.title" defaultMessage="Frequently Asked Questions" />}>
        <>
          <hr className="mt-0" />
          {this.state.faqText === null && (
            <div className="my-3">
              <LoadingIcon gapRight={2} />
              <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
            </div>
          )}

          {this.state.faqText === false && (
            <Callout variant="warning">
              <FormattedMessage
                id="app.faq.loadError"
                defaultMessage="FAQ content could not be loaded. Possibly due to the misconfiguration of the application."
              />
            </Callout>
          )}

          {this.state.faqText && (
            <div className="my-4 recodex-faq">
              <Markdown source={this.state.faqText} />
            </div>
          )}
        </>
      </PageContent>
    );
  }
}

FAQ.propTypes = {
  intl: PropTypes.object.isRequired,
};

export default injectIntl(FAQ);
