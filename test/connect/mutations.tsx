/// <reference path="../../typings/main.d.ts" />

import * as React from 'react';
import * as chai from 'chai';
import { mount } from 'enzyme';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { connect as ReactReduxConnect } from 'react-redux';
import gql from 'apollo-client/gql';
import assign = require('object-assign');
// import { spy } from 'sinon';

import ApolloClient from 'apollo-client';

declare function require(name: string);
import chaiEnzyme = require('chai-enzyme');

chai.use(chaiEnzyme()); // Note the invocation at the end
const { expect } = chai;

import mockNetworkInterface from '../mocks/mockNetworkInterface';
import {
  Passthrough,
  ProviderMock,
} from '../mocks/components';

import connect from '../../src/connect';

describe('mutations', () => {
  it('should bind mutation data to props', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const mutation = gql`
      mutation makeListPrivate($listId: ID!) {
        makeListPrivate(id: $listId)
      }
    `;

    const variables = {
      listId: '1',
    };

    const data = {
      makeListPrivate: true,
    };

    const networkInterface = mockNetworkInterface({
      request: { query: mutation, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapMutationsToProps() {
      return {
        makeListPrivate: () => ({
          mutation,
          variables,
        }),
      };
    };

    @connect({ mapMutationsToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.makeListPrivate).to.exist;
    expect(props.makeListPrivate.loading).to.be.true;
  });

  it('should bind multiple mutation keys to props', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const mutation1 = gql`
      mutation makeListPrivate($listId: ID!) {
        makeListPrivate(id: $listId)
      }
    `;

    const mutation2 = gql`
      mutation makeListReallyPrivate($listId: ID!) {
        makeListReallyPrivate(id: $listId)
      }
    `;

    const data = {
      makeListPrivate: true,
    };

    const networkInterface = mockNetworkInterface({
      request: { query: mutation1 },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapMutationsToProps() {
      return {
        makeListPrivate: () => ({
          mutation1,
        }),
        makeListReallyPrivate: () => ({
          mutation2,
        }),
      };
    };

    @connect({ mapMutationsToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.makeListPrivate).to.exist;
    expect(props.makeListPrivate.loading).to.be.true;
    expect(props.makeListReallyPrivate).to.exist;
    expect(props.makeListReallyPrivate.loading).to.be.true;
  });

  it('should bind mutation handler to `props.mutations[key]`', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const mutation = gql`
      mutation makeListPrivate($listId: ID!) {
        makeListPrivate(id: $listId)
      }
    `;

    const variables = {
      listId: '1',
    };

    const data = {
      makeListPrivate: true,
    };

    const networkInterface = mockNetworkInterface({
      request: { query: mutation, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapMutationsToProps() {
      return {
        makeListPrivate: () => ({
          mutation,
        }),
      };
    };

    @connect({ mapMutationsToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.makeListPrivate).to.exist;
    expect(props.makeListPrivate.loading).to.be.true;

    expect(props.mutations).to.exist;
    expect(props.mutations.makeListPrivate).to.exist;
    expect(props.mutations.makeListPrivate).to.be.instanceof(Function);
  });

  it('should pass the mutation promise to the child component', (done) => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const mutation = gql`
      mutation makeListPrivate($listId: ID!) {
        makeListPrivate(id: $listId)
      }
    `;

    const variables = {
      listId: '1',
    };

    const data = {
      makeListPrivate: true,
    };

    const networkInterface = mockNetworkInterface({
      request: { query: mutation, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapMutationsToProps() {
      return {
        makeListPrivate: () => ({
          mutation,
        }),
      };
    };

    @connect({ mapMutationsToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.makeListPrivate).to.exist;
    expect(props.makeListPrivate.loading).to.be.true;

    expect(props.mutations).to.exist;
    expect(props.mutations.makeListPrivate).to.exist;
    expect(props.mutations.makeListPrivate).to.be.instanceof(Function);
    props.mutations.makeListPrivate()
      .then((err, result) => {
        done();
      })
      .catch(() => {
        done(new Error('should not error'));
      });
  });

  it('should update the props of the child component when data is returned', (done) => {
    const store = createStore(() => ({ }));

    const mutation = gql`
      mutation makeListPrivate($listId: ID!) {
        makeListPrivate(id: $listId)
      }
    `;

    const variables = {
      listId: '1',
    };

    const data = {
      makeListPrivate: true,
    };

    const networkInterface = mockNetworkInterface({
      request: { query: mutation, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapMutationsToProps() {
      return {
        makeListPrivate: () => ({
          mutation,
          variables,
        }),
      };
    };

    @connect({ mapMutationsToProps })
    class Container extends React.Component<any, any> {
      componentDidMount() {
        // call the muation
        this.props.mutations.makeListPrivate();
      }

      componentDidUpdate(prevProps) {
        // wait until finished loading
        if (!this.props.makeListPrivate.loading) {
          expect(prevProps.makeListPrivate.loading).to.be.true;
          expect(this.props.makeListPrivate.makeListPrivate).to.be.true;
          done();
        }
      }

      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );
  });

  it('can use passed props as part of the mutation', (done) => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const mutation = gql`
      mutation makeListPrivate($listId: ID!) {
        makeListPrivate(id: $listId)
      }
    `;

    const variables = {
      listId: '1',
    };

    const data = {
      makeListPrivate: true,
    };

    const networkInterface = mockNetworkInterface({
      request: { query: mutation, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapMutationsToProps({ ownProps }) {
      expect(ownProps.listId).to.equal('1');
      return {
        makeListPrivate: () => {
          return {
            mutation,
            variables: {
              listId: ownProps.listId,
            },
          };
        },
      };
    };

    @connect({ mapMutationsToProps })
    class Container extends React.Component<any, any> {
      componentDidMount() {
        // call the muation
        this.props.mutations.makeListPrivate();
      }

      componentDidUpdate(prevProps) {
        if (!this.props.makeListPrivate.loading) {
          expect(prevProps.makeListPrivate.loading).to.be.true;
          expect(this.props.makeListPrivate.makeListPrivate).to.be.true;
          done();
        }
      }

      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container listId={'1'} />
      </ProviderMock>
    );
  });

  it('can use the redux store as part of the mutation', (done) => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      listId: '1',
    }));

    const mutation = gql`
      mutation makeListPrivate($listId: ID!) {
        makeListPrivate(id: $listId)
      }
    `;

    const variables = {
      listId: '1',
    };

    const data = {
      makeListPrivate: true,
    };

    const networkInterface = mockNetworkInterface({
      request: { query: mutation, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapMutationsToProps({ state }) {
      expect(state.listId).to.equal('1');
      return {
        makeListPrivate: () => {
          return {
            mutation,
            variables: {
              listId: state.listId,
            },
          };
        },
      };
    };

    @connect({ mapMutationsToProps })
    class Container extends React.Component<any, any> {
      componentDidMount() {
        // call the muation
        this.props.mutations.makeListPrivate();
      }

      componentDidUpdate(prevProps) {
        if (!this.props.makeListPrivate.loading) {
          expect(prevProps.makeListPrivate.loading).to.be.true;
          expect(this.props.makeListPrivate.makeListPrivate).to.be.true;
          done();
        }
      }

      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container listId={'1'} />
      </ProviderMock>
    );
  });

  it('should allow passing custom arugments to mutation handle', (done) => {
    const store = createStore(() => ({ }));

    const mutation = gql`
      mutation makeListPrivate($listId: ID!) {
        makeListPrivate(id: $listId)
      }
    `;

    const variables = {
      listId: '1',
    };

    const data = {
      makeListPrivate: true,
    };

    const networkInterface = mockNetworkInterface({
      request: { query: mutation, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapMutationsToProps() {
      return {
        makeListPrivate: (listId) => {
          // expect(listId).to.equal('1');
          return {
            mutation,
            variables: {
              listId,
            },
          };
        },
      };
    };

    @connect({ mapMutationsToProps })
    class Container extends React.Component<any, any> {
      componentDidMount() {
        // call the muation
        this.props.mutations.makeListPrivate('1');
      }

      componentDidUpdate(prevProps) {
        if (!this.props.makeListPrivate.loading) {
          expect(prevProps.makeListPrivate.loading).to.be.true;
          expect(this.props.makeListPrivate.makeListPrivate).to.be.true;
          done();
        }
      }

      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );
  });

});