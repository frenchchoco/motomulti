import fs from "fs";
import * as readline from "readline";
import { Address, Signer, Tap, Tx } from "@cmdcode/tapscript";
import util from "@cmdcode/crypto-utils";
import { assembleScript, transactionSubmitter } from "./helpers";
import { relayer } from "./relayer";

const seckey = Buffer.from(process.env.PRIVATE_KEY ?? "", "hex");
const pubkey = util.keys.get_pubkey(seckey, true);

const [tseckey] = Tap.getSecKey(seckey);
const [tpubkey] = Tap.getPubKey(pubkey);

const targetAddress = Address.p2tr.fromPubKey(tpubkey, "testnet");

const xop = "@moto:swap::cbrc-20:swap?ab=PIZZA-WAGMI&a=1&b=0.00000143";

const transactionSplitterBasic = async (utxo: string) => {
  const [txid, index] = utxo.split(":");

  const vouts = Array(200).fill({
    // x200
    value: 5_000_000, // 0.05 BTC
    scriptPubKey: Address.toScriptPubKey(targetAddress),
  });

  const vin = [
    {
      txid,
      vout: Number(index),
      prevout: {
        value: 1_010_000_000, // 10.1 BTC
        scriptPubKey: ["OP_1", tpubkey],
      },
    },
  ];

  const txnData = Tx.create({
    vin,
    vout: [...vouts],
  });

  const sig = Signer.taproot.sign(tseckey, txnData, 0);

  txnData.vin[0].witness = [sig];

  const txHex = Tx.encode(txnData).hex;

  const txId = await transactionSubmitter(txHex);

  return {
    inscriptionAddress: targetAddress,
    txId,
  };
};

const transactionSplitter = async (utxo: string) => {
  const [txid, index] = utxo.split(":");

  const inscribedXop = assembleScript(pubkey, xop);

  const tapleaf = Tap.encodeScript(inscribedXop);

  const [tspubkey, _] = Tap.getPubKey(pubkey, { target: tapleaf });

  const tsAddress = Address.p2tr.fromPubKey(tspubkey, "testnet");

  const vouts = Array(1000).fill({
    // x1000
    value: 3_000, // 0.0003 BTC
    scriptPubKey: Address.toScriptPubKey(tsAddress),
  });

  const vin = [
    {
      txid,
      vout: Number(index),
      prevout: {
        value: 5_000_000, // 0.05 BTC
        scriptPubKey: ["OP_1", tpubkey],
      },
    },
  ];

  const txnData = Tx.create({
    vin,
    vout: [...vouts],
  });

  const sig = Signer.taproot.sign(tseckey, txnData, 0);

  txnData.vin[0].witness = [sig];

  const txHex = Tx.encode(txnData).hex;

  const txId = await transactionSubmitter(txHex);

  return {
    inscriptionAddress: tsAddress,
    txId,
  };
};

const createUtxo = (utxos: string) => {
  const [txid, index] = utxos.split(":");

  const inscribedXop = assembleScript(pubkey, xop);

  const tapleaf = Tap.encodeScript(inscribedXop);

  const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });

  const vin = [
    {
      txid,
      vout: Number(index),
      prevout: {
        value: 3_000, // 0.0003 BTC
        scriptPubKey: ["OP_1", tpubkey],
      },
    },
  ];

  const vout = [
    {
      value: 330,
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

const transactionsCrafter = (txid: string) => {
  const utxos = Array.from({ length: 1000 }, (_, i) => `${txid}:${i}`); // x1000

  utxos.forEach((utxo) => {
    const createdUtxo = createUtxo(utxo);

    fs.writeFileSync("./crafted-transactions.txt", `${createdUtxo}\n`, {
      flag: "a",
    });
  });
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const splitSplitter = async (txid: string) => {
  const utxos = Array.from({ length: 200 }, (_, i) => `${txid}:${i}`); // x200

  for (const utxo of utxos) {
    console.log(utxo);
    await transactionSplitter(utxo).then((data) => {
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
    transactionsCrafter(line);
  });

  // Handle the 'close' event
  reader.on("close", () => {
    console.log("Finished reading the file.");
  });
};

async function start() {
  const step = process.argv[2];
  const argument = process.argv[3];

  switch (step) {
    case "1": {
      if (argument == undefined) {
        console.log("Invalid txid argument, check your input!");
        return;
      }

      transactionSplitterBasic(argument + ":0").then((txid) => {
        console.log(`TXID:\n${txid.txId}\n`);

        console.log(
          `Open this URL to track progress:\nhttps://mempool.space/testnet/tx/${txid.txId}`
        );
      });

      break;
    }
    case "2": {
      if (argument == undefined) {
        console.log("Invalid txid argument, check your input!");
        return;
      }

      splitSplitter(argument);
      break;
    }
    case "3": {
      await finalTxCrafter();
      relayer();
      break;
    }
    default: {
      console.log("Invalid step, check your input!");
      break;
    }
  }
}

start();
