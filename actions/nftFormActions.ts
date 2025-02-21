"use server";
import * as jwt from "jsonwebtoken";
import { prisma, prismaDisconnect } from "@/script";
import * as algosdk from "algosdk";
import { cookies } from "next/headers";
import { NFTStorage, File, Blob } from "nft.storage";
import { verifyAccessToken } from "./authFormActions";
const fs = require("fs");
const mime = require("mime-types");
const crypto = require("crypto");

/**
 * Extracts file details from a given file path
 * @param filePath Path to the file
 * @returns Object containing blob content, filename, and mimetype
 * @throws Error if file reading fails
 */
async function getFileDetails(filePath: string) {
  try {
    // Read file asynchronously
    const data = await fs.promises.readFile(filePath);

    // Get filename from file path
    const filename = filePath.split("/").pop();

    // Determine mimetype of the file
    const mimetype = mime.lookup(filePath);

    // Create blob content from file data
    const blobContent = new Blob([data], { type: mimetype });

    return {
      blobContent,
      filename,
      mimetype,
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

/**
 * Calculates SHA256 hash of blob content
 * Used for image integrity verification in NFT metadata
 * @param blobContent Blob to calculate hash for
 * @returns Promise resolving to hex string of SHA256 hash
 * @throws Error if blob is undefined or hash calculation fails
 */
async function calculateSHA256(blobContent: Blob | undefined): Promise<string> {
  if (!blobContent) {
    throw Error("No Blob found in calculateSHA256");
  }
  try {
    var buffer = Buffer.from(await blobContent.arrayBuffer());
    const hash = crypto.createHash("sha256");
    hash.update(buffer);
    return hash.digest("hex");
  } catch (error: any) {
    throw error;
  }
}

// NFT.Storage configuration for IPFS storage
const NFT_STORAGE_TOKEN =
  process.env.NFT_STORAGE_TOKEN!;
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

/**
 * Creates a new NFT on Algorand blockchain
 * Handles the complete NFT creation process:
 * 1. Validates user authentication
 * 2. Processes image file and calculates integrity hash
 * 3. Uploads metadata and image to IPFS
 * 4. Creates Algorand ASA (Asset) with NFT properties
 * 
 * @param formData Form data containing NFT details (name, description, image, etc.)
 * @param properties Array of key-value pairs for additional NFT properties
 * @returns Object containing transaction status, message, and explorer URL
 * 
 * Required formData fields:
 * - asset_name: Name of the NFT
 * - unit_name: Unit name for the NFT
 * - description: NFT description
 * - total_tokens: Number of tokens to mint
 * - decimals: Number of decimal places (0 for pure NFT)
 * - image: NFT image file
 * - originalFile: Original image file reference
 */
export const createNFT = async (
  formData: FormData,
  properties: { key: string; value: string }[]
) => {
  const asset_name = formData.get("asset_name")?.toString();
  const unit_name = formData.get("unit_name")?.toString();
  const nft_description = formData.get("description")?.toString();
  let total_nfts = Number(formData.get("total_tokens"));
  const decimals = Number(formData.get("decimals"));
  const image = formData.get("image");
  const originalFile = formData.get("originalFile") as File;

  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      if (decimals > 0) {
        total_nfts = total_nfts * 10 ** decimals;
      }

      try {
        // const image_details = await getFileDetails(image); // gets image details like blob,name,mimetypr
        const hash = await calculateSHA256(image as Blob) //calculates hash of the blob
          .then(async (hash) => {
            return hash;
          })
          .catch((error) => {
            return { status: false, msg: "Error calculating SHA256 hash:" };
          });

        const metadataa = {
          name: asset_name!,
          description: nft_description!,
          image: originalFile as File,
          image_integrity: `sha256-${hash}`,
          image_mimetype: originalFile?.type,
          properties: properties,
        };

        const metadata = await client.store(metadataa); // uploading files to ipfs
        if (metadata.url) {
          const algod_client = new algosdk.Algodv2(
            "",
            process.env.ALGOD_URL!,
            process.env.ALGOD_PORT
          );
          const suggestedParams = await algod_client
            .getTransactionParams()
            .do();
          const assetUrl = metadata.url + "#arc3";
          const nft_txn =
            algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
              from: wallet.public_address,
              suggestedParams,
              defaultFrozen: false,
              unitName: unit_name,
              assetName: asset_name,
              manager: wallet.public_address,
              reserve: wallet.public_address,
              freeze: wallet.public_address,
              clawback: wallet.public_address,
              assetURL: assetUrl,
              total: total_nfts,
              decimals: decimals,
            });
          const signed_nft_txn = nft_txn.signTxn(
            algosdk.mnemonicToSecretKey(wallet.private_key).sk
          );
          try {
            await algod_client.sendRawTransaction(signed_nft_txn).do();
            const result = await algosdk.waitForConfirmation(
              algod_client,
              nft_txn.txID().toString(),
              3
            );
            var confirmedRound = result["confirmed-round"];
            return {
              status: true,
              msg: `Transaction Successful in Round ${confirmedRound}`,
              tx_url: `https://testnet.explorer.perawallet.app/tx/${nft_txn.txID()}`,
            };
          } catch (e: any) {
            return { status: false, msg: e.message };
          }
        } else {
          return { status: false, msg: "Failed to Upload Files to IPFS" };
        }
      } catch (error) {
        return { status: false, msg: "Error Occured while reading file" };
      }
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};
