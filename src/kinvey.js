/**
 * Copyright 2013 Kinvey, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Constants.
// ----------

/**
 * The Kinvey server.
 *
 * @constant
 * @type {string}
 * @default
 */
Kinvey.API_ENDPOINT = '<%= config.kcs.protocol %>://<%= config.kcs.host %>';

/**
 * The Kinvey API version used when communicating with `Kinvey.API_ENDPOINT`.
 *
 * @constant
 * @type {string}
 * @default
 */
Kinvey.API_VERSION = '<%= config.apiVersion %>';

/**
 * The current version of the library.
 *
 * @constant
 * @type {string}
 * @default
 */
Kinvey.SDK_VERSION = '<%= pkg.version %>';

// Properties.
// -----------

/**
 * Kinvey App Key.
 *
 * @private
 * @type {?string}
 */
Kinvey.appKey = null;

/**
 * Kinvey App Secret.
 *
 * @private
 * @type {?string}
 */
Kinvey.appSecret = null;

/**
 * Kinvey Master Secret.
 *
 * @private
 * @type {?string}
 */
Kinvey.masterSecret = null;

// Top-level functionality.
// ------------------------

// The namespaces of the Kinvey service.
var DATA_STORE  = 'appdata';
var FILES       = 'blob';
var RPC         = 'rpc';
var USERS       = 'user';
/*var USER_GROUPS = 'group';*/

// The library has a concept of an active user which represents the person
// using the app. There can only be one user per copy of the library.

// The active user.
var activeUser = null;

// Status flag indicating whether the active user is ready to be used.
var activeUserReady = false;

/**
 * Restores the active user (if any) from disk.
 *
 * @returns {Promise} The active user, or `null` if there is no active user.
 */
var restoreActiveUser = function() {
  // Retrieve the authtoken from storage. If there is an authtoken, restore the
  // active user from disk.
  var promise = Storage.get('activeUser');
  return promise.then(function(user) {
    // If there is no active user, set to `null`.
    if(null == user) {
      return Kinvey.setActiveUser(null);
    }

    // Debug.
    if(KINVEY_DEBUG) {
      log('Restoring the active user.');
    }

    // Set the active user to a near-empty user with only the authtoken set.
    var previous = Kinvey.setActiveUser({ _id: user[0], _kmd: { authtoken: user[1] } });

    // Retrieve the user. The `Kinvey.User.me` method will also update the
    // active user. If `INVALID_CREDENTIALS`, reset the active user.
    return Kinvey.User.me().then(null, function(error) {
      // Debug.
      if(KINVEY_DEBUG) {
        log('Failed to restore the active user.', error);
      }

      // Reset the active user.
      if(Kinvey.Error.INVALID_CREDENTIALS === error.name) {
        Kinvey.setActiveUser(previous);
      }
      return Kinvey.Defer.reject(error);
    });
  });
};

/**
 * Returns the active user.
 *
 * @throws {Error} `Kinvey.getActiveUser` can only be called after the promise
     returned by `Kinvey.init` fulfills or rejects.
 * @returns {?Object} The active user, or `null` if there is no active user.
 */
Kinvey.getActiveUser = function() {
  // Validate preconditions.
  if(false === activeUserReady) {
    throw new Kinvey.Error('Kinvey.getActiveUser can only be called after the ' +
     'promise returned by Kinvey.init fulfills or rejects.');
  }

  return activeUser;
};

/**
 * Sets the active user.
 *
 * @param {?Object} user The active user, or `null` to reset.
 * @throws {Kinvey.Error} `user` must contain: `_kmd.authtoken`.
 * @returns {?Object} The previous active user, or `null` if there was no
 *            previous active user.
 */
Kinvey.setActiveUser = function(user) {
  // Debug.
  if(KINVEY_DEBUG) {
    log('Setting the active user.', arguments);
  }

  // Validate arguments.
  if(null != user && !(null != user._id && null != user._kmd && null != user._kmd.authtoken)) {
    throw new Kinvey.Error('user argument must contain: _id, _kmd.authtoken.');
  }

  // At this point, the active user is ready to be used (even though the
  // user data is not retrieved yet).
  if(false === activeUserReady) {
    activeUserReady = true;
  }

  var result = Kinvey.getActiveUser();// Previous.
  activeUser = user;

  // Update disk state in the background.
  if(null != user) {// Save the active user.
    Storage.save('activeUser', [ user._id, user._kmd.authtoken ]);
  }
  else {// Delete the active user.
    Storage.destroy('activeUser');
  }

  // Return the previous active user.
  return result;
};

/**
 * Initializes the library for use with Kinvey services.
 *
 * @param {Options} options Options.
 * @param {string}  options.appKey        App Key.
 * @param {string} [options.appSecret]    App Secret.
 * @param {string} [options.masterSecret] Master Secret. **Never use the
 *          Master Secret in client-side code.**
 * @param {Object} [options.sync]         Synchronization options.
 * @throws {Kinvey.Error} `options` must contain: `appSecret` or
 *                          `masterSecret`.
 * @returns {Promise} The active user.
 */
Kinvey.init = function(options) {
  // Debug.
  if(KINVEY_DEBUG) {
    log('Initializing the copy of the library.', arguments);
  }

  // Validate arguments.
  options = options || {};
  if(null == options.appKey) {
    throw new Kinvey.Error('options argument must contain: appKey.');
  }
  if(null == options.appSecret && null == options.masterSecret) {
    throw new Kinvey.Error('options argument must contain: appSecret and/or masterSecret.');
  }

  // The active user is not ready yet.
  activeUserReady = false;

  // Save credentials.
  Kinvey.appKey       = options.appKey;
  Kinvey.appSecret    = null != options.appSecret    ? options.appSecret    : null;
  Kinvey.masterSecret = null != options.masterSecret ? options.masterSecret : null;

  // Initialize the synchronization namespace and restore the active user.
  var promise = Kinvey.Sync.init(options.sync).then(restoreActiveUser);
  return wrapCallbacks(promise, options);
};

/**
 * Pings the Kinvey service.
 *
 * @param {Object} [options] Options.
 * @returns {Promise} The response.
 */
Kinvey.ping = function(options) {
  // Debug.
  if(KINVEY_DEBUG) {
    log('Pinging the Kinvey service.', arguments);
  }

  // Cast arguments.
  options = options || {};

  // The top-level ping is not compatible with `options.nocache`.
  options.nocache = null == Kinvey.appKey ? false : options.nocache;

  // Prepare the response. If the library copy has not been initialized yet,
  // ping anonymously.
  var promise = Kinvey.Persistence.read({
    namespace : DATA_STORE,
    auth      : null != Kinvey.appKey ? Auth.All : Auth.None
  }, options);

  // Debug.
  if(KINVEY_DEBUG) {
    promise.then(function(response) {
      log('Pinged the Kinvey service.', response);
    }, function(error) {
      log('Failed to ping the Kinvey service.', error);
    });
  }

  // Return the response.
  return wrapCallbacks(promise, options);
};