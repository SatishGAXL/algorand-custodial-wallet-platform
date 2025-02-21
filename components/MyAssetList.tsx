import { AllAssetType, Asset, AssetType } from "@/actions/authFormActions";
import { NFTdetailModal } from "./NFT/NFTdetailModal";
import { Fragment } from "react";
import { Badge } from "./ui/badge";

type Props = {
  assetListNew: AllAssetType;
};

const MyAssetList = async ({ assetListNew }: Props) => {
  return (
    <>
      {assetListNew.assets.map((assetContainer, key) => (
        <Fragment key={key}>
          <div className="col-span-full ">{assetContainer.name}</div>
          <div className="col-span-full grid grid-cols-3 gap-3 ">
            {assetContainer.type === "ft" ? (
              <>
                {assetContainer.assets?.map((asset, key) => (
                  <div
                    key={key}
                    className="cursor-default relative  border border-slate-300 p-6 rounded-lg hover:border-slate-600 active:border-slate-600 focus:border-slate-600 transition-all duration-200 ease-in-out "
                  >
                    <div className="">
                      <p className="font-bold">
                        {asset.asset_details.assetName}
                      </p>

                      <p className="text-sm">
                        {asset.balance} {asset.asset_details.unitName}
                      </p>
                    </div>
                    <Badge
                      className={`absolute right-4 bottom-8 ${
                        asset.isCreated ? "bg-green-500  text-white" : "hidden"
                      } `}
                    >
                      Created
                    </Badge>
                    
                  </div>
                ))}
              </>
            ) : (
              <>
                {assetContainer.assets?.map((asset: Asset, key) => (
                  <div
                    key={key}
                    className="cursor-default  border border-slate-300 p-6 rounded-lg hover:border-slate-600 active:border-slate-600 focus:border-slate-600 transition-all duration-200 ease-in-out "
                  >
                    <NFTdetailModal asset={asset} />
                  </div>
                ))}
              </>
            )}
          </div>
        </Fragment>
      ))}
    </>
  );
};

export default MyAssetList;
