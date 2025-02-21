import { getUserDetails } from "@/actions/globalActions";
import AccountDetails from "@/components/AccountDetails";
import FungibleForm from "@/components/Fungible/FungibleForm";
import { UserData } from "@/components/Header";

async function getdata() {
  const data: UserData = await getUserDetails()!;
  return data;
}

const RootPage = async () => {
  const data = await getdata();

  return (
    <section className=" max-w-5xl mx-auto ">
      <div className="space-y-12 py-16">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Create a fungible token
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Fungible tokens are digital assets that are identical and
            interchangeable, much like identical coins or banknotes. Each token
            holds the same value and can be exchanged on a one-to-one basis
            without distinction between individual units. They're commonly used
            in blockchain applications like cryptocurrencies, where uniformity
            is key for seamless transactions.
          </p>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full ">
              <AccountDetails data={data} />
            </div>
          </div>
          <FungibleForm data={data} />
        </div>
      </div>
    </section>
  );
};

export default RootPage;
