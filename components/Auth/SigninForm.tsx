"use client";
import { handleSignIn } from "@/actions/authFormActions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { useAppDispatch } from "@/lib/hooks";
import { setUserDataRedux } from "@/lib/slices/UserSlice";
import { useForm, SubmitHandler } from "react-hook-form";
import { Spinner } from "../Spinner";

type Inputs = {
  username: string;
  password: string;
};

const SigninForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const state = await handleSignIn(data.username, data.username);
    if (state) {
      dispatch(setUserDataRedux(state.data));
      if (state.status) {
        toast({
          variant: "default",
          title: state.message,
        });
        router.prefetch("/");
        router.push("/");
      } else {
        toast({
          variant: "destructive",
          title: state.message,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="mb-4">Please login to your account</p>

      <div className="relative mb-4" data-twe-input-wrapper-init="">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Username
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("username")}
          type="text"
          placeholder="Username"
        />
      </div>

      <div className="relative mb-4" data-twe-input-wrapper-init="">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Password
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("password")}
          type="password"
          placeholder="Password"
        />
      </div>

      <div className="mb-12 pb-1 pt-1 text-center">
        <button
          className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-dark-3 transition duration-150 ease-in-out hover:shadow-dark-2 focus:shadow-dark-2 focus:outline-none focus:ring-0 active:shadow-dark-2 "
          type="submit"
          data-twe-ripple-init=""
          data-twe-ripple-color="light"
          style={{
            background:
              "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
          }}
        >
          {isSubmitting ? (
            <Spinner className="text-white" size="medium" />
          ) : (
            "Log in"
          )}
        </button>
      </div>

      <div className="flex items-center justify-between pb-6">
        <p className="mb-0 me-2">Don't have an account?</p>
        <Link
          href={"/signup"}
          type="button"
          className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-danger-50/50 hover:text-danger-600 focus:border-danger-600 focus:bg-danger-50/50 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 "
          data-twe-ripple-init=""
          data-twe-ripple-color="light"
        >
          Register
        </Link>
      </div>
    </form>
  );
};

export default SigninForm;
