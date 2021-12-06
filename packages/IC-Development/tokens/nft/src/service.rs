use crate::ledger::Ledger;
use crate::types::*;
use crate::utils::*;

use ic_kit::ic::trap;
use ic_kit::macros::*;

// BEGIN DIP-721 //
#[query(name = "balanceOfDip721")]
fn balance_of_dip721(user: Principal) -> u64 {
    ledger().balance_of(&user.into())
}

#[query(name = "ownerOfDip721")]
fn owner_of_dip721(token_id: u64) -> Result<Principal, ApiError> {
    ledger().owner_of(&token_id.to_string())
}

#[update(name = "safeTransferFromDip721")]
fn safe_transfer_from_dip721(from: Principal, to: Principal, token_id: u64) -> TxReceipt {
    assert_ne!(
        to,
        Principal::from_slice(&[0; 29]),
        "transfer request to cannot be the zero principal"
    );
    transfer_from_dip721(from, to, token_id)
}

#[update(name = "transferFromDip721")]
fn transfer_from_dip721(_from: Principal, to: Principal, token_id: u64) -> TxReceipt {
    assert_ne!(
        ic_kit::ic::caller(),
        to,
        "transfer request caller and to cannot be the same"
    );

    ledger().transfer(
        &User::principal(ic_kit::ic::caller()),
        &User::principal(to),
        &token_id.to_string(),
    );

    Ok(Nat::from(1))
}

#[update]
async fn transaction_notification(args: TransactionNotification) -> Result<&'static str, &'static str> {
    ledger().check();
    return Err("Not implemented");
}

#[query]
fn get_check() -> u64 {
    return ledger().get_check();
}



#[query(name = "supportedInterfacesDip721")]
fn supported_interfaces_dip721() -> Vec<InterfaceId> {
    vec![InterfaceId::Mint, InterfaceId::TransactionHistory]
}

#[query(name = "logoDip721")]
fn logo_dip721() -> LogoResult {
    unimplemented!();
}

#[query(name = "nameDip721")]
fn name_dip721() -> &'static str {
    &token_level_metadata().name
}

#[query(name = "symbolDip721")]
fn symbol_dip721() -> &'static str {
    &token_level_metadata().symbol
}

#[query(name = "totalSupplyDip721")]
fn total_supply_dip721() -> u64 {
    ledger().total_supply()
}

#[query(name = "getMetadataDip721")]
fn get_metadata_dip721(token_id: u64) -> MetadataResult {
    ledger().get_metadata(token_id)
}

#[query(name = "getTransactionDip721")]
fn get_transaction_dip721(_transaction_id: Nat) -> TransactionResult {
    unimplemented!();
}

#[query(name = "getTransactionsDip721")]
fn get_transactions_dip721(_transaction_id_start: Nat, limit: u16) -> Vec<TransactionResult> {
    assert!(
        limit <= get_max_limit_dip721(),
        "limit has to be less than or equal than"
    );
    unimplemented!();
}

#[query(name = "getUserTransactionsDip721")]
fn get_user_transactions_dip721(
    _transaction_id_start: Nat,
    _limit: u16,
    _user: Principal,
) -> Vec<TransactionResult> {
    unimplemented!();
}

#[query(name = "getMaxLimitDip721")]
fn get_max_limit_dip721() -> u16 {
    200
}

#[update(name = "mintDip721")]
fn mint_dip721(to: Principal, metadata_desc: MetadataDesc) -> MintReceipt {
    ledger().mintNFT(&to, &metadata_desc)
}

#[allow(unreachable_code, unused_variables)]
#[query(name = "getMetadataForUserDip721")]
fn get_metadata_for_user_dip721(user: Principal) -> Vec<ExtendedMetadataResult> {
    ledger().get_metadata_for_user(&user)
}

// END DIP-721 //

#[update]
fn transfer(transfer_request: TransferRequest) -> TransferResponse {
    expect_principal(&transfer_request.from);
    expect_principal(&transfer_request.to);
    assert_ne!(
        transfer_request.from, transfer_request.to,
        "transfer request from and to cannot be the same"
    );
    assert_eq!(transfer_request.amount, 1, "only amount 1 is supported");
    expect_caller_general(&transfer_request.from, transfer_request.subaccount);

    ledger().transfer(
        &transfer_request.from,
        &transfer_request.to,
        &transfer_request.token,
    );

    Ok(Nat::from(1))
}

#[allow(non_snake_case, unreachable_code, unused_variables)]
#[update]
fn mintNFT(mint_request: MintRequest) -> TokenIdentifier {
    trap("Disabled as current EXT metadata doesn't allow multiple assets per token");
    expect_principal(&mint_request.to);
    expect_caller(&token_level_metadata().owner.expect("token owner not set"));
}

#[query]
fn bearer(token_identifier: TokenIdentifier) -> AccountIdentifierReturn {
    ledger().bearer(&token_identifier)
}

#[allow(unreachable_code, unused_variables)]
#[query(name = "getAllMetadataForUser")]
fn get_all_metadata_for_user(user: User) -> Vec<TokenMetadata> {
    trap("Disabled as current EXT metadata doesn't allow multiple assets per token");
    ledger().get_all_metadata_for_user(&user)
}

#[query]
fn supply(token_identifier: TokenIdentifier) -> BalanceReturn {
    ledger().supply(&token_identifier)
}

#[allow(unreachable_code, unused_variables)]
#[query]
fn metadata(token_identifier: TokenIdentifier) -> MetadataReturn {
    trap("Disabled as current EXT metadata doesn't allow multiple assets per token");
    ledger().metadata(&token_identifier)
}

#[update]
fn add(transfer_request: TransferRequest) -> TransactionId {
    expect_principal(&transfer_request.from);
    expect_principal(&transfer_request.to);
    unimplemented!();
}

#[query]
fn transactions(_transactions_request: TransactionsRequest) -> TransactionsResult {
    unimplemented!();
}

fn store_data_in_stable_store() {
    ic_kit::ic::stable_store((ledger().clone(), token_level_metadata().clone()))
        .expect("unable to store data in stable storage");
}

fn restore_data_from_stable_store() {
    let (ledger_stable, token_level_metadata_stable) =
        ic_kit::ic::stable_restore::<(Ledger, TokenLevelMetadata)>()
            .expect("unable to restore NFTLedger from stable storage");
    *ledger() = ledger_stable;
    *token_level_metadata() = token_level_metadata_stable;
}

#[init]
fn init(owner: Principal, symbol: String, name: String, history: Principal) {
    *token_level_metadata() = TokenLevelMetadata::new(Some(owner), symbol, name, Some(history));
    store_data_in_stable_store();
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::api::print(format!("Executing preupgrade"));
    store_data_in_stable_store();
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::api::print(format!("Executing postupgrade"));
    restore_data_from_stable_store();
}
