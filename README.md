# funy danny

oops no more updates. FUCK DANNY AND FUCK MOTOSWAP

# motomulti

A Motoswap Testnet farmer. Based on https://github.com/sanjaybuddapar/motogiga which is based on https://github.com/cryptosalomao/urabalu.

# A Message

I got banned from all the official Motoswap Telegram groups for making the following tweet: https://twitter.com/fluffmoney/status/1782036629424673036

Everything in the tweet is 100% factual and comes from the devs themselves. This is the first written post on X on the matter AFAIK. Don't ask me why the devs didn't make an announcement post of all this... It was allegedly "mentioned in X Spaces" (months after the token had been created with the fixed supply, BTW), but I (and many others) don't have the time to listen to all the Spaces on X.

Since we got paid for finishing this bot and the web UI, I will. (I'm not that shady as others might be.)

However, don't expect me to be super involved after all this. Progress will be slower and in my own tempo.

Even so, I'll be around in the largest Moto Telegram chat I'm still in (https://t.me/motobikeridersclub), find me there if you need help (my profile: https://t.me/tamassengel)!

# Extra features compared to motogiga

⏳ parallel processing  
✅ the ability to set gas fees in sats/vb  
⏳ built-in sybiling without a separate script  
⏳ replacing fees  
✅ a new bulk token minter mode  
✅ advanced error handling  
✅ using arguments to run different steps instead of commenting out stuff  
⏳ eventually: eliminating the need of manually running different steps by watching tx confirmations automatically

# pls gib

If you found it useful, donate us precious tokens and i will spend it on hookers with dicks!  
(I asked for Mike (motogiga dev) for addresses as well, but he didn't want to get donations for this :o)

## Tamas (meeeeeee :3)

Bitcoin: bc1pffdrehs8455lgnwquggf4dzf6jduz8v7d2usflyujq4ggh4jaapqkpyaa7  
EVM-based tokens (Ethereum, Polygon, Avalanche etc.): 0x0De8947c2ABd59C201e5EcE142bFCd22253BFC0d  
Solana: bzuNzCMgxRgWuDhg9yBTsto9rkNL96LsVWo6YurNQQf

## Guilherme (urabalu dev)

Bitcoin: 3D6TEUfALF7ZFnqs5pT9M6J3iWc49xotML  
EVM-based tokens (Ethereum, Polygon, Avalanche etc.): 0x690346d8a7dfe01b01a2f1439e6ec40943d2866e  
Solana: ETgfy4sSWb9NesEDCGg3Ns2iw9SsjZgiziobquwfQaPq

# How to Run
 
## 1.

- Download the repo (Code > Download as ZIP / Github / Github Desktop / etc).
- Extract the ZIP file if needed and make note of where the extracted folder is.
  
## 2.

- Make sure NodeJS is on your computer, get it here: https://nodejs.org/en
- Open a command terminal (cmd.exe on Windows and Terminal on Mac/Linux).
- Type `cd "folder-path-here"` to open the folder. If your folder is located at C:\dev\motomulti, enter `cd "C:\dev\motomulti"`.
- Run `npm install` next after getting to the correct folder.

## 3.

- Copy your hex private key from Unisat (Account # > ... > Export Private Key > Hex Private Key).
- Create a new file in the root folder of the codebase named ".env". The name should start with a dot.
  
- The contents of the file should be the following (replace the things between `<` and `>` with the values you want):

  ```
  PRIVATE_KEY = <your private key here>
  GAS_FEES = <gas fees for the 3 steps in sats/vB, separated by commas>
  MULTIPLIERS = <transaction multipliers for the 2 last steps involving multiple txes, separated by a comma>
  MODE = <see below>
  ```

- There are 2 modes. You can change between swapping tokens (which farms you Moto points) and minting a token.
  - To use the swap mode, write `SWAP <ticker A>-<ticker B>`.
  - To use the mint mode, write `MINT <amount> <ticker>`.

- Example 1:

  ```
  PRIVATE_KEY = y0uaRen0tg3tt1ngMyPr1vK3yUFuck3r
  GAS_FEES = 120, 100, 55.6
  MULTIPLIERS = 200, 1000
  MODE = SWAP PIZZA-WAGMI
  ```

- Example 2:

  ```
  PRIVATE_KEY = y0uaRest1lln0tg3tt1ngMyPr1vK3yUFuck3r
  GAS_FEES = 55, 55, 55
  MULTIPLIERS = 150, 800
  MODE = MINT 100 PIZZA
  ```

- Make sure not to modify this file while a process is running! Only modify it if you've reached the end of step 3 and before you re-run motomulti!
- Be smart and only use automation on fresh wallets, it's not worth the risk any other way. (Let me be the brave boy who uses his main wallet to test :DDDD)

## 4.

- Run step 0 of the script by running the following command in cmd.exe/Terminal:

  ```
  npx tsx --env-file=.env index.ts 0
  ```

- Send yourself the amount it prints out and ***wait for confirmation***! By sending your own account tBTC, you are creating a new unspent UTXO.
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

- Open the URL printed out to your console, copy the TXID and ***wait for the TX to confirm***.

## 6.

- Run step 2 of the script by running the following command in cmd.exe/Terminal:
  ```
  npx tsx --env-file=.env index.ts 2 <the txid copied in the previous step>
  ```

- So, if the txid is 2ad2c5e7711c213421f84718d1cfdcfad2f0043bf18bca3a678a101cc64137c3, you should run:

  ```
  npx tsx --env-file=.env index.ts 2 2ad2c5e7711c213421f84718d1cfdcfad2f0043bf18bca3a678a101cc64137c3
  ```

- ***Wait for all 200 of those TXNs to confirm***.
- You can track the progress by going to `https://mempool.space/testnet/address/<your testnet address>` and see whether you have unconfimed transactions. (This only works efficiently if you have only 1 process running for now - this will be drastically improved in the future).

## 7.

- Run step 3 of the script by running the following command in cmd.exe/Terminal:

  ```
  npx tsx --env-file=.env index.ts 3
  ```
- After a bit of processing, the final TXes will start to get generated. Expect this process to be long (it can take multiple days). The speed will get improved in the future; in the meantime, use multiple motomulti instances to speed the process up.

## 8.

- Smoke some green. You deserve it, chad.

# Make sure to do the following if you're running this more than one time

- Rename or delete crafted-transactions.txt.
- Rename or delete output_txns.txt.

# Additional Info

- There is a Python Selenium bot included which creates a new wallet, makes 5 new accounts, then attempts to swap. The file is _selenium_bot_sybiler.py_, take a look if you want. (will be obsolete soon)
- Feel free to take this and extend it in any way you see fit. Works very well for automation.
