import React, { useState } from "react";
import { Button } from "../ui/button";
import { IoAddOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

type Props = {
  setListItems: React.Dispatch<
    React.SetStateAction<
      {
        key: string;
        value: string;
      }[]
    >
  >;
  listItems: {
    key: string;
    value: string;
  }[];
};

const NFTproperties = ({ listItems, setListItems }: Props) => {
  const [keyInputValue, setKeyInputValue] = useState<string>("");
  const [valueInputValue, setValueInputValue] = useState<string>("");

  const handleKeyInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyInputValue(event.target.value);
  };

  const handleValueInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValueInputValue(event.target.value);
  };

  const handleAddItem = () => {
    if (keyInputValue.trim() !== "" && valueInputValue.trim() !== "") {
      setListItems([
        ...listItems,
        { key: keyInputValue, value: valueInputValue },
      ]);
      setKeyInputValue("");
      setValueInputValue("");
    }
  };

  const handleDeleteItem = (index: number) => {
    const updatedList = [...listItems];
    updatedList.splice(index, 1);
    setListItems(updatedList);
  };

  return (
    <div>
      <label
        htmlFor="cover-photo"
        className="block text-sm font-medium leading-6 mb-2 text-gray-900"
      >
        NFT Properties
      </label>
      <div className="mt-2 flex items-center gap-4">
        <input
          type="text"
          value={keyInputValue}
          onChange={handleKeyInputChange}
          placeholder="Enter key"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
        />
        <input
          type="text"
          value={valueInputValue}
          onChange={handleValueInputChange}
          placeholder="Enter value"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
        />
        <Button type={"button"} variant={"default"} onClick={handleAddItem}>
          <IoAddOutline />
        </Button>
      </div>

      <ul className="mt-6 space-y-2">
        {listItems.map((item, index) => (
          <li className="flex items-center w-full gap-4 " key={index}>
            <p className=" w-full flex items-center gap-5 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6">
              <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                Key : {item.key}
              </span>
              <span>|</span>
              <span>Value : {item.value}</span>
            </p>

            <Button variant={"default"} onClick={() => handleDeleteItem(index)}>
              <MdDelete />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NFTproperties;
