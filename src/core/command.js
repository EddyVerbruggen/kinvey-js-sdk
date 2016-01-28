import Client from './client';
import Auth from './auth';
import { HttpMethod } from './enums';
import { KinveyError } from './errors';
import NetworkRequest from './requests/networkRequest';
import assign from 'lodash/object/assign';
import isString from 'lodash/lang/isString';
const rpcNamespace = process.env.KINVEY_RPC_NAMESPACE || 'rpc';

/**
 * Executes a custom command.
 */
const Command = {
  /**
   * Execute a custom command. A promise will be returned that will be resolved
   * with the result of the command or rejected with an error.
   *
   * @param   {String}          command                           Command to execute.
   * @param   {Object}          [args]                            Command arguments
   * @param   {Object}          [options]                         Options
   * @param   {Properties}      [options.properties]              Custom properties to send with
   *                                                              the request.
   * @param   {Number}          [options.timeout]                 Timeout for the request.
   * @return  {Promise}                                           Promise
   *
   * @example
   * var promise = Kinvey.Command.execute('myCustomCommand').then(function(data) {
   *   ...
   * }).catch(function(error) {
   *   ...
   * });
   */
  execute(command, args, options = {}) {
    if (!command) {
      throw new KinveyError('A command is required.');
    }

    if (!isString(command)) {
      throw new KinveyError('Command must be a string.');
    }

    options = assign({
      properties: null,
      timeout: undefined,
      handler() {}
    }, options);

    const request = new NetworkRequest({
      method: HttpMethod.POST,
      client: Client.sharedInstance(),
      properties: options.properties,
      auth: Auth.default,
      pathname: `/${rpcNamespace}/${options.client.appKey}/custom/${command}`,
      data: args,
      timeout: options.timeout
    });
    const promise = request.execute().then(response => {
      if (response.isSuccess()) {
        return response.data;
      }

      throw response.error;
    });
    return promise;
  }
};

export default Command;
