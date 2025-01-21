import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Dropdown } from 'react-bootstrap';
import QRCode from 'react-qr-code';

import Icon from '../../icons';

const preventClickPropagation = ev => ev.stopPropagation();

const HeaderQRCodeDropdown = () => (
  <Dropdown as="li" align="end" navbar className="nav-item" data-bs-theme="light">
    <Dropdown.Toggle as="a" id="dropdown-qr-code-link" bsPrefix="nav-link">
      <Icon icon="qrcode" />
    </Dropdown.Toggle>

    <Dropdown.Menu rootCloseEvent="mousedown" onMouseDown={preventClickPropagation}>
      <Dropdown.Header>
        <FormattedMessage id="app.QRCodeDropdown.title" defaultMessage="QR code link to current page" />
      </Dropdown.Header>

      <Dropdown.Divider className="mb-0" />

      <div className="mx-5 my-4 text-center">
        <QRCode size={256} value={window.location.href} />
      </div>
      <p className="mx-3 small">
        <code className="small">{window.location.href}</code>
      </p>
    </Dropdown.Menu>
  </Dropdown>
);

HeaderQRCodeDropdown.propTypes = {};

export default HeaderQRCodeDropdown;
