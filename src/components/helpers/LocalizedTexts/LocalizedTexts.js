import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Card, Tab, Nav } from 'react-bootstrap';

import ExternalLinkPreview from '../ExternalLinkPreview';
import Icon from '../../icons';
import Markdown from '../../widgets/Markdown';
import Callout from '../../widgets/Callout';
import InsetPanel from '../../widgets/InsetPanel';
import { knownLocales } from '../../../helpers/localizedData';
import { UrlContext } from '../../../helpers/contexts';

import './LocalizedTexts.css';

const LocalizedTexts = ({ locales = [], noLocalesMessage = null }) => {
  const localeTabs = knownLocales
    .map(locale => locales.find(l => l.locale === locale))
    .filter(tabData => tabData && (tabData.text || tabData.link || tabData.studentHint));

  if (localeTabs.length === 0) {
    return noLocalesMessage ? <Callout variant="info">{noLocalesMessage}</Callout> : null;
  }

  return (
    <UrlContext.Consumer>
      {({ lang = 'en' }) => (
        <Tab.Container
          defaultActiveKey={
            localeTabs.find(({ locale }) => locale === lang) || localeTabs.length === 0 ? lang : localeTabs[0].locale
          }
          id="localized-texts">
          <Card>
            <Card.Header>
              <Nav
                variant="tabs"
                defaultActiveKey={
                  localeTabs.find(({ locale }) => locale === lang) || localeTabs.length === 0
                    ? lang
                    : localeTabs[0].locale
                }
                className="nav-tabs-custom"
                id="localized-texts">
                {localeTabs.map(({ locale }) => (
                  <Nav.Item key={locale}>
                    <Nav.Link eventKey={locale}>{locale}</Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Card.Header>
            <Tab.Content>
              {localeTabs.map(({ locale, text, link = '', studentHint = null }) => (
                <Tab.Pane key={locale} eventKey={locale}>
                  <Card.Body>
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
                      <Callout variant="warning" className="em-margin">
                        <FormattedMessage
                          id="app.localizedTexts.noText"
                          defaultMessage="There is no text nor link for given localization. The exercise is not fully specified yet."
                        />
                      </Callout>
                    )}
                  </Card.Body>

                  {studentHint && studentHint !== '' && (
                    <Card.Footer>
                      <h4>
                        <FormattedMessage id="app.localizedTexts.studentHintHeading" defaultMessage="Hint" />
                      </h4>
                      <Markdown source={studentHint} />
                    </Card.Footer>
                  )}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Card>
        </Tab.Container>
      )}
    </UrlContext.Consumer>
  );
};

LocalizedTexts.propTypes = {
  locales: PropTypes.arrayOf(
    PropTypes.shape({
      locale: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ),
  noLocalesMessage: PropTypes.any,
};

export default LocalizedTexts;
