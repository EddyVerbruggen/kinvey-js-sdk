import Promise from '../utils/promise';
import { KinveyError } from '../errors';
import { NetworkStore } from './networkstore';
import { AuthType, HttpMethod } from '../enums';
import isArray from 'lodash/isArray';
const usersNamespace = process.env.KINVEY_USERS_NAMESPACE || 'user';
const rpcNamespace = process.env.KINVEY_RPC_NAMESPACE || 'rpc';
const idAttribute = process.env.KINVEY_ID_ATTRIBUTE || '_id';
const socialIdentityAttribute = process.env.KINVEY_SOCIAL_IDENTITY_ATTRIBUTE || '_socialIdentity';

export class UserStore extends NetworkStore {
  /**
   * The pathname for the store.
   *
   * @return  {string}   Pathname
   */
  get _pathname() {
    return `/${usersNamespace}/${this.client.appKey}`;
  }

  save(user, options = {}) {
    const promise = Promise.resolve().then(() => {
      if (!user) {
        throw new KinveyError('No user was provided to be updated.');
      }

      if (isArray(user)) {
        throw new KinveyError('Please only update one user at a time.', user);
      }

      if (!user[idAttribute]) {
        throw new KinveyError('User must have an _id.');
      }

      if (options._identity) {
        const socialIdentity = user[socialIdentityAttribute];
        if (socialIdentity) {
          for (const identity in socialIdentity) {
            if (socialIdentity.hasOwnProperty(identity)) {
              if (socialIdentity[identity] && options._identity !== identity) {
                delete socialIdentity[identity];
              }
            }
          }
        }
      }

      return super.save(user, options);
    });

    return promise;
  }

  exists(username, options) {
    return this.client.executeNetworkRequest({
      method: HttpMethod.POST,
      pathname: `/${rpcNamespace}/${this.client.appKey}/check-username-exists`,
      properties: options.properties,
      authType: AuthType.App,
      data: { username: username },
      timeout: options.timeout
    }).then(response => {
      return response.data.usernameExists;
    });
  }

  restore(id, options = {}) {
    const promise = Promise.resolve().then(() => {
      return this.client.executeNetworkRequest({
        method: HttpMethod.POST,
        pathname: `${this._pathname}/id`,
        properties: options.properties,
        authType: AuthType.Master,
        timeout: options.timeout
      });
    }).then(response => {
      return response.data;
    });

    return promise;
  }
}
