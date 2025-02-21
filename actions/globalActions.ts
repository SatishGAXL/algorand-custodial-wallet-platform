"use server";

import { cookies } from "next/headers";
import { getAccountBalances, verifyAccessToken } from "./authFormActions";
import { UserData } from "@/components/Header";

/**
 * Server action to retrieve authenticated user's complete details
 * Combines JWT data with blockchain account information
 * 
 * @returns {Promise<UserData>} Object containing:
 * - JWT verification data (username, etc)
 * - Account balance in Algos
 * - Wallet address
 * - List of owned assets
 * - Transaction permissions
 * 
 * @throws Logs error if authentication or data fetching fails
 */
export async function getUserDetails() {
  try {
    // Get blockchain account data including balances and assets
    const data = await getAccountBalances();

    // Verify JWT token from cookies
    const cookieStore = cookies();
    const isAuth = cookieStore.get("authid");
    const isJWTVerified: any = await verifyAccessToken(isAuth?.value);

    // Merge JWT data with account data
    const obj: UserData = {
      ...isJWTVerified?.data,
      ...data,
    };

    return {
      ...isJWTVerified?.data,
      ...data,
    };
  } catch (error) {
    console.log(error);
  }
}
