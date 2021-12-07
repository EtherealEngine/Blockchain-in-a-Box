const nftUI = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const TokenIdentifier = IDL.Text;
  const Memo = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat;
  const TransferRequest = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier,
    'notify' : IDL.Bool,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransactionId = IDL.Nat;
  const CommonError = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const AccountIdentifierReturn = IDL.Variant({
    'Ok' : AccountIdentifier,
    'Err' : CommonError,
  });
  const Value = IDL.Variant({
    'nat' : IDL.Nat,
    'blob' : IDL.Vec(IDL.Nat8),
    'nat8' : IDL.Nat8,
    'text' : IDL.Text,
  });
  const MetadataValue = IDL.Tuple(IDL.Text, Value);
  const MetadataContainer = IDL.Variant({
    'blob' : IDL.Vec(IDL.Nat8),
    'data' : IDL.Vec(MetadataValue),
    'json' : IDL.Text,
  });
  const Metadata = IDL.Variant({
    'fungible' : IDL.Record({
      'decimals' : IDL.Nat8,
      'metadata' : IDL.Opt(MetadataContainer),
      'name' : IDL.Text,
      'symbol' : IDL.Text,
    }),
    'nonfungible' : IDL.Opt(MetadataContainer),
  });
  const TokenMetadata = IDL.Record({
    'principal' : IDL.Principal,
    'metadata' : Metadata,
    'account_identifier' : AccountIdentifier,
    'token_identifier' : TokenIdentifier,
  });
  const MetadataVal = IDL.Variant({
    'Nat64Content' : IDL.Nat64,
    'Nat32Content' : IDL.Nat32,
    'Nat8Content' : IDL.Nat8,
    'NatContent' : IDL.Nat,
    'Nat16Content' : IDL.Nat16,
    'BlobContent' : IDL.Vec(IDL.Nat8),
    'TextContent' : IDL.Text,
  });
  const MetadataKeyVal = IDL.Record({ 'key' : IDL.Text, 'val' : MetadataVal });
  const MetadataPurpose = IDL.Variant({
    'Preview' : IDL.Null,
    'Rendered' : IDL.Null,
  });
  const MetadataPart = IDL.Record({
    'data' : IDL.Vec(IDL.Nat8),
    'key_val_data' : IDL.Vec(MetadataKeyVal),
    'purpose' : MetadataPurpose,
  });
  const MetadataDesc = IDL.Vec(MetadataPart);
  const ApiError = IDL.Variant({
    'ZeroAddress' : IDL.Null,
    'InvalidTokenId' : IDL.Null,
    'Unauthorized' : IDL.Null,
  });
  const MetadataResult = IDL.Variant({ 'Ok' : MetadataDesc, 'Err' : ApiError });
  const ExtendedMetadataResult = IDL.Record({
    'token_id' : IDL.Nat64,
    'metadata_desc' : MetadataDesc,
  });
  const TransactionType = IDL.Variant({
    'Approve' : IDL.Record({
      'to' : IDL.Principal,
      'token_id' : IDL.Nat64,
      'from' : IDL.Principal,
    }),
    'Burn' : IDL.Record({ 'token_id' : IDL.Nat64 }),
    'Mint' : IDL.Record({ 'token_id' : IDL.Nat64 }),
    'SetApprovalForAll' : IDL.Record({
      'to' : IDL.Principal,
      'from' : IDL.Principal,
    }),
    'TransferFrom' : IDL.Record({
      'to' : IDL.Principal,
      'token_id' : IDL.Nat64,
      'from' : IDL.Principal,
      'caller' : IDL.Opt(IDL.Principal),
    }),
  });
  const TransactionResult = IDL.Record({
    'fee' : IDL.Nat,
    'transaction_type' : TransactionType,
  });
  const LogoResult = IDL.Record({ 'data' : IDL.Text, 'logo_type' : IDL.Text });
  const MetadataReturn = IDL.Variant({ 'Ok' : Metadata, 'Err' : CommonError });
  const MintReceiptPart = IDL.Record({
    'id' : IDL.Nat,
    'token_id' : IDL.Nat64,
  });
  const MintReceipt = IDL.Variant({ 'Ok' : MintReceiptPart, 'Err' : ApiError });
  const MintRequest = IDL.Record({
    'to' : User,
    'metadata' : IDL.Opt(MetadataContainer),
  });
  const OwnerResult = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : ApiError });
  const TxReceipt = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : ApiError });
  const BalanceReturn = IDL.Variant({ 'Ok' : Balance, 'Err' : CommonError });
  const InterfaceId = IDL.Variant({
    'Burn' : IDL.Null,
    'Mint' : IDL.Null,
    'Approval' : IDL.Null,
    'TransactionHistory' : IDL.Null,
    'TransferNotification' : IDL.Null,
  });
  const ICPTs = IDL.Record({ 'e8s' : IDL.Nat64 });
  const TransactionNotification = IDL.Record({
    'to' : IDL.Principal,
    'to_subaccount' : IDL.Opt(IDL.Nat8),
    'from' : IDL.Principal,
    'memo' : IDL.Nat64,
    'from_subaccount' : IDL.Opt(IDL.Nat8),
    'amount' : ICPTs,
    'block_height' : IDL.Nat64,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const Date = IDL.Nat64;
  const TransactionRequestFilter = IDL.Variant({
    'date' : IDL.Tuple(Date, Date),
    'page' : IDL.Tuple(IDL.Nat, IDL.Nat),
    'txid' : TransactionId,
    'user' : User,
  });
  const TransactionRequest = IDL.Record({
    'token' : TokenIdentifier,
    'query' : TransactionRequestFilter,
  });
  const Transaction = IDL.Record({
    'date' : Date,
    'request' : TransferRequest,
    'txid' : TransactionId,
  });
  const TrasactionsResult = IDL.Variant({
    'Ok' : IDL.Vec(Transaction),
    'Err' : CommonError,
  });
  const TransferResponse = IDL.Variant({
    'Ok' : Balance,
    'Err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const erc721_token = IDL.Service({
    'add' : IDL.Func([TransferRequest], [TransactionId], []),
    'balanceOfDip721' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'bearer' : IDL.Func(
        [TokenIdentifier],
        [AccountIdentifierReturn],
        ['query'],
      ),
    'getAllMetadataForUser' : IDL.Func(
        [User],
        [IDL.Vec(TokenMetadata)],
        ['query'],
      ),
    'getMaxLimitDip721' : IDL.Func([], [IDL.Nat16], ['query']),
    'getMetadataDip721' : IDL.Func([IDL.Nat64], [MetadataResult], ['query']),
    'getMetadataForUserDip721' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(ExtendedMetadataResult)],
        [],
      ),
    'getTransactionDip721' : IDL.Func(
        [IDL.Nat],
        [TransactionResult],
        ['query'],
      ),
    'getTransactionsDip721' : IDL.Func(
        [IDL.Nat, IDL.Nat16],
        [IDL.Vec(TransactionResult)],
        ['query'],
      ),
    'getUserTransactionsDip721' : IDL.Func(
        [IDL.Nat, IDL.Nat16, IDL.Principal],
        [IDL.Vec(TransactionResult)],
        ['query'],
      ),
    'get_check' : IDL.Func([], [IDL.Nat64], []),
    'logoDip721' : IDL.Func([], [LogoResult], ['query']),
    'metadata' : IDL.Func([TokenIdentifier], [MetadataReturn], ['query']),
    'mintDip721' : IDL.Func([IDL.Principal, MetadataDesc], [MintReceipt], []),
    'mintNFT' : IDL.Func([MintRequest], [TokenIdentifier], []),
    'nameDip721' : IDL.Func([], [IDL.Text], ['query']),
    'ownerOfDip721' : IDL.Func([IDL.Nat64], [OwnerResult], ['query']),
    'safeTransferFromDip721' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat64],
        [TxReceipt],
        [],
      ),
    'supply' : IDL.Func([TokenIdentifier], [BalanceReturn], ['query']),
    'supportedInterfacesDip721' : IDL.Func(
        [],
        [IDL.Vec(InterfaceId)],
        ['query'],
      ),
    'symbolDip721' : IDL.Func([], [IDL.Text], ['query']),
    'totalSupplyDip721' : IDL.Func([], [IDL.Nat64], ['query']),
    'transaction_notification' : IDL.Func(
        [TransactionNotification],
        [Result],
        [],
      ),
    'transactions' : IDL.Func([TransactionRequest], [TrasactionsResult], []),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'transferFromDip721' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat64],
        [TxReceipt],
        [],
      ),
  });
  return erc721_token;
};
// export const init = ({ IDL }) => {
//   return [IDL.Principal, IDL.Text, IDL.Text, IDL.Principal];
// };
