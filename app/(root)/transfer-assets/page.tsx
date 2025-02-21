import {
  AllAssetType,
  AssetType,
  getAccountAssets,
  getCreatedAssets,
  sendAsset,
} from "@/actions/authFormActions";
import { getUserDetails } from "@/actions/globalActions";
import AccountDetails from "@/components/AccountDetails";
import { UserData } from "@/components/Header";
import TransferTokenForm from "@/components/Transfer/TransferTokenForm";

async function getdata() {
  const data: UserData = await getUserDetails();
  return data;
}

async function getAssetdatanew() {
  const assetList: any = await getAccountAssets();
  return assetList;
}

const AssetTransferPage = async () => {
  const data = await getdata();
  const assetListNew: any = await getAssetdatanew();
  return (
    <section className=" max-w-5xl mx-auto min-h-screen pb-16 ">
      <div className="space-y-12 py-6">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Transfer your tokens
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            You can transfer the tokens you own
          </p>
        </div>

        <div className="border-b border-gray-900/10 pb-6">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full ">
              <AccountDetails data={data} />
            </div>

            {/* <TransferTokenForm assetList={assetList} /> */}
          </div>
        </div>
      </div>

      <TransferTokenForm assetListNew={assetListNew} />
    </section>
  );
};

export default AssetTransferPage;
