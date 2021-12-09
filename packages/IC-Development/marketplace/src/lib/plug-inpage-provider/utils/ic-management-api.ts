import { Principal } from '@dfinity/principal';
import { CallConfig } from '@dfinity/agent';

export const managementCanisterIdlFactory = ({ IDL }) => {
  const canister_id = IDL.Principal;
  const definite_canister_settings = IDL.Record({
    'freezing_threshold' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'memory_allocation' : IDL.Nat,
    'compute_allocation' : IDL.Nat,
  });
  const canister_settings = IDL.Record({
    'freezing_threshold' : IDL.Opt(IDL.Nat),
    'controllers' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'memory_allocation' : IDL.Opt(IDL.Nat),
    'compute_allocation' : IDL.Opt(IDL.Nat),
  });
  const wasm_module = IDL.Vec(IDL.Nat8);
  return IDL.Service({
    'canister_status' : IDL.Func(
        [IDL.Record({ 'canister_id' : canister_id })],
        [
          IDL.Record({
            'status' : IDL.Variant({
              'stopped' : IDL.Null,
              'stopping' : IDL.Null,
              'running' : IDL.Null,
            }),
            'memory_size' : IDL.Nat,
            'cycles' : IDL.Nat,
            'settings' : definite_canister_settings,
            'module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
          }),
        ],
        [],
      ),
    'create_canister' : IDL.Func(
        [IDL.Record({ 'settings' : IDL.Opt(canister_settings) })],
        [IDL.Record({ 'canister_id' : canister_id })],
        [],
      ),
    'delete_canister' : IDL.Func(
        [IDL.Record({ 'canister_id' : canister_id })],
        [],
        [],
      ),
    'deposit_cycles' : IDL.Func(
        [IDL.Record({ 'canister_id' : canister_id })],
        [],
        [],
      ),
    'install_code' : IDL.Func(
        [
          IDL.Record({
            'arg' : IDL.Vec(IDL.Nat8),
            'wasm_module' : wasm_module,
            'mode' : IDL.Variant({
              'reinstall' : IDL.Null,
              'upgrade' : IDL.Null,
              'install' : IDL.Null,
            }),
            'canister_id' : canister_id,
          }),
        ],
        [],
        [],
      ),
    'provisional_create_canister_with_cycles' : IDL.Func(
        [
          IDL.Record({
            'settings' : IDL.Opt(canister_settings),
            'amount' : IDL.Opt(IDL.Nat),
          }),
        ],
        [IDL.Record({ 'canister_id' : canister_id })],
        [],
      ),
    'provisional_top_up_canister' : IDL.Func(
        [IDL.Record({ 'canister_id' : canister_id, 'amount' : IDL.Nat })],
        [],
        [],
      ),
    'raw_rand' : IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
    'start_canister' : IDL.Func(
        [IDL.Record({ 'canister_id' : canister_id })],
        [],
        [],
      ),
    'stop_canister' : IDL.Func(
        [IDL.Record({ 'canister_id' : canister_id })],
        [],
        [],
      ),
    'uninstall_code' : IDL.Func(
        [IDL.Record({ 'canister_id' : canister_id })],
        [],
        [],
      ),
    'update_settings' : IDL.Func(
        [
          IDL.Record({
            'canister_id' : IDL.Principal,
            'settings' : canister_settings,
          }),
        ],
        [],
        [],
      ),
  });
};

export interface TransformArguments {
  canister_id: String,
}

export const managementCanisterPrincipal = Principal.fromHex('');

/**
 * Used as a handler that overrides CallConfig calls
 * See the @dfinity/agent callTransform and queryTransform fn signatures
 * E.g. the `canister_status` is called by passing an object with canister_id
 * that we override based in a particular condition, as documented in
 * (https://sdk.dfinity.org/docs/interface-spec/index.html#http-effective-canister-id)
 *
 * @param transformOverrideHandler
 * @param methodName the method name that we're interested in
 * @param args any value passed to the Management API endpoint call
 * @param callConfig configuration that can be passed to customize the Actor behaviour
 * @returns an object containing the key of the computed effective canister id
 */
export const transformOverrideHandler = (
  methodName: string,
  args: TransformArguments[],
  callConfig: CallConfig,
) => {
  // If the call is to the Management Canister (aaaaa-aa),
  // in which it falls back to
  let overridable = {
    effectiveCanisterId: managementCanisterPrincipal,
  }

  // We're only interested in the first argument
  if (!Array.isArray(args) || !args.length) return overridable;

  // If the arg is Candid-encoded where the first argument is a record
  // with a canister_id field of type principal, then the effective
  // canister id is that principal.
  if (args[0].hasOwnProperty('canister_id') && args[0].canister_id) {
    overridable = {
      effectiveCanisterId: Principal.from(args[0].canister_id),
    }
  }

  return overridable;
};
