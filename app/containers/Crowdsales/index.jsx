/**
 *
 * Crowdsales
 *
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { Col, Row, Table, UncontrolledTooltip } from 'reactstrap';
import InfoCircleIcon from 'components/InfoCircleIcon';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import CrowdsaleInfo from 'components/CrowdsaleInfo';
import LoadingIndicator from 'components/LoadingIndicator';
import ContainerBase from 'components/ContainerBase';
import {
  ECOSYSTEM_PROD,
  ECOSYSTEM_PROD_NAME,
  ECOSYSTEM_TEST,
} from 'containers/App/constants';

import ListHeader from 'components/ListHeader';
import { Messages as datetimeMessages } from 'components/FormattedDateTime';
import { FactoryLinkPreview } from 'components/LinkPreview';
import messages from './messages';
import makeSelectCrowdsales from './selectors';
import crowdsalesReducer from './reducer';
import crowdsalesSaga from './saga';
import { loadCrowdsales } from './actions';

const StyledTH = styled.th`
  border: none !important;
`;

export class Crowdsales extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.ecosystem =
      props.match.params.ecosystem.toString() ===
      ECOSYSTEM_PROD_NAME.toLowerCase()
        ? ECOSYSTEM_PROD
        : ECOSYSTEM_TEST;
  }

  componentDidMount() {
    this.props.loadCrowdsales(this.ecosystem);
  }

  render() {
    const loading = null;
    if (this.props.crowdsales.loading) {
      return (
        <ContainerBase>
          <LoadingIndicator />
        </ContainerBase>
      );
    }

    const assets = (
      <Table responsive>
        <thead>
          <tr>
            <StyledTH />
            <StyledTH>Crowdsale</StyledTH>
            <StyledTH>Buy With</StyledTH>
            <StyledTH className="text-right">Rate</StyledTH>
            <StyledTH className="text-center">
              Closing Datetime
              <InfoCircleIcon id="crowdsalesClosingDate" />
              <UncontrolledTooltip
                placement="right-end"
                target="crowdsalesClosingDate"
              >
                <FormattedMessage {...datetimeMessages.utc} />
              </UncontrolledTooltip>
            </StyledTH>
            <StyledTH className="text-right">Tokens Created</StyledTH>
            <StyledTH />
          </tr>
        </thead>
        <tbody>
          {this.props.crowdsales.crowdsales
            .filter(x => x.active)
            .map((x, idx) => (
              <CrowdsaleInfo {...x} key={x.creationtxid} />
            ))}
        </tbody>
      </Table>
    );

    const crowdsalesCount = this.props.crowdsales.crowdsales.length;
    const crowdsalesEcosystem = this.props.crowdsales.ecosystemName;
    const linkPreview = FactoryLinkPreview({
      title: `${crowdsalesCount} crowdsales on ${crowdsalesEcosystem}`,
      slug: `crowdsales/${crowdsalesEcosystem}`,
    });

    return (
      <ContainerBase>
        {linkPreview}
        <Row noGutters>
          <Col sm>
            <ListHeader
              total={crowdsalesCount}
              message={messages.header}
              values={{
                ecosystem: crowdsalesEcosystem,
              }}
            />
          </Col>
        </Row>
        <Row noGutters>
          <Col sm>{assets}</Col>
        </Row>
        <Row noGutters>
          <Col sm>{loading}</Col>
        </Row>
      </ContainerBase>
    );
  }
}

Crowdsales.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loadCrowdsales: PropTypes.func,
  crowdsales: PropTypes.shape({
    crowdsales: PropTypes.array,
    ecosystemName: PropTypes.string,
    loading: PropTypes.bool,
    ecosystem: PropTypes.number,
  }),
};

const mapStateToProps = createStructuredSelector({
  crowdsales: makeSelectCrowdsales(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    loadCrowdsales: ecosystem => dispatch(loadCrowdsales(ecosystem)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({
  key: 'crowdsales',
  reducer: crowdsalesReducer,
});
const withSaga = injectSaga({
  key: 'crowdsales',
  saga: crowdsalesSaga,
});

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Crowdsales);
