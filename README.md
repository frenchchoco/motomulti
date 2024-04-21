# motomulti

A Motoswap Testnet farmer. Based on https://github.com/sanjaybuddapar/motogiga which is based on https://github.com/cryptosalomao/urabalu.

# Extra features compared to motogiga

⏳ parallel processing  
⏳ the ability to set gas fees in sats/vb  
⏳ built-in sybiling without a separate script  
⏳ replacing fees  
✅ using arguments to run different steps instead of commenting out stuff  
⏳ eventually: eliminating the need of manually running different steps by watching tx confimations automatically

# pls gib

If you found it useful, donate us precious tokens and i will spend it on hookers with dicks!

## Tamas (meeeeeee :3)
Bitcoin: bc1pffdrehs8455lgnwquggf4dzf6jduz8v7d2usflyujq4ggh4jaapqkpyaa7  
EVM-based tokens (Ethereum, Polygon, Avalanche etc.): 0x0De8947c2ABd59C201e5EcE142bFCd22253BFC0d  
Solana: bzuNzCMgxRgWuDhg9yBTsto9rkNL96LsVWo6YurNQQf

## Mike (motogiga dev)
Soon...

## Guilherme (urabalu dev)
Bitcoin: bc1qnggsl6k7npzaeql34w50ur4ytertps48tx7zqczuasz3mh4q9jlqlha0cl

# How to Run
 
## 1. 
- Download the repo (Code > Download as ZIP / Github / Github Desktop / etc).
- Extract the ZIP file if needed and make note of where the extracted folder is.
  
## 2.
- Run `npm install` inside the folder (`cd folder` to get to the folder first).
- Make sure nodejs is on your computer, get it here: `https://nodejs.org/en`
- Open a command terminal (cmd.exe on Windows/Terminal on Mac/Linux).
- Type `cd folder-path-here` to open the folder.
- Run `npm install` next after getting to the correct folder.

## 3.
- Put your private key exported from Unisat at the top (Unisat > Account # > ... > Export > Hex Key).
- Create a new file in the root folder of the codebase named ".env". It should satart with a dot.
  
- The contents of the file should be the following (replace `<your private key here>` with your private key, obviously):

  ```
  PRIVATE_KEY=<your private key here>
  ```

- Be smart and only use automation on fresh wallets, it's not worth the risk any other way. (Let me be the brave boy who uses his main wallet to test :DDDD)

## 4.   
- Send yourself 10.1 tBTC and ***wait for confirmation***! By sending your own account 10.1 tBTC, you are creating a new unspent UTXO.
- Copy the ID from Unisat after hitting Send by clicking "Show in Explorer" under the checkmark.
- The TX ID is the hash at the top (looks something like this: 2ad2c5e7711c213421f84718d1cfdcfad2f0043bf18bca3a678a101cc64137c3), copy it.

## 5.
- Run step 1 of the script by running the following command in cmd.exe/Terminal:

  ```
  npx tsx --env-file=.env index.ts 1 <the txid copied in the previous step>
  ```

- So, if the txid is 2ad2c5e7711c213421f84718d1cfdcfad2f0043bf18bca3a678a101cc64137c3, you should run:

  ```
  npx tsx --env-file=.env index.ts 1 2ad2c5e7711c213421f84718d1cfdcfad2f0043bf18bca3a678a101cc64137c3
  ```

## 6.
- Open the URL printed out to your console, copy the TXID and ***wait for the TX to confirm***.

## 7.
- Run step 2 of the script by running the following command in cmd.exe/Terminal:
  ```
  npx tsx --env-file=.env index.ts 2 <the txid copied in the previous step>
  ```

- So, if the txid is 2ad2c5e7711c213421f84718d1cfdcfad2f0043bf18bca3a678a101cc64137c3, you should run:

  ```
  npx tsx --env-file=.env index.ts 1 2ad2c5e7711c213421f84718d1cfdcfad2f0043bf18bca3a678a101cc64137c3
  ```

## 8.
- Wait for all 200 of those TXNs to confirm and recomment out this step.
- You can track the progress by going to `https://mempool.space/testnet/address/<your testnet address>` and see whether you have unconfimed transactions. (This only works efficiently if you have only 1 process running for now - this will be drastically improved in the future).

## 9.
- Run step 3 of the script by running the following command in cmd.exe/Terminal:
  ```
  npx tsx --env-file=.env index.ts 3
  ```

## 10.
- Smoke some green. You deserve it, chad.

# Make sure to do the following if you're running this more than one time

- Rename or delete crafted-transactions.txt.
- Rename or delete output_txns.txt.

# Additional Info

You can edit the values that are sent to increase or decrease gas used. This is to send 200,000 transactions at ~15 sats/vb.
By changing the values and numbers inside each of the commented lines, you can achieve different number of transactions, and different gas amounts.

## Additional files
- Python selenium bot which creates a new wallet, makes 5 new accounts, then attempts to swap. The file is _selenium_bot_sybiler.py_, take a look if you want. (will be obsolete soon)
- Feel free to take this and extend it in any way you see fit. Works very well for automation.