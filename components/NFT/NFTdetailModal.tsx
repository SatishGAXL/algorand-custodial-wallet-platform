import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Asset } from "@/actions/authFormActions";
import { Badge } from "../ui/badge";

type Props = {
  asset: Asset;
};

export function NFTdetailModal({ asset }: Props) {
  const jsonData = JSON.stringify(asset.metadata, null, 2);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="text-center relative w-full ">
          <div className="relative h-[330px] cursor-pointer  ">
            <Image
              fill
              objectPosition="center"
              objectFit="contain"
              src={asset.image_url}
              alt="Uploaded Asset"
              className="mx-auto object-cover rounded-lg"
            />
          </div>
          <Badge
            className={`absolute right-3 bottom-1 ${
              asset.isCreated ? "bg-green-500  text-white" : "hidden"
            } `}
          >
            Created
          </Badge>
          <Badge
            className={` ${
              asset.isFractional ? "bg-orange-500  text-white" : "hidden"
            }  absolute left-3 bottom-1`}
          >
            Fractional NFT
          </Badge>
          <Badge
                      className={`absolute right-3 top-1 bg-purple-500`}
                    >
                      x{asset.balance}
                    </Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{asset.asset_details.assetName}</DialogTitle>
          <DialogDescription>
            Balance : {asset.balance} {asset.asset_details.unitName}
          </DialogDescription>
          <DialogDescription>
            Decimals : {asset.asset_details.decimals}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className=" w-full bg-white p-6 rounded-lg shadow-md">
            <pre className="whitespace-pre-wrap text-sm">{jsonData}</pre>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
