/**
 *
 * Search
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { Col, Row, Table } from 'reactstrap';
import isEmpty from 'lodash/isEmpty';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import getPropByTx from 'utils/getPropByTx';

import { FEATURE_ACTIVATION_TYPE_INT } from 'containers/App/constants';
import Wallet from 'components/Wallet';
import TransactionInfo from 'components/TransactionInfo';
import Asset from 'components/Asset';
import LoadingIndicator from 'components/LoadingIndicator';
import ContainerBase from 'components/ContainerBase';
import StyledLink from 'components/StyledLink';
import getLocationPath, { getSufixURL } from 'utils/getLocationPath';

import { loadActivations } from 'containers/Activations/actions';
import { makeSelectActivations } from 'containers/Activations/selectors';
import { startFetch, cancelFetch } from 'components/Token/actions';
import {
  makeSelectProperties,
  makeSelectProperty,
} from 'components/Token/selectors';

import makeSelectSearch from './selectors';
import searchReducer from './reducer';
import searchSaga from './saga';
import { loadSearch } from './actions';

const StyledTH = styled.th`
  border: none !important;
  font-weight: normal !important;
`;

const StyledAssetTH = styled(StyledTH).attrs({
  colSpan: '4',
})``;

const StyledTR = styled.tr.attrs({
  className: 'text-light bg-secondary',
})``;

const StyledRow = styled(Row)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

export function Search(props) {
  const query = decodeURIComponent(useParams().query || window.location.hash);

  useInjectReducer({
    key: 'search',
    reducer: searchReducer,
  });

  useInjectSaga({
    key: 'search',
    saga: searchSaga,
  });

  useEffect(() => {
    props.loadSearch(query);
  }, [query]);

  useEffect(() => {
    if (
      (!props.tokens.lastFetched || isActivation()) &&
      !isEmpty(props.search.tx)
    ) {
      if (isActivation()) {
        props.loadActivations();
      } else if (props.search.tx.propertyid) {
        props.getProperty(props.search.tx.propertyid);
      } else {
        props.cancelFetch();
      }
    }
  }, [props.search.loading]);

  let wallet = null;
  let assets = null;
  let tx = null;

  const isActivation = () =>
    props.search.tx.type_int === FEATURE_ACTIVATION_TYPE_INT;

  const loading = (
    <ContainerBase>
      <LoadingIndicator />
    </ContainerBase>
  );

  if (
    props.search.loading ||
    (!props.search.loading && props.search.query !== query) ||
    (!isActivation() && props.tokens.isFetching) ||
    (isActivation() && props.activations.loading)
  ) {
    return loading;
  }

  if (!isEmpty(props.search.tx.type)) {
    const property = getPropByTx(
      props.search.tx,
      isActivation()
        ? feat => feat.featureid === props.search.tx.featureid
        : id => props.tokens[id],
      props.activations.list,
    );
    if (!property) return loading;
    tx = <TransactionInfo {...props.search.tx} asset={property} />;
  }

  const walletlink = () => {
    if (
      props.search.address.balance &&
      props.search.address.balance.length > 0
    ) {
      return (
        <div className="container-fluid">
          <StyledLink
            to={{
              pathname: `${getSufixURL()}/address/${query}`,
              state: { state: props.state },
            }}
          >
            Click Here for full address details.
          </StyledLink>
        </div>
      );
    }
  };

  if (props.search.address.balance && props.search.address.balance.length > 0) {
    wallet = <Wallet {...props.search} addr={query} extra={walletlink()} />;
  }

  if (props.search.asset.length > 0) {
    assets = (
      <Table responsive className="mt-1">
        <thead>
          <tr>
            <StyledAssetTH>
              <h4 className="align-self-end text-sm-left">
                <strong className="d-inline-block">Properties</strong>
                {props.search.asset.length > 1 && (
                  <span className="d-inline-block">
                    &nbsp;(only first 10 results are displayed)
                  </span>
                )}
              </h4>
            </StyledAssetTH>
          </tr>
          <StyledTR>
            <StyledTH />
            <StyledTH>ID</StyledTH>
            <StyledTH>Name</StyledTH>
            <StyledTH>Issuer</StyledTH>
          </StyledTR>
        </thead>
        <tbody>
          {props.search.asset.map((x, idx) => (
            <Asset {...x} key={`${x[2]} ${idx}`} />
          ))}
        </tbody>
      </Table>
    );
  }

  const noMatches = (!wallet && !assets && !tx);

  return (
    <ContainerBase>
      <StyledRow noGutters>
        <Col sm>
          <h4>
            Showing results for:&nbsp;
            <div
              className="d-md-inline d-block-down-md"
              style={{
                overflow: 'auto',
                overflowY: 'hidden',
              }}
            >
              <mark>{query}</mark>
            </div>
          </h4>
        </Col>
      </StyledRow>
      <Row noGutters>
        <Col sm>{wallet}</Col>
      </Row>
      <Row noGutters>
        <Col sm>{assets}</Col>
      </Row>
      <Row noGutters>
        <Col sm>{tx}</Col>
      </Row>
      { noMatches &&
        <Row noGutters>
          <Col sm>
            <h4>No matches</h4>
          </Col>
        </Row>
      }
    </ContainerBase>
  );
}

Search.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loadSearch: PropTypes.func,
  cancelFetch: PropTypes.func,
  search: PropTypes.object,
  getProperty: PropTypes.func.isRequired,
  properties: PropTypes.func.isRequired,
  loadActivations: PropTypes.func.isRequired,
  tokens: PropTypes.any,
  match: PropTypes.any,
  activations: PropTypes.any,
};

const mapStateToProps = createStructuredSelector({
  search: makeSelectSearch(),
  tokens: makeSelectProperties(),
  properties: state => makeSelectProperty(state),
  activations: makeSelectActivations(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    loadSearch: query => dispatch(loadSearch(query)),
    getProperty: propertyId => dispatch(startFetch(propertyId)),
    loadActivations: () => dispatch(loadActivations()),
    cancelFetch: () => dispatch(cancelFetch()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Search);
