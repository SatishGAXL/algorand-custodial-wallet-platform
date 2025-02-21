"use client";
import { createToken } from "@/actions/authFormActions";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/use-toast";
import { useFormState, useFormStatus } from "react-dom";
import { ToastAction } from "../ui/toast";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { Spinner } from "../Spinner";
import { useAppSelector } from "@/lib/hooks";
import Cookies from "js-cookie";
import { UserData } from "../Header";

type Inputs = {
  asset_name: string;
  unit_name: string;
  total_supply: number;
  decimals: number;
};
type Props = { data: UserData };
const FungibleForm = ({ data }: Props) => {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const state = await createToken(
      data.asset_name,
      data.unit_name,
      Number(data.total_supply),
      Number(data.decimals)
    );
    if (state) {
      if (state.status) {
        toast({
          variant: "default",
          title: state.msg,

          action: (
            <ToastAction altText="Visitxn">
              <a target="_blank" href={state.tx_url!}>
                Check
              </a>
            </ToastAction>
          ),
        });
        reset();
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: state.msg,
          description: state.tx_url,
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={` ${
        !data.canTransact && "hidden"
      }  w-full mt-4 gap-3 grid grid-cols-2`}
    >
      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Asset Name
        </label>
        <div className="mt-2">
          <input
            type="text"
            {...register("asset_name")}
            maxLength={32}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Unit name
        </label>
        <div className="mt-2">
          <input
            maxLength={8}
            type="text"
            {...register("unit_name")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Total supply
        </label>
        <div className="mt-2">
          <input
            min={0}
            type="number"
            {...register("total_supply")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Decimals
        </label>
        <div className="mt-2">
          <input
            min={0}
            max={19}
            type="number"
            {...register("decimals")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md w-[200px] flex justify-center items-center bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm  gap-3 "
        >
          {isSubmitting ? (
            <Spinner className="text-white" size="medium" />
          ) : (
            "Create Token"
          )}
        </button>
      </div>
    </form>
  );
};

export default FungibleForm;
