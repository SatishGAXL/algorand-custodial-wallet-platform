import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { FaCopy } from "react-icons/fa";

import { getUserDetails } from "@/actions/globalActions";
import ClickToCopy from "./ClickToCopy";
import { redirect } from "next/navigation";

import { FaUserAstronaut } from "react-icons/fa";
import { FaAddressCard } from "react-icons/fa6";

export interface UserData {
  username: string;
  password: string;
  iat: number;
  exp: number;
  status: boolean;
  balance: number;
  address: string;
  assets: any[];
  canTransact: boolean;
}

async function getdata() {
  const data: UserData = await getUserDetails();
  return data;
}

const Header = async () => {
  const data: UserData = await getdata();

  if (!data?.status) {
    redirect("/signin");
  }

  return (
    <header className="w-full ">
      <div className="max-w-5xl mx-auto flex justify-between items-center py-7  ">
        <div className="flex gap-8 items-center">
          <Link href={"/"}>Fungible Token</Link>
          <Link href={"/non-fungible"}>NFT</Link>
          <Link href={"/transfer-assets"}>Transfer Token</Link>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="border border-slate-300 py-1 px-3 rounded-lg hover:border-slate-600 active:border-slate-600 focus:border-slate-600 ">
              <div className="flex flex-col items-end ">
                <p className="flex items-center gap-3">
                  {data.username} <FaUserAstronaut />
                </p>
                <div className="flex items-center gap-3">
                  <p className="truncate w-[400px] ">{data.address}</p>
                  <FaAddressCard />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <ClickToCopy address={data.address} />
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/my-assets">My Assets</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/signin">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
