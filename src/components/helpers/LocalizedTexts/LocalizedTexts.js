import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab } from 'react-bootstrap';

import ExternalLinkPreview from '../ExternalLinkPreview';
import Icon from '../../icons';
import Markdown from '../../widgets/Markdown';
import InsetPanel from '../../widgets/InsetPanel';
import { knownLocales } from '../../../helpers/localizedData';
import { UrlContext } from '../../../helpers/contexts';

import './LocalizedTexts.css';

const LocalizedTexts = ({ locales = [], noLocalesMessage = null }) => {
  const localeTabs = knownLocales
    .map(locale => locales.find(l => l.locale === locale))
    .filter(tabData => tabData && (tabData.text || tabData.link || tabData.studentHint));

  if (localeTabs.length === 0) {
    return noLocalesMessage ? <div className="callout callout-info">{noLocalesMessage}</div> : null;
  }

  return (
    <UrlContext.Consumer>
      {({ lang = 'en' }) => (
        <Tabs
          defaultActiveKey={
            localeTabs.find(({ locale }) => locale === lang) || localeTabs.length === 0 ? lang : localeTabs[0].locale
          }
          className="nav-tabs-custom"
          id="localized-texts">
          {localeTabs.map(({ locale, text, link = '', studentHint = null }, i) => (
            <Tab key={i} eventKey={locale} title={locale}>
              {link && link !== '' && (
                <div>
                  <InsetPanel>
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
                  </InsetPanel>
                  <ExternalLinkPreview url={link} />
                </div>
              )}

              {text.trim() !== '' && <Markdown source={text} />}

              {!text.trim() && !link && (
                <div className="callout callout-warning em-margin">
                  <FormattedMessage
                    id="app.localizedTexts.noText"
                    defaultMessage="There is no text nor link for given localization. The exercise is not fully specified yet."
                  />
                </div>
              )}

              {studentHint && studentHint !== '' && (
                <div>
                  <hr />
                  <h4>
                    <FormattedMessage id="app.localizedTexts.studentHintHeading" defaultMessage="Hint" />
                  </h4>
                  <Markdown source={studentHint} />
                </div>
              )}
            </Tab>
          ))}
        </Tabs>
      )}
    </UrlContext.Consumer>
  );
};

LocalizedTexts.propTypes = {
  locales: PropTypes.arrayOf(
    PropTypes.shape({
      locale: PropTypes.string.isRequried,
      text: PropTypes.string.isRequried,
    })
  ),
  noLocalesMessage: PropTypes.any,
};

export default LocalizedTexts;
