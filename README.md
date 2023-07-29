# XRPL-CORE-FUNCTIONS

Importing Dependencies: The code starts by importing the necessary dependencies, including the Express.js library (express), the "xrpl" library (xrpl) for XRP Ledger interactions, the MySQL library (mysql) for database operations, and the Node.js crypto module for cryptographic operations.

Defining Server and Database Connection: The code creates an Express.js app and sets up a server to listen on port 3000. It also establishes a connection to a MySQL database hosted on "viholder.com" with specific credentials.

Routes: The code defines various routes to handle different API endpoints related to the XRP Ledger and database operations. The routes include fetching XRP and token balances, NFT information, creating trustlines, sending XRP and tokens, and burning NFTs.

XRP Balance: The function get_wallet_balance(walletID) fetches the XRP balance of a specified walletID using the "xrpl" library.

Token Balance: The function get_gateway_balance(standby_wallet) retrieves the token balances associated with a gateway or issuer account.

NFT Information: The function getTokens(wallet) fetches information about Non-Fungible Tokens (NFTs) associated with a specified wallet.

Operational Send Issued Currency: The function SendCurrency(fromAccountSeed, toAccount, Quantity, currencyCode) allows the operational wallet (fromAccountSeed) to send issued tokens to another account (toAccount).

Create Operational Trustline: The function createTrustline(fromAccountSeed, toAccountSeed, Quantity, currencyCode) creates a trustline between the operational wallet (fromAccountSeed) and another account (toAccountSeed).

Burn Token: The function burnToken(TokenId, accountSeed) allows the operational wallet (accountSeed) to burn or destroy a specific Non-Fungible Token (NFT) with the given TokenId.
