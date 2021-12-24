![Frame 22](https://user-images.githubusercontent.com/73345016/144860113-c04a84ab-cb4f-4623-818c-ccf8e0541dcf.png)

# Wrapped ICP - WICP

Wrapped ICP (WICP) is a wrapped version of the IC's native token, ICP. Each WICP will be backed 1:1 with ICP, meaning that 1 WICP will always have the exact same value as 1 ICP. The only difference is that, unlike ICP, WICP uses the DIP20 fungible token standard that is specifically designed to allow for interoperability between dApps and other tokens.

- [Wrapped ICP Website](https://dank.ooo/wicp/) 
- [Using WICP Guide](https://docs.dank.ooo/wicp/getting-started/)

---
## 🧰 Interacting with Wrapped ICP (WICP) - On Mainnet (DFX)

In order to interact with the Internet Computer mainnet version of the Wrapped ICP (WICP) canister, you need the address.

- WICP Canister ID: `utozz-siaaa-aaaam-qaaxq-cai`
- WICP Account ID: `cc659fe529756bae6f72db9937c6c60cf7ad57eb4ac5f930a75748927aab469a`

You have to use this address (Canister ID) to make your calls, with the exception of the Account ID during the mint.

---

## ✒️ Update Calls

All update functions are allowed to trap, instead of returning an error in order to take advantage of the canisters automatic, atomic state rollback.

---

### Deposit ICP to mint an WICP balance - mint

Using the mint method is done in two steps. First, we need to make a transfer call at the ICP ledger to the WICP account ID. Using the following command you’ll be returned the block height when your transaction was approved. 

```bash
dfx ledger --network ic transfer --amount value "cc659fe529756bae6f72db9937c6c60cf7ad57eb4ac5f930a75748927aab469a" --memo 0
```

Now that we have the blockheight of our ICP transfer, we can call the mint method on the WICP canister. In addition, the mint method takes ‘subaccount’, a parameter that allows you to specify if you’ve made the previous ICP transfer from a subaccount. Index 0 is your main account, while all non-zero indices refer to subaccounts.

```bash
dfx canister --no-wallet --network ic call utozz-siaaa-aaaam-qaaxq-cai mint '(subaccount, blockheight:nat64)'
```

---

### Unwrap your WICP and regain a balance of ICP - withdraw

Calling withdraw unwraps your WICP, burns it, and then unlocks and sends ICP from the WICP canister to the balance of the Principal ID you specify.

The Withdraw method takes two parameters, ‘value’ and ‘to’. Value is an integer that represents the amount of WICP you’d like to withdraw to ICP. To is a string that should be the Principal ID that you wish the ICP to be transferred to. 

```bash
dfx canister --no-wallet --network ic call utozz-siaaa-aaaam-qaaxq-cai withdraw '(value:nat64, "account id")'
```

---

### Transfer WICP to Another WICP Balance - transfer

You can transfer WICP to any other valid Principal ID. Your balance at the WICP ledger will be deducted and the Principal ID you transfer to, will be incremented.

Transfers ‘value’ (Nat) amount of tokens to user ‘to’ (Principal), returns a TxReceipt which contains the transaction index or an error message.

```bash
dfx canister --network=ic --no-wallet call utozz-siaaa-aaaam-qaaxq-cai transfer "(principal \"to-account-principal\", 1000:nat)"
```
---

### Set an Allowance to Another Identity - approve

You can set an allowance using this method, giving a third-party access to a specific number of tokens they can withdraw from your balance if they want.

An allowance permits the ‘spender’ (Principal) to withdraw tokens from your account, up to the ‘value’ (Nat) amount. If it is called again it overwrites the current allowance with ‘value’ (Nat). There is no upper limit for value, you can approve a larger value than you have, but 3rd parties are still bound by the upper limit of your account balance.

```bash
dfx canister --network=ic --no-wallet call utozz-siaaa-aaaam-qaaxq-cai approve "(principal \"third-party-principal-id\", 1000:nat)"
```

---

### Transfer WICP on Another User's Behalf - transferFrom
Transfers ‘value’ (Nat) amount of tokens from user ‘from’ (Principal) to user ‘to’ (Principal), this method allows canister smart contracts to transfer tokens on your behalf, it returns a TxReceipt which contains the transaction index or an error message.

```bash
dfx canister --network=ic --no-wallet call utozz-siaaa-aaaam-qaaxq-cai transferFrom "(principal \"from-account-principal\",principal \"to-account-principal\", 1000:nat)"
```
---

## 📡 Query Calls
The query calls in this section do not require any fee as they are only reading information, not modifying it.

### Check your Balance - balanceOf
Returns the balance of user `who`.

```bash
​​dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai balanceOf "(principal \"who-account-principal\")"
```

---

### Check the set allowance for an ID - allowance
Returns the amount which spender is still allowed to withdraw from owner.

```bash
dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai allowance "(principal \"owner-account-principal\", principal \"spender-account-principal\")"
```

### Get token logo - getLogo 
Returns the logo of Wrapped ICP (WICP).

```bash
dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai getLogo
```

---

### Get token name - name
Returns the name of Wrapped ICP (WICP).

```bash
dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai name
```

---

### Get token symbol - symbol
Returns the symbol of the token.

```bash
dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai symbol
```

---

### Get token decimals - decimals
Returns the decimals of the token.

```bash
dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai decimals
```
 
---

### Get total supply of token - totalSupply
Returns the total supply of the token.

```bash
dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai totalSupply
```

---

### Get token’s metadata - getMetadata
Returns the metadata of the token.

```bash
dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai getMetadata
```

---

### historySize
Returns the history size.

```bash
dfx canister --network=ic --no-wallet call --query utozz-siaaa-aaaam-qaaxq-cai historySize
```
