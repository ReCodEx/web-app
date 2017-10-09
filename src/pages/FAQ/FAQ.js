import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactMarkdown from 'react-remarkable';

import PageContent from '../../components/layout/PageContent';
import withLinks from '../../hoc/withLinks';

const FAQ_MD_URI = 'https://raw.githubusercontent.com/wiki/ReCodEx/wiki/FAQ.md';

class FAQ extends Component {
  state = {
    faqText: ''
  };

  componentDidMount() {
    fetch(FAQ_MD_URI)
      .then(res => res.text())
      .then(text => this.setState({ faqText: text }));
  }

  render() {
    const { links: { FAQ_URI } } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id="app.faq.title" defaultMessage="FAQ" />}
        description={
          <FormattedMessage
            id="app.faq.description"
            defaultMessage="ReCodEx FAQ"
          />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.faq.title" defaultMessage="FAQ" />,
            iconName: 'blind',
            link: FAQ_URI
          }
        ]}
      >
        <ReactMarkdown source={this.state.faqText} />
      </PageContent>
    );
  }
}

FAQ.propTypes = {
  links: PropTypes.object.isRequired
};

export default withLinks(FAQ);
