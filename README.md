# ETHEREUM INDEXER
A rudimentary Ethereum indexer that scans the blockchain and updates the balances of deposit addresses in databases. Withdrawals, like those on a centralised exchange (CEX), can be updated with specifics if the user so desires.

## Key Features
* **Atomicity** - usage of multiple RPC providers for confirming transaction accuracy
* **Minimal RPC calls** - one rpc call per rpc provider over the block
* **Fast Balance Updation** - balances are updated as the block is indexed without backend request avoiding issues(latency, transaction error, etc.)
* **Withdrawals** - users can withdraw from withdrawal Hot Wallet by specifying both to address and amount.
* **Security** - before updating the database, transaction hashes are verified to see whether they are signed or not.
* **Timestamp** - time record in db for which the transaction has been processed/signed