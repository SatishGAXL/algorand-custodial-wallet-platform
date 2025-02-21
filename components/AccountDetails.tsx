import { UserData } from "./Header";

type Props = { data: UserData };

const AccountDetails = async ({ data }: Props) => {
  return (
    <>
      <label
        htmlFor="username"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Acount Details
      </label>
      <div className="mt-2">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset  ">
          <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
            {data?.username} /
          </span>
          <input
            type="text"
            name="username"
            id="username"
            autoComplete="username"
            className="block flex-1 px-3 cursor-not-allowed border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="janesmith"
            value={data?.address}
            disabled
          />
          <span className="flex select-none items-center pr-3 text-gray-500 sm:text-sm">
            / Algo Balance : {data?.balance}
          </span>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
