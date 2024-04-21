import fs from "fs";
import * as readline from "readline";
import { Address, Signer, Tap, Tx } from "@cmdcode/tapscript";
import util from "@cmdcode/crypto-utils";
import {
  assembleScript,
  getVsize,
  sleep,
  transactionSubmitter,
} from "./helpers";
import { relayer } from "./relayer";
import bigDecimal from "js-big-decimal";

const step = parseInt(process.argv[2]);

const DUMMY_TXID =
  "65af44e339cf9051b29c28fb0f6e3c1d8d85759d50b8506cf2f2b2b8e1148077";

const SATS_IN_INSCRIPTION = 330;
const STEP_COUNT = 3;

const preconditionCheck = () => {
  let isError = false;

  const keysAndErrorMessages = new Map([
    ["PRIVATE_KEY", "private key is"],
    ["GAS_FEES", "gas fees are"],
    ["MULTIPLIERS", "multipliers are"],
    ["MODE", "mode is"],
  ]);

  for (const [key, value] of keysAndErrorMessages.entries()) {
    if (process.env[key] == undefined) {
      console.log(
        `No ${value} present inside the .env file or no .env file was found.`
      );

      isError = true;
    }
  }

  if (isNaN(step)) {
    console.log("Invalid step argument, check your input!");
    isError = true;
  } else if (step < 0 || step > STEP_COUNT) {
    console.log("The specified step is outside of the valid step range.");
    isError = true;
  }

  if (isError) {
    process.exit();
  }
};

preconditionCheck();

const seckey = Buffer.from(process.env.PRIVATE_KEY ?? "", "hex");
const pubkey = util.keys.get_pubkey(seckey, true);

const [tseckey] = Tap.getSecKey(seckey);
const [tpubkey] = Tap.getPubKey(pubkey);

const targetAddress = Address.p2tr.fromPubKey(tpubkey, "testnet");

let xop: string;

let totalFees: number[] = Array(STEP_COUNT).fill(0);
let multipliers: number[];

// #region Basic Splitter

const basicSplitter = async (
  utxo: string
): Promise<{ inscriptionAddress: string; txId: string }> => {
  const txHex = getBasicSplitterTxData(utxo);
  const txId = await transactionSubmitter(txHex);

  return {
    inscriptionAddress: targetAddress,
    txId: txId,
  };
};

const getBasicSplitterTxData = (utxo: string): string => {
  const [txid, index] = utxo.split(":");

  const vin = [
    {
      txid,
      vout: parseInt(index),
      prevout: {
        value: totalFees[0],
        scriptPubKey: ["OP_1", tpubkey],
      },
    },
  ];

  const vouts = Array(multipliers[0]).fill({
    value: totalFees[1],
    scriptPubKey: Address.toScriptPubKey(targetAddress),
  });

  const txnData = Tx.create({
    vin,
    vout: [...vouts],
  });

  const sig = Signer.taproot.sign(tseckey, txnData, 0);

  txnData.vin[0].witness = [sig];

  return Tx.encode(txnData).hex;
};

// #endregion

// #region Split Splitter

const splitSplitter = async (txid: string) => {
  const utxos = Array.from(
    { length: multipliers[0] },
    (_, i) => `${txid}:${i}`
  );

  for (const utxo of utxos) {
    console.log(utxo);

    await sendSplitSplitterTx(utxo).then((data) => {
      fs.appendFile("output_txns.txt", `${data["txId"]}\n`, (err) => {
        if (err) {
          console.error("Error appending to file:", err);
        } else {
          console.log(data);
        }
      });
    });

    await sleep(500); // Sleep for 500ms before the next iteration (to avoid being rate limited)
  }
};

const getSplitSplitterTxData = (
  utxo: string
): { tsAddress: string; txHex: string } => {
  const [txid, index] = utxo.split(":");

  const inscribedXop = assembleScript(pubkey, xop);

  const tapleaf = Tap.encodeScript(inscribedXop);

  const [tspubkey, _] = Tap.getPubKey(pubkey, { target: tapleaf });

  const tsAddress = Address.p2tr.fromPubKey(tspubkey, "testnet");

  const vin = [
    {
      txid,
      vout: parseInt(index),
      prevout: {
        value: totalFees[1],
        scriptPubKey: ["OP_1", tpubkey],
      },
    },
  ];

  const vouts = Array(multipliers[1]).fill({
    value: totalFees[2],
    scriptPubKey: Address.toScriptPubKey(tsAddress),
  });

  const txnData = Tx.create({
    vin,
    vout: [...vouts],
  });

  const sig = Signer.taproot.sign(tseckey, txnData, 0);

  txnData.vin[0].witness = [sig];

  return {
    tsAddress: tsAddress,
    txHex: Tx.encode(txnData).hex,
  };
};

const sendSplitSplitterTx = async (
  utxo: string
): Promise<{ inscriptionAddress: string; txId: string }> => {
  const txData = getSplitSplitterTxData(utxo);
  const txId = await transactionSubmitter(txData.txHex);

  return {
    inscriptionAddress: txData.tsAddress,
    txId: txId,
  };
};

// #endregion

// #region Final Tx Crafter

const finalTxCrafter = async () => {
  const filePath = "output_txns.txt";

  // Create a readline interface
  const reader = readline.createInterface({
    input: fs.createReadStream(filePath),
    output: process.stdout,
    terminal: false,
  });

  // Listen for the 'line' event
  reader.on("line", (line) => {
    // Perform your action on the line here
    console.log(`Processing line: ${line}`);
    finalTxCrafterForLine(line);
  });

  // Handle the 'close' event
  reader.on("close", () => {
    console.log("Finished reading the file.");
  });
};

const finalTxCrafterForLine = (txid: string) => {
  const utxos = Array.from(
    { length: multipliers[1] },
    (_, i) => `${txid}:${i}`
  );

  utxos.forEach((utxo) => {
    const createdUtxo = getFinalTxData(utxo);

    fs.writeFileSync("./crafted-transactions.txt", `${createdUtxo}\n`, {
      flag: "a",
    });
  });
};

const getFinalTxData = (utxos: string): string => {
  const [txid, index] = utxos.split(":");

  const inscribedXop = assembleScript(pubkey, xop);

  const tapleaf = Tap.encodeScript(inscribedXop);

  const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });

  const vin = [
    {
      txid,
      vout: parseInt(index),
      prevout: {
        value: totalFees[2],
        scriptPubKey: ["OP_1", tpubkey],
      },
    },
  ];

  const vout = [
    {
      value: SATS_IN_INSCRIPTION,
      scriptPubKey: Address.toScriptPubKey(targetAddress),
    },
  ];

  const txnData = Tx.create({
    vin,
    vout,
  });

  const sig = Signer.taproot.sign(seckey, txnData, 0, { extension: tapleaf });

  txnData.vin[0].witness = [sig, inscribedXop, cblock];

  const txHex = Tx.encode(txnData).hex;

  return txHex;
};

// #endregion

const setXop = () => {
  const modeArgs = (process.env.MODE ?? "").split(" ");

  if (modeArgs.length == 0) {
    console.log("Invalid mode, check your input!");
    process.exit();
  }

  switch (modeArgs[0]) {
    case "SWAP": {
      if (modeArgs.length < 2) {
        console.log("Invalid mode arguments, check your .env file!");
        process.exit();
      }

      xop = `@moto:swap::cbrc-20:swap?ab=${modeArgs[1]}&a=1&b=0.00000143`;
      break;
    }

    case "MINT": {
      if (modeArgs.length < 3) {
        console.log("Invalid mode arguments, check your .env file!");
        process.exit();
      }

      xop = `cbrc-20:mint:${modeArgs[2]}=${modeArgs[1]}`;
      break;
    }

    default: {
      console.log("Invalid mode, check your .env file!");
      process.exit();
    }
  }
};

const calculateTotalFees = () => {
  const gasFees = (process.env.GAS_FEES ?? "")
    .split(",")
    .map((gasFeeString) => new bigDecimal(gasFeeString.trim()));

  multipliers = (process.env.MULTIPLIERS ?? "")
    .split(",")
    .map((multiplierString) => parseInt(multiplierString.trim()));

  const utxo = `${DUMMY_TXID}:0`;

  const txHexes = [
    getBasicSplitterTxData(utxo),
    getSplitSplitterTxData(utxo).txHex,
    getFinalTxData(utxo),
  ];

  const totalFeesPerTx = txHexes.map((txHex, index) => {
    const fees = getVsize(txHex).multiply(gasFees[index]);

    return fees.add(
      new bigDecimal(index == STEP_COUNT - 1 ? SATS_IN_INSCRIPTION : 0)
    );
  });

  for (let i = STEP_COUNT - 1; i >= 0; i--) {
    const multiplier = new bigDecimal(i == STEP_COUNT - 1 ? 1 : multipliers[i]);

    let totalFeesBigDecimal: bigDecimal;

    if (i == STEP_COUNT - 1) {
      totalFeesBigDecimal = totalFeesPerTx[i].ceil();
    } else {
      totalFeesBigDecimal = new bigDecimal(totalFees[i + 1])
        .multiply(multiplier)
        .add(totalFeesPerTx[i])
        .ceil();
    }

    totalFees[i] = parseInt(totalFeesBigDecimal.getValue());
  }
};

async function start() {
  console.log(`Step ${step} has been started!`);
  setXop();
  calculateTotalFees();
  const argument = process.argv[3];

  switch (step) {
    case 0: {
      let btcAmount = new bigDecimal(totalFees[0])
        .divide(new bigDecimal(100_000_000))
        .getValue();

      console.log(`Send ${btcAmount} BTC to yourself!`);

      break;
    }

    case 1: {
      if (argument == undefined) {
        console.log("Invalid TXID argument, check your input!");
        return;
      }

      basicSplitter(argument + ":0").then((txid) => {
        console.log(`TXID:\n${txid.txId}\n`);

        console.log(
          `Open this URL to track progress:\nhttps://mempool.space/testnet/tx/${txid.txId}`
        );
      });

      break;
    }

    case 2: {
      if (argument == undefined) {
        console.log("Invalid TXID argument, check your input!");
        return;
      }

      splitSplitter(argument);
      break;
    }

    case 3: {
      await finalTxCrafter();
      relayer();
      break;
    }
  }
}

start();
