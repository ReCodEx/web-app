import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab, Well } from 'react-bootstrap';

import ExternalLinkPreview from '../ExternalLinkPreview';
import Icon from '../../icons';
import Markdown from '../../widgets/Markdown';
import { knownLocales } from '../../../helpers/localizedData';

import './LocalizedTexts.css';

const LocalizedTexts = (
  { locales = [], noLocalesMessage = null },
  { lang = 'en' }
) => {
  const localeTabs = knownLocales
    .map(locale => locales.find(l => l.locale === locale))
    .filter(
      tabData => tabData && (tabData.text || tabData.link || tabData.stuentHint)
    );

  if (localeTabs.length === 0) {
    return noLocalesMessage
      ? <div className="callout callout-info">
          {noLocalesMessage}
        </div>
      : null;
  }

  return (
    <Tabs
      defaultActiveKey={
        localeTabs.find(({ locale }) => locale === lang) ||
        localeTabs.length === 0
          ? lang
          : localeTabs[0].locale
      }
      className="nav-tabs-custom"
      id="localized-texts"
    >
      {localeTabs.map(({ locale, text, link = '', studentHint = null }, i) =>
        <Tab key={i} eventKey={locale} title={locale}>
          {link &&
            link !== '' &&
            <div>
              <Well>
                <h4>
                  <FormattedMessage
                    id="app.localizedTexts.externalLink"
                    defaultMessage="The description is located beyond the realms of ReCodEx"
                  />
                </h4>
                <Icon icon="link" gapRight />
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link}
                </a>
              </Well>
              <ExternalLinkPreview url={link} />
            </div>}

          {text.trim() !== '' && <Markdown source={text} />}

          {!text.trim() &&
            !link &&
            <div className="callout callout-warning em-margin">
              <FormattedMessage
                id="app.localizedTexts.noText"
                defaultMessage="There is no text nor link for given localization. The exercise is not fully specified yet."
              />
            </div>}

          {studentHint &&
            studentHint !== '' &&
            <div>
              <hr />
              <h4>
                <FormattedMessage
                  id="app.localizedTexts.studentHintHeading"
                  defaultMessage="Hint"
                />
              </h4>
              <Markdown source={studentHint} />
            </div>}
        </Tab>
      )}
    </Tabs>
  );
};

LocalizedTexts.contextTypes = {
  lang: PropTypes.string
};

LocalizedTexts.propTypes = {
  locales: PropTypes.arrayOf(
    PropTypes.shape({
      locale: PropTypes.string.isRequried,
      text: PropTypes.string.isRequried
    })
  ),
  noLocalesMessage: PropTypes.any
};

export default LocalizedTexts;
