"use client";
import React from "react";
import { DropdownMenuLabel } from "./ui/dropdown-menu";
import { FaCopy } from "react-icons/fa";
import { useToast } from "./ui/use-toast";

type Props = { address: string };

const ClickToCopy = ({ address }: Props) => {
  const { toast } = useToast();

  return (
    <DropdownMenuLabel
      onClick={async () => {
        await navigator.clipboard.writeText(address);
        toast({
          variant: "default",
          title: "Address Copied.",
        });
      }}
      className="flex items-center justify-between py-6 cursor-pointer"
    >
      <p className="truncate w-[250px]">{address}</p>
      <FaCopy />
    </DropdownMenuLabel>
  );
};

export default ClickToCopy;
