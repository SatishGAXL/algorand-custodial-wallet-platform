import { getUserDetails } from "@/actions/globalActions";
import AccountDetails from "@/components/AccountDetails";
import { UserData } from "@/components/Header";
import NFTform from "@/components/NFT/NFTform";

async function getdata() {
  const data: UserData = await getUserDetails()!;
  return data;
}

const NonFungiblePage = async () => {
  const data = await getdata();
  return (
    <section className="min-h-screen max-w-5xl mx-auto ">
      <div className="space-y-12 py-16">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Fungible tokens
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            NFTs are unique digital assets unlike fungible tokens, with each
            holding distinct properties and metadata. They find applications in
            digital art, collectibles, and gaming, allowing for transparent
            ownership verification via blockchain. While fungible tokens
            facilitate uniform transactions, NFTs offer authenticity, scarcity,
            and uniqueness, enabling creators to monetize their work and
            collectors to invest in exclusive digital assets.
          </p>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full ">
              <AccountDetails data={data} />
            </div>
          </div>
          <NFTform />
        </div>
      </div>
    </section>
  );
};

export default NonFungiblePage;
