const { client, getAppVersion, setAppVersion, init, initialize, ping } = require('kinvey');
const { Acl } = require('kinvey-acl');
const { Aggregation } = require('kinvey-aggregation');
const { AuthorizationGrant } = require('kinvey-identity');
const { CustomEndpoint } = require('kinvey-endpoint');
const { DataStore, DataStoreType, SyncOperation } = require('kinvey-datastore');
const LiveService = require('kinvey-live');
const { Files } = require('kinvey-filestore');
const { Log } = require('kinvey-log');
const { Metadata } = require('kinvey-metadata');
const { Query } = require('kinvey-query');
const { User } = require('kinvey-user');
const { CacheRack, NetworkRack, Middleware, CacheMiddleware } = require('kinvey-request');
const { isDefined } = require('kinvey-utils/object');
const { MobileIdentityConnect } = require('kinvey-identity');
const {
  ActiveUserError,
  APIVersionNotAvailableError,
  APIVersionNotImplementedError,
  AppProblemError,
  BadRequestError,
  BLError,
  CORSDisabledError,
  DuplicateEndUsersError,
  FeatureUnavailableError,
  IncompleteRequestBodyError,
  IndirectCollectionAccessDisallowedError,
  InsufficientCredentialsError,
  InvalidCredentialsError,
  InvalidIdentifierError,
  InvalidQuerySyntaxError,
  JSONParseError,
  KinveyError,
  KinveyInternalErrorRetry,
  KinveyInternalErrorStop,
  MissingQueryError,
  MissingRequestHeaderError,
  MissingRequestParameterError,
  MobileIdentityConnectError,
  NoActiveUserError,
  NetworkConnectionError,
  NoResponseError,
  NotFoundError,
  ParameterValueOutOfRangeError,
  PopupError,
  QueryError,
  ServerError,
  StaleRequestError,
  SyncError,
  TimeoutError,
  UserAlreadyExistsError,
  WritesToCollectionDisallowedError
} = require('kinvey-errors');

module.exports = {
  client,
  getAppVersion,
  setAppVersion,
  init,
  initialize,
  ping,
  Acl,
  Aggregation,
  AuthorizationGrant,
  CustomEndpoint,
  DataStore,
  DataStoreType,
  SyncOperation,
  LiveService,
  Files,
  Log,
  Metadata,
  Query,
  User,
  ActiveUserError,
  APIVersionNotAvailableError,
  APIVersionNotImplementedError,
  AppProblemError,
  BadRequestError,
  BLError,
  CORSDisabledError,
  DuplicateEndUsersError,
  FeatureUnavailableError,
  IncompleteRequestBodyError,
  IndirectCollectionAccessDisallowedError,
  InsufficientCredentialsError,
  InvalidCredentialsError,
  InvalidIdentifierError,
  InvalidQuerySyntaxError,
  JSONParseError,
  KinveyError,
  KinveyInternalErrorRetry,
  KinveyInternalErrorStop,
  MissingQueryError,
  MissingRequestHeaderError,
  MissingRequestParameterError,
  MobileIdentityConnectError,
  NoActiveUserError,
  NetworkConnectionError,
  NoResponseError,
  NotFoundError,
  ParameterValueOutOfRangeError,
  PopupError,
  QueryError,
  ServerError,
  StaleRequestError,
  SyncError,
  TimeoutError,
  UserAlreadyExistsError,
  WritesToCollectionDisallowedError,

  MobileIdentityConnect,
  CacheRack,
  NetworkRack,
  Middleware,
  CacheMiddleware,
  isDefined
};
