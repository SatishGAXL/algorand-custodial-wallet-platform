"use server";
import * as jwt from "jsonwebtoken";

import { prisma, prismaDisconnect } from "@/script";
import * as algosdk from "algosdk";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDetails } from "./globalActions";

/**
 * Interface defining the structure of a token response
 * Includes both fungible and non-fungible tokens
 */
interface ResponseToken {
  type: "ft" | "nft";
  name: "Fungible Token" | "Non Fungible Token";
  assets: Asset[];
}

/**
 * Interface defining the structure of an Algorand asset
 * Includes detailed asset information, balances, and metadata
 */
export interface Asset {
  amount: number;
  "asset-id": number;
  deleted: boolean;
  "is-frozen": boolean;
  "opted-in-at-round": number;
  asset_details: {
    assetId: number;
    creator: string;
    assetName: string;
    unitName: string;
    total: number;
    decimals: number;
    defaultFrozen: boolean;
    url: string | null;
  };
  balance: number;
  isCreated: boolean;
  metadata: {
    name: string;
    description: string;
    image_integrity: string;
    image_mimetype: string;
    properties: { theme: string; background: string };
    image: string;
  };
  isFractional: boolean;
  image_url: string;
}

export type AllAssetType = {
  status: boolean;
  assets: ResponseToken[];
};

export type AssetType =
  | {
      status: boolean;
      assets: {
        id: any;
        decimals: any;
        name: any;
        unit_name: any;
        balance: number;
      }[];
      msg?: undefined;
    }
  | { status: boolean; msg: string; assets?: undefined };

/**
 * Generates a JWT access token for user authentication
 * @param user Object containing username and password
 * @returns Signed JWT token string
 */
function generateAccessToken(user: {
  username: string;
  password: string;
}): string {
  const payload = {
    username: user.username,
    password: user.password,
  };

  const secret = process.env.JWT_SECRET!;
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, secret, options);
}

/**
 * Verifies the validity of a JWT access token
 * @param token JWT token to verify
 * @returns Object with success status and decoded data or error
 */
export async function verifyAccessToken(token: string | undefined) {
  const secret = process.env.JWT_SECRET!;

  if (!token) return;
  try {
    const decoded = jwt.verify(token, secret);

    return { success: true, data: decoded };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Handles user sign-in process
 * - Generates JWT token
 * - Verifies user credentials
 * - Sets authentication cookie
 * @param username User's username
 * @param password User's password
 * @returns Object with login status and user data
 */
export const handleSignIn = async (username: string, password: string) => {
  const token: string = generateAccessToken({
    username,
    password,
  });

  const type = "Signin account";
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  await prismaDisconnect();
  if (user) {
    cookies().set("authid", token, { secure: true });

    const userData = await getUserDetails();
    return {
      status: true,
      message: "User Logged In",
      data: userData,
    };
  } else {
    return {
      status: false,
      message: "User not found",
    };
  }
};

/**
 * Transfers test Algos to a new account
 * @param reciever Recipient's Algorand address
 * @returns Boolean indicating transfer success
 */
const transferTestTokens = async (reciever: string) => {
  const mastet_private = process.env.MASTER_WALLET_MNEMONIC!;
  const account = algosdk.mnemonicToSecretKey(mastet_private);
  const algod_client = new algosdk.Algodv2(
    "",
    process.env.ALGOD_URL!,
    process.env.ALGOD_PORT
  );
  const suggestedParams = await algod_client.getTransactionParams().do();
  const xferTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: reciever,
    suggestedParams,
    amount: 2000000,
  });
  const signedXferTxn = xferTxn.signTxn(account.sk);
  try {
    await algod_client.sendRawTransaction(signedXferTxn).do();
    const result = await algosdk.waitForConfirmation(
      algod_client,
      xferTxn.txID().toString(),
      3
    );
    var confirmedRound = result["confirmed-round"];
    return true;
  } catch (e: any) {
    return false;
  }
};

/**
 * Handles user registration process
 * - Creates new Algorand account
 * - Stores user details in database
 * - Transfers initial test Algos
 * @param username New user's username
 * @param password New user's password
 * @param canTransact Boolean indicating transaction permissions
 */
export const handleSignUp = async (
  username: string,
  password: string,
  canTransact: boolean
) => {
  cookies().delete("authid");

  const account = algosdk.generateAccount();
  const user = await prisma.user.create({
    data: {
      username: username,
      password: password,
      public_address: account.addr,
      private_key: algosdk.secretKeyToMnemonic(account.sk),
      canTransact: canTransact,
    },
  });
  await prismaDisconnect();
  if (user) {
    var res = await transferTestTokens(account.addr);
    var msg = "User Ceated " + ((res == true) ? "& Added 2 Algos" : "");
    return {
      status: true,
      message: msg,
      data: user,
    };
  } else {
    return {
      status: false,
      message: "User not created",
    };
  }
};

/**
 * Creates a new Algorand token/asset
 * @param asset_name Name of the asset
 * @param unit_name Unit name for the asset
 * @param total_supply Total supply of tokens
 * @param decimals Number of decimal places
 * @returns Object with creation status and transaction details
 */
export async function createToken(
  asset_name: string,
  unit_name: string,
  total_supply: number,
  decimals: number
) {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      const total = total_supply * 10 ** decimals;

      const algod_client = new algosdk.Algodv2(
        "",
        process.env.ALGOD_URL!,
        process.env.ALGOD_PORT
      );
      const suggestedParams = await algod_client.getTransactionParams().do();
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: wallet.public_address,
        suggestedParams,
        defaultFrozen: false,
        unitName: unit_name,
        assetName: asset_name,
        total: total,
        decimals: decimals,
      });
      const signedTxn = txn.signTxn(
        algosdk.mnemonicToSecretKey(wallet.private_key).sk
      );
      try {
        await algod_client.sendRawTransaction(signedTxn).do();
        const result = await algosdk.waitForConfirmation(
          algod_client,
          txn.txID().toString(),
          3
        );
        var assetIndex = result["asset-index"];
        revalidatePath("/");

        return {
          status: true,
          msg: `Asset ID created: ${assetIndex}`,
          tx_url: `https://testnet.explorer.perawallet.app/tx/${txn.txID()}`,
        };
      } catch (e: any) {
        return { status: false, msg: e.message };
      }
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
}

/**
 * Retrieves account balances and assets for authenticated user
 * @returns Object containing account balance, address, and asset details
 */
export const getAccountBalances = async () => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });

    if (wallet) {
      const indexer = new algosdk.Indexer(
        "",
        process.env.INDEXER_URL!,
        process.env.INDEXER_PORT!
      );
      var res;
      try {
        res = await indexer.lookupAccountByID(wallet.public_address).do();

        var assets = [];

        if (res.account.assets) {
          for (var i = 0; i < res.account.assets.length; i++) {
            var id = res.account.assets[i]["asset-id"];
            var amount = res.account.assets[i].amount;
            var re = await indexer.lookupAssetByID(id).do();
            var decimals = re.asset.params.decimals;
            var name = re.asset.params.name;
            var unit = re.asset.params["unit-name"];
            var balance = amount / 10 ** decimals;
            assets.push({ id, name, unit, balance, decimals });
          }
        }

        return {
          status: true,
          balance: res.account.amount / 1000000,
          address: wallet.public_address,
          assets: assets,
          canTransact: wallet.canTransact,
        };
      } catch (e: any) {
        return {
          status: true,
          balance: 0,
          address: wallet.public_address,
          assets: [],
          canTransact: wallet.canTransact,
        };
      }
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

/**
 * Retrieves assets created by the authenticated user
 * @returns Object containing list of created assets and their details
 */
export const getCreatedAssets = async () => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      const indexer = new algosdk.Indexer(
        "",
        process.env.INDEXER_URL!,
        process.env.INDEXER_PORT!
      );
      let assets = [];
      var res = await indexer
        .lookupAccountCreatedAssets(wallet.public_address)
        .do();
      for (var i = 0; i < res.assets.length; i++) {
        assets.push(res.assets[i]);
      }
      while (true) {
        if (res.nextToken) {
          var result = await indexer
            .lookupAccountCreatedAssets(wallet.public_address)
            .nextToken(res.nextToken)
            .do();
          for (var i = 0; i < result.assets.length; i++) {
            assets.push(result.assets[i]);
          }
        } else {
          break;
        }
      }
      const balances = [];
      var res = await indexer.lookupAccountAssets(wallet.public_address).do();
      for (var i = 0; i < res.assets.length; i++) {
        balances.push({
          amount: res.assets[i].amount,
          "asset-id": res.assets[i]["asset-id"],
        });
      }
      while (true) {
        if (res.nextToken) {
          var result = await indexer
            .lookupAccountAssets(wallet.public_address)
            .nextToken(res.nextToken)
            .do();
          for (var i = 0; i < result.assets.length; i++) {
            balances.push({
              amount: result.assets[i].amount,
              "asset-id": result.assets[i]["asset-id"],
            });
          }
        } else {
          break;
        }
      }

      var filtered_assets = [];
      for (var i = 0; i < assets.length; i++) {
        var id = assets[i]["index"];
        var decimals = assets[i].params.decimals;
        var name = assets[i].params.name;
        var unit_name = assets[i].params["unit-name"];
        var bal = balances.filter((ele) => {
          return ele["asset-id"] == id;
        });
        if (bal.length > 0) {
          var balance = bal[0].amount / 10 ** decimals;
        } else {
          var balance = 0;
        }
        filtered_assets.push({ id, decimals, name, unit_name, balance });
      }

      return { status: true, assets: filtered_assets };
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

/**
 * Verifies if an address belongs to a registered user
 * @param address Algorand address to check
 * @returns Object indicating if address belongs to platform user
 */
const checkAddressOrigin = async (address: string) => {
  const wallet = await prisma.user.findFirst({
    where: {
      public_address: address,
    },
  });
  if (wallet) {
    return { status: true, wallet: wallet };
  } else {
    return { status: false };
  }
};

/**
 * Checks if an address has opted in to a specific asset
 * @param reciever Address to check
 * @param asset_id Asset ID to verify
 * @returns Boolean indicating if address is opted in
 */
const checkAddressisOptedToAsset = async (
  reciever: string,
  asset_id: number
) => {
  const indexer = new algosdk.Indexer(
    "",
    process.env.INDEXER_URL!,
    process.env.INDEXER_PORT!
  );
  const q = indexer.lookupAccountAssets(reciever);
  q.query = { "asset-id": asset_id };
  const account_details = await q.do();
  if (account_details.assets.length > 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * Handles asset transfer between accounts
 * - Verifies sender has sufficient balance
 * - Handles opt-in if necessary
 * - Executes transfer transaction
 * @param reciever Recipient address
 * @param asset_id Asset ID to transfer
 * @param amt Amount to transfer
 */
export const sendAsset = async (
  reciever: string,
  asset_id: number,
  amt: number
) => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      const indexer = new algosdk.Indexer(
        "",
        process.env.INDEXER_URL!,
        process.env.INDEXER_PORT!
      );
      const asset_details = await indexer.lookupAssetByID(asset_id).do();
      const res = indexer.lookupAccountAssets(wallet.public_address);
      res.query = { "asset-id": asset_id };
      const result = await res.do();
      if (result.assets.length > 0) {
        const asset = result.assets[0];
        amt = amt * 10 ** asset_details.asset.params.decimals;
        if (amt <= asset.amount) {
          const isopted = await checkAddressisOptedToAsset(reciever, asset_id);
          const add_origin = await checkAddressOrigin(reciever);
          if (!isopted && !add_origin.status) {
            return {
              status: false,
              msg: "Reciever Account Not Optedin to the asset and his account is not from our org to initiate opt in",
            };
          } else {
            const algod_client = new algosdk.Algodv2(
              "",
              process.env.ALGOD_URL!,
              process.env.ALGOD_PORT
            );
            const suggestedParams = await algod_client
              .getTransactionParams()
              .do();
            if (isopted) {
              const xferTxn =
                algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                  from: wallet.public_address,
                  to: reciever,
                  suggestedParams,
                  assetIndex: asset_id,
                  amount: amt,
                });
              const signedXferTxn = xferTxn.signTxn(
                algosdk.mnemonicToSecretKey(wallet.private_key).sk
              );
              try {
                await algod_client.sendRawTransaction(signedXferTxn).do();
                const result = await algosdk.waitForConfirmation(
                  algod_client,
                  xferTxn.txID().toString(),
                  3
                );
                var confirmedRound = result["confirmed-round"];
                return {
                  status: true,
                  msg: `Transaction Successful in Round ${confirmedRound}`,
                  tx_url: `https://testnet.explorer.perawallet.app/tx/${xferTxn.txID()}`,
                };
              } catch (e: any) {
                return { status: false, msg: e.message };
              }
            } else {
              const atc = new algosdk.AtomicTransactionComposer();
              suggestedParams.fee = 0;
              suggestedParams.flatFee = true;
              const optInTxn =
                algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                  from: add_origin.wallet?.public_address!,
                  to: add_origin.wallet?.public_address!,
                  suggestedParams,
                  assetIndex: asset_id,
                  amount: 0,
                });
              suggestedParams.fee = 2 * 1000;
              suggestedParams.flatFee = true;
              const xferTxn =
                algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                  from: wallet.public_address,
                  to: reciever,
                  suggestedParams,
                  assetIndex: asset_id,
                  amount: amt,
                });
              const receiver_signer = algosdk.makeBasicAccountTransactionSigner(
                algosdk.mnemonicToSecretKey(add_origin.wallet?.private_key!)
              );
              atc.addTransaction({ txn: optInTxn, signer: receiver_signer });
              const sender_signer = algosdk.makeBasicAccountTransactionSigner(
                algosdk.mnemonicToSecretKey(wallet.private_key)
              );
              atc.addTransaction({ txn: xferTxn, signer: sender_signer });
              try {
                const result = await atc.execute(algod_client, 4);
                revalidatePath("/transfer-assets");
                return {
                  status: true,
                  msg: `Transaction successful in Round ${result.confirmedRound}`,
                  tx_url: `https://testnet.explorer.perawallet.app/tx/${result.txIDs[1]}`,
                };
              } catch (e: any) {
                return { status: false, msg: e.message };
              }
            }
          }
        } else {
          return { status: false, msg: "Insufficient Amount in the account" };
        }
      } else {
        return { status: false, msg: "This account hasn't created this asset" };
      }

      // return {status:true,balance:res.account.amount/1000000}
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

/**
 * Retrieves detailed asset information for authenticated user
 * - Fetches both fungible and non-fungible tokens
 * - Includes metadata and IPFS information for NFTs
 * - Caches asset details in database
 * @returns Comprehensive list of user's assets
 */
export const getAccountAssets = async (): Promise<AllAssetType | any> => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });

    if (wallet) {
      const indexer = new algosdk.Indexer(
        "",
        process.env.INDEXER_URL!,
        process.env.INDEXER_PORT!
      );
      var assets: any = [
        {
          type: "ft",
          name: "Fungible Token",
          assets: [],
        },
        {
          type: "nft",
          name: "Non Fungible Token",
          assets: [],
        },
      ];
      var temp_assets = [];
      var assets_result = await indexer
        .lookupAccountAssets(wallet.public_address)
        .do();
      for (var i = 0; i < assets_result.assets.length; i++) {
        temp_assets.push(assets_result.assets[i]);
      }
      while (true) {
        if (assets_result.nextToken) {
          var result = await indexer
            .lookupAccountAssets(wallet.public_address)
            .nextToken(assets_result.nextToken)
            .do();
          for (var i = 0; i < result.assets.length; i++) {
            temp_assets.push(result.assets[i]);
          }
        } else {
          break;
        }
      }
      const all_asset_ids = [];
      var all_assets: any = {};
      for (var i = 0; i < temp_assets.length; i++) {
        all_asset_ids.push(temp_assets[i]["asset-id"]);
        all_assets[temp_assets[i]["asset-id"]] = temp_assets[i];
      }
      var db_res = await prisma.assetDetails.findMany({
        where: {
          assetId: {
            in: all_asset_ids,
          },
        },
      });
      var completed_assets: any = [];
      for (var i = 0; i < db_res.length; i++) {
        var row = db_res[i];
        all_assets[row.assetId].asset_details = row;
        completed_assets.push(row.assetId);
      }
      var remaining_assets = all_asset_ids.filter(
        (element) => !completed_assets.includes(element)
      );
      for (var i = 0; i < remaining_assets.length; i++) {
        var indexer_result = await indexer
          .lookupAssetByID(remaining_assets[i])
          .do();
        if (indexer_result.asset) {
          const row = {
            assetId: indexer_result.asset.index,
            creator: indexer_result.asset.params.creator,
            assetName: indexer_result.asset.params.name,
            unitName: indexer_result.asset.params["unit-name"],
            total: indexer_result.asset.params.total,
            decimals: indexer_result.asset.params.decimals,
            defaultFrozen: indexer_result.asset.params["default-frozen"],
            url: indexer_result.asset.params.url,
          };
          const assetDetail = await prisma.assetDetails.create({
            data: row,
          });
          if (assetDetail) {
            all_assets[row.assetId].asset_details = row;
          } else {
            continue;
          }
        } else {
          continue;
        }
      }
      for (const key in all_assets) {
        if (all_assets[key].asset_details.url === null) {
          var balance =
            all_assets[key].amount /
            10 ** all_assets[key].asset_details.decimals;
          var isCreated =
            wallet.public_address == all_assets[key].asset_details.creator
              ? true
              : false;
          assets[0].assets.push({
            ...all_assets[key],
            balance: balance,
            isCreated: isCreated,
          });
        } else {
          const ipfs_gateway = "https://ipfs.algonode.xyz/ipfs/";
          var metadata_res = await fetch(
            ipfs_gateway + all_assets[key].asset_details.url.split("://")[1]
          );
          var metadata = await metadata_res.json();
          var balance =
            all_assets[key].amount /
            10 ** all_assets[key].asset_details.decimals;
          var isCreated =
            wallet.public_address == all_assets[key].asset_details.creator
              ? true
              : false;
          var isFractional =
            all_assets[key].asset_details.decimals > 0 ? true : false;
          var image_url = ipfs_gateway + metadata.image.split("://")[1];
          assets[1].assets.push({
            ...all_assets[key],
            balance: balance,
            isCreated: isCreated,
            metadata,
            isFractional,
            image_url,
          });
        }
      }
      return { status: true, assets };
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};